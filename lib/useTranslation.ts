"use client";

import { useState, useEffect } from "react";

export function useTranslation() {
  const [lang, setLang] = useState("en");
  const [t, setT] = useState<any>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/translations/${lang}.json`);
      const data = await res.json();
      setT(data);
    };
    load();
  }, [lang]);

  return { t, lang, setLang };
}
