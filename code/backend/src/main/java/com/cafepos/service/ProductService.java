package com.cafepos.service;

import com.cafepos.dto.request.ProductRequest;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    /** Every filter is optional (null = not filtered). */
    PageResponse<ProductResponse> findAll(Long categoryId, String search, Boolean active, Pageable pageable);

    ProductResponse findById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    ProductResponse updateStatus(Long id, boolean active);
}
