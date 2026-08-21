"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Hôpitaux", href: "/admin/hopitaux", icon: "🏥" },
  { label: "Types d'hôpitaux", href: "/admin/types-hopitaux", icon: "🏷️" },
  { label: "Maladies", href: "/admin/maladies", icon: "🦠" },
  { label: "Prises en charge", href: "/admin/prises-en-charge", icon: "💊" },
  { label: "Examens médicaux", href: "/admin/examens-medicaux", icon: "🔬" },
  { label: "Plateau technique", href: "/admin/plateau-technique", icon: "⚙️" },
  { label: "Profil", href: "/admin/profil", icon: "👤" },
  { label: "Paramètres", href: "/admin/parametres", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
