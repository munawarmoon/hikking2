"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Package, Destination, getPackages, getDestinations } from "../lib/api";

function PackagesList() {
  const searchParams = useSearchParams();
  const destParam = searchParams.get("dest");

  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<string>(destParam || "all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "duration">("featured");

  useEffect(() => {
    if (destParam) {
      setSelectedDestination(destParam);
    }
  }, [destParam]);

  useEffect(() => {
    Promise.all([getPackages(), getDestinations()])
      .then(([pkgs, dests]) => {
        setPackages(pkgs);
        setDestinations(dests);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPackages = useMemo(() => {
    let result = [...packages];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.destination?.name.toLowerCase().includes(q)
      );
    }

    if (selectedDestination !== "all") {
      result = result.filter((p) => p.destination_id === Number(selectedDestination));
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "duration") {
      result.sort((a, b) => a.duration_days - b.duration_days);
    }

    return result;
  }, [packages, search, selectedDestination, sortBy]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800 antialiased">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="border-b border-stone-200/80 pb-8 mb-8">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase block">
            Trekking & Tour Packages
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">
            Explore All Expeditions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Choose from guided mountain climbs, beach side trail walks, and multi-day deep forest explorations.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search packages by title or keyword..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>
            <div>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-500 focus:bg-white transition text-gray-700"
              >
                <option value="all">All Destinations</option>
                {destinations.map((d) => (
                  <option key={d.destination_id} value={d.destination_id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-500 focus:bg-white transition text-gray-700"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration">Duration: Short to Long</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 text-xs text-gray-500">
          <span>Showing <strong className="text-gray-900">{filteredPackages.length}</strong> expeditions</span>
          {(search || selectedDestination !== "all" || sortBy !== "featured") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedDestination("all");
                setSortBy("featured");
              }}
              className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-80 border border-stone-200" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPackages.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 6l6 12H4l4-8 3 5 3-9z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800">No packages match your criteria</h3>
            <p className="text-xs text-gray-500 mt-1">Try modifying your search or destination filter.</p>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredPackages.map((p) => (
            <Link
              key={p.id}
              href={`/packages/${p.id}`}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-48 bg-gradient-to-tr from-gray-900 to-teal-900 overflow-hidden flex items-center justify-center">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-12 h-12 text-teal-400 opacity-60">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 6l6 12H4l4-8 3 5 3-9z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                    {p.duration_days}D / {p.duration_nights || p.duration_days - 1}N
                  </div>
                  {p.destination && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-gray-900 text-xs font-semibold flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{p.destination.name}</span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                      Max {p.max_travelers || 10} Travelers
                    </span>
                    <span className="text-xs font-bold text-emerald-700 uppercase">
                      {p.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-600 transition-colors line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {p.description || "An unforgettable outdoor trekking and camping adventure."}
                  </p>

                  {p.categories && p.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.categories.map((c) => (
                        <span
                          key={c.category_id}
                          className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                        >
                          {c.category_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Starting from
                  </span>
                  <span className="text-lg font-extrabold text-teal-700">
                    ৳{Number(p.price).toLocaleString()}
                  </span>
                </div>
                <span className="px-3.5 py-1.5 bg-teal-600 group-hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs">
                  Details &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800">
          <Header />
          <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-20 text-center text-sm text-gray-400">
            Loading expeditions...
          </main>
          <Footer />
        </div>
      }
    >
      <PackagesList />
    </Suspense>
  );
}
