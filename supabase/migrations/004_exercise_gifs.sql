-- Add GIF/image URL and instructions columns to exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS gif_url text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions text[];

-- Create Supabase Storage bucket for exercise media (run manually in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-gifs', 'exercise-gifs', true);
