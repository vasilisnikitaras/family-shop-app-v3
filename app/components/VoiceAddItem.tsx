"use client";
import { useState, useEffect } from "react";

export default function VoiceAddItem({ stores, onAdd }: any) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);   // ⭐ FIX
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null); // ⭐ FIX

  // 🔥 CLEANUP — Κλείνει το μικρόφωνο όταν κάνεις refresh / unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);


  // 🔥 STORE ALIASES — ΟΛΑ ΤΑ ΜΑΓΑΖΙΑ
  const storeAliases: Record<string, string[]> = {
  "super-c": [
    "super-c", "super c", "superc", "super see",
    "super sea", "super ci", "super si", "super ce"
  ],
  pa: ["pa", "p a", "πα", "πa", "pah"],
  atlantis: ["atlantis", "atl", "atlan", "atlantas"],
  metro: [
    "metro", "meto", "metroh", "μετρο", "μετρό",
    "to metro", "tu metro", "metrw", "metrw store"
  ],
  fanes: ["fanes", "φάνες", "fane", "faness"],
  iga: ["iga", "ίγκα", "iga store", "iga supermarket"],
  walmart: ["walmart", "wal mart", "wallmart"],
  "βασιλόπουλος": ["βασιλόπουλος", "vasilopoulos", "vassilopoulos"]
};


  function normalizeStore(text: any) {

    const lower = text.toLowerCase();
    for (const key of Object.keys(storeAliases)) {
      if (storeAliases[key].some(alias => lower.includes(alias))) {
        return key;
      }
    }
    return null;
  }

  // 🔥 PRODUCT ALIASES — ΟΛΑ ΤΑ ΠΡΟΪΟΝΤΑ
  const productAliases: Record<string, string[]> = {

    coffee: [
      "coffee", "greek coffee", "καφές",
      "papagalos", "παπαγάλος",
      "loumidis", "λουμίδης",
      "nescafe", "νέσκαφε",
      "frape", "φραπέ",
      "σιψά", "sipza", "sipsa"
    ],
    cola: ["cola", "κόλα", "gola", "coca cola", "coke"],
    pepsi: ["pepsi", "πέπσι"],
    fanta: ["fanta", "φάντα", "λεμον", "lemon", "fanta lemon"],
    sprite: ["sprite", "σπράιτ"],
    soda: ["soda", "σόδα"],
    milk: ["milk", "γάλα", "gala", "galaktos", "γαλακτος", "almond milk", "soy milk"],
    pasta: ["pasta", "μακαρόνια", "makaronia", "spaghetti", "σπαγγέτι", "penne", "πένες", "fusilli", "φουσίλι"],
    rice: ["rice", "ρύζι", "ryzi", "basmati", "μπασμάτι"],
    apple: ["apple", "μήλο", "milo"],
    banana: ["banana", "μπανάνα"],
    orange: ["orange", "πορτοκάλι"],
    lemon: ["lemon", "λεμόνι", "λεμονι"],
    grape: ["grape", "σταφύλι"],
    tomato: ["tomato", "ντομάτα", "domata"],
    potato: ["potato", "πατάτα", "patata"],
    onion: ["onion", "κρεμμύδι"],
    cucumber: ["cucumber", "αγγούρι"],
    pepper: ["pepper", "πιπεριά"],
    steak: ["steak", "steaks", "μπριζόλα", "μπριζόλες", "brizola", "brizoles"],
    chicken: ["chicken", "κοτόπουλο"],
    pork: ["pork", "χοιρινό"],
    beef: ["beef", "μοσχάρι"],
    feta: ["feta", "φέτα"],
    cheese: ["cheese", "τυρί"],
    ham: ["ham", "ζαμπόν"],
    salami: ["salami", "σαλάμι"],
    bacon: ["bacon", "μπέικον"],
    bread: ["bread", "ψωμί"],
    toast: ["toast", "τοστ"],
    chips: ["chips", "τσιπς", "πατατάκια"],
    chocolate: ["chocolate", "σοκολάτα"],
    detergent: ["detergent", "απορρυπαντικό"],
    soap: ["soap", "σαπούνι"],
    bleach: ["bleach", "χλωρίνη"],
    papadopoulou: ["papadopoulou", "παπαδοπούλου"],
    ion: ["ion", "ιον"],
    melissa: ["melissa", "μελισσα"],
    minerva: ["minerva", "μινέρβα"],
    dodoni: ["dodoni", "δωδώνη"],
  };

  function normalizeProduct(text: any) {

    const lower = text.toLowerCase();
    for (const key of Object.keys(productAliases)) {
      if (productAliases[key].some(alias => lower.includes(alias))) {
        return key;
      }
    }
    return null;
  }

  // 🔥 PARSING
  function parseCommand(text: any) {

    text = text
      .replace(/f[\s\-]?a[\s\-]?n[\s\-]?e[\s\-]?s/i, "fanes")
      .replace(/p[\s\-]?a/i, "pa")
      .replace(/i[\s\-]?g[\s\-]?a/i, "iga")
      .replace(/m[\s\-]?e[\s\-]?t[\s\-]?r[\s\-]?o/i, "metro")
      .replace(/s[\s\-]?u[\s\-]?p[\s\-]?e[\s\-]?r[\s\-]?c/i, "super c")
      .replace(/w[\s\-]?a[\s\-]?l[\s\-]?m[\s\-]?a[\s\-]?r[\s\-]?t/i, "walmart")
      .replace(/a[\s\-]?t[\s\-]?l[\s\-]?a[\s\-]?n[\s\-]?t[\s\-]?i[\s\-]?s/i, "atlantis");

    text = text.replace(/[.,]/g, "");
    text = text.replace(/^and\s+/i, "");
    text = text
      .replace(/\badd\b/i, "")
      .replace(/\bat\b/i, "")
      .replace(/\bone\b/i, "")
      .replace(/\s+/g, " ")
      .trim();

    const lower = text.toLowerCase();

    const quantityMatch = lower.match(/(\d+)/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

    const product = normalizeProduct(lower);
    const store = normalizeStore(lower);

    if (!product || !store) return null;

    return { product, quantity, store };
  }

  // 🔥 MIC TOGGLE
  const handleToggleListening = async () => {
    if (listening) {
      setTranscript("");

      if (mediaRecorder) mediaRecorder.stop();
      if (stream) stream.getTracks().forEach(t => t.stop());

      setListening(false);
      return;
    }

    const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setStream(newStream);

    const recorder = new MediaRecorder(newStream);
    setMediaRecorder(recorder);

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("file", blob);

      const res = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data || !data.text) {
        setTranscript("ERROR: No text returned");
        setListening(false);
        return;
      }

      setTranscript(data.text);

      const parsed = parseCommand(data.text);
      if (parsed) {
        onAdd({
          name: parsed.product,
          quantity: parsed.quantity,
          store: parsed.store.replace(/-/g, " "),
          text: data.text
        });
      }

      setListening(false);
    };

    recorder.start();
    setListening(true);
  };

  return (
    <div>
      <button
        onClick={handleToggleListening}
        style={{
          background: listening ? "red" : "green",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        {listening ? "Stop 🎤" : "Start 🎤"}
      </button>

      <p>You said: {transcript}</p>
    </div>
  );
}
