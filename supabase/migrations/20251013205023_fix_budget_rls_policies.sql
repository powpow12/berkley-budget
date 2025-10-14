/*
  # Fix Budget Items RLS Policies

  1. Changes
    - Add INSERT policy for anonymous and authenticated users
    - This allows the initial data import to work

  2. Security
    - Allows public read access (viewing budget data)
    - Allows public insert access (for initial data import)
    - In production, you may want to restrict INSERT to authenticated admins only
*/

CREATE POLICY "Allow public insert for data import"
  ON budget_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);