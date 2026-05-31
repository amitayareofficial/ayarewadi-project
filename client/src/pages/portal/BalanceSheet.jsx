import { useState, useEffect } from "react";
import axios from "axios";
import PulsatingLoader from "@/components/ui/pulsating-loader";

const API = "https://ayarewadi-project.onrender.com";

const fmt = n => "₹ " + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export default function BalanceSheet({ onBack }) {
  const [years,  setYears]  = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/budget-years`)
      .then(r => {
        setYears(r.data);
        if (r.data.length > 0) setActive(r.data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const yr = years.find(y => y.id === active);

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>💰 Village Balance Sheet</h2>
        <div style={s.titleSub}>गाव अर्थसंकल्प · Ayarewadi</div>
      </div>

      {loading ? (
        <PulsatingLoader message="Loading balance sheet…" />
      ) : years.length === 0 ? (
        <div style={s.emptyBox}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>No financial data yet</div>
          <div style={{ fontSize: "0.8rem", color: "#aaa" }}>Admin will add village finances soon.</div>
        </div>
      ) : (
        <>
          {/* Year tabs */}
          <div style={s.yearTabs}>
            {years.map(y => (
              <button key={y.id}
                style={{ ...s.yearTab, ...(active === y.id ? s.yearTabActive : {}) }}
                onClick={() => setActive(y.id)}>
                {y.year}
              </button>
            ))}
          </div>

          {yr && (
            <>
              {/* Summary cards */}
              <div style={s.summaryGrid}>
                <SummaryCard
                  label="Opening Balance"
                  sublabel="सुरुवातीची शिल्लक"
                  value={fmt(yr.opening_balance)}
                  color="#1565c0"
                  bg="#e3f2fd"
                  icon="🏦"
                />
                <SummaryCard
                  label="Total Income"
                  sublabel="एकूण उत्पन्न"
                  value={fmt(yr.income)}
                  color="#2e7d32"
                  bg="#e8f5e9"
                  icon="📈"
                />
                <SummaryCard
                  label="Total Expenses"
                  sublabel="एकूण खर्च"
                  value={fmt(yr.expense)}
                  color="#c62828"
                  bg="#fdecea"
                  icon="📉"
                />
                <SummaryCard
                  label="Closing Balance"
                  sublabel="अंतिम शिल्लक"
                  value={fmt(yr.closing_balance)}
                  color="#e65100"
                  bg="#fff3e0"
                  icon="💼"
                />
              </div>

              {yr.notes && (
                <div style={s.notesBox}>
                  📝 {yr.notes}
                </div>
              )}

              {/* Income entries */}
              {yr.entries?.filter(e => e.type === "income").length > 0 && (
                <div style={s.section}>
                  <div style={{ ...s.sectionHeader, color: "#2e7d32", borderColor: "#c8e6c9", background: "#f1f8e9" }}>
                    📈 Income · उत्पन्न
                  </div>
                  {yr.entries.filter(e => e.type === "income").map(e => (
                    <EntryRow key={e.id} entry={e} type="income" />
                  ))}
                  <div style={{ ...s.totalRow, color: "#2e7d32" }}>
                    Total Income: <strong>{fmt(yr.income)}</strong>
                  </div>
                </div>
              )}

              {/* Expense entries */}
              {yr.entries?.filter(e => e.type === "expense").length > 0 && (
                <div style={s.section}>
                  <div style={{ ...s.sectionHeader, color: "#c62828", borderColor: "#ffcdd2", background: "#fdecea" }}>
                    📉 Expenses · खर्च
                  </div>
                  {yr.entries.filter(e => e.type === "expense").map(e => (
                    <EntryRow key={e.id} entry={e} type="expense" />
                  ))}
                  <div style={{ ...s.totalRow, color: "#c62828" }}>
                    Total Expenses: <strong>{fmt(yr.expense)}</strong>
                  </div>
                </div>
              )}

              {yr.entries?.length === 0 && (
                <div style={s.emptyBox}>
                  No entries for {yr.year} yet.
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, sublabel, value, color, bg, icon }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "0.85rem", flex: "1 1 calc(50% - 6px)", minWidth: 130 }}>
      <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: "0.95rem", color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: "0.73rem", fontWeight: 700, color }}>{label}</div>
      <div style={{ fontSize: "0.67rem", color: "#888" }}>{sublabel}</div>
    </div>
  );
}

function EntryRow({ entry, type }) {
  const color = type === "income" ? "#2e7d32" : "#c62828";
  const sign  = type === "income" ? "+" : "-";
  return (
    <div style={s.entryRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#222" }}>{entry.description}</div>
        <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 2 }}>
          {entry.category && <span>{entry.category} · </span>}
          {entry.date ? new Date(entry.date).toLocaleDateString("en-IN") : ""}
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: "0.9rem", color, flexShrink: 0 }}>
        {sign} ₹{Number(entry.amount).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

const s = {
  wrap:    { maxWidth: 560, margin: "0 auto", padding: "72px 1rem 3rem", display: "flex", flexDirection: "column", gap: "1rem" },
  header:  { marginBottom: "0.25rem" },
  backBtn: { background: "none", border: "none", color: "#2e7d32", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", padding: "0 0 6px 0" },
  title:   { fontSize: "1.2rem", fontWeight: 800, color: "#1b5e20", margin: "4px 0 2px" },
  titleSub:{ fontSize: "0.78rem", color: "#888" },
  yearTabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  yearTab: {
    background: "#f5f5f5", border: "1.5px solid #e0e0e0",
    borderRadius: 8, padding: "7px 16px",
    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", color: "#555",
  },
  yearTabActive: { background: "#e65100", border: "1.5px solid #e65100", color: "#fff" },
  summaryGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  notesBox: { background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", fontSize: "0.8rem", color: "#795548" },
  section: { background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
  sectionHeader: { padding: "10px 14px", fontWeight: 800, fontSize: "0.85rem", borderBottom: "1px solid" },
  entryRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #f5f5f5" },
  totalRow: { padding: "10px 14px", fontSize: "0.82rem", textAlign: "right" },
  emptyBox: { textAlign: "center", padding: "2.5rem 0", color: "#bbb" },
};
