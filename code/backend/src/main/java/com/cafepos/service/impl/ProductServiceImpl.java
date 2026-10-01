package com.cafepos.service.impl;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.domain.entity.Category;
import com.cafepos.domain.entity.Product;
import com.cafepos.dto.request.ProductRequest;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.ProductResponse;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.ProductMapper;
import com.cafepos.repository.AddOnRepository;
import com.cafepos.repository.CategoryRepository;
import com.cafepos.repository.ProductRepository;
import com.cafepos.repository.ProductSpecifications;
import com.cafepos.service.ProductService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AddOnRepository addOnRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              AddOnRepository addOnRepository,
                              ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.addOnRepository = addOnRepository;
        this.productMapper = productMapper;
    }

    @Override
    public PageResponse<ProductResponse> findAll(Long categoryId, String search, Boolean active, Pageable pageable) {
        return PageResponse.of(
                productRepository.findAll(ProductSpecifications.filter(categoryId, search, active), pageable),
                productMapper::toResponse);
    }

    @Override
    public ProductResponse findById(Long id) {
        return productMapper.toResponse(getProduct(id));
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        productMapper.updateEntity(product, request, getCategory(request.categoryId()), getAddOns(request.addOnIds()));
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        productMapper.updateEntity(product, request, getCategory(request.categoryId()), getAddOns(request.addOnIds()));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateStatus(Long id, boolean active) {
        Product product = getProduct(id);
        product.setActive(active);
        return productMapper.toResponse(product);
    }

    private Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    /** All ids must exist, otherwise 404 listing the missing ones. null = no add-ons. */
    private Set<AddOn> getAddOns(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Set.of();
        }
        Set<AddOn> found = new HashSet<>(addOnRepository.findAllById(ids));
        if (found.size() != ids.size()) {
            Set<Long> foundIds = found.stream().map(AddOn::getId).collect(Collectors.toSet());
            Set<Long> missing = ids.stream().filter(id -> !foundIds.contains(id)).collect(Collectors.toSet());
            throw new ResourceNotFoundException("Add-on", missing);
        }
        return found;
    }
}
