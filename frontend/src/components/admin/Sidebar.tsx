"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DashboardIcon,
  HospitalIcon,
  TagIcon,
  VirusIcon,
  PillIcon,
  MicroscopeIcon,
  CogIcon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
  MenuIcon,
} from "@/components/Icons";

const menuItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: DashboardIcon },
  { label: "Hopitaux", href: "/admin/hopitaux", icon: HospitalIcon },
  { label: "Types d'hopitaux", href: "/admin/types-hopitaux", icon: TagIcon },
  { label: "Maladies", href: "/admin/maladies", icon: VirusIcon },
  { label: "Prises en charge", href: "/admin/prises-en-charge", icon: PillIcon },
  { label: "Examens medicaux", href: "/admin/examens-medicaux", icon: MicroscopeIcon },
  { label: "Plateau technique", href: "/admin/plateau-technique", icon: CogIcon },
  { label: "Profil", href: "/admin/profil", icon: UserIcon },
  { label: "Parametres", href: "/admin/parametres", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shellClass =
    theme === "dark"
      ? "border-white/10 bg-slate-950 text-white"
      : "border-slate-200 bg-white text-slate-950";

  const mutedText = theme === "dark" ? "text-slate-300" : "text-slate-600";
  const borderClass = theme === "dark" ? "border-white/10" : "border-slate-200";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-lg md:hidden ${
          theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-950"
        }`}
        aria-label="Ouvrir le menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${shellClass}`}
      >
        <div className={`p-5 ${borderClass} border-b`}>
          <Link href="/admin/dashboard" className="inline-flex rounded-lg focus-visible:ring-2 focus-visible:ring-teal-300">
            <img
              src="/logo/logo-horizontal-light.svg"
              alt="SanteProx"
              className="h-9 w-auto"
            />
          </Link>
          <div className={`mt-5 rounded-2xl border p-4 ${theme === "dark" ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Espace admin
            </p>
            <p className={`mt-1 text-sm font-semibold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
              Gestion hospitaliere
            </p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-950/30"
                        : theme === "dark"
                          ? "text-slate-300 hover:bg-white/8 hover:text-white"
                          : "text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`border-t p-4 ${borderClass}`}>
          <div className={`mb-3 rounded-2xl p-3 ${theme === "dark" ? "bg-white/8" : "bg-slate-50"}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-sm font-bold text-white">
                {user?.nom?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>{user?.nom}</p>
                <p className={`truncate text-xs ${mutedText}`}>{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs font-medium ${mutedText}`}>Theme</span>
              <ThemeToggle />
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              theme === "dark"
                ? "text-slate-300 hover:bg-red-500/12 hover:text-red-200"
                : "text-slate-700 hover:bg-red-50 hover:text-red-700"
            }`}
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            <span>Deconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
