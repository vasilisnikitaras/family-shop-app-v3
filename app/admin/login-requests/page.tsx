"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";

export default function AdminLoginRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  async function loadRequests() {
    setLoading(true);
    const res = await fetch("/api/admin/getLoginRequests");
    const data = await res.json();
    if (data.success) setRequests(data.requests);
    setLoading(false);
  }

  async function approve(id: any) {
  await fetch("/api/admin/approveLogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  loadRequests();
}

async function deny(id: any) {
  await fetch("/api/admin/denyLogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  loadRequests();
}


  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = requests
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) =>
      r.family_code.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center tracking-tight">
        Login Requests
      </h1>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg flex-1">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search family code..."
            className="bg-transparent outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {["all", "pending", "approved", "denied"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "px-3 py-2 rounded-lg text-sm font-medium transition " +
                (filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300")
              }
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-xl"
            ></div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
          <Clock size={40} className="mx-auto mb-3" />
          No login requests found.
        </div>
      )}


      <div className="space-y-5">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="border rounded-xl p-5 shadow-md bg-white dark:bg-gray-900 transition hover:shadow-lg animate-[fadeIn_0.3s_ease]"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xl font-semibold">{r.family_code}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(r.requested_at).toLocaleString()}
                </p>
              </div>

              <div
                className={
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium " +
                  (r.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : r.status === "denied"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700")
                }
              >
                {r.status === "approved" && <CheckCircle size={18} />}
                {r.status === "denied" && <XCircle size={18} />}
                {r.status === "pending" && <Clock size={18} />}
                {r.status.toUpperCase()}
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => approve(r.id)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition active:scale-95"
              >
                <CheckCircle size={18} />
                Approve
              </button>

              <button
                onClick={() => deny(r.id)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition active:scale-95"
              >
                <XCircle size={18} />
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
