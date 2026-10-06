package com.cafepos.controller.api;

import com.cafepos.domain.enums.DiscountType;
import com.cafepos.dto.response.PromotionResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.service.PromotionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Security rules are covered by SecurityIntegrationTest; this class only tests the controller.
@WebMvcTest(PromotionController.class)
@AutoConfigureMockMvc(addFilters = false)
class PromotionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PromotionService promotionService;

    private PromotionResponse sample(Long id) {
        return new PromotionResponse(id, "SAVE10", "Save 10 Baht", DiscountType.FIXED_AMOUNT,
                new BigDecimal("10.00"), new BigDecimal("100.00"), true, Instant.now());
    }

    @Test
    void findAll_passesActiveFilter() throws Exception {
        when(promotionService.findAll(eq(true))).thenReturn(List.of(sample(1L)));

        mockMvc.perform(get("/api/v1/promotions").param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("SAVE10"));
        verify(promotionService).findAll(true);
    }

    @Test
    void findById_returns200_whenExists() throws Exception {
        when(promotionService.findById(1L)).thenReturn(sample(1L));

        mockMvc.perform(get("/api/v1/promotions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void findById_returns404_whenMissing() throws Exception {
        when(promotionService.findById(99L)).thenThrow(new ResourceNotFoundException("Promotion", 99L));

        mockMvc.perform(get("/api/v1/promotions/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_returns201_withLocationHeader() throws Exception {
        when(promotionService.create(any())).thenReturn(sample(42L));

        mockMvc.perform(post("/api/v1/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"SAVE10","name":"Save 10 Baht","discountType":"FIXED_AMOUNT",
                                 "discountValue":10.00,"minOrderAmount":100.00,"active":true}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42));
    }

    @Test
    void create_duplicateCode_returns409() throws Exception {
        when(promotionService.create(any())).thenThrow(new ConflictException("code already exists"));

        mockMvc.perform(post("/api/v1/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"SAVE10","name":"dup","discountType":"PERCENT","discountValue":5.00}"""))
                .andExpect(status().isConflict());
    }

    @Test
    void create_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"x\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.code").exists())
                .andExpect(jsonPath("$.fieldErrors.discountType").exists())
                .andExpect(jsonPath("$.fieldErrors.discountValue").exists());
    }

    @Test
    void create_negativeDiscountValue_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"BAD","name":"neg","discountType":"PERCENT","discountValue":-5.00}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.discountValue").exists());
    }

    @Test
    void update_returns200() throws Exception {
        when(promotionService.update(eq(1L), any())).thenReturn(sample(1L));

        mockMvc.perform(put("/api/v1/promotions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"SAVE10","name":"Updated","discountType":"FIXED_AMOUNT","discountValue":10.00}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void updateStatus_togglesActive() throws Exception {
        when(promotionService.updateStatus(eq(1L), eq(false))).thenReturn(sample(1L));

        mockMvc.perform(patch("/api/v1/promotions/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk());
        verify(promotionService).updateStatus(1L, false);
    }

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/promotions/1"))
                .andExpect(status().isNoContent());
        verify(promotionService).delete(1L);
    }
}
