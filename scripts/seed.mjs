#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

// Load env if available (optional)
try {
  const dotenv = await import('dotenv');
  dotenv.config?.();
} catch {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env vars. Set VITE_SUPABASE_URL and either SUPABASE_SERVICE_ROLE or VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseCurrency(value) {
  if (!value || !value.trim()) return 0;
  const n = parseFloat(value.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function parseCsvLineAware(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out.map(f => f.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
}

async function readCsv(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines.map(parseCsvLineAware);
}

async function seedBudgetItems(rootDir) {
  const file = path.resolve(rootDir, 'src/data/FY26 Budget - Sheet2.csv');
  const rows = await readCsv(file);
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Ensure at least 8 columns
    while (row.length < 8) row.push('');
    const [org_code, fund, object_code, description, fy2023, fy2024, fy2025, fy2026] = row;
    if (!description) continue;
    items.push({
      org_code: org_code || '',
      fund: fund || '',
      object_code: object_code || '',
      description,
      fy2023_budget: parseCurrency(fy2023),
      fy2024_budget: parseCurrency(fy2024),
      fy2025_budget: parseCurrency(fy2025),
      fy2026_budget: parseCurrency(fy2026)
    });
  }
  await insertChunked('budget_items', items);
}

async function seedBudgetFlows(rootDir) {
  const file = path.resolve(rootDir, 'src/data/FY26 Budget - Sheet1.csv');
  const rows = await readCsv(file);
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Expected: Classification, Description, FY 2025, FY2026, ...
    const classification = (row[0] || '').toUpperCase();
    const description = row[1] || '';
    const fy2025 = row[2] || '';
    const fy2026 = row[3] || '';
    if (!classification || !description) continue;
    if (!['REVENUE', 'EXPENSES', 'BACKCHARGES'].includes(classification)) continue;
    items.push({
      classification,
      description,
      fy2025: parseCurrency(fy2025),
      fy2026: parseCurrency(fy2026)
    });
  }
  await insertChunked('budget_flows', items);
}

async function insertChunked(table, rows, chunkSize = 500) {
  console.log(`Inserting ${rows.length} rows into ${table}...`);
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      console.error(`Error inserting into ${table} at chunk starting ${i}:`, error.message);
      process.exit(1);
    }
  }
  console.log(`Done seeding ${table}.`);
}

async function main() {
  const rootDir = process.cwd();
  await seedBudgetItems(rootDir);
  await seedBudgetFlows(rootDir);
  console.log('Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


