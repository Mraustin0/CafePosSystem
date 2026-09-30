-- Add-ons chosen for each order line (e.g. Latte + Oat Milk). Many-to-Many with a payload:
-- price is a snapshot, so later add-on price changes do not rewrite past orders.
-- An add-on can be chosen once per line (primary key); line total = quantity x (unit_price + sum of add-on prices).
CREATE TABLE order_item_add_ons (
    order_item_id BIGINT         NOT NULL REFERENCES order_items (id) ON DELETE CASCADE,
    add_on_id     BIGINT         NOT NULL REFERENCES add_ons (id),
    price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    PRIMARY KEY (order_item_id, add_on_id)
);
CREATE INDEX idx_order_item_add_ons_add_on ON order_item_add_ons (add_on_id);
