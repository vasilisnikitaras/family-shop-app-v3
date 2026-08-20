import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
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
      language: "en",   // OK

      // ❌ task: "transcribe"
      // Το νέο Whisper API δεν το υποστηρίζει πλέον.
      // Το αφήνουμε εδώ ως comment για ιστορικό.
      // task: "transcribe",
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
