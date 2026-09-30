"use client";
import SqlFileView, { Panel } from "../sql-results/SqlFileView";

const panels: Panel[] = [
  {
    label: "View",
    note: "OutstandingBookings view",
    reads: [{ key: "booking_view", title: "OutstandingBookings" }],
  },
  {
    label: "Procedure",
    note: "sp_TravelerBookingStatus(traveler_id)",
    reads: [],
    run: {
      key: "traveler_status",
      label: "Call",
      fields: [{ name: "traveler_id", label: "Traveler ID", def: "5" }],
    },
  },
  {
    label: "Trigger",
    note: "trg_booking_notify_guide: নতুন booking হলে guide-কে notification যায়",
    reads: [{ key: "booking_notifications", title: "Latest notifications" }],
    run: {
      key: "insert_booking",
      label: "Insert test booking",
      fields: [
        { name: "traveler_id", label: "Traveler ID", def: "5" },
        { name: "package_id", label: "Package ID", def: "1" },
      ],
    },
  },
  {
    label: "Transaction",
    note: "sp_CreateBookingWithPayment",
    reads: [
      { key: "booking_latest", title: "Latest bookings" },
      { key: "booking_payments", title: "Latest payments" },
    ],
    run: {
      key: "create_booking",
      label: "Run",
      fields: [
        { name: "traveler_id", label: "Traveler", def: "5" },
        { name: "package_id", label: "Package", def: "2" },
        { name: "travel_date", label: "Date", def: "2026-12-25" },
        { name: "travelers", label: "Travelers", def: "2" },
        { name: "amount", label: "Amount", def: "29000" },
      ],
    },
  },
];

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Booking SQL Results</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        mysql_1_booking_management.sql — View, Procedure, Trigger, Transaction
      </p>
      <SqlFileView panels={panels} />
    </div>
  );
}
