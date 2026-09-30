"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, logoutUser, User, clearToken, clearUser } from "../lib/api";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      clearToken();
      clearUser();
    }
    clearUser();
    setUser(null);
    router.push("/");
  }

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "guide"
        ? "/guide-dashboard"
        : "/dashboard";

  const navLinks = [
    { href: "/destination", label: "Destinations" },
    { href: "/packages", label: "Tour Packages" },
    { href: "/hotels", label: "Hotels & Stays" },
    { href: "/guide", label: "Local Guides" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 h-18 py-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M14 6l6 12H4l4-8 3 5 3-9z" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
                Hik<span className="text-teal-600">King</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
                Tours & Treks
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors relative py-1 ${
                    active
                      ? "text-teal-600 font-bold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Auth Buttons / Profile */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardHref}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-800 border border-gray-200 transition"
              >
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span>{user.name.split(" ")[0]}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-teal-100 text-teal-800">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-teal-600 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition shadow-xs hover:shadow"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-gray-700 py-1.5 hover:text-teal-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="w-full text-center py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800"
                >
                  Go to {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-xs font-semibold text-rose-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full text-center py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="w-full text-center py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

