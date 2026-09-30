package com.cafepos.mapper;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.domain.entity.Category;
import com.cafepos.domain.entity.Product;
import com.cafepos.dto.request.ProductRequest;
import com.cafepos.dto.response.ProductResponse;
import org.springframework.stereotype.Component;

import java.math.RoundingMode;
import java.util.Comparator;
import java.util.Set;

/** Copies simple fields. The service resolves categoryId / addOnIds into entities before calling it. */
@Component
public class ProductMapper {

    private final CategoryMapper categoryMapper;
    private final AddOnMapper addOnMapper;

    public ProductMapper(CategoryMapper categoryMapper, AddOnMapper addOnMapper) {
        this.categoryMapper = categoryMapper;
        this.addOnMapper = addOnMapper;
    }

    public void updateEntity(Product product, ProductRequest request, Category category, Set<AddOn> addOns) {
        product.setName(request.name().trim());
        product.setPrice(request.price().setScale(2, RoundingMode.HALF_UP)); // match NUMERIC(10,2) so responses show 70.00, not 70
        product.setImageUrl(request.imageUrl() == null || request.imageUrl().isBlank() ? null : request.imageUrl().trim());
        product.setCategory(category);
        product.getAddOns().clear();
        product.getAddOns().addAll(addOns);
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                product.isActive(),
                categoryMapper.toResponse(product.getCategory()),
                product.getAddOns().stream()
                        .sorted(Comparator.comparing(AddOn::getName))
                        .map(addOnMapper::toResponse)
                        .toList());
    }
}
