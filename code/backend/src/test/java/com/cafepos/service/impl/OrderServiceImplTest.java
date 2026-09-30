package com.cafepos.service.impl;

import com.cafepos.common.CurrentUser;
import com.cafepos.domain.entity.Order;
import com.cafepos.domain.entity.User;
import com.cafepos.dto.request.ApplyDiscountRequest;
import com.cafepos.domain.enums.DiscountType;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.OrderMapper;
import com.cafepos.mapper.PaymentMapper;
import com.cafepos.repository.*;
import com.cafepos.service.discount.DiscountStrategy;
import com.cafepos.service.discount.FixedAmountDiscount;
import com.cafepos.service.discount.NoDiscount;
import com.cafepos.service.discount.PercentDiscount;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/** Rules not reachable through the HTTP flow tests (see OrderApiIntegrationTest for the happy paths). */
@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository profileRepository;
    @Mock
    private PaymentRepository paymentRepository;

    private final OrderMapper mapper = new OrderMapper(new PaymentMapper());

    @Test
    void startupFails_whenADiscountTypeHasNoStrategy() {
        assertThatThrownBy(() -> service(List.of(new NoDiscount(), new PercentDiscount())))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Missing discount strategy");
    }

    @Test
    void cashier_cannotChangeAnotherCashiersOrder() {
        Order order = new Order();
        User owner = new User();
        owner.setId(2L);
        order.setCashier(owner);
        order.setSubtotal(new BigDecimal("100.00"));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.findVisibleById(any(), any())).thenCallRealMethod(); // the rule under test lives there

        OrderServiceImpl service = service(List.of(new NoDiscount(), new PercentDiscount(), new FixedAmountDiscount()));

        assertThatThrownBy(() -> service.applyDiscount(1L, new ApplyDiscountRequest(DiscountType.PERCENT, BigDecimal.TEN),
                new CurrentUser(3L, false)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private OrderServiceImpl service(List<DiscountStrategy> strategies) {
        return new OrderServiceImpl(orderRepository, productRepository, userRepository, profileRepository,
                paymentRepository, mapper, strategies);
    }
}
