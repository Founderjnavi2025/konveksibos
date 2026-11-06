from pathlib import Path

p = Path("assets/js/app.js")
s = p.read_text()

if "function renderPayroll()" in s:
    print("STOP: Payroll sudah terpasang. Tidak ada perubahan.")
    raise SystemExit

route = """  } else if (page === 'Monitor') {
    renderMonitor();
  } else {"""

replacement = """  } else if (page === 'Monitor') {
    renderMonitor();
  } else if (page === 'Payroll') {
    renderPayroll();
  } else {"""

if route not in s:
    print("STOP: Jalur navigasi tidak cocok. File tidak diubah.")
    raise SystemExit

marker = "\nrenderDashboard();"
if marker not in s:
    print("STOP: Posisi akhir file tidak ditemukan. File tidak diubah.")
    raise SystemExit

payroll = r'''
// ================= PAYROLL =================

let payrollSelectedWorkerId = null;
let payrollWeekDate = payrollToday();

function payrollToday() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function payrollDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function payrollISO(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function payrollPeriod(value) {
  const d = new Date(value + 'T12:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const start = new Date(d);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return {
    key: payrollISO(start),
    start: payrollISO(start),
    end: payrollISO(end)
  };
}

function payrollMoney(value) {
  return 'Rp ' + Math.round(Number(value) || 0).toLocaleString('id-ID');
}

function payrollEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  }[c]));
}

function payrollRows(workerId, period) {
  const rows = [];

  jobs.filter(j => String(j.workerId) === String(workerId))
    .forEach(job => {
      const reports = Array.isArray(job.workReports) ? job.workReports : [];
      const reported = reports.reduce((sum, r) =>
        sum + (Number(r.quantity) || 0), 0);

      reports.forEach(report => {
        const d = payrollDate(report.date);
        if (!d) return;
        const date = payrollISO(d);
        if (date < period.start || date > period.end) return;

        const qty = Number(report.quantity) || 0;
        const rate = Number(job.rate) || 0;
        const pay = job.unit === 'lusin'
          ? qty / 12 * rate
          : qty * rate;

        rows.push({
          date,
          product: job.product || '-',
          type: job.type || '-',
          quantity: qty,
          unit: job.unit || 'pcs',
          note: report.note || 'Laporan pekerjaan',
          shortage: Number(report.shortageQuantity) || 0,
          pay
        });
      });

      const outstanding = Math.max(0,
        Number(job.quantity || 0) - reported);
      const created = payrollDate(job.createdAt);

      if (outstanding > 0 && created) {
        const date = payrollISO(created);
        if (date >= period.start && date <= period.end) {
          rows.push({
            date,
            product: job.product || '-',
            type: job.type || '-',
            quantity: outstanding,
            unit: job.unit || 'pcs',
            note: 'Barang masih dipegang / belum dilaporkan',
            shortage: 0,
            pay: 0
          });
        }
      }
    });

  return rows.sort((a, b) =>
    a.date.localeCompare(b.date));
}

function payrollPaidData() {
  try {
    return JSON.parse(localStorage.getItem('kb_payroll_paid') || '{}');
  } catch (_) { return {}; }
}

function payrollArchives() {
  try {
    return JSON.parse(localStorage.getItem('kb_payroll_archives') || '[]');
  } catch (_) { return []; }
}

function payrollIsArchived(key) {
  return payrollArchives().some(a => a.periodKey === key);
}

function payrollSetPaid(workerId, key) {
  const data = payrollPaidData();
  if (!data[key]) data[key] = {};
  data[key][workerId] = true;
  localStorage.setItem('kb_payroll_paid', JSON.stringify(data));
  renderPayroll();
}

function payrollSelectWorker(id) {
  payrollSelectedWorkerId = id;
  renderPayroll();
}

function payrollChangeWeek(value) {
  if (!value) return;
  payrollWeekDate = value;
  payrollSelectedWorkerId = null;
  renderPayroll();
}

function renderPayroll() {
  mainAction.style.display = 'none';

  const period = payrollPeriod(payrollWeekDate);
  const archived = payrollIsArchived(period.key);
  const paidData = payrollPaidData();
  const allWorkers = Array.isArray(workers) ? workers : [];

  if (!payrollSelectedWorkerId ||
      !allWorkers.some(w => String(w.id) === String(payrollSelectedWorkerId))) {
    payrollSelectedWorkerId = allWorkers[0]?.id ?? null;
  }

  const summaries = allWorkers.map(worker => {
    const rows = payrollRows(worker.id, period);
    const total = rows.reduce((sum, r) => sum + r.pay, 0);
    return {
      worker,
      rows,
      total,
      paid: !!paidData[period.key]?.[worker.id]
    };
  });

  const totalAll = summaries.reduce((sum, x) => sum + x.total, 0);
  const payable = summaries.filter(x => x.total > 0);
  const allPaid = payable.length > 0 && payable.every(x => x.paid);
  const selected = summaries.find(x =>
    String(x.worker.id) === String(payrollSelectedWorkerId));

  const dateLabel = d => new Date(d + 'T12:00:00')
    .toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

  content.innerHTML = `
    <section class="panel payroll-panel">
      <div class="payroll-week">
        <label for="payrollWeek">Pilih tanggal dalam minggu kerja</label>
        <input id="payrollWeek" type="date"
          value="${payrollEscape(payrollWeekDate)}"
          onchange="payrollChangeWeek(this.value)">
        <small>Periode: ${dateLabel(period.start)} – ${dateLabel(period.end)}</small>
      </div>

      <div class="payroll-total">
        <small>Total upah seluruh pekerja</small>
        <strong>${payrollMoney(totalAll)}</strong>
        <span>${payable.length} pekerja memiliki upah pada periode ini</span>
      </div>

      <h3>Daftar pekerja</h3>
      <div class="payroll-worker-tabs">
        ${summaries.map(x => `
          <button class="payroll-worker-tab ${String(x.worker.id) === String(payrollSelectedWorkerId) ? 'active' : ''}"
            onclick="payrollSelectWorker('${payrollEscape(x.worker.id)}')">
            ${payrollEscape(x.worker.name || 'Tanpa nama')}
          </button>
        `).join('') || '<p>Belum ada pekerja.</p>'}
      </div>

      ${selected ? `
        <div class="payroll-worker-detail">
          <div class="payroll-worker-head">
            <div>
              <h3>${payrollEscape(selected.worker.name || 'Pekerja')}</h3>
              <p>${payrollEscape(selected.worker.role || selected.worker.position || 'Pekerja')}</p>
            </div>
            <span class="payroll-paid-label ${selected.paid ? 'is-paid' : ''}">
              ${selected.paid ? 'Sudah gajian' : 'Belum gajian'}
            </span>
          </div>

          <div class="payroll-worker-total">
            <small>Total upah pekerja</small>
            <strong>${payrollMoney(selected.total)}</strong>
            <small>${selected.rows.length} catatan aktivitas dalam minggu ini</small>
          </div>

          <div class="table-wrap">
            <table class="data-table payroll-table">
              <thead><tr>
                <th>Tanggal</th><th>Pekerjaan</th><th>Jumlah</th><th>Keterangan</th><th>Upah</th>
              </tr></thead>
              <tbody>
                ${selected.rows.map(r => `
                  <tr>
                    <td>${dateLabel(r.date)}</td>
                    <td>${payrollEscape(r.product)}<small>${payrollEscape(r.type)}</small></td>
                    <td>${r.quantity} ${payrollEscape(r.unit)}</td>
                    <td>${payrollEscape(r.note)}
                      ${r.shortage ? `<small class="payroll-shortage">Kekurangan: ${r.shortage}</small>` : ''}
                    </td>
                    <td>${payrollMoney(r.pay)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="5">Belum ada aktivitas pada minggu ini.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="payroll-actions">
            <button class="btn btn-primary"
              onclick="printPayrollSlip('${payrollEscape(selected.worker.id)}','${period.key}')">
              Cetak Slip Gaji
            </button>
            ${selected.total > 0 && !selected.paid && !archived ? `
              <button class="btn btn-secondary"
                onclick="payrollSetPaid('${payrollEscape(selected.worker.id)}','${period.key}')">
                Tandai Sudah Gajian
              </button>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <div class="payroll-close-book">
        <h3>Tutup Buku Mingguan</h3>
        <p>${archived ? 'Periode ini sudah diarsipkan.' :
          allPaid ? 'Semua pekerja yang memiliki upah sudah ditandai lunas.' :
          'Tandai semua pekerja yang memiliki upah sebagai sudah gajian untuk mengaktifkan Tutup Buku.'}</p>
        <button class="btn btn-primary" ${(!allPaid || archived) ? 'disabled' : ''}
          onclick="closePayrollBook('${period.key}')">
          Tutup Buku
        </button>
      </div>

      <div class="payroll-archives">
        <h3>Arsip Tutup Buku</h3>
        ${payrollArchives().slice().reverse().map(a => `
          <div class="payroll-archive-card">
            <div>
              <strong>Tutup Buku ${dateLabel(payrollISO(new Date(a.closedAt)))}</strong>
              <span>Periode ${dateLabel(a.periodKey)} – ${dateLabel(a.periodEnd)}</span>
              <small>Total: ${payrollMoney(a.total)}</small>
            </div>
            <button class="btn btn-secondary"
              onclick="printPayrollArchive('${payrollEscape(a.id)}')">Cetak Arsip</button>
          </div>
        `).join('') || '<p>Belum ada arsip.</p>'}
      </div>
    </section>
  `;
}

function payrollPrintPage(title, body) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Browser memblokir jendela cetak. Izinkan pop-up lalu coba lagi.');
    return;
  }
  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
    <title>${payrollEscape(title)}</title>
    <style>
      body{font:14px Arial,sans-serif;padding:28px;color:#111}
      h2{margin-bottom:4px}p{color:#555}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #bbb;padding:9px;text-align:left}
      th{background:#eee}.total{font-size:20px;font-weight:bold;margin-top:20px}
      @media print{button{display:none}}
    </style></head><body>${body}
    <button onclick="window.print()">Cetak</button></body></html>`);
  win.document.close();
}

function printPayrollSlip(workerId, periodKey) {
  const period = payrollPeriod(periodKey);
  const worker = workers.find(w => String(w.id) === String(workerId));
  if (!worker) return;
  const rows = payrollRows(workerId, period);
  const total = rows.reduce((sum, r) => sum + r.pay, 0);
  const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('id-ID');
  payrollPrintPage('Slip Gaji', `
    <h2>SLIP GAJI PEKERJA</h2>
    <p>${payrollEscape(worker.name || '')}</p>
    <p>Periode ${fmt(period.start)} – ${fmt(period.end)}</p>
    <table><thead><tr><th>Tanggal</th><th>Produk</th><th>Jenis</th><th>Jumlah</th><th>Keterangan</th><th>Upah</th></tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td>${fmt(r.date)}</td><td>${payrollEscape(r.product)}</td>
      <td>${payrollEscape(r.type)}</td><td>${r.quantity} ${payrollEscape(r.unit)}</td>
      <td>${payrollEscape(r.note)}</td><td>${payrollMoney(r.pay)}</td>
    </tr>`).join('')}</tbody></table>
    <div class="total">Total: ${payrollMoney(total)}</div>
  `);
}

function closePayrollBook(periodKey) {
  const period = payrollPeriod(periodKey);
  if (payrollIsArchived(periodKey)) return;

  const paid = payrollPaidData()[periodKey] || {};
  const summaries = workers.map(worker => {
    const rows = payrollRows(worker.id, period);
    return {
      workerId: worker.id,
      name: worker.name || 'Tanpa nama',
      role: worker.role || worker.position || '',
      rows,
      total: rows.reduce((sum, r) => sum + r.pay, 0),
      paid: !!paid[worker.id]
    };
  }).filter(x => x.total > 0);

  if (!summaries.length || summaries.some(x => !x.paid)) {
    alert('Masih ada pekerja yang belum ditandai sudah gajian.');
    return;
  }

  if (!confirm('Tutup buku periode ' + period.start + ' sampai ' + period.end + '?')) return;

  const archives = payrollArchives();
  archives.push({
    id: crypto.randomUUID(),
    periodKey,
    periodEnd: period.end,
    closedAt: new Date().toISOString(),
    workers: summaries,
    total: summaries.reduce((sum, x) => sum + x.total, 0)
  });
  localStorage.setItem('kb_payroll_archives', JSON.stringify(archives));

  const next = new Date(period.end + 'T12:00:00');
  next.setDate(next.getDate() + 1);
  payrollWeekDate = payrollISO(next);
  payrollSelectedWorkerId = null;
  renderPayroll();
}

function printPayrollArchive(archiveId) {
  const archive = payrollArchives().find(a => a.id === archiveId);
  if (!archive) return;
  const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('id-ID');
  payrollPrintPage('Arsip Tutup Buku', `
    <h2>ARSIP TUTUP BUKU</h2>
    <p>Periode ${fmt(archive.periodKey)} – ${fmt(archive.periodEnd)}</p>
    <p>Tanggal tutup buku: ${new Date(archive.closedAt).toLocaleString('id-ID')}</p>
    <table><thead><tr><th>Nama pekerja</th><th>Total upah</th><th>Status</th></tr></thead>
    <tbody>${archive.workers.map(w => `<tr>
      <td>${payrollEscape(w.name)}</td><td>${payrollMoney(w.total)}</td>
      <td>${w.paid ? 'Sudah gajian' : 'Belum gajian'}</td>
    </tr>`).join('')}</tbody></table>
    <div class="total">Total seluruh upah: ${payrollMoney(archive.total)}</div>
  `);
}

// =============== END PAYROLL ===============
'''

s = s.replace(route, replacement, 1)
s = s.replace(marker, "\n" + payroll + marker, 1)
p.write_text(s)
print("Payroll berhasil dipasang.")
