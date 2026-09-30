"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Destination, getDestinations } from "../lib/api";

const DESTINATION_THEMES: Record<string, { bg: string; tags: string[] }> = {
  bandarban: {
    bg: "from-emerald-950 to-teal-950",
    tags: ["High Peaks", "Tribal Villages", "Waterfalls"],
  },
  sylhet: {
    bg: "from-teal-950 to-emerald-950",
    tags: ["Tea Gardens", "Swamp Forest", "River Valleys"],
  },
  "cox's bazar": {
    bg: "from-slate-900 to-cyan-950",
    tags: ["Longest Sea Beach", "Marine Drive", "Coastal Trails"],
  },
  sreemangal: {
    bg: "from-emerald-950 to-slate-900",
    tags: ["Tea Capital", "Rainforest", "Bird Sanctuaries"],
  },
  rangamati: {
    bg: "from-slate-900 to-teal-950",
    tags: ["Kaptai Lake", "Hanging Bridge", "Kayaking"],
  },
  sundarbans: {
    bg: "from-stone-950 to-teal-950",
    tags: ["Mangrove Delta", "Wildlife Reserve", "Boat Expeditions"],
  },
};

export default function DestinationPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredDestinations = useMemo(() => {
    if (!search.trim()) return destinations;
    const q = search.toLowerCase();
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.location && d.location.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q)),
    );
  }, [destinations, search]);

  const getTheme = (name: string) => {
    const key = Object.keys(DESTINATION_THEMES).find((k) =>
      name.toLowerCase().includes(k),
    );
    return (
      (key && DESTINATION_THEMES[key]) || {
        bg: "from-teal-950 to-slate-900",
        tags: ["Expeditions", "Scenic Views", "Cultural Trails"],
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800 antialiased">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Banner */}
        <div className="border-b border-stone-200 pt-4 pb-10 mb-12 relative">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-2">
              Discover Bangladesh
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Trekking & Travel Destinations
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mt-3 leading-relaxed">
              From the highest peaks of the Chittagong Hill Tracts to the
              unbroken sands of Cox&apos;s Bazar and ancient rainforests,
              explore destinations with verified local guides.
            </p>

            {/* Quick Search */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
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
                  placeholder="Search destination, district, or region..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-3 bg-white hover:bg-stone-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors border border-stone-300"
                />
              </div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-teal-200 text-xs font-semibold rounded-xl transition-colors border border-white/10"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs text-center">
            <div className="text-2xl font-extrabold text-teal-700">
              {destinations.length}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Destinations Registered
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs text-center">
            <div className="text-2xl font-extrabold text-teal-700">100%</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Verified Safety Records
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs text-center">
            <div className="text-2xl font-extrabold text-teal-700">24/7</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Guide & Route Support
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs text-center">
            <div className="text-2xl font-extrabold text-teal-700">৳0</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Hidden Platform Fees
            </div>
          </div>
        </div>

        {/* Catalog Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Available Regions ({filteredDestinations.length})
          </h2>
          <Link
            href="/packages"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Browse All Tours &rarr;
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-64 border border-stone-200/70"
              ></div>
            ))}
          </div>
        )}

        {!loading && filteredDestinations.length === 0 && (
          <div className="bg-white border border-stone-200/70 rounded-2xl p-12 text-center max-w-md mx-auto">
            <h3 className="font-bold text-gray-900 text-lg">
              No Destinations Found
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              We couldn&apos;t find any destination matching &ldquo;{search}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((d) => {
            const theme = getTheme(d.name);
            return (
              <div
                key={d.destination_id}
                className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Banner */}
                  <div
                    className={`h-40 bg-gradient-to-br ${theme.bg} p-5 flex flex-col justify-between text-white relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="text-xs font-bold bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-white border border-white/20 flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-teal-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{d.location || "Bangladesh"}</span>
                      </span>
                    </div>
                    <div className="z-10">
                      <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-teal-200 transition-colors">
                        {d.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed min-h-[48px]">
                      {d.description ||
                        "Explore dramatic mountain vistas, serene lakes, cultural heritage sites, and thrilling trails with local certified guides."}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {theme.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-5 pt-0">
                  <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Guided Treks
                    </span>
                    <Link
                      href={`/packages?dest=${d.destination_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Explore Packages</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
