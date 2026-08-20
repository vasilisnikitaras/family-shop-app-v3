import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        min-h-screen
        w-full
        bg-gray-50
        p-4 md:p-8
        overflow-x-auto
      "
    >
      <div
        className="
          w-full
          max-w-none
          mx-auto
        "
      >
        {children}
      </div>
    </div>
  );
}
