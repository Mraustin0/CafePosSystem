package com.cafepos.controller.api;

import com.cafepos.dto.request.ProductRequest;
import com.cafepos.dto.request.StatusUpdateRequest;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.ProductResponse;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import static com.cafepos.common.NotImplementedYet.error;

/** F-14 – F-19. POS menu (F-24) = GET /api/v1/products?active=true */
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @GetMapping
    public PageResponse<ProductResponse> findAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @ParameterObject @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        throw error();
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        throw error();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        throw error();
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        throw error();
    }

    @PatchMapping("/{id}/status")
    public ProductResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        throw error();
    }
}
