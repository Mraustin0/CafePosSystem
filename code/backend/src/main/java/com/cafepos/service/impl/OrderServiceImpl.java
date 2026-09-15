package com.cafepos.service.impl;

import com.cafepos.common.CurrentUser;
import com.cafepos.domain.entity.*;
import com.cafepos.domain.enums.DiscountType;
import com.cafepos.domain.enums.OrderStatus;
import com.cafepos.dto.request.ApplyDiscountRequest;
import com.cafepos.dto.request.OrderItemRequest;
import com.cafepos.dto.request.OrderItemsRequest;
import com.cafepos.dto.response.OrderResponse;
import com.cafepos.dto.response.OrderSummaryResponse;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.exception.BadRequestException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.OrderMapper;
import com.cafepos.repository.*;
import com.cafepos.service.OrderService;
import com.cafepos.service.discount.DiscountStrategy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;
    private final Map<DiscountType, DiscountStrategy> discountStrategies;

    public OrderServiceImpl(OrderRepository orderRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository,
                            UserProfileRepository profileRepository,
                            PaymentRepository paymentRepository,
                            OrderMapper orderMapper,
                            List<DiscountStrategy> discountStrategies) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.paymentRepository = paymentRepository;
        this.orderMapper = orderMapper;
        this.discountStrategies = discountStrategies.stream()
                .collect(Collectors.toMap(DiscountStrategy::type, Function.identity(), (a, b) -> {
                    throw new IllegalStateException("Two discount strategies for " + a.type());
                }, () -> new EnumMap<>(DiscountType.class)));
        // Fail at startup, not at checkout, if a DiscountType has no strategy.
        if (this.discountStrategies.size() != DiscountType.values().length) {
            throw new IllegalStateException("Missing discount strategy, found only " + this.discountStrategies.keySet());
        }
    }

    @Override
    @Transactional
    public OrderResponse create(OrderItemsRequest request, CurrentUser actor) {
        Order order = new Order();
        order.setCashier(userRepository.getReferenceById(actor.id()));
        // order_number is NOT NULL UNIQUE but the real number needs the generated id: insert a unique placeholder first.
        order.setOrderNumber("NEW-" + UUID.randomUUID().toString().substring(0, 16));
        fillItems(order, request.items());
        applyDiscount(order, DiscountType.NONE, null);

        orderRepository.save(order);
        order.setOrderNumber("ORD-%08d".formatted(order.getId()));
        return toResponse(order);
    }

    @Override
    public PageResponse<OrderSummaryResponse> findAll(OrderStatus status, LocalDate from, LocalDate to, Long cashierId,
                                                      Pageable pageable, CurrentUser actor) {
        Long effectiveCashierId = actor.admin() ? cashierId : actor.id();
        Page<Order> page = orderRepository.findAll(OrderSpecifications.filter(status, from, to, effectiveCashierId), pageable);
        Map<Long, String> names = cashierNames(page.getContent().stream().map(o -> o.getCashier().getId()).collect(Collectors.toSet()));
        return PageResponse.of(page, o -> orderMapper.toSummary(o, names.get(o.getCashier().getId())));
    }

    @Override
    public OrderResponse findById(Long id, CurrentUser actor) {
        return toResponse(getVisibleOrder(id, actor));
    }

    @Override
    @Transactional
    public OrderResponse replaceItems(Long id, OrderItemsRequest request, CurrentUser actor) {
        Order order = getVisibleOrder(id, actor);
        order.ensureModifiable();
        order.getItems().clear(); // orphanRemoval deletes the old rows and their add-ons
        fillItems(order, request.items());
        try {
            applyDiscount(order, order.getDiscountType(), order.getDiscountValue());
        } catch (BadRequestException e) {
            // Rolls back the whole transaction, so the order keeps its old items.
            throw new BadRequestException("The current discount does not fit the new subtotal "
                    + order.getSubtotal() + ": change or remove the discount first");
        }
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse applyDiscount(Long id, ApplyDiscountRequest request, CurrentUser actor) {
        Order order = getVisibleOrder(id, actor);
        order.ensureModifiable();
        applyDiscount(order, request.type(), request.value());
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancel(Long id, CurrentUser actor) {
        Order order = getVisibleOrder(id, actor);
        order.cancel();
        return toResponse(order);
    }

    // ----- helpers -----

    private void fillItems(Order order, List<OrderItemRequest> requests) {
        Map<Long, Product> products = loadProducts(requests.stream().map(OrderItemRequest::productId).collect(Collectors.toSet()));
        for (OrderItemRequest request : requests) {
            Product product = products.get(request.productId());
            if (!product.isActive()) {
                throw new BadRequestException("Product is not available: " + product.getName());
            }
            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(request.quantity());
            item.setUnitPrice(product.getPrice());
            for (Long addOnId : Optional.ofNullable(request.addOnIds()).orElse(Set.of())) {
                AddOn addOn = allowedAddOn(product, addOnId);
                item.getAddOns().add(new OrderItemAddOn(addOn, addOn.getPrice()));
            }
            order.addItem(item);
        }
    }

    private Map<Long, Product> loadProducts(Set<Long> ids) {
        Map<Long, Product> products = productRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        Set<Long> missing = new TreeSet<>(ids);
        missing.removeAll(products.keySet());
        if (!missing.isEmpty()) {
            throw new ResourceNotFoundException("Product", missing);
        }
        return products;
    }

    /** The add-on must be linked to the product (product_add_ons) and active. */
    private static AddOn allowedAddOn(Product product, Long addOnId) {
        return product.getAddOns().stream()
                .filter(a -> a.getId().equals(addOnId) && a.isActive())
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "Add-on " + addOnId + " is not available for " + product.getName()));
    }

    /** Recalculates subtotal, discount and total; remembers type/value so later item changes can reuse them. */
    private void applyDiscount(Order order, DiscountType type, BigDecimal value) {
        BigDecimal subtotal = order.getItems().stream().map(OrderItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
        order.setSubtotal(subtotal);
        BigDecimal normalizedValue = type == DiscountType.NONE || value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
        BigDecimal discount = discountStrategies.get(type).calculate(subtotal, normalizedValue);
        order.setDiscountType(type);
        order.setDiscountValue(normalizedValue);
        order.setDiscountAmount(discount);
        order.setTotal(subtotal.subtract(discount));
    }

    /** Another cashier's order answers 404, same as a missing one, so ids can't be probed. */
    private Order getVisibleOrder(Long id, CurrentUser actor) {
        return orderRepository.findVisibleById(id, actor)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    private OrderResponse toResponse(Order order) {
        Long cashierId = order.getCashier().getId();
        return orderMapper.toResponse(order, cashierNames(Set.of(cashierId)).get(cashierId),
                paymentRepository.findByOrderId(order.getId()).orElse(null));
    }

    /** One query for all cashiers on a page instead of one per order. */
    private Map<Long, String> cashierNames(Set<Long> userIds) {
        return profileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserProfile::getId, UserProfile::getFullName));
    }
}
