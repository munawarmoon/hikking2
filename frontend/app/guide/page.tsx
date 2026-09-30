"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GuideProfile, getGuideProfiles } from "../lib/api";

const GUIDE_SPECIALTIES = [
  "Wilderness First Aid",
  "High-Altitude Navigation",
  "Mountain Flora & Fauna",
  "Local Dialects & Culture",
  "Expedition Photography",
];

export default function GuidePage() {
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getGuideProfiles()
      .then((data) =>
        setGuides(
          data.filter(
            (g) =>
              g.verification_status === "approved" ||
              g.verification_status === "verified",
          ),
        ),
      )
      .catch(() => setGuides([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredGuides = useMemo(() => {
    if (!search.trim()) return guides;
    const q = search.toLowerCase();
    return guides.filter(
      (g) =>
        g.user?.name.toLowerCase().includes(q) ||
        (g.bio && g.bio.toLowerCase().includes(q)),
    );
  }, [guides, search]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800 antialiased">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="border-b border-stone-200 pt-4 pb-10 mb-12 relative">
          {/* blur circle div মুছে দিন */}
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-2">
              Trail Masters
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Certified Mountain Guides
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mt-3 leading-relaxed">
              Every HikKing trek leader is government-registered, trained in
              wilderness first aid, and intimately familiar with local terrain,
              indigenous culture, and mountain paths.
            </p>

            {/* Search Input */}
            <div className="mt-6 relative max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search guide by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Verified Leaders ({filteredGuides.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Available for group expeditions and custom treks
            </p>
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-72 border border-stone-200"
              ></div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredGuides.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <h3 className="font-bold text-gray-900 text-lg">No Guides Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              We couldn&apos;t find any verified guide matching &ldquo;{search}
              &rdquo;. Try another search keyword.
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-xs bg-teal-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Guides Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((g) => (
            <div
              key={g.id}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="p-6">
                {/* Guide Header: Avatar + Verification */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-xl shadow-inner group-hover:scale-105 transition-transform">
                      {g.user?.name ? g.user.name[0].toUpperCase() : "G"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-700 transition-colors">
                        {g.user?.name ?? "Trail Guide"}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                        Verified Guide
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating & Experience Stats */}
                <div className="flex items-center gap-4 py-2.5 px-3 bg-stone-50 rounded-xl mb-4 border border-stone-100 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">
                      Experience
                    </span>
                    <span className="font-bold text-gray-800">
                      {g.experience_years
                        ? `${g.experience_years} Years`
                        : "Experienced"}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-stone-200" />
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">
                      Rating
                    </span>
                    <span className="font-bold text-amber-700">
                      {g.rating_avg ? Number(g.rating_avg).toFixed(1) : "5.0"} /
                      5.0
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4 min-h-[48px]">
                  {g.bio ||
                    "Professional certified guide specializing in remote trail navigation, safety protocols, and summit expeditions across Bangladesh."}
                </p>

                {/* Skills / Specializations */}
                <div className="flex flex-wrap gap-1.5">
                  {GUIDE_SPECIALTIES.slice(0, 2 + (g.id % 3)).map((spec) => (
                    <span
                      key={spec}
                      className="text-[11px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Available For Bookings
                  </span>
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>View Treks</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
