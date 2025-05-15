/*
  # Create Farm Inventory Schema

  1. New Tables
    - items
      - id (uuid, primary key)
      - name (text)
      - category (text)
      - quantity (integer)
      - unit (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - item_history
      - id (uuid, primary key)
      - item_id (uuid, foreign key)
      - change_amount (integer)
      - change_type (text)
      - notes (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create item_history table
CREATE TABLE IF NOT EXISTS item_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  change_amount integer NOT NULL,
  change_type text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_history ENABLE ROW LEVEL SECURITY;

-- Create policies for items table
CREATE POLICY "Enable read access for authenticated users" ON items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON items
  FOR DELETE TO authenticated USING (true);

-- Create policies for item_history table
CREATE POLICY "Enable read access for authenticated users" ON item_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON item_history
  FOR INSERT TO authenticated WITH CHECK (true);