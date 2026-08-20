// app/admin/components/ItemRow.tsx
import React from "react";

export default function ItemRow({
  item,
  onToggleGotIt,
  onEdit,
  onDelete,
}: {
  item: any;
  onToggleGotIt: any;
  onEdit: any;
  onDelete: any;
}) {

  return (
    <div
      className={`flex items-center justify-between px-3 py-3 rounded-lg mb-3 transition-all ${
        item.is_checked ? "bg-[#e9fff4]" : "bg-[#f5f5f5]"
      }`}
    >
      {/* Item name */}
      <span className="text-base font-medium text-[#222]">
        {item.name}
      </span>

      {/* Action boxes */}
      <div className="flex gap-6">
  <button
    onClick={() => onToggleGotIt(item.id)}
    className="action-icon gotit"
  >
    ✔
  </button>

  <button
    onClick={() => onEdit(item.id)}
    className="action-icon edit"
  >
    ✎
  </button>

  <button
    onClick={() => onDelete(item.id)}
    className="action-icon delete"
  >
    🗑
  </button>
</div>

    </div>
  );
}
