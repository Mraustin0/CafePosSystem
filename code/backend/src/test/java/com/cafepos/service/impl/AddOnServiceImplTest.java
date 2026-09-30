package com.cafepos.service.impl;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.response.AddOnResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.AddOnMapper;
import com.cafepos.repository.AddOnRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddOnServiceImplTest {

    @Mock
    private AddOnRepository addOnRepository;

    private AddOnServiceImpl addOnService;

    @BeforeEach
    void setUp() {
        addOnService = new AddOnServiceImpl(addOnRepository, new AddOnMapper());
    }

    @Test
    void findAll_withoutFilter_returnsAll() {
        when(addOnRepository.findAll(any(Sort.class))).thenReturn(List.of(addOn(1L, "Oat Milk", true)));

        assertThat(addOnService.findAll(null)).hasSize(1);
        verify(addOnRepository, never()).findByActive(anyBoolean(), any());
    }

    @Test
    void findAll_withActiveFilter_queriesByActive() {
        when(addOnRepository.findByActive(eq(false), any(Sort.class))).thenReturn(List.of(addOn(4L, "Honey", false)));

        assertThat(addOnService.findAll(false)).extracting(AddOnResponse::name).containsExactly("Honey");
    }

    @Test
    void create_throwsConflict_whenNameExists() {
        when(addOnRepository.existsByNameIgnoreCase("Oat Milk")).thenReturn(true);

        assertThatThrownBy(() -> addOnService.create(new AddOnRequest("Oat Milk", new BigDecimal("20.00"))))
                .isInstanceOf(ConflictException.class);
        verify(addOnRepository, never()).save(any());
    }

    @Test
    void update_changesNameAndPrice() {
        AddOn existing = addOn(1L, "Oat Milk", true);
        when(addOnRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(addOnRepository.existsByNameIgnoreCaseAndIdNot("Almond Milk", 1L)).thenReturn(false);

        AddOnResponse result = addOnService.update(1L, new AddOnRequest(" Almond Milk ", new BigDecimal("25.00")));

        assertThat(result.name()).isEqualTo("Almond Milk");
        assertThat(result.price()).isEqualByComparingTo("25.00");
    }

    @Test
    void updateStatus_deactivatesAddOn() {
        when(addOnRepository.findById(1L)).thenReturn(Optional.of(addOn(1L, "Oat Milk", true)));

        assertThat(addOnService.updateStatus(1L, false).active()).isFalse();
    }

    @Test
    void updateStatus_throwsNotFound_whenMissing() {
        when(addOnRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> addOnService.updateStatus(99L, false))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private static AddOn addOn(Long id, String name, boolean active) {
        AddOn a = new AddOn();
        a.setId(id);
        a.setName(name);
        a.setPrice(new BigDecimal("20.00"));
        a.setActive(active);
        return a;
    }
}
