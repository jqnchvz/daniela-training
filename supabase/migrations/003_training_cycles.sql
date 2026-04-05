-- Training cycles for 16-week periodization
create table training_cycles (
  id uuid primary key default uuid_generate_v4(),
  start_date date not null,
  current_phase integer not null default 1 check (current_phase between 1 and 3),
  extension_weeks integer not null default 0 check (extension_weeks between 0 and 12),
  notes text,
  created_at timestamptz not null default now()
);

-- Progression events log
create table progression_events (
  id uuid primary key default uuid_generate_v4(),
  exercise_id uuid not null references exercises(id),
  date date not null,
  old_weight decimal not null,
  new_weight decimal not null,
  created_at timestamptz not null default now()
);

create index idx_training_cycles_start on training_cycles(start_date desc);
create index idx_progression_events_exercise on progression_events(exercise_id, date desc);
