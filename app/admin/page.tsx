"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// TYPES
type Family = {
  id: number;
  name: string;
  family_code: string;
  family_password: string;
  created_at: string;
};

type Member = {
  id: number;
  family_code: string;
  name: string;
};

type Item = {
  id: number;
  family_code: string;
  name: string;
  quantity: number;
  is_checked: boolean;
};

type Device = {
  id: number;
  family_code: string;
  member_name: string;
  device_name: string;
  last_seen: string | null;
  is_online: boolean;
};

export default function AdminPage() {
  const router = useRouter();

  // LOGIN PROTECTION
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.push("/admin/login");

    // REGISTER ADMIN DEVICE
    fetch("/api/registerDevice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_code: "ADMIN",
        device_name: "Admin Panel",
        member_name: "Admin"
      })
    });
  }, []);

  // STATES
  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFamily, setSelectedFamily] = useState<string>("");

  const [renameOld, setRenameOld] = useState("");
  const [renameNew, setRenameNew] = useState("");

  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberFamilyCode, setNewMemberFamilyCode] = useState("");

  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  // ⭐ NEW LOGIN REQUEST ALERT ⭐
  const [pendingRequests, setPendingRequests] = useState(0);

  const checkLoginRequests = async () => {
    const res = await fetch("/api/admin/checkNewRequests");
    const data = await res.json();
    setPendingRequests(data.pending || 0);
  };

  useEffect(() => {
    checkLoginRequests();
    const interval = setInterval(checkLoginRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  // LOADERS
  const loadFamilies = async () => {
    const res = await fetch("/api/admin/getFamilies");
    const data = await res.json();
    setFamilies(data.families);
    setLoading(false);
  };

  const loadMembers = async () => {
    const res = await fetch("/api/admin/getMembers");
    const data = await res.json();
    setMembers(data.members);
  };

  const loadItems = async () => {
    const res = await fetch("/api/admin/getItems");
    const data = await res.json();
    setItems(data.items);
  };

  const loadDevices = async () => {
    const res = await fetch(`/api/admin/getDevices?familyCode=${selectedFamily}`);
    const data = await res.json();
    setDevices(data.devices);
  };

  // LIVE DEVICE MONITORING
  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 5000);
    return () => clearInterval(interval);
  }, [selectedFamily]);

  useEffect(() => {
    loadFamilies();
    loadMembers();
    loadItems();
  }, []);

  // FILTERED LISTS
  const filteredMembers = selectedFamily
    ? members.filter((m) => m.family_code === selectedFamily)
    : members;

  const filteredItems = selectedFamily
    ? items.filter((i) => i.family_code === selectedFamily)
    : items;

  const filteredDevices = selectedFamily
    ? devices.filter((d) => d.family_code === selectedFamily)
    : devices;

  // ⭐ SELECTED DEVICES (NEW)
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);

  // ⭐ TOGGLE SELECT (NEW)
  function toggleSelect(id: number) {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  // ACTIONS
  const renameFamily = async () => {
    if (!renameOld.trim() || !renameNew.trim()) return;

    await fetch("/api/admin/renameFamily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_code: renameOld.trim(),
        new_code: renameNew.trim(),
      }),
    });

    setRenameOld("");
    setRenameNew("");
    loadFamilies();
  };

  const deleteFamily = async (code: string) => {
    if (!window.confirm(`Delete family "${code}"?`)) return;

    await fetch("/api/admin/deleteFamily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    loadFamilies();
  };

  const addMember = async () => {
    if (!newMemberName.trim() || !newMemberFamilyCode.trim()) return;

    await fetch("/api/admin/addMember", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newMemberName.trim(),
        family_code: newMemberFamilyCode.trim(),
      }),
    });

    setNewMemberName("");
    setNewMemberFamilyCode("");
    loadMembers();
  };

  const deleteMember = async (id: number) => {
    if (!window.confirm("Delete this member?")) return;

    await fetch("/api/admin/deleteMember", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadMembers();
  };

  const toggleItem = async (id: number, is_checked: boolean) => {
    await fetch("/api/admin/toggleItemChecked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_checked }),
    });

    loadItems();
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;

    await fetch("/api/admin/deleteItem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadItems();
  };

  const toggleDeviceOnline = async (id: number, is_online: boolean) => {
    await fetch("/api/admin/toggleDeviceOnline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_online }),
    });

    loadDevices();
  };

  const deleteDevice = async (id: number) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this device?")) return;

    await fetch("/api/admin/deleteDevice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadDevices();
  };

  // ⭐ DELETE SELECTED DEVICES (NEW)
  const deleteSelectedDevices = async () => {
    if (selectedDevices.length === 0) return;

    if (!window.confirm(`Delete ${selectedDevices.length} devices?`)) return;

    await fetch("/api/admin/deleteDevicesBulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedDevices }),
    });

    loadDevices();
  };

  // ⭐ SELECT ALL DEVICES (NEW)
  function selectAllDevices() {
    setSelectedDevices(filteredDevices.map((d) => d.id));
  }

  // ⭐ CLEAR SELECTED DEVICES (NEW)
  function clearSelectedDevices() {
    setSelectedDevices([]);
  }

  const resetPasswordAction = async () => {
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        family_code: resetCode,
        new_password: resetPassword,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Error resetting password");
      return;
    }

    alert("Password reset successfully!");
  };
  
  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading admin panel...
      </div>
    );
  }

  return (
<div className="w-full space-y-10">

      {/* ⭐ NEW LOGIN REQUEST ALERT ⭐ */}
      {pendingRequests > 0 && (
        <div className="mb-6 p-4 bg-red-600 text-white rounded-lg shadow text-center text-lg font-semibold">
          🚨 NEW LOGIN REQUEST — CHECK ADMIN LOGIN REQUESTS PAGE
        </div>
      )}

      <style jsx>{`
  .card {
    background: white;
    padding: 22px;
    border-radius: 18px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    margin-bottom: 24px;
    width: 100%;
    overflow-x: auto;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 14px;
    white-space: nowrap;
  }

  .input {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #d1d5db;
    font-size: 15px;
    margin-bottom: 12px;
  }

  .button {
    background: #7c3aed;
    color: white;
    padding: 12px 18px;
    border-radius: 12px;
    border: none;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .button:hover {
    background: #5b21b6;
  }

  .table {
    width: 100%;
    min-width: 900px; /* ⭐ ΚΑΝΕΙ ΤΟ TABLE SCROLLABLE */
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
  }

  .table th {
    background: #f3f4f6;
    padding: 12px;
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
  }

  .table td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .card {
      padding: 16px;
    }

    .input {
      width: 100% !important;
    }

    .button {
      width: 100%;
    }

    .flex {
      flex-direction: column;
      gap: 12px;
    }
  }
`}</style>


      <div className="max-w-6xl mx-auto space-y-10">

        {/* LOGOUT */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              router.push("/admin/login");
            }}
            className="button"
          >
            Logout
          </button>
        </div>

        {/* FAMILY SWITCH */}
        <div className="card">
          <h2 className="title">Select Family</h2>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="input w-60"
          >
            <option value="">All families</option>
            {families.map((f) => (
              <option key={f.id} value={f.family_code}>
                {f.name} ({f.family_code})
              </option>
            ))}
          </select>
        </div>

        {/* RENAME */}
        <div className="card">
          <h2 className="title">Rename Family</h2>
          <div className="flex gap-3">
            <input
              value={renameOld}
              onChange={(e) => setRenameOld(e.target.value)}
              placeholder="Old code"
              className="input w-40"
            />
            <input
              value={renameNew}
              onChange={(e) => setRenameNew(e.target.value)}
              placeholder="New code"
              className="input w-40"
            />
            <button onClick={renameFamily} className="button">
              Rename
            </button>
          </div>
        </div>

        {/* RESET PASSWORD */}
        <div className="card">
          <h2 className="title">Reset Password</h2>

          <div className="flex gap-3">
            <input
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Family code"
              className="input w-40"
            />

            <input
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="New password"
              className="input w-40"
            />

            <button onClick={resetPasswordAction} className="button">
              Reset
            </button>
          </div>
        </div>

        {/* FAMILIES */}
        <div className="card">
          <h2 className="title">Families</h2>

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Family Code</th>
                <th>Password</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {families.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.name || "—"}</td>
                  <td>{f.family_code || "—"}</td>
                  <td>
                    <details>
                      <summary>••••••</summary>
                      {f.family_password}
                    </details>
                  </td>
                  <td>{new Date(f.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => deleteFamily(f.family_code)}
                      className="button bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DANGER ZONE */}
        <div className="card">
          <h2 className="title">Danger Zone</h2>

          <button
            onClick={async () => {
              if (!window.confirm("⚠️ Delete ALL DEFAULT families?")) return;

              const res = await fetch("/api/admin/deleteDefaultFamilies", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
              });

              const data = await res.json();

              alert(`Deleted ${data.deleted} DEFAULT families.`);
              loadFamilies();
            }}
            className="button bg-red-700 hover:bg-red-800"
          >
            Delete ALL DEFAULT Families
          </button>
        </div>

        {/* MEMBERS */}
        <div className="card">
          <h2 className="title">Members</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Family</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.family_code}</td>
                  <td>{m.name}</td>
                  <td>
                    <button
                      onClick={() => deleteMember(m.id)}
                      className="button bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ITEMS */}
        <div className="card">
          <h2 className="title">Items</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Qty</th>
                <th>Family</th>
                <th>Checked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.family_code}</td>
                  <td>
                    <button
                      onClick={() => toggleItem(item.id, !item.is_checked)}
                      className={`button ${
                        item.is_checked ? "bg-green-600" : "bg-gray-500"
                      }`}
                    >
                      {item.is_checked ? "Checked" : "Not checked"}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="button bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DEVICES */}
        <div className="card">
          <h2 className="title">Devices (Live)</h2>

          <div className="flex gap-3 mb-3">
            <button onClick={selectAllDevices} className="button bg-gray-700 hover:bg-gray-800">
              Select All
            </button>

            <button onClick={clearSelectedDevices} className="button bg-gray-500 hover:bg-gray-600">
              Clear
            </button>

            <button onClick={deleteSelectedDevices} className="button bg-red-700 hover:bg-red-800">
              Delete Selected ({selectedDevices.length})
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Family</th>
                <th>Member</th>
                <th>Device</th>
                <th>Last Seen</th>
                <th>Online</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDevices.map((d) => (
                <tr key={d.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedDevices.includes(d.id)}
                      onChange={() => toggleSelect(d.id)}
                    />
                  </td>

                  <td>{d.id}</td>
                  <td>{d.family_code}</td>
                  <td>{d.member_name || "—"}</td>
                  <td>{d.device_name}</td>
                  <td>{d.last_seen ? new Date(d.last_seen).toLocaleString() : "Never"}</td>

                  <td>
                    <button
                      onClick={() => toggleDeviceOnline(d.id, !d.is_online)}
                      className={`button ${d.is_online ? "bg-green-600" : "bg-gray-500"}`}
                    >
                      {d.is_online ? "Online" : "Offline"}
                    </button>
                  </td>

                  <td>
                    <button
                      onClick={() => deleteDevice(d.id)}
                      className="button bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="text-center text-gray-500 text-sm mt-10 mb-4">
          © 2026 VNF Software — Created by Vasilis Fanes Nikitaras. All Rights Reserved.
          <br />
          Unauthorized copying or resale is strictly prohibited and punishable by law.
          <br />
          Contact: vasilis.nikitaras@gmail.com
        </div>

      </div>
    </div>
  );
}
