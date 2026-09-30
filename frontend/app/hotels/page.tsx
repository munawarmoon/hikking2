"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Hotel, getHotels } from "../lib/api";

const HOTEL_AMENITIES = [
  "Hot Water",
  "Trekker Breakfast",
  "Gear Storage",
  "24/7 Security",
  "Wi-Fi Access",
];

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState<string>("all");

  useEffect(() => {
    getHotels()
      .then(setHotels)
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredHotels = useMemo(() => {
    let list = [...hotels];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.hotel_name.toLowerCase().includes(q) ||
          (h.address && h.address.toLowerCase().includes(q)),
      );
    }

    if (starFilter !== "all") {
      const stars = Number(starFilter);
      list = list.filter((h) => h.star_rating === stars);
    }

    return list;
  }, [hotels, search, starFilter]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800 antialiased">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="border-b border-stone-200 pt-4 pb-10 mb-12 relative">
          {/* blur circle div মুছে দিন */}
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-2">
              Comfort & Rest
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Verified Stays & Mountain Lodges
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mt-3 leading-relaxed">
              Every hotel and eco-resort in our network is inspected for
              cleanliness, secure gear storage, hot water facilities, and
              proximity to hiking trailheads.
            </p>

            {/* Search & Filter Bar */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
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
                  placeholder="Search hotel by name or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
                />
              </div>
              <div>
                <select
                  value={starFilter}
                  onChange={(e) => setStarFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
                >
                  <option value="all">All Star Ratings</option>
                  <option value="5">5-Star Luxury</option>
                  <option value="4">4-Star Premium</option>
                  <option value="3">3-Star Comfort</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Partner Accommodations ({filteredHotels.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Arranged with hiking tour packages
            </p>
          </div>
          {(search || starFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStarFilter("all");
              }}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-64 border border-stone-200"
              ></div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredHotels.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <h3 className="font-bold text-gray-900 text-lg">No Hotels Found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              We couldn&apos;t find any hotel matching your criteria. Try
              adjusting your search or star filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStarFilter("all");
              }}
              className="text-xs bg-teal-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((h) => (
            <div
              key={h.hotel_id}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Hotel Banner Card */}
                <div className="h-36 bg-gradient-to-br from-stone-800 to-teal-950 p-5 flex flex-col justify-between text-white relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white border border-white/20 flex items-center gap-1.5">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Partner Lodge
                    </span>
                    {h.star_rating && (
                      <span className="text-xs text-amber-300 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                        {h.star_rating}-Star
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-teal-200 transition-colors line-clamp-1">
                      {h.hotel_name}
                    </h3>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="p-5 space-y-3">
                  {h.address && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-600">
                      <svg
                        className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5"
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
                      <span className="line-clamp-2 leading-relaxed">
                        {h.address}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                      Included Amenities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {HOTEL_AMENITIES.slice(0, 3 + (h.hotel_id % 3)).map(
                        (amenity) => (
                          <span
                            key={amenity}
                            className="text-[11px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                          >
                            {amenity}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-5 pt-0">
                <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified Stay
                  </span>
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
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
