import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ABOUT_SECTIONS } from "../lib/about-sections"; // relative: tsx doesn't resolve the "@/" alias

const OUT_DIR = path.join(process.cwd(), "public", "audio");
const force = process.argv.includes("--force");
const listOnly = process.argv.includes("--list-voices");

// Multilingual v2 is the most natural-sounding model; it costs 1 credit/char, which the free tier covers for this copy
const MODEL_ID = "eleven_multilingual_v2";

interface Voice {
  voice_id: string;
  name: string;
  category: string;
}

interface VoicesResponse {
  voices: Voice[];
}

const exists = (file: string): Promise<boolean> =>
  access(file).then(
    () => true,
    () => false,
  );

// Asks the account which voices it has, instead of trusting a hardcoded ID that ElevenLabs can reclassify
const fetchVoices = async (apiKey: string): Promise<Voice[]> => {
  const response = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`);
  }
  return ((await response.json()) as VoicesResponse).voices;
};

const resolveVoiceId = async (apiKey: string): Promise<string> => {
  if (process.env.ELEVENLABS_VOICE_ID) return process.env.ELEVENLABS_VOICE_ID;

  // Free plans can only use "premade" voices through the API; library voices return 402
  const premade = (await fetchVoices(apiKey)).filter(
    (v) => v.category === "premade",
  );
  if (premade.length === 0) {
    throw new Error(
      "No premade voices on this account; set ELEVENLABS_VOICE_ID manually",
    );
  }
  console.log(`Using voice "${premade[0].name}" (${premade[0].voice_id})`);
  return premade[0].voice_id;
};

const synthesize = async (
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<Buffer> => {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        // Slightly higher stability keeps the delivery steady across seven separate clips
        voice_settings: { stability: 0.55, similarity_boost: 0.75 },
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

const main = async (): Promise<void> => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");

  if (listOnly) {
    (await fetchVoices(apiKey)).forEach((v) =>
      console.log(
        `${v.category.padEnd(10)} ${v.name.padEnd(20)} ${v.voice_id}`,
      ),
    );
    return;
  }

  const voiceId = await resolveVoiceId(apiKey);
  await mkdir(OUT_DIR, { recursive: true });

  // Sequential, and skipping existing files, so a re-run never spends credits on a take you kept
  for (const [i, section] of ABOUT_SECTIONS.entries()) {
    const file = path.join(OUT_DIR, `section-${i}.mp3`);
    if (!force && (await exists(file))) {
      console.log(`Skipped ${file} (exists, use --force to regenerate)`);
      continue;
    }
    await writeFile(
      file,
      await synthesize(`${section.label}. ${section.body}`, voiceId, apiKey),
    );
    console.log(`Wrote ${file}`);
  }
};

main().catch((error: unknown) => {
  // Fail loudly: a half-generated set would leave the page playing 404s mid-reading
  console.error("Audio generation failed", error);
  process.exit(1);
});
