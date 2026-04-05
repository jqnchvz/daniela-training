-- Seed exercises with deterministic UUIDs for referencing in workout plans
-- Using uuid_generate_v5 with DNS namespace for idempotent seeds

-- Compound / Multi-joint exercises
INSERT INTO exercises (id, name, category, muscle_groups, equipment, notes) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Dumbbell Goblet Squat', 'compound', ARRAY['quads', 'glutes', 'core'], ARRAY['dumbbell'], 'Hold dumbbell at chest level. Keep elbows inside knees.'),
  ('a0000000-0000-4000-8000-000000000002', 'Romanian Deadlift (DB)', 'compound', ARRAY['hamstrings', 'glutes', 'lower_back'], ARRAY['dumbbell'], 'Hinge at hips, slight knee bend. Feel stretch in hamstrings.'),
  ('a0000000-0000-4000-8000-000000000003', 'Dumbbell Bench Press', 'compound', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['dumbbell'], 'Flat bench. Control the eccentric.'),
  ('a0000000-0000-4000-8000-000000000004', 'Dumbbell Overhead Press', 'compound', ARRAY['shoulders', 'triceps', 'core'], ARRAY['dumbbell'], 'Seated or standing. Brace core throughout.'),
  ('a0000000-0000-4000-8000-000000000005', 'Dumbbell Bent-Over Row', 'compound', ARRAY['back', 'biceps', 'rear_delts'], ARRAY['dumbbell'], 'Hinge forward 45 degrees. Pull to hip.'),
  ('a0000000-0000-4000-8000-000000000006', 'Dumbbell Lunges', 'compound', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['dumbbell'], 'Alternating or walking. Knee tracks over toe.'),
  ('a0000000-0000-4000-8000-000000000007', 'Hip Thrust', 'compound', ARRAY['glutes', 'hamstrings'], ARRAY['machine', 'dumbbell'], 'Machine or DB on hips. Squeeze glutes at top.'),
  ('a0000000-0000-4000-8000-000000000008', 'Lat Pulldown', 'compound', ARRAY['back', 'biceps', 'rear_delts'], ARRAY['machine'], 'Wide grip. Pull to upper chest.'),
  ('a0000000-0000-4000-8000-000000000009', 'Leg Press', 'compound', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['machine'], 'Feet shoulder-width. Do not lock knees.'),
  ('a0000000-0000-4000-8000-00000000000a', 'Cable Face Pulls', 'multi_joint', ARRAY['rear_delts', 'upper_back', 'rotator_cuff'], ARRAY['cable'], 'Pull to face level. External rotation at top.')
ON CONFLICT (name) DO NOTHING;

-- Accessory / Isolation exercises
INSERT INTO exercises (id, name, category, muscle_groups, equipment, notes) VALUES
  ('a0000000-0000-4000-8000-00000000000b', 'Dumbbell Bicep Curls', 'isolation', ARRAY['biceps'], ARRAY['dumbbell'], 'Standing or seated. No swinging.'),
  ('a0000000-0000-4000-8000-00000000000c', 'Tricep Pushdowns', 'isolation', ARRAY['triceps'], ARRAY['cable'], 'Cable machine. Keep elbows pinned to sides.'),
  ('a0000000-0000-4000-8000-00000000000d', 'Lateral Raises', 'isolation', ARRAY['shoulders'], ARRAY['dumbbell'], 'Slight bend in elbows. Raise to shoulder height.'),
  ('a0000000-0000-4000-8000-00000000000e', 'Calf Raises', 'isolation', ARRAY['calves'], ARRAY['dumbbell', 'machine'], 'Full range of motion. Pause at top.'),
  ('a0000000-0000-4000-8000-00000000000f', 'Plank', 'isolation', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'Hold position. Keep hips level with shoulders.'),
  ('a0000000-0000-4000-8000-000000000010', 'Dead Bug', 'isolation', ARRAY['core'], ARRAY['bodyweight'], 'Opposite arm/leg extension. Press lower back into floor.'),
  ('a0000000-0000-4000-8000-000000000011', 'Cable Woodchops', 'multi_joint', ARRAY['core', 'obliques'], ARRAY['cable'], 'Rotate through core. Control the return.')
ON CONFLICT (name) DO NOTHING;

-- Workout Plans
INSERT INTO workout_plans (id, name, phase, day_of_week) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'Day A — Push Focus', 1, 1),
  ('b0000000-0000-4000-8000-000000000002', 'Day B — Pull Focus', 1, 3),
  ('b0000000-0000-4000-8000-000000000003', 'Day C — Legs / Full Body', 1, 5)
ON CONFLICT DO NOTHING;

-- Day A (Monday): Goblet squat 3x10, DB bench press 3x10, DB bent-over row 3x10, Lateral raises 2x12, Tricep pushdowns 2x12, Plank 2x30sec
INSERT INTO workout_plan_exercises (plan_id, exercise_id, sets, reps, target_weight, rest_seconds, "order") VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 3, 10, NULL, 150, 1),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 3, 10, NULL, 150, 2),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 3, 10, NULL, 150, 3),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000d', 2, 12, NULL, 120, 4),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000c', 2, 12, NULL, 120, 5),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-00000000000f', 2, 30, NULL, 120, 6)
ON CONFLICT DO NOTHING;

-- Day B (Wednesday): Romanian deadlift 3x10, Lat pulldown 3x10, DB overhead press 3x10, Cable face pulls 2x12, DB bicep curls 2x12, Dead bug 2x10
INSERT INTO workout_plan_exercises (plan_id, exercise_id, sets, reps, target_weight, rest_seconds, "order") VALUES
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 3, 10, NULL, 150, 1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000008', 3, 10, NULL, 150, 2),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', 3, 10, NULL, 150, 3),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-00000000000a', 2, 12, NULL, 120, 4),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-00000000000b', 2, 12, NULL, 120, 5),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000010', 2, 10, NULL, 120, 6)
ON CONFLICT DO NOTHING;

-- Day C (Friday): Leg press 3x10, Hip thrust 3x10, DB lunges 2x10, Cable woodchops 2x12, Calf raises 2x15, Plank 2x30sec
INSERT INTO workout_plan_exercises (plan_id, exercise_id, sets, reps, target_weight, rest_seconds, "order") VALUES
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000009', 3, 10, NULL, 150, 1),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000007', 3, 10, NULL, 150, 2),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000006', 2, 10, NULL, 150, 3),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000011', 2, 12, NULL, 120, 4),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-00000000000e', 2, 15, NULL, 120, 5),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-00000000000f', 2, 30, NULL, 120, 6)
ON CONFLICT DO NOTHING;
