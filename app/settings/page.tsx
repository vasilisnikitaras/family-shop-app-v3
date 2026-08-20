"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const router = useRouter();

  const [familyCode, setFamilyCode] = useState("");
  const [theme, setTheme] = useState("light");

  // ⭐ THEME FIX — LISTEN FOR CHANGES
  useEffect(() => {
    const fc = localStorage.getItem("family_code") || "";
    setFamilyCode(fc);

    const t = localStorage.getItem("theme") || "light";
    setTheme(t);

    const handler = () => {
      const newTheme = localStorage.getItem("theme") || "light";
      setTheme(newTheme);
    };

    window.addEventListener("theme-change", handler);

    return () => window.removeEventListener("theme-change", handler);
  }, []);

  // ⭐ CHANGE FAMILY CODE (NEON)
  const changeFamilyCode = async () => {
    const newCode = prompt("Enter new family code:", familyCode);
    if (!newCode) return;

    const res = await fetch("/api/changeFamilyCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_code: familyCode,
        new_code: newCode
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Error updating family code.");
      return;
    }

    localStorage.setItem("family_code", newCode);
    setFamilyCode(newCode);

    alert("Family code updated!");
    router.push("/");
    location.reload();
  };

  // ⭐ CHANGE FAMILY PASSWORD (NEON)
  const changeFamilyPassword = async () => {
    const newPass = prompt("Enter new family password:");
    if (!newPass) return;

    const res = await fetch("/api/changeFamilyPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_code: familyCode,
        new_password: newPass
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Error updating password.");
      return;
    }

    localStorage.setItem("family_password", newPass);

    alert("Password updated!");
    router.push("/");
    location.reload();
  };

  // ⭐ CLEAR CACHE
  const clearCache = async () => {
    const keys = await caches.keys();
    for (const key of keys) {
      await caches.delete(key);
    }
    alert("Cache cleared! Reloading...");
    location.reload();
  };

  return (
    <div
      className={`min-h-screen p-4 pt-safe flex flex-col items-center ${
        theme === "dark"
          ? "bg-[#1c1c1e] text-white"
          : "bg-[#f2f2f7] text-black"
      }`}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 w-full max-w-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          ⚙️ Settings
        </h1>

        <button
          onClick={() => router.push("/")}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
        >
          Back
        </button>
      </div>

      {/* ⭐ BLOCKS */}
      <div className="space-y-4">

        {/* ⭐ FAMILY CODE */}
        {/* OLD:
        <div className="bg-white dark:bg-[#2c2c2e] rounded-xl shadow p-4">
        */}
        {/* NEW: */}
        <div
          className={`rounded-xl shadow p-4 ${
            theme === "dark" ? "bg-[#2c2c2e] text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-lg font-semibold mb-1">Family Code</h2>

          {/* OLD:
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          */}
          {/* NEW: */}
          <p
            className={`text-sm mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Current: {familyCode}
          </p>

          <button
            className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg"
            onClick={changeFamilyCode}
          >
            Change Family Code
          </button>
        </div>

        {/* ⭐ FAMILY PASSWORD */}
        {/* OLD:
        <div className="bg-white dark:bg-[#2c2c2e] rounded-xl shadow p-4">
        */}
        {/* NEW: */}
        <div
          className={`rounded-xl shadow p-4 ${
            theme === "dark" ? "bg-[#2c2c2e] text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-lg font-semibold mb-1">Family Password</h2>

          {/* OLD:
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          */}
          {/* NEW: */}
          <p
            className={`text-sm mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Change the password for this family
          </p>

          <button
            className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg"
            onClick={changeFamilyPassword}
          >
            Change Password
          </button>
        </div>

        {/* ⭐ CLEAR CACHE */}
        {/* OLD:
        <div className="bg-white dark:bg-[#2c2c2e] rounded-xl shadow p-4">
        */}
        {/* NEW: */}
        <div
          className={`rounded-xl shadow p-4 ${
            theme === "dark" ? "bg-[#2c2c2e] text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-lg font-semibold mb-1">Clear Cache</h2>

          {/* OLD:
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          */}
          {/* NEW: */}
          <p
            className={`text-sm mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Fix issues by clearing PWA cache
          </p>

          <button
            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg"
            onClick={clearCache}
          >
            Clear Cache
          </button>
        </div>

        {/* ⭐ ABOUT */}
        {/* OLD:
        <div className="bg-white dark:bg-[#2c2c2e] rounded-xl shadow p-4">
        */}
        {/* NEW: */}
        <div
          className={`rounded-xl shadow p-4 ${
            theme === "dark" ? "bg-[#2c2c2e] text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-lg font-semibold mb-1">About</h2>

          {/* OLD:
          <footer className="text-center text-xs opacity-70">
          */}
          {/* NEW: */}
          <footer
            className={`text-center text-xs opacity-70 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            © 2026 VNF Software — Created by Vasilis Fanes Nikitaras.<br />
            Unauthorized copying or resale is strictly prohibited.<br />
            Contact:
            <a
              href="mailto:vasilis.nikitaras@gmail.com?subject=FamilyShop%20Support"
              className="text-blue-500 underline"
            >
              vasilis.nikitaras@gmail.com
            </a>
          </footer>
        </div>

      </div>
    </div>
  );
}
