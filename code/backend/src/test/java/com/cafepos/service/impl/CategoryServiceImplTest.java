package com.cafepos.service.impl;

import com.cafepos.domain.entity.Category;
import com.cafepos.dto.request.CategoryRequest;
import com.cafepos.dto.response.CategoryResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.CategoryMapper;
import com.cafepos.repository.CategoryRepository;
import com.cafepos.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    private CategoryServiceImpl categoryService;

    @BeforeEach
    void setUp() {
        // Real mapper: it's plain code with no dependencies, mocking it would only hide bugs.
        categoryService = new CategoryServiceImpl(categoryRepository, productRepository, new CategoryMapper());
    }

    @Test
    void create_savesTrimmedName_whenNameIsUnique() {
        when(categoryRepository.existsByNameIgnoreCase("Coffee")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        CategoryResponse result = categoryService.create(new CategoryRequest("  Coffee "));

        assertThat(result).isEqualTo(new CategoryResponse(1L, "Coffee"));
    }

    @Test
    void create_throwsConflict_whenNameExists() {
        when(categoryRepository.existsByNameIgnoreCase("Coffee")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(new CategoryRequest("Coffee")))
                .isInstanceOf(ConflictException.class);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void findById_throwsNotFound_whenMissing() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_throwsConflict_whenNameUsedByAnotherCategory() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category(1L, "Coffee")));
        when(categoryRepository.existsByNameIgnoreCaseAndIdNot("Tea", 1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.update(1L, new CategoryRequest("Tea")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void delete_throwsConflict_whenCategoryHasProducts() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category(1L, "Coffee")));
        when(productRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(1L))
                .isInstanceOf(ConflictException.class);
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void delete_removesCategory_whenNoProducts() {
        Category coffee = category(1L, "Coffee");
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(coffee));
        when(productRepository.existsByCategoryId(1L)).thenReturn(false);

        categoryService.delete(1L);

        verify(categoryRepository).delete(coffee);
    }

    private static Category category(Long id, String name) {
        Category c = new Category();
        c.setId(id);
        c.setName(name);
        return c;
    }
}
