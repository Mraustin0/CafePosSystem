-- Promotion catalog (F-28 pairing): the promotions/coupons a cashier can look up and apply to an order.
-- The order-side discount is still stored on `orders` (discount_type + discount_value); this table is the
-- editable catalog of ready-made promotions.
CREATE TABLE promotions (
    id                BIGSERIAL PRIMARY KEY,
    code              VARCHAR(50)  NOT NULL UNIQUE,
    name              VARCHAR(100) NOT NULL,
    discount_type     VARCHAR(20)  NOT NULL CHECK (discount_type IN ('PERCENT', 'FIXED_AMOUNT')),
    discount_value    NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount  NUMERIC(10, 2) CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A couple of seed promos so the UI has something to show on first boot.
INSERT INTO promotions (code, name, discount_type, discount_value, min_order_amount, active) VALUES
    ('MEMBER10', 'ส่วนลดสมาชิก 10%', 'PERCENT',      10.00, 200.00, TRUE),
    ('WELCOME20', 'ต้อนรับลูกค้าใหม่ ลด 20 บาท', 'FIXED_AMOUNT', 20.00, 100.00, TRUE);
