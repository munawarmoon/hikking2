"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Package,
  Review,
  getPackage,
  getReviews,
  createBooking,
  getStoredUser,
} from "../../lib/api";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [pkg, setPkg] = useState<Package | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Set default travel date to 7 days in the future
  const defaultFutureDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const [travelDate, setTravelDate] = useState(defaultFutureDate());
  const [totalTravelers, setTotalTravelers] = useState(1);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getPackage(id).catch(() => null),
      getReviews(id).catch(() => []),
    ])
      .then(([p, r]) => {
        setPkg(p);
        setReviews(r || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setBooking(true);
    try {
      await createBooking({
        package_id: id,
        travel_date: travelDate,
        total_travelers: totalTravelers,
      });
      setSuccess(
        "Reservation requested successfully. You can manage your booking in your dashboard.",
      );
    } catch (err: any) {
      setError(err.message || "Failed to create booking.");
    } finally {
      setBooking(false);
    }
  }

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800">
        <Header />
        <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800">
        <Header />
        <main className="flex-grow max-w-xl mx-auto w-full px-6 py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Package Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The hiking or travel package you are looking for does not exist or
            may have been archived.
          </p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            &larr; Browse All Packages
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const unitPrice = Number(pkg.price) || 0;
  const totalPrice = unitPrice * totalTravelers;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 text-gray-800 antialiased">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/packages"
            className="hover:text-teal-600 transition-colors"
          >
            Packages
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {pkg.title}
          </span>
        </nav>

        {/* Header Title Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            {pkg.destination?.name && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                <svg
                  className="w-3.5 h-3.5 text-teal-700"
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
                {pkg.destination.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
              <svg
                className="w-3.5 h-3.5 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {pkg.duration_days} Days{" "}
              {pkg.duration_nights ? `/ ${pkg.duration_nights} Nights` : ""}
            </span>
            {pkg.max_travelers && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded-full">
                <svg
                  className="w-3.5 h-3.5 text-purple-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Max {pkg.max_travelers} Travelers
              </span>
            )}
            {avgRating && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                <svg
                  className="w-3.5 h-3.5 text-amber-600 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {avgRating} ({reviews.length} reviews)
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
            {pkg.title}
          </h1>

          {pkg.destination?.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-gray-600">Location:</span>{" "}
              {pkg.destination.location}
            </p>
          )}
        </div>

        {/* Main Grid: Details (2 Cols) + Sticky Booking Box (1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Visual Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-10 shadow-sm border border-teal-900/20">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-10 shadow-sm border border-teal-900/20 min-h-[320px] flex items-end">
                {pkg.image_url && (
                  <>
                    <img
                      src={pkg.image_url}
                      alt={pkg.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  </>
                )}
                <div className="relative z-10"></div>
                <span className="text-xs font-semibold text-teal-300 tracking-widest uppercase">
                  Featured Experience
                </span>
                <h3 className="text-2xl font-bold mt-1 mb-3 text-white">
                  Explore {pkg.destination?.name || "The Trail"}
                </h3>
                <p className="text-sm text-teal-100/90 leading-relaxed max-w-xl">
                  {pkg.description ||
                    "Experience breathtaking nature trails, historical landmarks, and authentic regional cuisine led by our certified guide network."}
                </p>

                {pkg.categories && pkg.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {pkg.categories.map((c) => (
                      <span
                        key={c.category_id}
                        className="text-xs font-medium bg-white/10 hover:bg-white/20 backdrop-blur-sm text-teal-100 px-3 py-1 rounded-lg border border-white/10 transition-colors"
                      >
                        {c.category_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Guide Profile Card */}
            {pkg.guideProfile && (
              <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-xl shadow-inner shrink-0">
                    {pkg.guideProfile.user?.name
                      ? pkg.guideProfile.user.name[0].toUpperCase()
                      : "G"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-base">
                        {pkg.guideProfile.user?.name ?? "Assigned Local Guide"}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        Verified Guide
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pkg.guideProfile.experience_years
                        ? `${pkg.guideProfile.experience_years} Years of Field Experience`
                        : "Professional Trekking & Expedition Leader"}
                    </p>
                    {pkg.guideProfile.bio && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2 max-w-lg">
                        &ldquo;{pkg.guideProfile.bio}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center sm:flex-col items-end gap-1 text-right">
                  <span className="text-xs font-medium text-gray-400">
                    Guide Rating
                  </span>
                  <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                    {pkg.guideProfile.rating_avg
                      ? Number(pkg.guideProfile.rating_avg).toFixed(1)
                      : "5.0"}{" "}
                    / 5.0
                  </span>
                </div>
              </div>
            )}

            {/* Accommodations / Hotels */}
            {pkg.hotels && pkg.hotels.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Included Accommodations
                    </h3>
                    <p className="text-xs text-gray-500">
                      Verified hotels arranged for this package
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                    {pkg.hotels.length}{" "}
                    {pkg.hotels.length === 1 ? "Hotel" : "Hotels"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pkg.hotels.map((h) => (
                    <div
                      key={h.hotel_id}
                      className="border border-stone-200/70 rounded-xl p-4 hover:border-teal-300 transition-colors bg-stone-50/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {h.hotel_name}
                          </h4>
                          {h.address && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-teal-600 shrink-0"
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
                              <span>{h.address}</span>
                            </p>
                          )}
                        </div>
                        {h.star_rating && (
                          <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 shrink-0">
                            {h.star_rating}-Star
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-day Itinerary */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/70 shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Trip Itinerary
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Day-by-day planned schedule for the journey
              </p>

              {pkg.itineraries && pkg.itineraries.length > 0 ? (
                <div className="relative border-l-2 border-teal-100 ml-4 pl-6 space-y-6">
                  {pkg.itineraries.map((it) => (
                    <div key={it.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center ring-4 ring-white shadow-xs">
                        {it.day_number}
                      </div>
                      <div className="bg-stone-50 border border-stone-200/70 rounded-xl p-4">
                        <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-0.5">
                          Day {it.day_number}
                        </div>
                        <h4 className="font-bold text-gray-900 text-base">
                          {it.title}
                        </h4>
                        {it.description && (
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            {it.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">
                  Detailed itinerary is available upon booking confirmation with
                  your guide.
                </div>
              )}
            </div>

            {/* Traveler Reviews Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/70 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Traveler Reviews
                  </h3>
                  <p className="text-xs text-gray-500">
                    Verified feedback from hikers
                  </p>
                </div>
                {avgRating && (
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-amber-600">
                      {avgRating} / 5.0
                    </div>
                    <div className="text-xs text-gray-400">
                      Based on {reviews.length} reviews
                    </div>
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.review_id}
                      className="border border-stone-100 rounded-xl p-4 bg-stone-50/40"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                            {r.traveler?.name
                              ? r.traveler.name[0].toUpperCase()
                              : "T"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {r.traveler?.name ?? "Verified Traveler"}
                            </div>
                            <span className="text-[11px] text-teal-700 font-medium">
                              Verified Trip
                            </span>
                          </div>
                        </div>
                        <div className="text-amber-700 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                          {r.rating} / 5 Rating
                        </div>
                      </div>
                      {r.comment ? (
                        <p className="text-sm text-gray-600 pl-10 leading-relaxed">
                          {r.comment}
                        </p>
                      ) : (
                        <p className="text-xs italic text-gray-400 pl-10">
                          No written feedback provided.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
                  <p className="font-medium text-gray-700">
                    No reviews yet for this package
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Book your tour now and be the first explorer to review it.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-md">
              <div className="pb-4 mb-4 border-b border-stone-100 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    ৳{unitPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {" "}
                    / person
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  All-Inclusive
                </span>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-4 mb-4">
                  <div className="font-bold mb-1">{success}</div>
                  <Link
                    href="/dashboard"
                    className="inline-block mt-2 font-bold underline hover:text-emerald-900"
                  >
                    Go to Traveler Dashboard &rarr;
                  </Link>
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Departure Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Number of Travelers
                    </label>
                    {pkg.max_travelers && (
                      <span className="text-[11px] text-gray-400">
                        Max: {pkg.max_travelers}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setTotalTravelers((prev) => Math.max(1, prev - 1))
                      }
                      className="px-3 py-2.5 text-gray-600 hover:bg-stone-100 transition-colors font-bold text-base"
                    >
                      &minus;
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={pkg.max_travelers || 99}
                      required
                      value={totalTravelers}
                      onChange={(e) =>
                        setTotalTravelers(
                          Math.max(
                            1,
                            Math.min(
                              pkg.max_travelers || 99,
                              Number(e.target.value) || 1,
                            ),
                          ),
                        )
                      }
                      className="w-full text-center text-sm font-semibold text-gray-900 py-2.5 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTotalTravelers((prev) =>
                          pkg.max_travelers
                            ? Math.min(pkg.max_travelers, prev + 1)
                            : prev + 1,
                        )
                      }
                      className="px-3 py-2.5 text-gray-600 hover:bg-stone-100 transition-colors font-bold text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 pb-1 border-t border-stone-100 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>
                      ৳{unitPrice.toLocaleString()} &times; {totalTravelers}{" "}
                      {totalTravelers === 1 ? "traveler" : "travelers"}
                    </span>
                    <span>৳{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guide & Permits</span>
                    <span className="text-emerald-600 font-medium">
                      Included
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-stone-100">
                    <span>Total Cost</span>
                    <span className="text-teal-700 font-extrabold text-base">
                      ৳{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={booking}
                  className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Reservation...</span>
                    </>
                  ) : (
                    <span>Reserve Adventure Now &rarr;</span>
                  )}
                </button>
              </form>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-stone-100 space-y-2.5 text-xs text-gray-500">
                <div className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-teal-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Instant digital confirmation & invoice</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-teal-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Certified and verified mountain guides</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg
                    className="w-4 h-4 text-teal-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>Transparent payment tracking & receipts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
