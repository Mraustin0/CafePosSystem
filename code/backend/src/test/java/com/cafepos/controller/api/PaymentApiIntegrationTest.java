package com.cafepos.controller.api;

import com.cafepos.domain.enums.PaymentMethod;
import com.cafepos.domain.event.OrderPaidEvent;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Payment flow on seed data: cashier1=2, cashier2=3, Latte=3 (60), Oat Milk=2 (20). New order = 2 x (60 + 20) = 160. */
@SpringBootTest
@AutoConfigureMockMvc
@RecordApplicationEvents
class PaymentApiIntegrationTest {

    private static final RequestPostProcessor CASHIER_1 = user(2);
    private static final RequestPostProcessor CASHIER_2 = user(3);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApplicationEvents events;

    @Test
    void cash_returnsChange_marksOrderPaid_andPublishesEvent() throws Exception {
        long id = createOrder();

        send(post(payment(id)), CASHIER_1, "{\"method\":\"CASH\",\"amountReceived\":200}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(id))
                .andExpect(jsonPath("$.amountReceived").value(200.00))
                .andExpect(jsonPath("$.change").value(40.00));

        send(get("/api/v1/orders/" + id), CASHIER_1, null)
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.payment.change").value(40.00));
        send(get(payment(id)), CASHIER_1, null).andExpect(status().isOk());

        assertThat(events.stream(OrderPaidEvent.class))
                .singleElement()
                .satisfies(e -> {
                    assertThat(e.orderId()).isEqualTo(id);
                    assertThat(e.method()).isEqualTo(PaymentMethod.CASH);
                    assertThat(e.total()).isEqualByComparingTo("160.00");
                });
    }

    @Test
    void secondPayment_returns409() throws Exception {
        long id = createOrder();
        send(post(payment(id)), CASHIER_1, "{\"method\":\"QR_CODE\",\"amountReceived\":160}").andExpect(status().isCreated());

        send(post(payment(id)), CASHIER_1, "{\"method\":\"CASH\",\"amountReceived\":500}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already paid")));
        send(put("/api/v1/orders/" + id + "/items"), CASHIER_1, "{\"items\":[{\"productId\":3,\"quantity\":1}]}")
                .andExpect(status().isConflict());
    }

    @Test
    void wrongAmount_returns400_andNothingIsSaved() throws Exception {
        long id = createOrder();

        send(post(payment(id)), CASHIER_1, "{\"method\":\"CASH\",\"amountReceived\":159.99}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("less than the total")));
        send(post(payment(id)), CASHIER_1, "{\"method\":\"CARD\",\"amountReceived\":200}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("exactly the total")));

        send(get("/api/v1/orders/" + id), CASHIER_1, null).andExpect(jsonPath("$.status").value("PENDING"));
        send(get(payment(id)), CASHIER_1, null).andExpect(status().isNotFound());
        assertThat(events.stream(OrderPaidEvent.class)).isEmpty();
    }

    @Test
    void cancelledOrder_cannotBePaid() throws Exception {
        long id = createOrder();
        send(post("/api/v1/orders/" + id + "/cancel"), CASHIER_1, null).andExpect(status().isOk());

        send(post(payment(id)), CASHIER_1, "{\"method\":\"CASH\",\"amountReceived\":200}")
                .andExpect(status().isConflict());
    }

    @Test
    void anotherCashier_cannotPayOrReadPayment() throws Exception {
        long id = createOrder();

        send(post(payment(id)), CASHIER_2, "{\"method\":\"CASH\",\"amountReceived\":200}").andExpect(status().isNotFound());
        send(get(payment(id)), CASHIER_2, null).andExpect(status().isNotFound());
    }

    @Test
    void missingFields_return400() throws Exception {
        send(post(payment(createOrder())), CASHIER_1, "{\"amountReceived\":-1}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.method").exists())
                .andExpect(jsonPath("$.fieldErrors.amountReceived").exists());
    }

    private long createOrder() throws Exception {
        String body = send(post("/api/v1/orders"), CASHIER_1, "{\"items\":[{\"productId\":3,\"quantity\":2,\"addOnIds\":[2]}]}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private static String payment(long orderId) {
        return "/api/v1/orders/" + orderId + "/payment";
    }

    private ResultActions send(MockHttpServletRequestBuilder request, RequestPostProcessor who, String json) throws Exception {
        if (json != null) {
            request.contentType(MediaType.APPLICATION_JSON).content(json);
        }
        return mockMvc.perform(request.with(who));
    }

    private static RequestPostProcessor user(long id) {
        return jwt().jwt(j -> j.subject(String.valueOf(id)).claim("roles", List.of("CASHIER")))
                .authorities(new SimpleGrantedAuthority("ROLE_CASHIER"));
    }
}
