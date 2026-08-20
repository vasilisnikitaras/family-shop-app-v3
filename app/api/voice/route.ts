import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

// Only create client if key exists (local)
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    // If no key → disable voice on production
    if (!client) {
      return NextResponse.json(
        { error: "Voice transcription disabled (no OPENAI_API_KEY)" },
        { status: 200 }
      );
    }

    const formData = await req.formData();
    const blob = formData.get("file") as Blob;

    if (!blob) {
      return NextResponse.json(
        { error: "No audio file received" },
        { status: 400 }
      );
    }

    // Convert Blob → File (Whisper needs filename)
    const arrayBuffer = await blob.arrayBuffer();
    const file = new File([arrayBuffer], "voice.webm", {
      type: "audio/webm",
    });

    const response = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ text: response.text });
  } catch (err: any) {
    console.error("VOICE API ERROR:", err);
    return NextResponse.json(
      { error: "Voice transcription failed" },
      { status: 500 }
    );
  }
}
