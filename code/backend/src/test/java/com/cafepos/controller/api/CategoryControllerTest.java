package com.cafepos.controller.api;

import com.cafepos.dto.request.CategoryRequest;
import com.cafepos.dto.response.CategoryResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoryController.class)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryService categoryService;

    @Test
    void findAll_returns200WithList() throws Exception {
        when(categoryService.findAll()).thenReturn(List.of(new CategoryResponse(1L, "Coffee")));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Coffee"));
    }

    @Test
    void create_returns201WithLocation() throws Exception {
        when(categoryService.create(new CategoryRequest("Coffee"))).thenReturn(new CategoryResponse(1L, "Coffee"));

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Coffee\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/v1/categories/1"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void create_returns400WithFieldErrors_whenNameBlank() throws Exception {
        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void findById_returns404_whenMissing() throws Exception {
        when(categoryService.findById(99L)).thenThrow(new ResourceNotFoundException("Category", 99L));

        mockMvc.perform(get("/api/v1/categories/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Category not found: 99"))
                .andExpect(jsonPath("$.path").value("/api/v1/categories/99"));
    }

    @Test
    void delete_returns409_whenCategoryHasProducts() throws Exception {
        doThrow(new ConflictException("Category still has products: 1")).when(categoryService).delete(1L);

        mockMvc.perform(delete("/api/v1/categories/1"))
                .andExpect(status().isConflict());
    }

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/categories/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void wrongMethod_keeps405_insteadOf500() throws Exception {
        mockMvc.perform(patch("/api/v1/categories/1"))
                .andExpect(status().isMethodNotAllowed());
    }
}
