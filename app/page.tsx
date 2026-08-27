"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { useRouter } from "next/navigation";
import { CheckIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
// import EditProductModal from "@/app/components/EditProductModal"; //
import VoiceAddItem from "@/app/components/VoiceAddItem";

export default function Page() {
  const router = useRouter();
  const { t, lang, setLang } = useTranslation();

  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [familyPassword, setFamilyPassword] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [familyId, setFamilyId] = useState<string | null>(null);

  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginUserName, setLoginUserName] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  const [theme, setTheme] = useState("dark");
  const [storeModal, setStoreModal] = useState(false);

  const [newStoreName, setNewStoreName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemStore, setNewItemStore] = useState("");

  const [viewMode, setViewMode] = useState<"list" | "store" | "manage">("list");

  // const [showEdit, setShowEdit] = useState(false); //
 // const [selectedItem, setSelectedItem] = useState(null); //




 
  // ⭐ REGISTER DEVICE — CLEAN VERSION
  async function registerDevice() {
  const family_code = localStorage.getItem("family_code");
  const member_name = localStorage.getItem("user_name");
  const device_name = localStorage.getItem("device_name") || "FamilyShop App";

  if (!family_code || !member_name) {
    console.log("❌ registerDevice skipped: missing family_code or user_name");
    return;
  }

  await fetch("/api/registerDevice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      family_code,
      member_name,
      device_name,
    }),
  });
}

  // ⭐ AUTO LOGIN + REGISTER DEVICE
  useEffect(() => {
  const fc = localStorage.getItem("family_code");
  const fp = localStorage.getItem("family_password");
  const un = localStorage.getItem("user_name");
  const fid = localStorage.getItem("family_id");

  if (fc) setFamilyCode(fc);
  if (fp) setFamilyPassword(fp);
  if (un) setUserName(un);
  if (fid) setFamilyId(fid);

  setItems([]);
  setStores([]);

  // ❗ FIX: ΜΗΝ τρέχει registerDevice χωρίς user
  if (!fc || !un) {
    console.log("❌ Auto-login: missing user_name → skipping registerDevice");
    return;
  }

  registerDevice();   // ⭐ ΤΩΡΑ ΘΑ ΔΟΥΛΕΨΕΙ
  loadItems();
  loadStores();
}, []);


  // ⭐ HEIGHT FIX
  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const themeClass =
    theme === "dark"
      ? "bg-[#0b0b0b] text-[#f5f5f5]"
      : "bg-[#f3f4f6] text-[#1a1a1a]";

  // ⭐ ONLINE STATUS (ping every 30s)
  useEffect(() => {
    if (!familyCode) return;

    fetch("/api/setOnline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ family_code: familyCode }),
    });

    const interval = setInterval(() => {
      fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_code: familyCode }),
      });
    }, 30000);

    return () => {
      fetch("/api/setOffline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_code: familyCode }),
      });
      clearInterval(interval);
    };
  }, [familyCode]);
// ❌ OLD EDIT FLOW — COMMENTED OUT (ΜΗΝ ΤΟ ΣΒΗΣΕΙΣ)

//
// async function handleSaveEdit(updated: any) {
//   const family_code = localStorage.getItem("family_code");
//
//   const res = await postJSON("/api/editItem", {
//     ...updated,
//     family_code,
//   });
//
//   if (!res.success) {
//     console.error("EDIT ERROR:", res.message);
//     alert("Failed to save changes");
//     return;
//   }
//
//   setShowEdit(false);
//   loadItems();
// }
//

  // --------------------------------------
  // API POST
  // --------------------------------------

  const postJSON = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-family-code": localStorage.getItem("family_code") || "",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API ERROR:", errorText);
      return { success: false, message: errorText };
    }

    return res.json();
  };

  // --------------------------------------
  // LOGIN
  // --------------------------------------
  const handleLogin = async () => {
    const res = await postJSON("/api/loginFamily", {
      family_code: loginCode,
      family_password: loginPassword,
    });

    if (!res.success) {
      alert(res.message);
      return;
    }

    // 🔥 Login pending → auto-retry
    if (!res.family) {
      alert("Login request sent. Waiting for approval...");

      const retryInterval = setInterval(async () => {
        const retryRes = await postJSON("/api/loginFamily", {
          family_code: loginCode,
          family_password: loginPassword,
        });

        if (retryRes.family) {
          clearInterval(retryInterval);

          // ⭐ SAVE EVERYTHING
          localStorage.setItem("family_code", loginCode);
          localStorage.setItem("family_password", loginPassword);
          localStorage.setItem("user_name", loginUserName);
          localStorage.setItem("family_id", retryRes.family.id);

          // ⭐ SAVE DEVICE NAME
          localStorage.setItem("device_name", navigator.userAgent);

          registerDevice();

          setFamilyCode(loginCode);
          setFamilyPassword(loginPassword);
          setUserName(loginUserName);
          setFamilyId(retryRes.family.id);

          loadItems();
          loadStores();

          router.push("/");
        }
      }, 3000);

      return;
    }

    // 🔥 Normal login
    localStorage.setItem("family_code", loginCode);
    localStorage.setItem("family_password", loginPassword);
    localStorage.setItem("user_name", loginUserName);
    localStorage.setItem("family_id", res.family.id);

    localStorage.setItem("device_name", navigator.userAgent);

    registerDevice();

    setFamilyCode(loginCode);
    setFamilyPassword(loginPassword);
    setUserName(loginUserName);
    setFamilyId(res.family.id);

    loadItems();
    loadStores();

    router.push("/");
  };
  

  // --------------------------------------
  // AUTO LOGIN (SETTINGS FIX)
  // --------------------------------------
  useEffect(() => {
  const fc = localStorage.getItem("family_code");
  const fp = localStorage.getItem("family_password");
  const un = localStorage.getItem("user_name");
  const fid = localStorage.getItem("family_id");

  if (fc) setFamilyCode(fc);
  if (fp) setFamilyPassword(fp);
  if (un) setUserName(un);
  if (fid) setFamilyId(fid);

  // 🔥 FIX: καθάρισε παλιά σκουπίδια
  setItems([]);
  setStores([]);

  if (fc) {
    loadItems();
    loadStores();
  }
}, []); // 🔥 ΟΧΙ [familyCode]

  // --------------------------------------
// LOAD ITEMS (FIXED)
// --------------------------------------
const loadItems = async () => {
  if (!familyCode) return;

  const res = await postJSON("/api/getList", {
    family_code: familyCode,
  });

  // ⭐ ΕΔΩ ΒΑΖΕΙΣ ΤΟ LOG
  console.log("ITEMS RAW:", res.items);


  const cloned = (res.items || []).map((x: any) => ({
    ...x,
    id: String(x.id),                // ⭐ ΠΑΝΤΑ STRING
    store_id: String(x.store_id),    // ⭐ ΠΑΝΤΑ STRING
    is_checked: x.is_checked === true || x.is_checked === "true",
    added_by: x.added_by || "Unknown",
  }));

  setItems(cloned);
};

  // --------------------------------------
  // LOAD STORES
  // --------------------------------------
  const loadStores = async () => {
    if (!familyCode) return;

    const res = await postJSON("/api/getStores", {
      family_code: familyCode,
    });

    const cloned = (res.stores || []).map((x: any) => ({
      ...x,
      id: String(x.id),
    }));

    setStores(cloned);
  };

  // --------------------------------------
  // LOGOUT
  // --------------------------------------
  const logoutFamily = () => {
    localStorage.removeItem("family_code");
    localStorage.removeItem("family_password");
    localStorage.removeItem("user_name");

    setFamilyCode(null);
    setFamilyPassword(null);
    setUserName("");
    setItems([]);
    setStores([]);
  };

 const addStore = async () => {
  if (!newStoreName.trim()) return;

  const res = await fetch("/api/addStore", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-family-code": familyCode || ""
    },
    body: JSON.stringify({
      name: newStoreName.trim(),
      family_id: familyId,      // ⭐ ΒΑΛΤΟ ΠΙΣΩ
      added_by: userName        // ⭐ optional αλλά βοηθάει
    })
  });

  const data = await res.json();

  if (data.success) {
    setNewStoreName("");
    loadStores();
  } else {
    alert(data.message);
  }
};



// --------------------------------------
// DELETE STORE
// --------------------------------------
const deleteStore = async (storeUid: string) => {
  console.log("STORE UID:", storeUid);

  const res = await postJSON("/api/deleteStore", {
    uid: storeUid,        // αυτό είναι το id
    family_code: familyCode,
  });

  if (res.success) {
    setStores(prev => prev.filter(s => s.id !== storeUid));
    setItems(prev => prev.filter(i => i.store_id !== storeUid));
    loadStores();
    loadItems();
  }
};


  // --------------------------------------
  // ADD ITEM
  // --------------------------------------
  const addItem = async () => {
    if (!newItemName.trim()) return;

    const res = await postJSON("/api/addItem", {
      name: newItemName.trim(),
      quantity: Number(newItemQty || "1"),
      store_id: newItemStore || null,
      family_code: familyCode,
      added_by: userName,
    });

    if (res.success) {
      setNewItemName("");
      setNewItemQty("1");
      setNewItemStore("");
      loadItems();
    }
  };

  // --------------------------------------
  // GOT IT
  // --------------------------------------
 const toggleGotIt = async (item: any) => {
  const newChecked = !item.is_checked;

  // optimistic update
  setItems((prev) =>
    prev.map((i) =>
      i.id === item.id ? { ...i, is_checked: newChecked } : i
    )
  );

  await postJSON("/api/toggleItem", {
    id: item.id,
    is_checked: newChecked,
    family_code: familyCode,
  });
};


// --------------------------------------
// STORE ALIASES — ΒΑΛΕ ΤΟ ΠΑΝΩ ΑΠΟ clean() 🔥
// --------------------------------------
const storeAliases = {
  superc: [
    "superc",
    "super c",
    "super-c",
    "super",
    "c",
    "super see",
    "super sea",
    "super ci",
    "super si",
    "super ce",
    "super c store",
    "super c supermarket",
    "super c market",
    "super c superstore"
  ],
  walmart: ["walmart"],
  pa: ["pa", "p a"],
  iga: ["iga"],
  metro: ["metro"],
  atlantis: ["atlantis"]
};

// --------------------------------------
// VOICE ADD ITEM (FINAL VERSION — TAIL FUZZY) 🔥
// --------------------------------------
const clean = (str: string) =>

  str
    .toLowerCase()
    .replace(/[^a-zA-Zα-ωΑ-Ω0-9\s]/g, "")
    .trim();

const handleVoiceAdd = async (item: any) => {

  console.log("VOICE ITEM:", item);

  let spokenRaw = item.text || "";
  let spoken = clean(spokenRaw);
  let words = spoken.split(/\s+/).filter(Boolean);

  // 1️⃣ Quantity
let quantity = 1;
let qtyIndex = -1;

const numMap = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

for (let i = 0; i < words.length; i++) {
  const w = words[i];

  if (!isNaN(Number(w))) {
    quantity = parseInt(w, 10);
    qtyIndex = i;
    break;
  }
}

for (let i = 0; i < words.length; i++) {
  const w = words[i];

  if (numMap[w as keyof typeof numMap]) {
    quantity = numMap[w as keyof typeof numMap];
    qtyIndex = i;
    break;
  }
}


if (qtyIndex !== -1) {
  words.splice(qtyIndex, 1);
}


  // 2️⃣ Store from tail
 // 2️⃣ Store from tail
const tail = words.slice(-3);
const combos: string[] = [];

for (let i = 0; i < tail.length; i++) {
  for (let j = i; j < tail.length; j++) {
    combos.push(tail.slice(i, j + 1).join(" "));
  }
}


  let storeObj = stores.find((s) => {
  const name = clean(s.name).replace(/-/g, " ");

  return combos.some((c) => {
    const cNorm = c.replace(/-/g, " ");
    return (
      name.includes(cNorm) ||
      cNorm.includes(name) ||
      name.startsWith(cNorm) ||
      cNorm.startsWith(name)
    );
  });
});


 let storeName = storeObj ? clean(storeObj.name).replace(/-/g, " ") : "";


  // 3️⃣ Stop words
  const stopWords = new Set([
    "i","want","add","from","to","please","put","can","you","give","me",
    "βαλε","vale","thelo","θέλω","δώσε","dose","μου","mou"
  ]);

  let filtered = words.filter(
  (w) => !stopWords.has(w)
);


  // 4️⃣ Product
  let product = filtered.join(" ").trim();

  if (!product) {
    product = item.name || "item";
  }

  console.log("PARSED:", {
    raw: spokenRaw,
    quantity,
    store: storeObj ? storeObj.name : null,
    product,
  });

  // 5️⃣ Add item
  const res = await postJSON("/api/addItem", {
    name: product,
    quantity,
    store_id: storeObj ? storeObj.id : null,
    family_code: familyCode,
    added_by: userName,
  });

  if (res.success) {
    loadItems();
  }
};


  // --------------------------------------
// EDIT MODAL STATE
// --------------------------------------
const [editModal, setEditModal] = useState(false);
const [editItemData, setEditItemData] = useState({
  id: "",
  name: "",
  quantity: "",
  store_id: "",
});

// --------------------------------------
// OPEN EDIT MODAL (ΑΝΤΙΚΑΘΙΣΤΑ ΤΟ ΠΑΛΙΟ PROMPT)
// --------------------------------------
// --------------------------------------
// OPEN EDIT MODAL (FIXED VERSION)
// --------------------------------------
const editItem = (item: any) => {

  // ⭐ STOP DOUBLE CALL
  if (editModal) return;

  setEditItemData({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    store_id: String(item.store_id),
  });

  setEditModal(true);
};

// --------------------------------------
// SAVE EDIT (FIXED VERSION)
// --------------------------------------
const saveEdit = async () => {
  console.log("STORE ID BEFORE SAVE:", editItemData.store_id);

  const res = await postJSON("/api/editItem", {
    id: editItemData.id,
    name: editItemData.name,
    quantity: Number(editItemData.quantity),
    store_id: editItemData.store_id,
    family_code: familyCode,
  });

  if (!res.success) {
    console.error("EDIT ERROR:", res);
    return;
  }

  // ⭐ WAIT FOR DB TO FINISH WRITING
  await new Promise((r) => setTimeout(r, 150));

  // ⭐ RELOAD ITEMS BEFORE CLOSING MODAL
  await loadItems();

  // ⭐ NOW CLOSE MODAL
  setEditModal(false);
};

// --------------------------------------
// EDIT MODAL UI
// --------------------------------------
{editModal && (
  <div className="modal-overlay">
    <div className="modal card p-4 space-y-3">

      <h2 className="section-title text-purple-700 dark:text-purple-300">
        Edit Product
      </h2>

      <input
        type="text"
        className="input mb-2"
        value={editItemData.name}
        onChange={(e) =>
          setEditItemData({ ...editItemData, name: e.target.value })
        }
      />

      <input
        type="number"
        className="input mb-2"
        value={editItemData.quantity}
        onChange={(e) =>
          setEditItemData({ ...editItemData, quantity: e.target.value })
        }
      />

      <select
        className="select mb-3"
        value={editItemData.store_id}
        onChange={(e) =>
          setEditItemData({ ...editItemData, store_id: e.target.value })
        }
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button onClick={saveEdit} className="btn btn-purple w-full mb-2">
        Save
      </button>

      <button
        onClick={() => setEditModal(false)}
        className="btn btn-danger w-full"
      >
        Close
      </button>
    </div>
  </div>
)}

  // --------------------------------------
  // DELETE ITEM
  // --------------------------------------
  const deleteItem = async (item: any) => {
    if (!confirm(`Delete "${item.name}"?`)) return;

    const res = await postJSON("/api/deleteItem", {
      id: item.id,
      family_code: familyCode,
    });

    if (res.success) loadItems();
  };

  // --------------------------------------
  // DARK MODE
  // --------------------------------------
  useEffect(() => {
    document.body.classList.remove("dark", "light-dark");
    document.body.classList.add(theme);
  }, [theme]);

  // --------------------------------------
  // AUTO LOAD ITEMS & STORES
  // --------------------------------------
  useEffect(() => {
    if (!familyCode) return;
    loadItems();
    loadStores();
  }, [familyCode]);

  // --------------------------------------
// AUTO REFRESH ITEMS
// --------------------------------------
useEffect(() => {
  const interval = setInterval(() => {
    loadItems();
  }, 3000);

  return () => clearInterval(interval);
}, []);

// --------------------------------------
// AUTO REFRESH ITEMS & STORES (FIXED)
// --------------------------------------
useEffect(() => {
  if (!familyCode) return;

  // ⭐ FIX: ΜΟΝΟ loadStores κάθε 10s για να ΜΗΝ ΣΒΗΝΕΙ ΤΟ STATE
  const interval = setInterval(() => {
    loadStores();
  }, 10000);

  return () => clearInterval(interval);
}, [familyCode]);

  // --------------------------------------
  // LOGIN SCREEN
  // --------------------------------------
  if (!familyCode) {
    return (
      <div className={`min-h-screen px-2 py-4 flex justify-center items-center ${themeClass}`}>
        <div className="w-full max-w-xs mx-auto space-y-4 p-6 rounded-xl shadow-xl card">

          <h1 className="text-xl font-bold text-center">Enter Family Code</h1>
          <input
            className="input"
            placeholder="Family code..."
            value={loginCode}
            onChange={(e) => setLoginCode(e.target.value)}
          />

          <h1 className="text-xl font-bold text-center mt-4">Enter Password</h1>
          <input
            type="password"
            className="input"
            placeholder="Password..."
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          <h1 className="text-xl font-bold text-center mt-4">Enter User</h1>
          <input
            className="input mb-4"
            placeholder="Your name..."
            value={loginUserName}
            onChange={(e) => setLoginUserName(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="btn btn-purple w-full mt-3"
          >
            Join Family
          </button>

        </div>
      </div>
    );
  }

  // --------------------------------------
  // MAIN PAGE
  // --------------------------------------
  return (
    <div className={`page-container min-h-screen flex justify-center items-start ${themeClass}`}>
      <div className="w-full max-w-xl space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="header-title text-3xl font-extrabold text-purple-700 dark:text-purple-300">
              {t.title}
            </h1>
            <p className="header-subtitle text-xs text-gray-500 dark:text-gray-300 mt-1">
              Family: {familyCode}
            </p>
            <p className="header-subtitle text-xs text-gray-500 dark:text-gray-300">
              User: {userName}
            </p>
          </div>

          <div className="flex items-center gap-2">

            {/* LANGUAGE SELECT */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="select"
            >
              <option value="en">EN</option>
              <option value="el">EL</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="it">IT</option>
              <option value="de">DE</option>
              <option value="fi">FI</option>
              <option value="ar">AR</option>
              <option value="ja">JA</option>
              <option value="zh">ZH</option>
            </select>

            {/* THEME TOGGLE */}
            <button
              onClick={() => {
                const newTheme = theme === "dark" ? "light" : "dark";
                setTheme(newTheme);
                localStorage.setItem("theme", newTheme);
                window.dispatchEvent(new Event("theme-change"));
              }}
              className="btn btn-purple"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            {/* LOGOUT */}
            <button onClick={logoutFamily} className="btn btn-purple">
              Logout
            </button>

            {/* SETTINGS */}
            <button
              onClick={() => router.push("/settings")}
              className="w-14 h-14 flex items-center justify-center
              rounded-full bg-[#2c2c2e] text-white
              border border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.25)]
              hover:bg-[#3a3a3c] active:scale-95 transition-all text-2xl ml-4"
            >
              ⚙️
            </button>

          </div>
        </div>

        {/* TOGGLE VIEW */}
        <div className="flex justify-center">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "store" : "list")}
            className="btn btn-light-purple w-full"
          >
            {viewMode === "list" ? "Store View" : "List View"}
          </button>
        </div>

        {/* ADD STORE */}
        <div className="card space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="input"
              placeholder={t.new_store}
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
            />

            <button onClick={addStore} className="btn btn-purple">
              {t.add_store}
            </button>
          </div>

          <button
            onClick={() => setStoreModal(!storeModal)}
            className="btn btn-light-purple w-full"
          >
            {t.manage_stores} ▼
          </button>
        </div>

        {/* MANAGE STORES MODAL */}
        {storeModal && (
            <div className="modal-overlay">
            <div className="store-modal-card space-y-4 max-h-[80vh] overflow-y-auto">


              <h2 className="section-title text-purple-700 dark:text-purple-300">
                {t.manage_stores}
              </h2>

              <div className="space-y-2">
                {stores.length === 0 && (
                  <p className="text-gray-500 text-sm">No stores added yet.</p>
                )}

                {stores.map((s: any) => (
                  <div key={s.id} className="card flex justify-between items-center">
                    <span className="font-medium">{s.name}</span>

             <button
                onClick={() => deleteStore(s.id)}

                className="btn btn-danger"
              >
                {t.delete}
              </button>

                  </div>
                ))}
              </div>

              <button
                onClick={() => setStoreModal(false)}
                className="btn btn-light-purple w-full"
              >
                {t.close}
              </button>

            </div>
          </div>
        )}
        


        {/* ADD PRODUCT */}
<div className="card space-y-3">
  <h2 className="section-title text-purple-700 dark:text-purple-300">
    {t.add_product}
  </h2>

  <div className="flex flex-col sm:flex-row gap-3">

    <input
      className="input"
      placeholder={t.add_product}
      value={newItemName}
      onChange={(e) => setNewItemName(e.target.value)}
    />

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center overflow-visible relative">
      <input
        type="number"
        min={1}
        className="input-qty"
        value={newItemQty}
        onChange={(e) => setNewItemQty(e.target.value)}
      />

      <select
        className="select z-50"
        value={newItemStore}
        onChange={(e) => setNewItemStore(e.target.value)}
      >
        <option value="">{t.select_store}</option>
        {stores.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button onClick={addItem} className="btn btn-purple">
        {t.add}
      </button>

      {/* 🎤 VOICE BUTTON */}
<VoiceAddItem
  stores={stores.map((s: any) => s.name)}
  onAdd={(item: any) => {
    setNewItemName(item.name);
    setNewItemQty(item.quantity);
    setNewItemStore(
      stores.find((s: any) => s.name.toLowerCase() === item.store.toLowerCase())?.id || ""
    );
    addItem();
  }}
/>

    </div>
  </div>
</div>


        {/* STORE VIEW */}
{viewMode === "store" && (
  <div className="w-full max-w-2xl mx-auto space-y-6">
    {stores.map((store: any) => {
      const storeItems = items.filter(
        (i) => String(i.store_id) === String(store.id)
      );

      if (storeItems.length === 0) return null;

      return (
        <div key={store.id} className="card space-y-3 store-section">

          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 pt-1 pb-1">
            {store.name}
          </h2>

          <ul className="space-y-3">
            {storeItems.map((i: any) => (
              <li
                key={i.id}
                className={`card list-item px-4 py-3 transition-all pointer-events-auto ${
                  i.is_checked && "bg-green-100 dark:bg-green-900"
                }`}
              >

                {/* LEFT SIDE */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2">
                    {i.is_checked && (
                      <span className="text-green-600 dark:text-green-300 font-bold">
                        ✔
                      </span>
                    )}

                    <span
                      className={`text-sm font-medium ${
                        i.is_checked
                          ? "line-through text-gray-700 dark:text-gray-300"
                          : ""
                      }`}
                    >
                      {i.name} (x{i.quantity})
                    </span>
                  </div>

                  <span className="text-xs text-gray-500 dark:text-gray-300 mt-[3px] block">
                    {store.name} — Added by: {i.added_by}
                  </span>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col gap-3 ml-auto">

                  <button
                    onClick={() => toggleGotIt(i)}
                    className="w-10 h-10 flex items-center justify-center 
                    rounded-full bg-white text-green-600 border border-green-300
                    hover:bg-green-50 active:scale-95 transition-all"
                  >
                    ✔️
                  </button>

                  {/* NEW EDIT BUTTON */}
                  <button
                    onClick={() => editItem(i)}
                    className="w-10 h-10 flex items-center justify-center 
                    rounded-full bg-white text-blue-600 border border-blue-300
                    hover:bg-blue-50 active:scale-95 transition-all"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => deleteItem(i)}
                    className="w-10 h-10 flex items-center justify-center 
                    rounded-full bg-white text-red-600 border border-red-300
                    hover:bg-red-50 active:scale-95 transition-all"
                  >
                    🗑️
                  </button>

                </div>

              </li>
            ))}
          </ul>

        </div>
      );
    })}
  </div>
)}

{/* LIST VIEW */}
{viewMode === "list" && (
  <div className="space-y-3 w-full max-w-2xl mx-auto">
    <h2 className="section-title text-purple-700 dark:text-purple-300">
      {t.list}
    </h2>

    <ul className="space-y-3">
      {items.map((i: any) => (
        <li
          key={i.id}
          className={`card list-item px-4 py-3 transition-all pointer-events-auto flex items-start gap-3 ${
            i.is_checked && "bg-green-100 dark:bg-green-900"
          }`}
        >

          {/* LEFT SIDE */}
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center gap-2">
              {i.is_checked && (
                <span className="text-green-600 font-bold">✔</span>
              )}

              <span
                className={`text-sm font-medium ${
                  i.is_checked
                    ? "line-through text-green-900 dark:text-green-200"
                    : ""
                }`}
              >
                {i.name} (x{i.quantity})
              </span>
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-300 mt-[3px] block">
              {i.store} — Added by: {i.added_by}
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-3 ml-auto">

            <button
              onClick={() => toggleGotIt(i)}
              className="w-10 h-10 flex items-center justify-center 
              rounded-full bg-white text-green-600 border border-green-300
              hover:bg-green-50 active:scale-95 transition-all"
            >
              ✔️
            </button>

            {/* NEW EDIT BUTTON */}
            <button
              onClick={() => editItem(i)}
              className="w-10 h-10 flex items-center justify-center 
              rounded-full bg-white text-blue-600 border border-blue-300
              hover:bg-blue-50 active:scale-95 transition-all"
            >
              ✏️
            </button>

            <button
              onClick={() => deleteItem(i)}
              className="w-10 h-10 flex items-center justify-center 
              rounded-full bg-white text-red-600 border border-red-300
              hover:bg-red-50 active:scale-95 transition-all"
            >
              🗑️
            </button>

          </div>

        </li>
      ))}
    </ul>
  </div>
)}


       {/* EDIT MODAL — NEW */}
{editModal && (
  <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="modal card p-4 space-y-3 w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg">

      <h2 className="section-title text-purple-700 dark:text-purple-300 text-lg font-bold">
        Edit Product
      </h2>

      {/* NAME */}
      <input
        type="text"
        className="input mb-2 w-full p-2 border rounded"
        value={editItemData.name}
        onChange={(e) =>
          setEditItemData({ ...editItemData, name: e.target.value })
        }
      />

      {/* QUANTITY */}
      <input
        type="number"
        className="input mb-2 w-full p-2 border rounded"
        value={editItemData.quantity}
        onChange={(e) =>
          setEditItemData({ ...editItemData, quantity: e.target.value })
        }
      />

      {/* STORE SELECT */}
      <select
        className="select mb-3 w-full p-2 border rounded"
        value={editItemData.store_id}
        onChange={(e) =>
          setEditItemData({ ...editItemData, store_id: e.target.value })
        }
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* SAVE BUTTON */}
      <button
        onClick={saveEdit}
        className="btn btn-purple w-full p-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
      >
        Save
      </button>

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setEditModal(false)}
        className="btn btn-danger w-full p-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
      >
        Close
      </button>

    </div>
  </div>
)}

        {/* FOOTER */}
        <footer className="text-center text-sm opacity-70 mt-10">
          © 2026 VNF Software — Created by Vasilis Fanes Nikitaras.<br />
          Unauthorized copying or resale is strictly prohibited.<br />
          Contact:{" "}
          <a
            href="mailto:vasilis.nikitaras@gmail.com?subject=FamilyShop%20Support&body=Hello%20Vasilis,%0D%0A%0D%0AI%20need%20help%20with%20my%20FamilyShop%20account."
            className="text-blue-500 underline"
          >
            vasilis.nikitaras@gmail.com
          </a>
        </footer>

      </div>
    </div>
  );
}

