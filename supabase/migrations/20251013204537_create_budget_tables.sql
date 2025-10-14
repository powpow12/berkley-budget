/*
  # Budget Visualization Schema

  1. New Tables
    - `budget_items`
      - `id` (uuid, primary key)
      - `org_code` (text) - Organization code
      - `fund` (text) - Fund name/category
      - `object_code` (text) - Object code
      - `description` (text) - Line item description
      - `fy2023_budget` (numeric) - FY 2023 Budget amount
      - `fy2024_budget` (numeric) - FY 2024 Budget amount
      - `fy2025_budget` (numeric) - FY 2025 Budget amount
      - `fy2026_budget` (numeric) - FY 2026 Budget amount (BOS approved)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on org_code for fast filtering
    - Index on fund for department grouping
    - Index on description for search functionality

  3. Security
    - Enable RLS on `budget_items` table
    - Add policy for public read access (public budget data)
*/

CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_code text DEFAULT '',
  fund text DEFAULT '',
  object_code text DEFAULT '',
  description text NOT NULL,
  fy2023_budget numeric DEFAULT 0,
  fy2024_budget numeric DEFAULT 0,
  fy2025_budget numeric DEFAULT 0,
  fy2026_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_items_org_code ON budget_items(org_code);
CREATE INDEX IF NOT EXISTS idx_budget_items_fund ON budget_items(fund);
CREATE INDEX IF NOT EXISTS idx_budget_items_description ON budget_items(description);

ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public budget data is viewable by everyone"
  ON budget_items
  FOR SELECT
  TO anon, authenticated
  USING (true);