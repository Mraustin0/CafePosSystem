package com.cafepos.controller.api;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Real login against seed users (password cafe1234) and real JWT validation — no mocked security. */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    private static final String PASSWORD = "cafe1234";

    @Autowired
    private MockMvc mockMvc;

    // ----- login -----

    @Test
    void login_returnsTokenAndUser() throws Exception {
        mockMvc.perform(json(post("/api/v1/auth/login"), "{\"username\":\"admin\",\"password\":\"cafe1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.fullName").value("Cafe Owner"));
    }

    @Test
    void login_wrongPassword_returns401WithStandardBody() throws Exception {
        mockMvc.perform(json(post("/api/v1/auth/login"), "{\"username\":\"admin\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    // ----- token handling -----

    @Test
    void noToken_returns401Json() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.path").value("/api/v1/products"));
    }

    @Test
    void forgedToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/products").header(HttpHeaders.AUTHORIZATION, "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.x"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicPaths_needNoToken() throws Exception {
        mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }

    // ----- role rules -----

    @Test
    void cashier_canReadMenu_butNotChangeIt() throws Exception {
        String cashier = login("cashier1");
        mockMvc.perform(auth(get("/api/v1/products"), cashier)).andExpect(status().isOk());
        mockMvc.perform(auth(json(post("/api/v1/categories"), "{\"name\":\"Hacked\"}"), cashier))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access denied"));
    }

    @Test
    void cashier_cannotManageUsersOrSeeReports() throws Exception {
        String cashier = login("cashier1");
        mockMvc.perform(auth(get("/api/v1/users"), cashier)).andExpect(status().isForbidden());
        mockMvc.perform(auth(get("/api/v1/reports/sales-summary?from=2026-01-01&to=2026-12-31"), cashier))
                .andExpect(status().isForbidden());
    }

    @Test
    void cashier_canReadOwnProfile() throws Exception {
        mockMvc.perform(auth(get("/api/v1/users/me"), login("cashier1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("cashier1"));
    }

    // ----- user management -----

    @Test
    void admin_createsUser_whoCanLogIn_untilDeactivated() throws Exception {
        String admin = login("admin");
        String body = "{\"username\":\"newbie\",\"password\":\"secret123\",\"role\":\"CASHIER\",\"fullName\":\"New Cashier\"}";
        String created = mockMvc.perform(auth(json(post("/api/v1/users"), body), admin))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(true))
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(created, "$.id");

        mockMvc.perform(auth(json(post("/api/v1/users"), body), admin)).andExpect(status().isConflict());
        mockMvc.perform(json(post("/api/v1/auth/login"), "{\"username\":\"newbie\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(auth(json(patch("/api/v1/users/" + id + "/status"), "{\"active\":false}"), admin))
                .andExpect(status().isOk());
        mockMvc.perform(json(post("/api/v1/auth/login"), "{\"username\":\"newbie\",\"password\":\"secret123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void admin_cannotDeactivateSelf() throws Exception {
        String admin = login("admin");
        String me = mockMvc.perform(auth(get("/api/v1/users/me"), admin)).andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(me, "$.id");

        mockMvc.perform(auth(json(patch("/api/v1/users/" + id + "/status"), "{\"active\":false}"), admin))
                .andExpect(status().isConflict());
    }

    @Test
    void userList_isPagedAndFiltered() throws Exception {
        mockMvc.perform(auth(get("/api/v1/users?role=CASHIER&size=1&sort=user.username"), login("admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username", startsWith("cashier")))
                .andExpect(jsonPath("$.size").value(1));
    }

    @Test
    void changePassword_wrongCurrent_returns400_notLogout() throws Exception {
        mockMvc.perform(auth(json(put("/api/v1/users/me/password"),
                        "{\"currentPassword\":\"wrong\",\"newPassword\":\"whatever123\"}"), login("cashier2")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));
    }

    private String login(String username) throws Exception {
        String res = mockMvc.perform(json(post("/api/v1/auth/login"),
                        "{\"username\":\"" + username + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(res, "$.accessToken");
    }

    private static MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder req, String token) {
        return req.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder req, String body) {
        return req.contentType(MediaType.APPLICATION_JSON).content(body);
    }
}
