"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, User } from "../lib/api";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/guide-dashboard",
    label: "My Profile",
    exact: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/guide-dashboard/documents",
    label: "Verification Documents",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function GuideDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
  }, [router]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen flex bg-stone-50 text-gray-800 antialiased">
      <aside className="w-64 shrink-0 min-h-screen bg-white border-r border-stone-200/80 flex flex-col">
        <div className="px-6 py-5 border-b border-stone-100">
          <Link href="/" className="block">
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Hik<span className="text-teal-600">King</span>
            </span>
          </Link>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mt-0.5">
            Guide Portal
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                    : "text-gray-600 hover:bg-stone-50 hover:text-gray-900"
                }`}
              >
                <span className={active ? "text-teal-700" : "text-gray-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-stone-100">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-stone-50 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Return to Site</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-stone-200/80 flex items-center justify-between px-8">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Mountain Guide Portal
          </span>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 text-xs font-bold">
              {user?.name?.[0] ?? "G"}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {user?.name ?? "Guide"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  );
}
