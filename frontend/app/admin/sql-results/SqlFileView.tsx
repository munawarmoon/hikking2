"use client";
import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
type Row = Record<string, string | number | null>;
type Field = { name: string; label: string; def?: string };
export type Panel = {
  label: string;
  note: string;
  reads: { key: string; title: string }[];
  run?: { key: string; label: string; fields: Field[] };
};

function Table({ rows }: { rows: Row[] }) {
  const cols = rows.length ? Object.keys(rows[0]) : [];
  if (!rows.length) return <p className="px-6 py-4 text-sm text-gray-400">No results.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
            {cols.map((c) => <th key={c} className="px-4 py-2 whitespace-nowrap">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100">
              {cols.map((c) => (
                <td key={c} className="px-4 py-2 text-gray-600 whitespace-nowrap">
                  {r[c] === null ? "—" : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PanelView({ panel }: { panel: Panel }) {
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [out, setOut] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [vals, setVals] = useState<Record<string, string>>(
    Object.fromEntries((panel.run?.fields ?? []).map((f) => [f.name, f.def ?? ""]))
  );

  const load = useCallback(async () => {
    try {
      const res = await Promise.all(
        panel.reads.map((r) => fetch(`${API_URL}/query-results/sql/read/${r.key}`).then((x) => { if (!x.ok) throw new Error("Server error " + x.status + " (" + r.key + ")"); return x.json(); }))
      );
      setData(Object.fromEntries(panel.reads.map((r, i) => [r.key, res[i].data ?? []])));
      setErr(null);
    } catch (e) { setErr(String(e)); }
  }, [panel]);

  useEffect(() => { load(); }, [load]);

  async function run() {
    if (!panel.run) return;
    const res = await fetch(`${API_URL}/query-results/sql/run/${panel.run.key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(vals),
    });
    const json = await res.json().catch(() => ({ message: "Invalid server response" }));
    setOut(json.data ?? [{ error: json.message ?? `Failed (${res.status})` }]);
    load();
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400">{panel.note}</p>
      {panel.run && (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {panel.run.fields.map((f) => (
              <label key={f.name} className="text-xs text-gray-500">
                {f.label}
                <input
                  value={vals[f.name]}
                  onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })}
                  className="block mt-1 border border-gray-200 rounded-md px-2 py-1 text-sm w-36 text-gray-800"
                />
              </label>
            ))}
            <button onClick={run} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-900 text-white">
              {panel.run.label}
            </button>
          </div>
          {out && (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Output</p>
              <Table rows={out} />
            </div>
          )}
        </div>
      )}
      {err && <p className="text-sm text-red-500">{err}</p>}
      {panel.reads.map((r) => (
        <div key={r.key} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <p className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50">{r.title}</p>
          <Table rows={data[r.key] ?? []} />
        </div>
      ))}
    </div>
  );
}

export default function SqlFileView({ panels }: { panels: Panel[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="flex gap-2 mb-6">
        {panels.map((p, k) => (
          <button key={p.label} onClick={() => setI(k)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide ${
              i === k ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <PanelView key={i} panel={panels[i]} />
    </div>
  );
}