"use client";
import SqlFileView, { Panel } from "../sql-results/SqlFileView";

const panels: Panel[] = [
  {
    label: "View",
    note: "vw_DestinationPackageSummary",
    reads: [{ key: "pkg_view", title: "vw_DestinationPackageSummary" }],
  },
  {
    label: "Procedure",
    note: "sp_ReviewPackages (৩+ booking = published, ০ booking = ১০% discount)",
    reads: [{ key: "pkg_packages", title: "Packages" }],
    run: { key: "review_packages", label: "Run", fields: [] },
  },
  {
    label: "Trigger",
    note: "trg_package_price_audit: price/status বদলালে audit log",
    reads: [{ key: "pkg_audit", title: "package_audit" }],
    run: {
      key: "update_price",
      label: "Change price",
      fields: [
        { name: "package_id", label: "Package ID", def: "1" },
        { name: "delta", label: "Price + ", def: "500" },
      ],
    },
  },
  {
    label: "Transaction",
    note: "sp_CreatePackageWithItinerary (category 9999 দিলে PARTIAL_SUCCESS)",
    reads: [
      { key: "pkg_packages", title: "Packages" },
      { key: "pkg_itin", title: "Itineraries" },
    ],
    run: {
      key: "create_package",
      label: "Run",
      fields: [
        { name: "destination_id", label: "Destination", def: "1" },
        { name: "guide_profile_id", label: "Guide", def: "1" },
        { name: "title", label: "Title", def: "Test Trek" },
        { name: "price", label: "Price", def: "9500" },
        { name: "days", label: "Days", def: "3" },
        { name: "category_id", label: "Category", def: "1" },
      ],
    },
  },
];

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Package SQL Results</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        mysql_2_package_management.sql — View, Procedure, Trigger, Transaction
      </p>
      <SqlFileView panels={panels} />
    </div>
  );
}
