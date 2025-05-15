-- Create the database
CREATE DATABASE IF NOT EXISTS farm_inventory;
USE farm_inventory;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  main_category VARCHAR(50) NOT NULL,
  main_category_label VARCHAR(100) NOT NULL,
  subcategory VARCHAR(50) NOT NULL,
  subcategory_label VARCHAR(100) NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create predefined_items table
CREATE TABLE IF NOT EXISTS predefined_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  unit ENUM('Kgs', 'Pcs') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create inventory_history table
CREATE TABLE IF NOT EXISTS inventory_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit ENUM('Kgs', 'Pcs') NOT NULL,
  date TIMESTAMP NOT NULL,
  harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id)
);

-- Insert base categories
INSERT INTO categories (main_category, main_category_label, subcategory, subcategory_label, is_system) VALUES
('agricultural', 'Agricultural', 'vegetables', 'Vegetables', TRUE),
('agricultural', 'Agricultural', 'soil', 'Soil', TRUE),
('agricultural', 'Agricultural', 'fertilizer', 'Fertilizer', TRUE),
('agricultural', 'Agricultural', 'cocopots', 'Cocopots', TRUE),
('agricultural', 'Agricultural', 'seedlings', 'Seedlings', TRUE),
('non-agricultural', 'Non-Agricultural', 'repurposed-products', 'Repurposed Products', TRUE),
('non-agricultural', 'Non-Agricultural', 'rugs', 'Rugs', TRUE),
('non-agricultural', 'Non-Agricultural', 'bags', 'Bags', TRUE),
('non-agricultural', 'Non-Agricultural', 'ecobricks', 'Ecobricks', TRUE);

-- Insert predefined vegetables
INSERT INTO predefined_items (category_id, name, unit) 
SELECT c.id, name, unit
FROM categories c
CROSS JOIN (
  SELECT 'Ampalaya' as name, 'Kgs' as unit UNION
  SELECT 'Gabi', 'Kgs' UNION
  SELECT 'Kalabasa', 'Kgs' UNION
  SELECT 'Kamatis', 'Kgs' UNION
  SELECT 'Kamias', 'Kgs' UNION
  SELECT 'Kamote', 'Kgs' UNION
  SELECT 'Kangkong', 'Kgs' UNION
  SELECT 'Luya', 'Kgs' UNION
  SELECT 'Malunggay', 'Kgs' UNION
  SELECT 'Mustasa', 'Kgs' UNION
  SELECT 'Okra', 'Kgs' UNION
  SELECT 'Oregano', 'Kgs' UNION
  SELECT 'Patola', 'Kgs' UNION
  SELECT 'Pechay', 'Kgs' UNION
  SELECT 'Papaya', 'Kgs' UNION
  SELECT 'Siling Haba', 'Kgs' UNION
  SELECT 'Sitaw', 'Kgs' UNION
  SELECT 'Talbos ng Kamote', 'Kgs' UNION
  SELECT 'Talong', 'Kgs'
) AS items
WHERE c.subcategory = 'vegetables';

-- Insert predefined seedlings
INSERT INTO predefined_items (category_id, name, unit)
SELECT c.id, CONCAT(name, ' Seedling'), 'Pcs'
FROM categories c
CROSS JOIN (
  SELECT 'Ampalaya' as name UNION
  SELECT 'Gabi' UNION
  SELECT 'Kalabasa' UNION
  SELECT 'Kamatis' UNION
  SELECT 'Kamias' UNION
  SELECT 'Kamote' UNION
  SELECT 'Kangkong' UNION
  SELECT 'Luya' UNION
  SELECT 'Malunggay' UNION
  SELECT 'Mustasa' UNION
  SELECT 'Okra' UNION
  SELECT 'Oregano' UNION
  SELECT 'Patola' UNION
  SELECT 'Pechay' UNION
  SELECT 'Papaya' UNION
  SELECT 'Siling Haba' UNION
  SELECT 'Sitaw' UNION
  SELECT 'Talbos ng Kamote' UNION
  SELECT 'Talong'
) AS items
WHERE c.subcategory = 'seedlings';

-- Insert predefined repurposed products
INSERT INTO predefined_items (category_id, name, unit)
SELECT c.id, name, 'Pcs'
FROM categories c
CROSS JOIN (
  SELECT 'Clothes' as name UNION
  SELECT 'Bags' UNION
  SELECT 'Rugs' UNION
  SELECT 'Ecobricks'
) AS items
WHERE c.subcategory = 'repurposed-products';