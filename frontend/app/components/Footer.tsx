import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {/* Brand Col */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M14 6l6 12H4l4-8 3 5 3-9z" />
              </svg>
            </span>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Hik<span className="text-teal-400">King</span>
            </span>
          </Link>
          <p className="text-xs text-gray-400 leading-relaxed">
            Bangladesh&apos;s premier adventure and hiking tour platform. Discover breathtaking mountain peaks, coastal trails, and travel with certified local guides.
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Verified Booking Network
            </span>
          </div>
        </div>

        {/* Explore Col */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Explore Destinations
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li>
              <Link href="/destination" className="hover:text-teal-400 transition-colors">
                Bandarban Hill Tracts
              </Link>
            </li>
            <li>
              <Link href="/destination" className="hover:text-teal-400 transition-colors">
                Cox&apos;s Bazar Beach & Marine Drive
              </Link>
            </li>
            <li>
              <Link href="/destination" className="hover:text-teal-400 transition-colors">
                Sajek Valley Cloud Peaks
              </Link>
            </li>
            <li>
              <Link href="/destination" className="hover:text-teal-400 transition-colors">
                Sreemangal Tea Trails
              </Link>
            </li>
            <li>
              <Link href="/packages" className="hover:text-teal-400 transition-colors font-medium text-teal-300">
                View All Packages &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Platform & Services
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li>
              <Link href="/hotels" className="hover:text-teal-400 transition-colors">
                Resorts & Eco-Cottages
              </Link>
            </li>
            <li>
              <Link href="/guide" className="hover:text-teal-400 transition-colors">
                Certified Local Guides
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-teal-400 transition-colors">
                Traveler Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-teal-400 transition-colors">
                Admin Management Portal
              </Link>
            </li>
            <li>
              <Link href="/admin/advanced-operations" className="hover:text-teal-400 transition-colors">
                Operations & Systems Console
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Contact & Support
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+880 1700-000000</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>support@hikking.com</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Dhaka, Bangladesh</span>
            </li>
            <li className="pt-2 text-[11px] text-gray-500">
              Support hours: 24/7 dedicated assistance for ongoing expeditions.
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>&copy; 2026 HikKing. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/destination" className="hover:text-gray-400">Destinations</Link>
          <Link href="/packages" className="hover:text-gray-400">Packages</Link>
          <Link href="/hotels" className="hover:text-gray-400">Hotels</Link>
          <Link href="/guide" className="hover:text-gray-400">Guides</Link>
        </div>
      </div>
    </footer>
  );
}
