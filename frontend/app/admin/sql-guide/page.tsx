"use client";
import SqlFileView, { Panel } from "../sql-results/SqlFileView";

const panels: Panel[] = [
  {
    label: "View",
    note: "vw_GuideVerificationSummary",
    reads: [{ key: "guide_view", title: "vw_GuideVerificationSummary" }],
  },
  {
    label: "Procedure",
    note: "sp_VerifyGuide(guide_profile_id)",
    reads: [],
    run: {
      key: "verify_guide",
      label: "Call",
      fields: [
        { name: "guide_profile_id", label: "Guide Profile ID", def: "3" },
      ],
    },
  },
  {
    label: "Trigger",
    note: "trg_guide_verified_notify: verified হলে notification",
    reads: [{ key: "guide_notifications", title: "Latest notifications" }],
    run: {
      key: "add_doc",
      label: "Add approved doc",
      fields: [
        { name: "guide_profile_id", label: "Guide Profile ID", def: "3" },
      ],
    },
  },
  {
    label: "Transaction",
    note: "sp_ResolveComplaint(id, status)",
    reads: [{ key: "guide_complaints", title: "Complaints" }],
    run: {
      key: "resolve_complaint",
      label: "Run",
      fields: [
        { name: "complaint_id", label: "Complaint ID", def: "1" },
        { name: "status", label: "Status", def: "resolved" },
      ],
    },
  },
];

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Guide SQL Results</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        mysql_3_guide_management.sql — View, Procedure, Trigger, Transaction
      </p>
      <SqlFileView panels={panels} />
    </div>
  );
}
