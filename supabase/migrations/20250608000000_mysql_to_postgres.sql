-- Convert MySQL database to PostgreSQL

-- Drop existing tables if they exist
DROP TABLE IF EXISTS action_logs CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS item_history CASCADE;
DROP TABLE IF EXISTS predefined_items CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS password_reset_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS action_type;
DROP TYPE IF EXISTS change_type;
DROP TYPE IF EXISTS unit_type;

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'operator', 'supervisor');
CREATE TYPE action_type AS ENUM ('login', 'logout', 'add_item', 'update_item', 'delete_item', 'increase_stock', 'reduce_stock');
CREATE TYPE change_type AS ENUM ('add', 'reduce', 'increase');
CREATE TYPE unit_type AS ENUM ('kg', 'pcs');

-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    contact VARCHAR(100),
    subdivision VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    label VARCHAR(100) NOT NULL,
    unit unit_type DEFAULT 'kg',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE predefined_items (
    id SERIAL PRIMARY KEY,
    subcat_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    unit unit_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    main_category_id INTEGER REFERENCES categories(id)
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    predefined_item_id INTEGER NOT NULL REFERENCES predefined_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    harvest_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_history (
    id SERIAL PRIMARY KEY,
    predefined_item_id INTEGER REFERENCES predefined_items(id),
    quantity INTEGER,
    notes VARCHAR(255),
    change_type change_type,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    harvest_date DATE
);

CREATE TABLE action_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action_type action_type NOT NULL,
    description TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP
);

-- Create or replace the function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, label, is_system) VALUES
('agricultural', 'Agricultural', true),
('non-agricultural', 'Non-Agricultural', true);

-- Insert default subcategories
INSERT INTO subcategories (category_id, name, label, unit, is_system) VALUES
(1, 'vegetables', 'Vegetables', 'kg', true),
(1, 'soil', 'Soil', 'kg', true),
(1, 'fertilizer', 'Fertilizer', 'kg', true),
(1, 'cocopots', 'Cocopots', 'pcs', true),
(1, 'seedlings', 'Seedlings', 'pcs', true),
(2, 'repurposed_items', 'Repurposed Items', 'pcs', true);

-- Insert default user
INSERT INTO users (username, email, password, role, contact, subdivision)
VALUES (
    'supervisor1',
    'sup@example.com',
    '$2y$10$YOUR_HASHED_PASSWORD',  -- Replace with a properly hashed password
    'supervisor',
    '09171234567',
    'Phase 1'
);
