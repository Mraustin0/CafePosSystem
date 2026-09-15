package com.cafepos.controller.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full stack against the Flyway seed data (V2) on H2.
 * Deliberately NOT @Transactional: lazy loading must work without a test transaction, exactly like production.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProductApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void filtersByCategoryAndActive_withCategoryAndAddOnsLoaded() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("search", "latte").param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name", contains("Latte", "Matcha Latte")))
                .andExpect(jsonPath("$.content[0].category.name").value("Coffee"))
                .andExpect(jsonPath("$.content[0].addOns[*].name", contains("Extra Shot", "Oat Milk", "Whipped Cream")));
    }

    @Test
    void searchIsCaseInsensitive_andTreatsWildcardsLiterally() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("search", "MOCHA"))
                .andExpect(jsonPath("$.content[*].name", contains("Mocha")));
        mockMvc.perform(get("/api/v1/products").param("search", "%"))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void inactiveFilter_returnsOnlyInactiveProducts() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("active", "false"))
                .andExpect(jsonPath("$.content[*].name", contains("Banana Cake")));
    }

    @Test
    void paginatesAndSorts() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("search", "a").param("active", "true")
                        .param("size", "2").param("page", "0").param("sort", "price,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].price").value(65.00))
                .andExpect(jsonPath("$.totalPages", greaterThan(1)));
    }

    @Test
    void unknownSortProperty_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("sort", "hacked"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void findById_includesAddOns() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("search", "thai milk tea"))
                .andExpect(jsonPath("$.content[0].addOns", hasSize(2)));
    }

    @Test
    void create_withUnknownAddOn_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryId\":1,\"name\":\"Ghost\",\"price\":10,\"addOnIds\":[999]}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("999")));
    }
}
