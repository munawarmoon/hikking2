"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type QueryType = "join" | "aggregate" | "subquery";

const QUERY_TYPES: { key: QueryType; label: string; description: string }[] = [
  { key: "join", label: "Join", description: "All related tables combined" },
  {
    key: "aggregate",
    label: "Aggregate",
    description: "COUNT, SUM, AVG, MIN, MAX per group",
  },
  {
    key: "subquery",
    label: "Subquery",
    description: "Rows filtered by a nested query",
  },
];

type Row = Record<string, string | number | null>;

type ApiResponse = {
  success: boolean;
  operation: string;
  title: string;
  data: Row[];
};

export default function QueryResultView({
  endpoint,
}: {
  /** URL segment under /api/query-results/, e.g. "guides", "packages", "bookings" */
  endpoint: "guides" | "packages" | "bookings";
}) {
  const [queryType, setQueryType] = useState<QueryType>("join");
  const [rows, setRows] = useState<Row[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/query-results/${endpoint}/${queryType}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then((json) => {
        if (cancelled) return;
        setRows(json.data ?? []);
        setTitle(json.title ?? "");
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, queryType]);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div>
      {/* Query type tabs */}
      <div className="flex gap-2 mb-6">
        {QUERY_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setQueryType(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors ${
              queryType === t.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-4">
        {QUERY_TYPES.find((t) => t.key === queryType)?.description}
        {title ? ` — ${title}` : ""}
      </p>

      {/* Results table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {columns.map((col) => (
                <th key={col} className="px-6 py-3 whitespace-nowrap">
                  {col}
                </th>
              ))}
              {columns.length === 0 && <th className="px-6 py-3">Result</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-6 py-8 text-center text-red-500"
                >
                  {error}. Check that the Laravel server is running and
                  NEXT_PUBLIC_API_URL is set correctly.
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-6 py-8 text-center text-gray-400"
                >
                  No results.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="px-6 py-3 text-gray-600 whitespace-nowrap"
                    >
                      {row[col] === null ? "—" : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
