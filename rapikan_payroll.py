from pathlib import Path
import re

p = Path("assets/css/style.css")
s = p.read_text()

pattern = r'/\* PAYROLL \*/.*?(?=/\* PAYROLL \*/|$)'
matches = list(re.finditer(pattern, s, re.S))

if len(matches) != 2:
    print("STOP: Ditemukan", len(matches), "blok Payroll. File tidak diubah.")
    raise SystemExit

new = r'''
/* PAYROLL - KONVEKSIBOS STYLE */
.payroll-panel {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.payroll-week {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 12px;
}

.payroll-week input {
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--white);
  color: inherit;
}

.payroll-total,
.payroll-worker-total {
  display: grid;
  gap: 6px;
  padding: 16px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 13px;
  box-shadow: var(--shadow);
}

.payroll-total small,
.payroll-worker-total small {
  color: var(--muted);
  font-size: 11px;
}

.payroll-total strong,
.payroll-worker-total strong {
  color: var(--blue);
  font-size: 23px;
  font-weight: 750;
}

.payroll-total span {
  color: var(--muted);
  font-size: 11px;
}

.payroll-worker-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 3px 2px 10px;
}

.payroll-worker-tab {
  flex: 0 0 auto;
  padding: 9px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--white);
  color: inherit;
  font-size: 12px;
  font-weight: 700;
}

.payroll-worker-tab.active {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
}

.payroll-worker-detail {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.payroll-worker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.payroll-worker-head h3 {
  margin: 0 0 4px;
  font-size: 14px;
}

.payroll-worker-head p {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
}

.payroll-paid-label {
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: 6px;
  background: rgba(245,158,11,.12);
  color: #d97706;
  font-size: 10px;
  font-weight: 700;
}

.payroll-paid-label.is-paid {
  background: rgba(34,197,94,.12);
  color: #16a34a;
}

.payroll-table {
  width: 100%;
  min-width: 620px;
}

.payroll-table th,
.payroll-table td {
  padding: 11px 10px;
  font-size: 11px;
  white-space: normal;
  vertical-align: top;
}

.payroll-table small {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
}

.payroll-table .payroll-shortage {
  color: #d97706;
}

.payroll-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.payroll-actions button {
  flex: 1 1 140px;
  min-height: 40px;
}

.payroll-close-book,
.payroll-archives {
  display: grid;
  gap: 11px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.payroll-close-book h3,
.payroll-archives h3 {
  margin: 0;
  font-size: 14px;
}

.payroll-close-book p,
.payroll-archives p {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
}

.payroll-close-book button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.payroll-archive-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 10px;
}

.payroll-archive-card div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.payroll-archive-card strong {
  font-size: 12px;
}

.payroll-archive-card span,
.payroll-archive-card small {
  color: var(--muted);
  font-size: 10px;
}

.payroll-archive-card button {
  flex: 0 0 auto;
  font-size: 11px;
}

@media (max-width: 600px) {
  .payroll-panel { gap: 14px; }
  .payroll-total strong,
  .payroll-worker-total strong { font-size: 21px; }
  .payroll-worker-head { align-items: flex-start; }
  .payroll-archive-card { align-items: flex-start; }
  .payroll-archive-card button { padding: 8px; }
}
'''

first = matches[0].start()
last = matches[-1].end()
s = s[:first] + new + s[last:]
p.write_text(s)
print("CSS Payroll berhasil dirapikan.")
