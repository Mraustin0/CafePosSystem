package com.cafepos.service.impl;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.domain.entity.Category;
import com.cafepos.domain.entity.Product;
import com.cafepos.dto.request.ProductRequest;
import com.cafepos.dto.response.AddOnResponse;
import com.cafepos.dto.response.ProductResponse;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.AddOnMapper;
import com.cafepos.mapper.CategoryMapper;
import com.cafepos.mapper.ProductMapper;
import com.cafepos.repository.AddOnRepository;
import com.cafepos.repository.CategoryRepository;
import com.cafepos.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private AddOnRepository addOnRepository;

    private ProductServiceImpl productService;

    private final Category coffee = category(1L, "Coffee");
    private final AddOn oatMilk = addOn(1L, "Oat Milk");
    private final AddOn extraShot = addOn(2L, "Extra Shot");

    @BeforeEach
    void setUp() {
        ProductMapper mapper = new ProductMapper(new CategoryMapper(), new AddOnMapper());
        productService = new ProductServiceImpl(productRepository, categoryRepository, addOnRepository, mapper);
    }

    @Test
    void create_linksCategoryAndAddOns() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(coffee));
        when(addOnRepository.findAllById(Set.of(1L, 2L))).thenReturn(List.of(oatMilk, extraShot));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse result = productService.create(request(1L, Set.of(1L, 2L)));

        assertThat(result.name()).isEqualTo("Latte");
        assertThat(result.category().name()).isEqualTo("Coffee");
        assertThat(result.addOns()).extracting(AddOnResponse::name).containsExactly("Extra Shot", "Oat Milk");
    }

    @Test
    void create_withoutAddOnIds_hasNoAddOns() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(coffee));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(productService.create(request(1L, null)).addOns()).isEmpty();
        verifyNoInteractions(addOnRepository);
    }

    @Test
    void create_throwsNotFound_whenCategoryMissing() {
        when(categoryRepository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.create(request(9L, null)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category");
        verify(productRepository, never()).save(any());
    }

    @Test
    void create_throwsNotFound_listingMissingAddOnIds() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(coffee));
        when(addOnRepository.findAllById(Set.of(1L, 99L))).thenReturn(List.of(oatMilk));

        assertThatThrownBy(() -> productService.create(request(1L, Set.of(1L, 99L))))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
        verify(productRepository, never()).save(any());
    }

    @Test
    void update_replacesAddOns() {
        Product latte = new Product();
        latte.setId(5L);
        latte.getAddOns().add(oatMilk);
        when(productRepository.findById(5L)).thenReturn(Optional.of(latte));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(coffee));
        when(addOnRepository.findAllById(Set.of(2L))).thenReturn(List.of(extraShot));

        ProductResponse result = productService.update(5L, request(1L, Set.of(2L)));

        assertThat(result.addOns()).extracting(AddOnResponse::name).containsExactly("Extra Shot");
    }

    @Test
    void updateStatus_throwsNotFound_whenMissing() {
        when(productRepository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.updateStatus(9L, false))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private static ProductRequest request(Long categoryId, Set<Long> addOnIds) {
        return new ProductRequest(categoryId, " Latte ", new BigDecimal("60.00"), "", addOnIds);
    }

    private static Category category(Long id, String name) {
        Category c = new Category();
        c.setId(id);
        c.setName(name);
        return c;
    }

    private static AddOn addOn(Long id, String name) {
        AddOn a = new AddOn();
        a.setId(id);
        a.setName(name);
        a.setPrice(new BigDecimal("15.00"));
        return a;
    }
}
