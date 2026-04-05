-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Exercises table
create table exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text not null check (category in ('compound', 'multi_joint', 'isolation')),
  muscle_groups text[] not null default '{}',
  equipment text[] not null default '{}',
  notes text
);

-- Workout plans table
create table workout_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phase integer not null default 1,
  day_of_week integer not null check (day_of_week between 0 and 6),
  created_at timestamptz not null default now()
);

-- Workout plan exercises (join table)
create table workout_plan_exercises (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references workout_plans(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  sets integer not null,
  reps integer not null,
  target_weight decimal,
  rest_seconds integer not null default 150,
  "order" integer not null
);

-- Session logs
create table session_logs (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references workout_plans(id),
  date date not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  energy_pre integer check (energy_pre between 1 and 10),
  energy_post integer check (energy_post between 1 and 10),
  notes text
);

-- Set logs
create table set_logs (
  id uuid primary key default uuid_generate_v4(),
  session_log_id uuid not null references session_logs(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_number integer not null,
  weight decimal not null default 0,
  reps integer not null default 0,
  rpe integer check (rpe between 1 and 10),
  completed boolean not null default false
);

-- Daily check-ins
create table daily_checkins (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  energy integer not null check (energy between 1 and 10),
  sleep_quality integer not null check (sleep_quality between 1 and 10),
  sleep_hours decimal,
  mood integer not null check (mood between 1 and 10),
  soreness integer not null check (soreness between 1 and 10),
  notes text,
  created_at timestamptz not null default now()
);

-- Body measurements
create table body_measurements (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  weight_kg decimal,
  waist_cm decimal,
  hips_cm decimal,
  notes text
);

-- Indexes for common queries
create index idx_session_logs_date on session_logs(date desc);
create index idx_session_logs_plan on session_logs(plan_id);
create index idx_set_logs_session on set_logs(session_log_id);
create index idx_set_logs_exercise on set_logs(exercise_id);
create index idx_daily_checkins_date on daily_checkins(date desc);
create index idx_body_measurements_date on body_measurements(date desc);
create index idx_workout_plan_exercises_plan on workout_plan_exercises(plan_id);
