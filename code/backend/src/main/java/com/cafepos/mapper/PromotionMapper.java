package com.cafepos.mapper;

import com.cafepos.domain.entity.Promotion;
import com.cafepos.dto.request.PromotionRequest;
import com.cafepos.dto.response.PromotionResponse;
import org.springframework.stereotype.Component;

/** Converts between Promotion entity and its DTOs. */
@Component
public class PromotionMapper {

    public Promotion toEntity(PromotionRequest request) {
        Promotion promotion = new Promotion();
        updateEntity(promotion, request);
        return promotion;
    }

    public void updateEntity(Promotion promotion, PromotionRequest request) {
        promotion.setCode(request.code().trim());
        promotion.setName(request.name().trim());
        promotion.setDiscountType(request.discountType());
        promotion.setDiscountValue(request.discountValue());
        promotion.setMinOrderAmount(request.minOrderAmount());
        if (request.active() != null) {
            promotion.setActive(request.active());
        }
    }

    public PromotionResponse toResponse(Promotion p) {
        return new PromotionResponse(
                p.getId(),
                p.getCode(),
                p.getName(),
                p.getDiscountType(),
                p.getDiscountValue(),
                p.getMinOrderAmount(),
                p.isActive(),
                p.getCreatedAt());
    }
}
