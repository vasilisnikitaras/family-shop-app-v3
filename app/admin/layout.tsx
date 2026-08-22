import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        min-h-screen
        w-full
        bg-gray-50
        p-0
        m-0
      "
    >
      <div
        className="
          w-full
          max-w-full
          mx-0
        "
      >
        {children}
      </div>
    </div>
  );
}
