/*
  # Budget Flows Table

  - Stores revenue/expense/backcharge rows used by the Sankey diagram
  - Public read; insert allowed for initial import (tighten in prod)
*/

create table if not exists budget_flows (
  id uuid primary key default gen_random_uuid(),
  classification text not null check (classification in ('REVENUE','EXPENSES','BACKCHARGES')),
  description text not null,
  fy2025 numeric default 0,
  fy2026 numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_budget_flows_classification on budget_flows(classification);
create index if not exists idx_budget_flows_description on budget_flows(description);

alter table budget_flows enable row level security;

create policy "Public flows readable" on budget_flows
  for select to anon, authenticated using (true);

create policy "Allow public flows insert (initial import)" on budget_flows
  for insert to anon, authenticated with check (true);
