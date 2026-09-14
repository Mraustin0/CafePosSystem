package com.cafepos.mapper;

import com.cafepos.domain.entity.Category;
import com.cafepos.dto.request.CategoryRequest;
import com.cafepos.dto.response.CategoryResponse;
import org.springframework.stereotype.Component;

/** Converts between Category entity and its DTOs so the entity never leaves the service layer. */
@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequest request) {
        Category category = new Category();
        updateEntity(category, request);
        return category;
    }

    public void updateEntity(Category category, CategoryRequest request) {
        category.setName(request.name().trim());
    }

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
