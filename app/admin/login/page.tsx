"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!data.success) {
      setError("Wrong username or password");
      return;
    }

    localStorage.setItem("admin_token", data.token);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <style jsx>{`
        .card {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 380px;
          margin: auto; /* ⭐ FIX */
        }
        .title {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          margin-bottom: 14px;
          font-size: 15px;
        }
        .button {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: #7c3aed;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .button:hover {
          background: #5b21b6;
        }
        .error {
          color: red;
          margin-bottom: 10px;
          text-align: center;
        }
      `}</style>

      <div className="card">
        <div className="title">Admin Login</div>

        {error && <div className="error">{error}</div>}

        <input
          className="input"
          placeholder="Admin username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="input"
          placeholder="Admin password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="button" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}
