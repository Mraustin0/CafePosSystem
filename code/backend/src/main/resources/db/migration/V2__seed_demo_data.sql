-- Demo data for development and the presentation.
-- Demo accounts (password: cafe1234) — change the passwords on the deployed instance.
-- IDs are never hard-coded: identity sequences stay correct and rows are linked by unique names.

INSERT INTO users (username, password_hash, role, active, created_at) VALUES
    ('admin',    '$2a$10$gQzdovpQYHNhSrrosOQ6UO/ADACE2gIvAJkPFAjiAgYdekTyNelNS', 'ADMIN',   TRUE, CURRENT_TIMESTAMP),
    ('cashier1', '$2a$10$gQzdovpQYHNhSrrosOQ6UO/ADACE2gIvAJkPFAjiAgYdekTyNelNS', 'CASHIER', TRUE, CURRENT_TIMESTAMP),
    ('cashier2', '$2a$10$gQzdovpQYHNhSrrosOQ6UO/ADACE2gIvAJkPFAjiAgYdekTyNelNS', 'CASHIER', TRUE, CURRENT_TIMESTAMP);

INSERT INTO user_profiles (user_id, full_name, phone, email) VALUES
    ((SELECT id FROM users WHERE username = 'admin'),    'Cafe Owner',     '0800000001', 'admin@cafepos.local'),
    ((SELECT id FROM users WHERE username = 'cashier1'), 'Cashier One',    '0800000002', 'cashier1@cafepos.local'),
    ((SELECT id FROM users WHERE username = 'cashier2'), 'Cashier Two',    '0800000003', NULL);

INSERT INTO categories (name) VALUES ('Coffee'), ('Tea'), ('Bakery');

INSERT INTO add_ons (name, price, active) VALUES
    ('Extra Shot',    15.00, TRUE),
    ('Oat Milk',      20.00, TRUE),
    ('Whipped Cream', 10.00, TRUE),
    ('Honey',         10.00, FALSE);

INSERT INTO products (category_id, name, price, active) VALUES
    ((SELECT id FROM categories WHERE name = 'Coffee'), 'Espresso',       45.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Coffee'), 'Americano',      50.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Coffee'), 'Latte',          60.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Coffee'), 'Mocha',          65.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Tea'),    'Thai Milk Tea',  50.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Tea'),    'Matcha Latte',   65.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Bakery'), 'Croissant',      55.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Bakery'), 'Brownie',        45.00, TRUE),
    ((SELECT id FROM categories WHERE name = 'Bakery'), 'Banana Cake',    40.00, FALSE);

INSERT INTO product_add_ons (product_id, add_on_id)
SELECT p.id, a.id
FROM products p
JOIN add_ons a ON a.name IN ('Extra Shot', 'Oat Milk', 'Whipped Cream')
WHERE p.name IN ('Americano', 'Latte', 'Mocha');

INSERT INTO product_add_ons (product_id, add_on_id)
SELECT p.id, a.id
FROM products p
JOIN add_ons a ON a.name IN ('Oat Milk', 'Whipped Cream')
WHERE p.name IN ('Thai Milk Tea', 'Matcha Latte');

-- Orders: 4 PAID (spread over the last days, for reports), 1 PENDING, 1 CANCELLED.
INSERT INTO orders (order_number, cashier_id, status, subtotal, discount_amount, total, created_at) VALUES
    ('ORD-DEMO-0001', (SELECT id FROM users WHERE username = 'cashier1'), 'PAID',      165.00,  0.00, 165.00, CURRENT_TIMESTAMP - INTERVAL '3' DAY),
    ('ORD-DEMO-0002', (SELECT id FROM users WHERE username = 'cashier1'), 'PAID',      105.00, 10.50,  94.50, CURRENT_TIMESTAMP - INTERVAL '2' DAY),
    ('ORD-DEMO-0003', (SELECT id FROM users WHERE username = 'cashier2'), 'PAID',      195.00, 20.00, 175.00, CURRENT_TIMESTAMP - INTERVAL '1' DAY),
    ('ORD-DEMO-0004', (SELECT id FROM users WHERE username = 'cashier2'), 'PAID',      100.00,  0.00, 100.00, CURRENT_TIMESTAMP),
    ('ORD-DEMO-0005', (SELECT id FROM users WHERE username = 'cashier1'), 'PENDING',    60.00,  0.00,  60.00, CURRENT_TIMESTAMP),
    ('ORD-DEMO-0006', (SELECT id FROM users WHERE username = 'cashier1'), 'CANCELLED',  45.00,  0.00,  45.00, CURRENT_TIMESTAMP - INTERVAL '1' DAY);

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, v.quantity, p.price
FROM (VALUES
    ('ORD-DEMO-0001', 'Latte',         2),
    ('ORD-DEMO-0001', 'Brownie',       1),
    ('ORD-DEMO-0002', 'Americano',     1),
    ('ORD-DEMO-0002', 'Croissant',     1),
    ('ORD-DEMO-0003', 'Matcha Latte',  3),
    ('ORD-DEMO-0004', 'Thai Milk Tea', 2),
    ('ORD-DEMO-0005', 'Latte',         1),
    ('ORD-DEMO-0006', 'Espresso',      1)
) AS v (order_number, product_name, quantity)
JOIN orders o ON o.order_number = v.order_number
JOIN products p ON p.name = v.product_name;

INSERT INTO payments (order_id, method, amount, paid_at)
SELECT o.id, v.method, v.amount, o.created_at
FROM (VALUES
    ('ORD-DEMO-0001', 'CASH',    200.00),
    ('ORD-DEMO-0002', 'QR_CODE',  94.50),
    ('ORD-DEMO-0003', 'CARD',    175.00),
    ('ORD-DEMO-0004', 'CASH',    100.00)
) AS v (order_number, method, amount)
JOIN orders o ON o.order_number = v.order_number;
