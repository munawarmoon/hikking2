"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type TabKey = "view" | "procedures" | "triggers" | "transactions" | "reservations" | "sql";

export default function AdvancedDatabaseOperationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("view");

  // View state
  const [outstandingBookings, setOutstandingBookings] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Procedure 1 state (Traveler Status)
  const [selectedTravelerId, setSelectedTravelerId] = useState<number>(5);
  const [travelerStatusResult, setTravelerStatusResult] = useState<any>(null);
  const [travelerLoading, setTravelerLoading] = useState(false);

  // Procedure 2 state (Review Packages)
  const [reviewPackagesLogs, setReviewPackagesLogs] = useState<any[]>([]);
  const [updatedPackages, setUpdatedPackages] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Trigger state (Audit Log)
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [triggerPkgId, setTriggerPkgId] = useState<number>(1);
  const [triggerNewPrice, setTriggerNewPrice] = useState<string>("9200");
  const [triggerStatus, setTriggerStatus] = useState<string>("published");
  const [triggerSubmitting, setTriggerSubmitting] = useState(false);
  const [triggerFeedback, setTriggerFeedback] = useState<string | null>(null);

  // Notifications (Trigger 2)
  const [notifications, setNotifications] = useState<any[]>([]);

  // Transaction state
  const [txnTravelerId, setTxnTravelerId] = useState<number>(5);
  const [txnPkgId, setTxnPkgId] = useState<number>(2);
  const [txnTravelDate, setTxnTravelDate] = useState<string>("2026-12-25");
  const [txnTravelers, setTxnTravelers] = useState<number>(2);
  const [txnAmount, setTxnAmount] = useState<string>("29000.00");
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnResult, setTxnResult] = useState<any>(null);

  // Reservations state
  const [reservations, setReservations] = useState<any[]>([]);
  const [resLoading, setResLoading] = useState(false);

  // Raw SQL state
  const [sqlDialect, setSqlDialect] = useState<"mysql" | "tsql">("mysql");
  const [mysqlSql, setMysqlSql] = useState<string>("");
  const [tsqlSql, setTsqlSql] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Load View data on mount
  useEffect(() => {
    loadOutstandingBookings();
  }, []);

  async function loadOutstandingBookings() {
    setViewLoading(true);
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/outstanding-bookings`);
      const json = await res.json();
      if (json.success) setOutstandingBookings(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setViewLoading(false);
    }
  }

  async function runTravelerStatus(id: number) {
    setSelectedTravelerId(id);
    setTravelerLoading(true);
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/traveler-status/${id}`);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        setTravelerStatusResult(json.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTravelerLoading(false);
    }
  }

  async function runReviewPackages() {
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/review-packages`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setReviewPackagesLogs(json.logs || []);
        setUpdatedPackages(json.packages || []);
        // Refresh audit logs too since prices might have changed
        loadAuditLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  }

  async function loadAuditLogs() {
    setAuditLoading(true);
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/package-audit-log`);
      const json = await res.json();
      if (json.success) setAuditLogs(json.data || []);

      const notifRes = await fetch(`${API_URL}/query-results/advanced-operations/notifications`);
      const notifJson = await notifRes.json();
      if (notifJson.success) setNotifications(notifJson.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  }

  async function handleTestTrigger(e: React.FormEvent) {
    e.preventDefault();
    setTriggerSubmitting(true);
    setTriggerFeedback(null);
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/test-trigger-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: triggerPkgId,
          new_price: parseFloat(triggerNewPrice),
          new_status: triggerStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTriggerFeedback("Success: Trigger trg_package_price_audit fired and logged event to package_audit!");
        loadAuditLogs();
      } else {
        setTriggerFeedback(`Error: ${json.message}`);
      }
    } catch (err: any) {
      setTriggerFeedback(`Failed: ${err.message}`);
    } finally {
      setTriggerSubmitting(false);
    }
  }

  async function handleExecuteTransaction(e: React.FormEvent) {
    e.preventDefault();
    setTxnLoading(true);
    setTxnResult(null);
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/create-booking-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traveler_id: txnTravelerId,
          package_id: txnPkgId,
          travel_date: txnTravelDate,
          travelers: txnTravelers,
          amount: parseFloat(txnAmount),
        }),
      });
      const json = await res.json();
      setTxnResult(json);
      loadOutstandingBookings();
    } catch (err: any) {
      setTxnResult({ success: false, message: err.message });
    } finally {
      setTxnLoading(false);
    }
  }

  async function loadReservations() {
    setResLoading(true);
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/reservations`);
      const json = await res.json();
      if (json.success) setReservations(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setResLoading(false);
    }
  }

  async function loadRawSql() {
    try {
      const res = await fetch(`${API_URL}/query-results/advanced-operations/raw-sql`);
      const json = await res.json();
      if (json.success) {
        setMysqlSql(json.mysql_sql);
        setTsqlSql(json.tsql_sql);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    if (tab === "view") loadOutstandingBookings();
    if (tab === "triggers") loadAuditLogs();
    if (tab === "reservations") loadReservations();
    if (tab === "sql") loadRawSql();
  }

  function copySqlToClipboard() {
    const text = sqlDialect === "mysql" ? mysqlSql : tsqlSql;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Calculate view totals
  const totalDue = outstandingBookings.reduce((sum, b) => sum + parseFloat(b.unpaid_amount || 0), 0);
  const totalPaid = outstandingBookings.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-teal-900 to-gray-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide uppercase border border-teal-500/30">
                Database Engine · Advanced Features
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs font-medium border border-green-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                MySQL 8.4 Connected
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Advanced Database Operations
            </h1>
            <p className="text-teal-200/80 text-sm mt-1">
              Live enterprise database features: Views, Stored Procedures, Triggers, Transactions & Constraints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange("sql")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold tracking-wider uppercase backdrop-blur transition border border-white/20"
            >
              View SQL Code (Q1–Q10)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { key: "view", label: "1. View (OutstandingBookings)", desc: "Q6" },
          { key: "procedures", label: "2. Stored Procedures", desc: "Q7 & Q8" },
          { key: "triggers", label: "3. Triggers & Audit", desc: "Q9 & Notifications" },
          { key: "transactions", label: "4. Transactions (Savepoint)", desc: "Q10" },
          { key: "reservations", label: "5. Reservations Table", desc: "Q1 Constraints" },
          { key: "sql", label: "6. Full SQL Scripts", desc: "MySQL & T-SQL" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key as TabKey)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === t.key
                ? "bg-teal-600 text-white shadow-sm ring-2 ring-teal-600/30"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                activeTab === t.key ? "bg-teal-800 text-teal-200" : "bg-gray-100 text-gray-500"
              }`}
            >
              {t.desc}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: VIEW (OutstandingBookings) */}
      {activeTab === "view" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Bookings in View
              </span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {outstandingBookings.length}
              </p>
              <span className="text-xs text-gray-500 mt-1 block">
                Filtered: Pending & Confirmed
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Total Collected (Paid)
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                ৳{totalPaid.toLocaleString()}
              </p>
              <span className="text-xs text-gray-500 mt-1 block">
                Aggregated via SUM(CASE WHEN paid)
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Total Outstanding Due
              </span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">
                ৳{totalDue.toLocaleString()}
              </p>
              <span className="text-xs text-gray-500 mt-1 block">
                SUM(CASE WHEN pending/failed)
              </span>
            </div>
          </div>

          {/* View Details Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  SQL View: OutstandingBookings
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Connects bookings, users, packages, destinations and computes settled vs unpaid amounts.
                </p>
              </div>
              <button
                onClick={loadOutstandingBookings}
                disabled={viewLoading}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {viewLoading ? "Refreshing..." : "↻ Refresh View"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Traveler</th>
                    <th className="px-4 py-3">Package Title</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Travel Date</th>
                    <th className="px-4 py-3 text-right">Total Price</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Unpaid Due</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {outstandingBookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        #{b.booking_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{b.traveler_name}</div>
                        <div className="text-xs text-gray-400">{b.traveler_email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium max-w-xs truncate">
                        {b.package_title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.destination_name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {b.travel_date}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ৳{parseFloat(b.total_price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                        ৳{parseFloat(b.paid_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">
                        ৳{parseFloat(b.unpaid_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            b.booking_status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {outstandingBookings.length === 0 && !viewLoading && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-400">
                        No outstanding bookings in view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORED PROCEDURES (sp_TravelerBookingStatus & sp_ReviewPackages) */}
      {activeTab === "procedures" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Procedure 1: sp_TravelerBookingStatus */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold uppercase">
                  Stored Procedure Q7
                </span>
                <span className="text-xs text-gray-400">IF / ELSE & CASE Logic</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                sp_TravelerBookingStatus
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Takes traveler ID, calculates spend, unpaid debt, and flags status:
                <span className="text-rose-600 font-semibold ml-1">Blocked (&ge;10k)</span>,
                <span className="text-amber-600 font-semibold ml-1">Warning (&ge;3k)</span>,
                <span className="text-emerald-600 font-semibold ml-1">Clear</span>.
              </p>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-600 block">
                Quick Test Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 5, label: "Aiman Ahmed (#5)", note: "Clear" },
                  { id: 7, label: "Nusrat Jahan (#7)", note: "Blocked" },
                  { id: 6, label: "Tanvir Rahman (#6)", note: "Clear" },
                  { id: 1, label: "Admin (#1)", note: "No Bookings" },
                  { id: 999, label: "ID #999", note: "Not Found" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => runTravelerStatus(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selectedTravelerId === s.id
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {s.label}
                    <span className="ml-1 opacity-75 text-[10px]">({s.note})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="number"
                value={selectedTravelerId}
                onChange={(e) => setSelectedTravelerId(parseInt(e.target.value) || 1)}
                placeholder="Custom Traveler ID"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <button
                onClick={() => runTravelerStatus(selectedTravelerId)}
                disabled={travelerLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition whitespace-nowrap"
              >
                {travelerLoading ? "Executing..." : "CALL Procedure"}
              </button>
            </div>

            {/* Procedure Output Card */}
            {travelerStatusResult && (
              <div className="mt-4 p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Procedure Execution Output
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                      travelerStatusResult.Status === "Blocked"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : travelerStatusResult.Status === "Warning"
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {travelerStatusResult.Status || "Clear"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block">Traveler Name</span>
                    <span className="font-bold text-gray-800">
                      {travelerStatusResult.Name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Total Bookings</span>
                    <span className="font-bold text-gray-800">
                      {travelerStatusResult.BookingCount ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Total Spend</span>
                    <span className="font-bold text-gray-800">
                      ৳{parseFloat(travelerStatusResult.TotalSpend || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Unpaid Amount</span>
                    <span
                      className={`font-bold ${
                        parseFloat(travelerStatusResult.UnpaidAmount || 0) > 0
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      ৳{parseFloat(travelerStatusResult.UnpaidAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {travelerStatusResult.result && travelerStatusResult.result !== "OK" && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                    ℹ️ {travelerStatusResult.result}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Procedure 2: sp_ReviewPackages */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                  Stored Procedure Q8
                </span>
                <span className="text-xs text-gray-400">WHILE Loop Iteration</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">sp_ReviewPackages</h2>
              <p className="text-xs text-gray-500 mt-1">
                Iterates through packages in a WHILE loop:
                <br />• Bookings &ge; 3 &rarr; Promotes to <span className="font-semibold text-teal-700">'published'</span>
                <br />• Bookings = 0 &rarr; Applies <span className="font-semibold text-rose-700">10% discount</span> automatically.
              </p>
            </div>

            <button
              onClick={runReviewPackages}
              disabled={reviewLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              {reviewLoading ? "Executing Routine..." : "CALL sp_ReviewPackages()"}
            </button>

            {/* Loop Output Logs */}
            {reviewPackagesLogs.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  WHILE Loop Execution Log:
                </span>
                <div className="bg-gray-900 text-green-400 font-mono text-xs p-3 rounded-lg max-h-48 overflow-y-auto space-y-1">
                  {reviewPackagesLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-gray-500">[{idx + 1}]</span>
                      <span>{log.log_line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Updated Packages table snippet */}
            {updatedPackages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Post-Procedure Package Statuses:
                </span>
                <div className="border border-gray-100 rounded-lg overflow-hidden max-h-48 overflow-y-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">Title</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {updatedPackages.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2 font-semibold">#{p.id}</td>
                          <td className="p-2 truncate max-w-[140px]">{p.title}</td>
                          <td className="p-2 text-right font-medium">৳{parseFloat(p.price).toLocaleString()}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRIGGERS & AUDIT (trg_package_price_audit & trg_booking_notify_guide) */}
      {activeTab === "triggers" && (
        <div className="space-y-6">
          {/* Live Trigger Tester Form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                Trigger Q9 Tester
              </span>
              <span className="text-xs text-gray-400">AFTER UPDATE ON packages</span>
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              Test Trigger: trg_package_price_audit
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Updating a package price or status directly fires the database trigger, logging old and new values to <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-purple-700">package_audit</code>.
            </p>

            <form onSubmit={handleTestTrigger} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Target Package ID
                </label>
                <input
                  type="number"
                  value={triggerPkgId}
                  onChange={(e) => setTriggerPkgId(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  New Price (BDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={triggerNewPrice}
                  onChange={(e) => setTriggerNewPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  New Status
                </label>
                <select
                  value={triggerStatus}
                  onChange={(e) => setTriggerStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={triggerSubmitting}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  {triggerSubmitting ? "Executing Trigger..." : "Update Package Price & Audit"}
                </button>
              </div>
            </form>

            {triggerFeedback && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-semibold ${
                triggerFeedback.startsWith("Success")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                {triggerFeedback}
              </div>
            )}
          </div>

          {/* Trigger 1 Audit Table Log */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Audit Log: package_audit
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Populated strictly by database trigger <code className="font-mono text-purple-700">trg_package_price_audit</code>.
                </p>
              </div>
              <button
                onClick={loadAuditLogs}
                disabled={auditLoading}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {auditLoading ? "Refreshing..." : "↻ Refresh Audit Log"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Audit ID</th>
                    <th className="px-4 py-3">Package ID</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3 text-right">Old Price</th>
                    <th className="px-4 py-3 text-right">New Price</th>
                    <th className="px-4 py-3 text-center">Old Status</th>
                    <th className="px-4 py-3 text-center">New Status</th>
                    <th className="px-4 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-700">#{log.id}</td>
                      <td className="px-4 py-3 font-bold text-teal-600">Pkg #{log.package_id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">
                          {log.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {log.old_price ? `৳${parseFloat(log.old_price).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {log.new_price ? `৳${parseFloat(log.new_price).toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">{log.old_status || "—"}</td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-gray-800">{log.new_status || "—"}</td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400 whitespace-nowrap">{log.created_at}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-gray-400">
                        No audit records yet. Update a package above to trigger an audit record!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trigger 2: Notifications */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Trigger 2: trg_booking_notify_guide (Notifications Table)
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Fires AFTER INSERT on <code className="font-mono text-teal-700">bookings</code> to notify assigned tour guides.
            </p>
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.notification_id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-teal-800 mr-2">Guide User #{n.user_id}:</span>
                    <span className="text-gray-700">{n.message}</span>
                  </div>
                  <span className="text-gray-400 text-[11px] whitespace-nowrap ml-4">{n.created_at}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSACTIONS & SAVEPOINTS (sp_CreateBookingWithPayment) */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                Transaction Q10
              </span>
              <span className="text-xs text-gray-400">START TRANSACTION & SAVEPOINT after_booking</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Atomic Booking & Payment Transaction
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Demonstrates atomic transaction handling:
              <br />1. <span className="font-semibold text-gray-700">INSERT booking</span> (status: pending)
              <br />2. <span className="font-semibold text-teal-700">SAVEPOINT after_booking</span>
              <br />3. <span className="font-semibold text-gray-700">INSERT payment</span> (status: paid)
              <br />4. <span className="font-semibold text-emerald-700">UPDATE booking</span> &rarr; 'confirmed'
              <br />5. <span className="font-semibold text-blue-700">COMMIT</span>. On payment failure: rolls back to savepoint to preserve booking as pending.
            </p>

            <form onSubmit={handleExecuteTransaction} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Traveler User ID
                </label>
                <input
                  type="number"
                  value={txnTravelerId}
                  onChange={(e) => setTxnTravelerId(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Package ID
                </label>
                <input
                  type="number"
                  value={txnPkgId}
                  onChange={(e) => setTxnPkgId(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={txnTravelDate}
                  onChange={(e) => setTxnTravelDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Total Travelers
                </label>
                <input
                  type="number"
                  value={txnTravelers}
                  onChange={(e) => setTxnTravelers(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  min={1}
                  max={20}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Payment Amount (BDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={txnAmount}
                  onChange={(e) => setTxnAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={txnLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  {txnLoading ? "Executing Transaction..." : "Execute Transaction"}
                </button>
              </div>
            </form>

            {/* Transaction Result Card */}
            {txnResult && (
              <div className="mt-5 p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                    Transaction Result
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    {txnResult.result?.[0]?.result || "COMPLETED"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {txnResult.result?.[0]?.message}
                </p>

                {txnResult.booking && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-400 block">Created Booking ID</span>
                      <span className="font-bold text-teal-600">#{txnResult.booking.booking_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Booking Status</span>
                      <span className="font-bold text-emerald-600">{txnResult.booking.booking_status}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Payment ID</span>
                      <span className="font-bold text-gray-800">#{txnResult.payment?.payment_id || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Transaction UUID</span>
                      <span className="font-mono text-gray-700 truncate block">{txnResult.payment?.transaction_id || "N/A"}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: RESERVATIONS (Q1 Table & Constraints) */}
      {activeTab === "reservations" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                  Table Q1
                </span>
                <span className="text-xs text-gray-400">PK, FK, UNIQUE, CHECK Constraints</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Reservations Table
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Constraints: PRIMARY KEY (ResID), FK (TravelerID &rarr; users.id), FK (PackageID &rarr; packages.id), UNIQUE (TravelerID, PackageID, ResDate), CHECK (TotalTravelers BETWEEN 1 AND 20), CHECK (Status IN ('Pending', 'Confirmed', 'Collected', 'Cancelled')).
              </p>
            </div>
            <button
              onClick={loadReservations}
              disabled={resLoading}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              {resLoading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Res ID</th>
                  <th className="px-4 py-3">Traveler ID</th>
                  <th className="px-4 py-3">Package ID</th>
                  <th className="px-4 py-3">Reservation Date</th>
                  <th className="px-4 py-3 text-center">Total Travelers</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map((r) => (
                  <tr key={r.ResID} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">#{r.ResID}</td>
                    <td className="px-4 py-3 text-teal-600 font-bold">User #{r.TravelerID}</td>
                    <td className="px-4 py-3 text-blue-600 font-bold">Pkg #{r.PackageID}</td>
                    <td className="px-4 py-3 text-gray-600">{r.ResDate}</td>
                    <td className="px-4 py-3 text-center font-bold">{r.TotalTravelers}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        r.Status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {r.Status}
                      </span>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No reservations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: FULL SQL SCRIPTS (MySQL & T-SQL) */}
      {activeTab === "sql" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Course Lecture SQL Code (Q1 to Q10)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Exact formats tailored for your project. Choose dialect to view or copy:
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                <button
                  onClick={() => setSqlDialect("mysql")}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    sqlDialect === "mysql" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  MySQL 8.4 (App)
                </button>
                <button
                  onClick={() => setSqlDialect("tsql")}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    sqlDialect === "tsql" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  T-SQL (Lecture Format)
                </button>
              </div>
              <button
                onClick={copySqlToClipboard}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold transition"
              >
                {copied ? "Copied" : "Copy Script"}
              </button>
            </div>
          </div>

          <div className="bg-gray-950 text-gray-200 rounded-xl p-5 font-mono text-xs overflow-x-auto max-h-[600px] border border-gray-800 leading-relaxed">
            <pre>{sqlDialect === "mysql" ? mysqlSql : tsqlSql}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
