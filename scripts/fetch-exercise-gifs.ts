/**
 * One-time script to fetch exercise images and instructions from the
 * free-exercise-db (https://github.com/yuhonas/free-exercise-db)
 * and optionally upload to Supabase Storage.
 *
 * Usage:
 *   npx tsx scripts/fetch-exercise-gifs.ts
 *
 * If SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set, uploads to Supabase Storage.
 * Otherwise, stores image URLs pointing to GitHub raw content (free CDN).
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const FREE_EXERCISE_DB_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main";

// Mapping from our exercise names to free-exercise-db exercise IDs
const EXERCISE_MAPPINGS = [
  { ourName: "Dumbbell Goblet Squat", searchId: "Dumbbell_Goblet_Squat", fallbackId: "Goblet_Squat" },
  { ourName: "Romanian Deadlift (DB)", searchId: "Dumbbell_Stiff_Leg_Deadlift", fallbackId: "Romanian_Deadlift_With_Dumbbells" },
  { ourName: "Dumbbell Bench Press", searchId: "Dumbbell_Bench_Press", fallbackId: null },
  { ourName: "Dumbbell Overhead Press", searchId: "Dumbbell_Shoulder_Press", fallbackId: "Standing_Dumbbell_Shoulder_Press" },
  { ourName: "Dumbbell Bent-Over Row", searchId: "Bent_Over_Two-Dumbbell_Row", fallbackId: "Dumbbell_Bent_Over_Row" },
  { ourName: "Dumbbell Lunges", searchId: "Dumbbell_Lunges", fallbackId: "Dumbbell_Lunge" },
  { ourName: "Hip Thrust", searchId: "Barbell_Hip_Thrust", fallbackId: "Glute_Bridge" },
  { ourName: "Lat Pulldown", searchId: "Wide-Grip_Lat_Pulldown", fallbackId: "Cable_Lat_Pulldown" },
  { ourName: "Leg Press", searchId: "Leg_Press", fallbackId: null },
  { ourName: "Cable Face Pulls", searchId: "Face_Pull", fallbackId: null },
  { ourName: "Dumbbell Bicep Curls", searchId: "Dumbbell_Bicep_Curl", fallbackId: "Alternate_Dumbbell_Curl" },
  { ourName: "Tricep Pushdowns", searchId: "Triceps_Pushdown", fallbackId: "Cable_Triceps_Pushdown" },
  { ourName: "Lateral Raises", searchId: "Side_Lateral_Raise", fallbackId: "Dumbbell_Lateral_Raise" },
  { ourName: "Calf Raises", searchId: "Standing_Calf_Raises", fallbackId: "Calf_Raise" },
  { ourName: "Plank", searchId: "Plank", fallbackId: "Front_Plank" },
  { ourName: "Dead Bug", searchId: "Dead_Bug", fallbackId: null },
  { ourName: "Cable Woodchops", searchId: "Standing_Cable_Wood_Chop", fallbackId: "Cable_Woodchop" },
];

async function fetchExerciseData(exerciseId: string): Promise<{
  instructions: string[];
  imageUrl: string | null;
} | null> {
  const jsonUrl = `${FREE_EXERCISE_DB_BASE}/exercises/${exerciseId}.json`;
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) return null;

    const data = await response.json();
    const instructions: string[] = data.instructions || [];
    const images: string[] = data.images || [];

    let imageUrl: string | null = null;
    if (images.length > 0) {
      imageUrl = `${FREE_EXERCISE_DB_BASE}/exercises/${images[0]}`;
    }

    return { instructions, imageUrl };
  } catch {
    return null;
  }
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const useSupabase = !!(supabaseUrl && supabaseKey);

  let supabase: ReturnType<typeof createClient> | null = null;
  if (useSupabase) {
    supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log("Connected to Supabase — will upload GIFs to storage\n");
  } else {
    console.log("No Supabase credentials — will generate URL mappings only\n");
  }

  const results: Array<{
    name: string;
    gifUrl: string | null;
    instructions: string[];
  }> = [];

  for (const mapping of EXERCISE_MAPPINGS) {
    // Try primary search ID first, then fallback
    let data = await fetchExerciseData(mapping.searchId);
    if (!data && mapping.fallbackId) {
      data = await fetchExerciseData(mapping.fallbackId);
    }

    if (data) {
      let gifUrl = data.imageUrl;

      // If Supabase is configured, download and upload to storage
      if (supabase && gifUrl) {
        try {
          const imageResponse = await fetch(gifUrl);
          if (imageResponse.ok) {
            const buffer = Buffer.from(await imageResponse.arrayBuffer());
            const fileName = `${mapping.ourName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`;
            const { error } = await supabase.storage
              .from("exercise-gifs")
              .upload(fileName, buffer, {
                contentType: "image/jpeg",
                upsert: true,
              });

            if (!error) {
              const { data: urlData } = supabase.storage
                .from("exercise-gifs")
                .getPublicUrl(fileName);
              gifUrl = urlData.publicUrl;
              console.log(`  ✓ Uploaded to Supabase Storage`);
            } else {
              console.log(`  ⚠ Upload failed: ${error.message}, using GitHub URL`);
            }
          }
        } catch (err) {
          console.log(`  ⚠ Download failed, using GitHub URL`);
        }
      }

      // Update database if Supabase connected
      if (supabase) {
        await supabase
          .from("exercises")
          .update({
            gif_url: gifUrl,
            instructions: data.instructions,
          })
          .eq("name", mapping.ourName);
      }

      results.push({
        name: mapping.ourName,
        gifUrl: gifUrl,
        instructions: data.instructions,
      });

      console.log(
        `✓ ${mapping.ourName} — ${data.instructions.length} instructions, image: ${gifUrl ? "yes" : "no"}`,
      );
    } else {
      results.push({ name: mapping.ourName, gifUrl: null, instructions: [] });
      console.log(`⚠ ${mapping.ourName} — not found in exercise DB, skipping`);
    }

    // Rate limit: 500ms between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Write results to a local JSON file for reference
  const outputPath = path.join(__dirname, "../src/lib/exercise-media.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Saved ${results.length} exercise media mappings to src/lib/exercise-media.json`);

  const found = results.filter((r) => r.gifUrl).length;
  console.log(`\nSummary: ${found}/${results.length} exercises have images`);
}

main().catch(console.error);
