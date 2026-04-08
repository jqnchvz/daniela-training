-- Menstrual cycle phase tracking
-- Stores period start dates and enabled flag per user
create table menstrual_cycle_phase (
  id uuid primary key not null,
  user_id uuid references users(id) on delete cascade,
  enabled boolean not null default false,
  period_start_dates text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index idx_menstrual_cycle_phase_user on menstrual_cycle_phase(user_id);
