"use client";

import React, { useState } from "react";

// ⭐ FIX: ΔΕΝ ΣΒΗΝΩ ΤΙΠΟΤΑ — ΜΟΝΟ ΒΑΖΩ ΤΥΠΟ ΓΙΑ ΝΑ ΜΗΝ ΣΚΑΣΕΙ ΤΟ VERCEL
export default function EditProductModal({ item, stores, onSave, onClose }: any) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [storeId, setStoreId] = useState(item.store_id);

  const handleSubmit = () => {
    onSave({
      id: item.id,
      name,
      quantity: Number(quantity),
      store_id: storeId,
    });
  };

  return (
    <div className="edit-modal-card space-y-4">

      <h2 className="section-title text-purple-700 dark:text-purple-300">
        Edit Product
      </h2>

      <input
        className="input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        className="input-qty"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <select
        className="select"
        value={storeId}
        onChange={(e) => setStoreId(e.target.value)}
      >
        {stores.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button onClick={handleSubmit} className="btn btn-purple w-full">
        Save
      </button>

      <button onClick={onClose} className="btn btn-light-purple w-full">
        Close
      </button>

    </div>
  );
}
