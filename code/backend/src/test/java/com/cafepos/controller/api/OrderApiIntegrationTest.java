package com.cafepos.controller.api;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Order flow on the seed data (V2). Seed ids, in insert order:
 * users admin=1, cashier1=2, cashier2=3 · products Latte=3, Croissant=7 (no add-ons), Banana Cake=9 (inactive)
 * · add-ons Extra Shot=1, Oat Milk=2, Honey=4 (inactive) · orders ORD-DEMO-0001=1 (PAID by cashier1, cash 200),
 * ORD-DEMO-0002=2 (PAID, 10.50 discount).
 */
@SpringBootTest
@AutoConfigureMockMvc
class OrderApiIntegrationTest {

    private static final RequestPostProcessor ADMIN = user(1, "ADMIN");
    private static final RequestPostProcessor CASHIER_1 = user(2, "CASHIER");
    private static final RequestPostProcessor CASHIER_2 = user(3, "CASHIER");

    private static final String LATTE_X2_OAT_MILK = "{\"items\":[{\"productId\":3,\"quantity\":2,\"addOnIds\":[2]}]}";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void create_snapshotsPricesAndIncludesAddOnsInTotal() throws Exception {
        send(post("/api/v1/orders"), CASHIER_1, LATTE_X2_OAT_MILK)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber", matchesPattern("ORD-\\d{8}")))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.cashierName").value("Cashier One"))
                .andExpect(jsonPath("$.items[0].unitPrice").value(60.00))
                .andExpect(jsonPath("$.items[0].addOns[0].name").value("Oat Milk"))
                .andExpect(jsonPath("$.items[0].addOns[0].price").value(20.00))
                .andExpect(jsonPath("$.items[0].lineTotal").value(160.00)) // 2 x (60 + 20)
                .andExpect(jsonPath("$.subtotal").value(160.00))
                .andExpect(jsonPath("$.total").value(160.00))
                .andExpect(jsonPath("$.payment").doesNotExist());
    }

    @Test
    void create_rejectsInvalidItems() throws Exception {
        send(post("/api/v1/orders"), CASHIER_1, "{\"items\":[{\"productId\":7,\"quantity\":1,\"addOnIds\":[2]}]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("not available for Croissant")));
        send(post("/api/v1/orders"), CASHIER_1, "{\"items\":[{\"productId\":3,\"quantity\":1,\"addOnIds\":[4]}]}")
                .andExpect(status().isBadRequest());
        send(post("/api/v1/orders"), CASHIER_1, "{\"items\":[{\"productId\":9,\"quantity\":1}]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Banana Cake")));
        send(post("/api/v1/orders"), CASHIER_1, "{\"items\":[{\"productId\":999,\"quantity\":1}]}")
                .andExpect(status().isNotFound());
        send(post("/api/v1/orders"), CASHIER_1, "{\"items\":[{\"productId\":3,\"quantity\":0}]}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void percentDiscount_isRecalculatedWhenItemsChange() throws Exception {
        long id = createOrder(CASHIER_1);

        send(put("/api/v1/orders/" + id + "/discount"), CASHIER_1, "{\"type\":\"PERCENT\",\"value\":10}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.discountType").value("PERCENT"))
                .andExpect(jsonPath("$.discountValue").value(10.00))
                .andExpect(jsonPath("$.discountAmount").value(16.00))
                .andExpect(jsonPath("$.total").value(144.00));
        send(put("/api/v1/orders/" + id + "/discount"), CASHIER_1, "{\"type\":\"FIXED_AMOUNT\",\"value\":999}")
                .andExpect(status().isBadRequest());

        send(put("/api/v1/orders/" + id + "/items"), CASHIER_1, "{\"items\":[{\"productId\":7,\"quantity\":1}]}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productName").value("Croissant"))
                .andExpect(jsonPath("$.subtotal").value(55.00))
                .andExpect(jsonPath("$.discountType").value("PERCENT"))
                .andExpect(jsonPath("$.discountAmount").value(5.50))
                .andExpect(jsonPath("$.total").value(49.50));
    }

    @Test
    void fixedDiscountLargerThanNewSubtotal_rejectsItemChange_andKeepsOrder() throws Exception {
        long id = createOrder(CASHIER_1); // subtotal 160
        send(put("/api/v1/orders/" + id + "/discount"), CASHIER_1, "{\"type\":\"FIXED_AMOUNT\",\"value\":100}")
                .andExpect(jsonPath("$.total").value(60.00));

        send(put("/api/v1/orders/" + id + "/items"), CASHIER_1, "{\"items\":[{\"productId\":7,\"quantity\":1}]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("change or remove the discount first")));

        send(get("/api/v1/orders/" + id), CASHIER_1, null)
                .andExpect(jsonPath("$.items[0].productName").value("Latte"))
                .andExpect(jsonPath("$.subtotal").value(160.00))
                .andExpect(jsonPath("$.discountAmount").value(100.00));

        send(put("/api/v1/orders/" + id + "/discount"), CASHIER_1, "{\"type\":\"NONE\"}")
                .andExpect(jsonPath("$.discountValue").doesNotExist());
        send(put("/api/v1/orders/" + id + "/items"), CASHIER_1, "{\"items\":[{\"productId\":7,\"quantity\":1}]}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(55.00));
    }

    @Test
    void cancel_onlyOnce_andCancelledOrderIsReadOnly() throws Exception {
        long id = createOrder(CASHIER_1);

        send(post("/api/v1/orders/" + id + "/cancel"), CASHIER_1, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
        send(post("/api/v1/orders/" + id + "/cancel"), CASHIER_1, null).andExpect(status().isConflict());
        send(put("/api/v1/orders/" + id + "/items"), CASHIER_1, LATTE_X2_OAT_MILK).andExpect(status().isConflict());
    }

    @Test
    void paidOrder_cannotBeCancelled_andShowsPaymentWithChange() throws Exception {
        send(post("/api/v1/orders/1/cancel"), ADMIN, null).andExpect(status().isConflict());
        send(get("/api/v1/orders/1"), ADMIN, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.payment.method").value("CASH"))
                .andExpect(jsonPath("$.payment.change").value(35.00)); // 200 - 165
    }

    @Test
    void existingDiscountedOrders_areMigratedAsFixedAmount() throws Exception {
        // ORD-DEMO-0002 (id 2) had 10.50 off before V4 added discount_type/discount_value
        send(get("/api/v1/orders/2"), ADMIN, null)
                .andExpect(jsonPath("$.discountType").value("FIXED_AMOUNT"))
                .andExpect(jsonPath("$.discountValue").value(10.50))
                .andExpect(jsonPath("$.total").value(94.50));
    }

    @Test
    void cashier_onlySeesOwnOrders() throws Exception {
        send(get("/api/v1/orders/1"), CASHIER_2, null).andExpect(status().isNotFound());
        send(post("/api/v1/orders/1/cancel"), CASHIER_2, null).andExpect(status().isNotFound());

        // cashierId=2 is ignored for a cashier: cashier2 still gets only their own orders
        send(get("/api/v1/orders?cashierId=2"), CASHIER_2, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[*].cashierName", everyItem(is("Cashier Two"))));
    }

    @Test
    void admin_filtersByCashierStatusAndDate() throws Exception {
        send(get("/api/v1/orders?cashierId=2&status=PAID"), ADMIN, null)
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[*].cashierName", everyItem(is("Cashier One"))))
                .andExpect(jsonPath("$.content[*].status", everyItem(is("PAID"))));
        send(get("/api/v1/orders?from=2000-01-01&to=2000-12-31"), ADMIN, null)
                .andExpect(jsonPath("$.totalElements").value(0));
        send(get("/api/v1/orders?sort=total,desc&size=2"), ADMIN, null)
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    private long createOrder(RequestPostProcessor who) throws Exception {
        String body = send(post("/api/v1/orders"), who, LATTE_X2_OAT_MILK)
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private ResultActions send(MockHttpServletRequestBuilder request, RequestPostProcessor who, String json) throws Exception {
        if (json != null) {
            request.contentType(MediaType.APPLICATION_JSON).content(json);
        }
        return mockMvc.perform(request.with(who));
    }

    private static RequestPostProcessor user(long id, String role) {
        return jwt().jwt(j -> j.subject(String.valueOf(id)).claim("roles", List.of(role)))
                .authorities(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
