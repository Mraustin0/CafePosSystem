package com.cafepos.service;

import com.cafepos.dto.request.PromotionRequest;
import com.cafepos.dto.response.PromotionResponse;

import java.util.List;

public interface PromotionService {

    List<PromotionResponse> findAll(Boolean active);

    PromotionResponse findById(Long id);

    PromotionResponse create(PromotionRequest request);

    PromotionResponse update(Long id, PromotionRequest request);

    PromotionResponse updateStatus(Long id, boolean active);

    void delete(Long id);
}
