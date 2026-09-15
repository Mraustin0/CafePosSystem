-- Keep how the discount was entered, not only the amount, so it can be recalculated when items change.
-- (Two statements: H2, used by tests, does not accept several ADD COLUMN clauses in one ALTER.)
ALTER TABLE orders ADD COLUMN discount_type VARCHAR(20) NOT NULL DEFAULT 'NONE'
    CHECK (discount_type IN ('NONE', 'PERCENT', 'FIXED_AMOUNT'));
ALTER TABLE orders ADD COLUMN discount_value NUMERIC(10, 2) CHECK (discount_value >= 0);

-- Existing discounted orders keep exactly the same amount, recorded as a fixed-amount discount.
UPDATE orders SET discount_type = 'FIXED_AMOUNT', discount_value = discount_amount WHERE discount_amount > 0;
