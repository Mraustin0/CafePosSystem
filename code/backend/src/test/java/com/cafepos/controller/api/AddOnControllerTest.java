package com.cafepos.controller.api;

import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.response.AddOnResponse;
import com.cafepos.service.AddOnService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Security rules are covered by SecurityIntegrationTest; this class only tests the controller.
@WebMvcTest(AddOnController.class)
@AutoConfigureMockMvc(addFilters = false)
class AddOnControllerTest {

    private static final AddOnResponse OAT_MILK = new AddOnResponse(1L, "Oat Milk", new BigDecimal("20.00"), true);

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AddOnService addOnService;

    @Test
    void findAll_passesActiveFilter() throws Exception {
        when(addOnService.findAll(true)).thenReturn(List.of(OAT_MILK));

        mockMvc.perform(get("/api/v1/add-ons").param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Oat Milk"));
    }

    @Test
    void create_returns201() throws Exception {
        when(addOnService.create(new AddOnRequest("Oat Milk", new BigDecimal("20.00")))).thenReturn(OAT_MILK);

        mockMvc.perform(post("/api/v1/add-ons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Oat Milk\",\"price\":20.00}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/v1/add-ons/1"));
    }

    @Test
    void create_returns400_whenPriceNegative() throws Exception {
        mockMvc.perform(post("/api/v1/add-ons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Oat Milk\",\"price\":-1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.price").exists());
    }

    @Test
    void updateStatus_returns400_whenActiveMissing() throws Exception {
        mockMvc.perform(patch("/api/v1/add-ons/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.active").exists());
    }

    @Test
    void updateStatus_callsService() throws Exception {
        when(addOnService.updateStatus(1L, false))
                .thenReturn(new AddOnResponse(1L, "Oat Milk", new BigDecimal("20.00"), false));

        mockMvc.perform(patch("/api/v1/add-ons/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
        verify(addOnService).updateStatus(1L, false);
    }
}
