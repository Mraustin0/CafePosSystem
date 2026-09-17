package com.cafepos.service.impl;

import com.cafepos.domain.entity.Promotion;
import com.cafepos.dto.request.PromotionRequest;
import com.cafepos.dto.response.PromotionResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.PromotionMapper;
import com.cafepos.repository.PromotionRepository;
import com.cafepos.service.PromotionService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;

    public PromotionServiceImpl(PromotionRepository promotionRepository, PromotionMapper promotionMapper) {
        this.promotionRepository = promotionRepository;
        this.promotionMapper = promotionMapper;
    }

    @Override
    public List<PromotionResponse> findAll(Boolean active) {
        return promotionRepository.findAll(Sort.by("code")).stream()
                .filter(p -> active == null || p.isActive() == active)
                .map(promotionMapper::toResponse)
                .toList();
    }

    @Override
    public PromotionResponse findById(Long id) {
        return promotionMapper.toResponse(getPromotion(id));
    }

    @Override
    @Transactional
    public PromotionResponse create(PromotionRequest request) {
        if (promotionRepository.existsByCodeIgnoreCase(request.code().trim())) {
            throw new ConflictException("Promotion code already exists: " + request.code());
        }
        Promotion saved = promotionRepository.save(promotionMapper.toEntity(request));
        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PromotionResponse update(Long id, PromotionRequest request) {
        Promotion promotion = getPromotion(id);
        if (promotionRepository.existsByCodeIgnoreCaseAndIdNot(request.code().trim(), id)) {
            throw new ConflictException("Promotion code already exists: " + request.code());
        }
        promotionMapper.updateEntity(promotion, request);
        return promotionMapper.toResponse(promotion);
    }

    @Override
    @Transactional
    public PromotionResponse updateStatus(Long id, boolean active) {
        Promotion promotion = getPromotion(id);
        promotion.setActive(active);
        return promotionMapper.toResponse(promotion);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        promotionRepository.delete(getPromotion(id));
    }

    private Promotion getPromotion(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
    }
}
