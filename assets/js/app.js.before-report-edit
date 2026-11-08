const content = document.querySelector('.content');
const dashboardHTML = content.innerHTML;

const pageTitle = document.getElementById('pageTitle');
const breadcrumb = document.getElementById('breadcrumb');
const description = document.getElementById('pageDescription');
const mainAction = document.getElementById('mainAction');
let currentPage = 'Dashboard';

const descriptions = {
  Kekurangan: 'Daftar barang yang masih kurang dari pekerjaan.',
  Dashboard: 'Pantau aktivitas dan kondisi konveksi dalam satu tempat.',
  Pekerja: 'Kelola data dan daftar pekerja konveksi.',
  Pekerjaan: 'Catat dan kelola seluruh pekerjaan produksi.',
  Monitor: 'Pantau barang keluar, proses, dan barang masuk.',
  Payroll: 'Kelola perhitungan upah dan pembayaran pekerja.',
  Keuangan: 'Pantau pemasukan dan pengeluaran bisnis.',
  Laporan: 'Lihat ringkasan dan riwayat aktivitas bisnis.',
  Kalkulator: 'Hitung konversi PCS, lusin, dan total harga.'
};

let workers = JSON.parse(localStorage.getItem('kb_workers') || '[]');
let editingId = null;
let currentJobTab = 'Aktif';

function saveWorkers() {
  localStorage.setItem('kb_workers', JSON.stringify(workers));

  if (window.KBCloud?.saveWorkers) {
    window.KBCloud.saveWorkers();
  }
}

function setActiveMenu(page) {
  document.querySelectorAll('[data-page]').forEach(button => {
    button.classList.toggle('active', button.dataset.page === page);
  });

  const morePages = ['Kekurangan', 'Payroll', 'Keuangan', 'Laporan', 'Kalkulator'];
  document.getElementById('moreMenuToggle')
    ?.classList.toggle('active', morePages.includes(page));
}

function navigate(page) {
  currentPage = page;
  setActiveMenu(page);

  pageTitle.textContent = page;
  breadcrumb.textContent = page;
  description.textContent = descriptions[page] || '';

  if (page === 'Dashboard') {
    content.innerHTML = dashboardHTML;
    mainAction.style.display = '';
    mainAction.textContent = '+ Catat pekerjaan';
    renderDashboard();
  } else if (page === 'Pekerja') {
    renderWorkers();
  } else if (page === 'Pekerjaan') {
    renderJobs();
  } else if (page === 'Monitor') {
    renderMonitor();
  } else if (page === 'Payroll') {
    renderPayroll();
  } else if (page === 'Keuangan') {
    renderKeuangan();
  } else if (page === 'Laporan') {
    renderLaporan();
  } else if (page === 'Kekurangan') {
    renderKekurangan();
  } else if (page === 'Kalkulator') {
    renderKalkulator();
  } else {
    content.innerHTML = `
      <section class="panel">
        <h2>${page}</h2>
        <p>Modul ini akan dibangun pada tahap berikutnya.</p>
      </section>
    `;
    mainAction.style.display = 'none';
  }
}





function renderKalkulator() {
  mainAction.style.display = 'none';

  content.innerHTML = `
    <section class="calc-layout">
      <div class="calc-intro">
        <span class="calc-eyebrow">TOOLS PRODUKSI</span>
        <h2>Kalkulator Lusin</h2>
        <p>Konversi jumlah barang dan hitung nilai pekerjaan dengan cepat.</p>
      </div>

      <div class="calc-panel">
        <div class="calc-section-title">
          <div>
            <span class="calc-number">01</span>
            <h3>Jumlah Barang</h3>
          </div>
          <span class="calc-hint">Konversi otomatis</span>
        </div>

        <div class="calc-fields">
          <label class="calc-field">
            <span>Jumlah PCS</span>
            <div class="calc-input-wrap">
              <input class="calc-input" data-calc-field="pcs"
                type="text" inputmode="decimal" placeholder="Contoh: 151">
              <b>PCS</b>
            </div>
          </label>

          <div class="calc-convert-icon">⇄</div>

          <label class="calc-field">
            <span>Jumlah Lusin</span>
            <div class="calc-input-wrap">
              <input class="calc-input" data-calc-field="dozen"
                type="text" inputmode="decimal" placeholder="Contoh: 12,7">
              <b>LUSIN</b>
            </div>
          </label>
        </div>

        <p class="calc-note">Format lusin,sisa PCS. Contoh: 12,7 = 12 lusin + 7 PCS.</p>
      </div>

      <div class="calc-panel">
        <div class="calc-section-title">
          <div>
            <span class="calc-number">02</span>
            <h3>Perhitungan Harga</h3>
          </div>
        </div>

        <label class="calc-field calc-price-field">
          <span>Harga per Lusin (Rp)</span>
          <div class="calc-input-wrap">
            <b>Rp</b>
            <input class="calc-input" data-calc-field="price"
              type="text" inputmode="decimal" placeholder="Contoh: 8.000">
          </div>
        </label>

        <div class="calc-result">
          <span>ESTIMASI TOTAL HARGA</span>
          <strong id="calcTotal">Rp0</strong>
          <small id="calcBreakdown">0 lusin × Rp0</small>
        </div>

        <button type="button" class="calc-reset"
          onclick="resetKalkulator()">Reset Kalkulator</button>
      </div>

      <div class="calc-disclaimer">
        <span>ⓘ</span>
        Kalkulator mandiri. Hasil perhitungan tidak otomatis masuk ke Payroll atau transaksi keuangan.
      </div>
    </section>
  `;
}

function parseCalcPcs(value) {
  const number = parseInt(String(value || '').trim(), 10);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function parseCalcDozen(value) {
  const match = String(value || '').trim().match(/^(\d+)(?:,(\d*))?$/);
  if (!match) return 0;

  const dozen = Number(match[1]);
  const remainder = Number(match[2] || 0);

  return (dozen * 12) + remainder;
}

function formatCalcDozen(pcs) {
  const dozen = Math.floor(pcs / 12);
  const remainder = pcs % 12;

  return remainder ? `${dozen},${remainder}` : String(dozen);
}

function parseCalcPrice(value) {
  const digits = String(value || '').replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

function updateKalkulator(source) {
  const pcsInput = content.querySelector('[data-calc-field="pcs"]');
  const dozenInput = content.querySelector('[data-calc-field="dozen"]');
  const priceInput = content.querySelector('[data-calc-field="price"]');

  if (!pcsInput || !dozenInput || !priceInput) return;

  if (source === 'pcs') {
    const value = pcsInput.value.trim();
    dozenInput.value = value
      ? formatCalcDozen(parseCalcPcs(value))
      : '';
  }

  if (source === 'dozen') {
    const value = dozenInput.value.trim();
    pcsInput.value = value
      ? String(parseCalcDozen(value))
      : '';
  }

  const pcs = parseCalcPcs(pcsInput.value);
  const dozen = pcs / 12;
  const price = parseCalcPrice(priceInput.value);
  const total = dozen * price;

  const totalElement = document.getElementById('calcTotal');
  const breakdown = document.getElementById('calcBreakdown');

  if (totalElement) {
    totalElement.textContent = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(total);
  }

  if (breakdown) {
    breakdown.textContent =
      `${pcs} PCS ÷ 12 × Rp${price.toLocaleString('id-ID')}`;
  }
}

function resetKalkulator() {
  content.querySelectorAll('[data-calc-field]').forEach(input => {
    input.value = '';
  });
  updateKalkulator();
}

content.addEventListener('input', event => {
  const field = event.target.dataset.calcField;
  if (!field) return;
  updateKalkulator(field);
});


function renderMonitor() {
  mainAction.style.display = 'none';

  const stages = [
    { key: 'monitor', title: 'Barang Sudah Diobras', next: 'kam', button: 'Pindah ke Kam' },
    { key: 'kam', title: 'Barang di Kam', next: 'jahit', button: 'Pindah ke Jahit' },
    { key: 'jahit', title: 'Barang di Jahit', next: 'gosok', button: 'Pindah ke Gosok' },
    { key: 'gosok', title: 'Barang di Gosok', next: 'packaging', button: 'Pindah ke Packaging' },
    { key: 'packaging', title: 'Barang di Packaging', next: 'siap_kirim', button: 'Pindah ke Siap Kirim' },
    { key: 'siap_kirim', title: 'Barang Siap Kirim', next: 'dikirim', button: 'Tandai Sudah Dikirim' },
    { key: 'dikirim', title: 'Sudah Dikirim', next: null, button: null }
  ];

  const completedJobs = jobs.filter(job => {
    const done = Array.isArray(job.workReports) &&
      job.workReports.some(report => report.note === 'Selesai');

    return done ||
      Number(job.returned || 0) >= Number(job.quantity || 0);
  });

  const currentStage = window.monitorCurrentStage || 'monitor';
  const selected = stages.find(stage => stage.key === currentStage) || stages[0];

  const stageJobs = completedJobs.filter(job =>
    (job.monitorStage || 'monitor') === selected.key
  );

  const total = stageJobs.reduce(
    (sum, job) => sum + Number(job.quantity || 0), 0
  );

  const formatDate = job => {
    const value = job.monitorDates?.[selected.key] ||
      (selected.key === 'monitor'
        ? job.depositHistory?.at(-1)?.date ||
          job.workReports?.at(-1)?.date
        : null);

    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '-' : date.toLocaleDateString('id-ID');
  };

  content.innerHTML = `
    <section class="monitor-redesign">
      <article class="monitor-summary">
        <span class="monitor-kicker">KONVEKSIBOS / MONITOR PRODUKSI</span>
        <h2>${escapeHTML(selected.title)}</h2>
        <strong class="monitor-total">
          ${total.toLocaleString('id-ID')}
          <small>PCS</small>
        </strong>
        <p>Total keseluruhan barang</p>
        <button type="button" class="monitor-process-btn"
          id="monitorProcessBtn">
          PROSES <span>→</span>
        </button>
      </article>

      <div class="monitor-stage-switch">
        ${stages.map(stage => {
          const count = completedJobs.filter(job =>
            (job.monitorStage || 'monitor') === stage.key
          ).length;

          return `
            <button type="button"
              class="monitor-stage-btn ${stage.key === selected.key ? 'active' : ''}"
              data-monitor-stage="${stage.key}">
              <span>${escapeHTML(stage.title)}</span>
              <strong>${count}</strong>
            </button>
          `;
        }).join('')}
      </div>

      <section id="monitorDetail" class="monitor-detail" hidden>
        <div class="monitor-detail-head">
          <div>
            <h3>Detail Barang</h3>
            <p>${stageJobs.length} pekerjaan · ${total.toLocaleString('id-ID')} pcs</p>
          </div>
          <button type="button" id="monitorCloseDetail">Tutup</button>
        </div>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Pekerja</th>
                <th>Barang</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${stageJobs.map(job => {
                const worker = workers.find(w => w.id === job.workerId);

                return `
                  <tr>
                    <td><strong>${escapeHTML(worker?.name || 'Pekerja tidak ditemukan')}</strong></td>
                    <td>${escapeHTML(job.product || '-')}<br>
                      <small>${escapeHTML(job.type || '-')}</small>
                    </td>
                    <td><strong>${Number(job.quantity || 0)} pcs</strong></td>
                    <td>${formatDate(job)}</td>
                    <td>
                      ${selected.next
                        ? `<button type="button" class="text-button"
                            data-monitor-move="${escapeHTML(String(job.id))}"
                            data-monitor-next="${selected.next}">
                            ${selected.button}
                          </button>`
                        : '<span class="status-badge">Terkirim</span>'}
                    </td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="5">Belum ada barang.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;

  content.querySelectorAll('[data-monitor-stage]').forEach(button => {
    button.addEventListener('click', () => {
      window.monitorCurrentStage = button.dataset.monitorStage;
      renderMonitor();
    });
  });

  document.getElementById('monitorProcessBtn')
    ?.addEventListener('click', () => {
      document.getElementById('monitorDetail').hidden = false;
    });

  document.getElementById('monitorCloseDetail')
    ?.addEventListener('click', () => {
      document.getElementById('monitorDetail').hidden = true;
    });

  content.querySelectorAll('[data-monitor-move]').forEach(button => {
    button.addEventListener('click', () => {
      moveMonitorStage(
        button.dataset.monitorMove,
        button.dataset.monitorNext
      );
    });
  });
}

function moveMonitorStage(jobId, nextStage) {
  const job = jobs.find(item => String(item.id) === String(jobId));
  if (!job) return;

  job.monitorStage = nextStage;
  job.monitorDates = job.monitorDates || {};
  job.monitorDates[nextStage] = new Date().toISOString();

  saveJobs();
  renderMonitor();
}



function quickMoveMonitor() {
  const stages = [
    { key: 'monitor', title: 'Monitor Barang', desc: 'Barang selesai dari pekerja' },
    { key: 'kam', title: 'Barang di Kam', desc: 'Proses kam' },
    { key: 'jahit', title: 'Barang di Jahit', desc: 'Proses jahit leher' },
    { key: 'gosok', title: 'Barang di Gosok', desc: 'Proses gosok' },
    { key: 'packaging', title: 'Barang di Packaging', desc: 'Proses pengemasan' },
    { key: 'siap_kirim', title: 'Barang Siap Kirim', desc: 'Menunggu pengiriman' }
  ];

  const activeJobs = jobs.filter(job => {
    const done = (Array.isArray(job.workReports) &&
      job.workReports.some(report => report.note === 'Selesai')) ||
      Number(job.returned || 0) >= Number(job.quantity || 0);

    return done;
  });

  const old = document.getElementById('quickMoveModal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'quickMoveModal';
  modal.className = 'quick-modal-overlay';

  modal.innerHTML = `
    <div class="quick-modal">
      <div class="quick-modal-head">
        <div>
          <span class="quick-modal-kicker">KONVEKSIBOS / AKSI MASSAL</span>
          <h2>⚡ Proses Cepat</h2>
          <p>Pindahkan semua barang ke tahap pilihan.</p>
        </div>
        <button class="quick-close" onclick="closeQuickMoveModal()">×</button>
      </div>

      <div class="quick-total">
        <strong>${activeJobs.length}</strong>
        <span>Barang aktif yang bisa diproses</span>
      </div>

      <div class="quick-stage-list">
        ${stages.map((stage, i) => `
          <button class="quick-stage" onclick="selectQuickMoveStage('${stage.key}', '${stage.title}')">
            <span class="quick-stage-number">${i + 1}</span>
            <span class="quick-stage-info">
              <strong>${stage.title}</strong>
              <small>${stage.desc}</small>
            </span>
            <span class="quick-stage-arrow">›</span>
          </button>
        `).join('')}
      </div>

      <button class="quick-cancel" onclick="closeQuickMoveModal()">Batal</button>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeQuickMoveModal() {
  document.getElementById('quickMoveModal')?.remove();
}

function selectQuickMoveStage(target, title) {
  const activeJobs = jobs.filter(job => {
    const done = (Array.isArray(job.workReports) &&
      job.workReports.some(report => report.note === 'Selesai')) ||
      Number(job.returned || 0) >= Number(job.quantity || 0);

    return done;
  });

  if (!activeJobs.length) {
    closeQuickMoveModal();
    alert('Tidak ada barang aktif.');
    return;
  }

  if (!confirm(`Pindahkan ${activeJobs.length} barang ke ${title}?`)) return;

  const now = new Date().toISOString();

  activeJobs.forEach(job => {
    job.monitorStage = target;
    job.monitorDates = job.monitorDates || {};
    job.monitorDates[target] = now;
  });

  saveJobs();
  closeQuickMoveModal();
  renderMonitor();
}

function renderDashboard() {
  const metrics = document.querySelectorAll('.metrics .metric');
  const format = value => Number(value || 0).toLocaleString('id-ID');
  const money = value => 'Rp ' + format(Math.round(value || 0));

  const isCompleted = job =>
    (Array.isArray(job.workReports) &&
      job.workReports.some(item => item.note === 'Selesai')) ||
    Number(job.returned || 0) >= Number(job.quantity || 0);

  // Pekerja yang masih aktif, termasuk yang sedang mengerjakan.
  const activeWorkers = workers.filter(w =>
    ['Aktif', 'Dikerjakan'].includes(w.status)
  );

  // Pekerja aktif yang belum menerima pekerjaan.
  const waitingWorkers = activeWorkers.filter(w =>
    w.status === 'Aktif' && !getActiveAssignment(w.id)
  );

  // Penugasan yang masih dipegang pekerja.
  const activeJobs = jobs.filter(job =>
    job.distributionReleased !== true &&
    Number(job.returned || 0) < Number(job.quantity || 0) &&
    !isCompleted(job)
  );

  const activeQuantity = activeJobs.reduce((sum, job) =>
    sum + Math.max(0, Number(job.quantity || 0) -
      Number(job.returned || 0)), 0);

  // Catatan kekurangan beserta umur catatannya.
  const shortages = [];

  jobs.forEach(job => {
    const reports = Array.isArray(job.workReports)
      ? job.workReports : [];

    const worker = workers.find(w =>
      String(w.id) === String(job.workerId)
    );

    reports.forEach(report => {
      const quantity = Number(report.shortageQuantity || 0);
      if (quantity <= 0) return;

      const date = report.date ? new Date(report.date) : null;
      const validDate = date && !isNaN(date.getTime());
      const days = validDate
        ? Math.max(0, Math.floor(
            (Date.now() - date.getTime()) / 86400000
          ))
        : null;

      shortages.push({
        worker: worker?.name || 'Pekerja tidak ditemukan',
        product: job.product || '-',
        note: report.note || 'Kekurangan',
        quantity,
        days,
        date: validDate ? date : null
      });
    });
  });

  shortages.sort((a, b) =>
    (b.days ?? -1) - (a.days ?? -1)
  );

  const shortageTotal = shortages.reduce((sum, item) =>
    sum + item.quantity, 0);

  // Upah belum dibayar pada periode payroll minggu berjalan.
  const currentPeriod = payrollPeriod(payrollToday());
  const paidData = payrollPaidData();
  const periodArchived = payrollIsArchived(currentPeriod.key);

  const wageRows = periodArchived ? [] : workers.map(worker => {
    const paid = !!paidData[currentPeriod.key]?.[worker.id];
    if (paid) return null;

    const rows = payrollRows(worker.id, currentPeriod);
    const total = rows.reduce((sum, row) =>
      sum + (Number(row.pay) || 0), 0);

    return { name: worker.name, total };
  }).filter(item => item && item.total > 0)
    .sort((a, b) => b.total - a.total);

  const totalPayroll = wageRows.reduce((sum, item) =>
    sum + item.total, 0);

  // Empat kartu ringkasan dashboard.
  const metricData = [
    {
      label: 'Pekerja aktif',
      value: format(activeWorkers.length),
      detail: `${workers.length} pekerja terdaftar`
    },
    {
      label: 'Belum menerima pekerjaan',
      value: format(waitingWorkers.length),
      detail: 'Pekerja siap menerima barang'
    },
    {
      label: 'Barang sedang dikerjakan',
      value: `${format(activeQuantity)} pcs`,
      detail: `${activeJobs.length} penugasan berjalan`
    },
    {
      label: 'Upah belum dibayar',
      value: money(totalPayroll),
      detail: periodArchived ? 'Periode sudah tutup buku' : `${wageRows.length} pekerja belum menerima upah`
    }
  ];

  metrics.forEach((metric, index) => {
    const item = metricData[index];
    if (!item) return;

    const label = metric.querySelector('span');
    const strong = metric.querySelector('strong');
    const detail = metric.querySelector('p');

    if (label) label.textContent = item.label;
    if (strong) strong.textContent = item.value;
    if (detail) detail.textContent = item.detail;
  });

  // Aktivitas pekerjaan terbaru.
  const tbody = document.querySelector(
    '.dashboard-grid .panel table tbody'
  );

  if (tbody) {
    tbody.innerHTML = jobs.slice(0, 5).map(job => {
      const worker = workers.find(w => w.id === job.workerId);
      const left = Math.max(
        0,
        Number(job.quantity || 0) - Number(job.returned || 0)
      );

      const status = isCompleted(job)
        ? 'Selesai'
        : Number(job.returned || 0) > 0
          ? 'Sebagian setor'
          : 'Belum setor';

      return `
        <tr>
          <td><strong>${escapeHTML(worker?.name || 'Pekerja tidak ditemukan')}</strong></td>
          <td>${escapeHTML(job.type || '-')} — ${escapeHTML(job.product || '-')}</td>
          <td>${format(job.quantity)} pcs</td>
          <td>${status}</td>
        </tr>
      `;
    }).join('') || `
      <tr><td colspan="4">Belum ada aktivitas pekerjaan.</td></tr>
    `;
  }

  // Rincian akumulasi upah per pekerja.
  const finance = document.querySelector('.finance');

  if (finance) {
    finance.innerHTML = `
      <div class="owner-wage-total">
        <span>Total upah belum dibayar</span>
        <strong>${money(totalPayroll)}</strong>
        <small>Minggu ini · ${currentPeriod.start} – ${currentPeriod.end}${periodArchived ? ' · Tutup buku' : ''}</small>
      </div>

      <div class="owner-wage-list">
        ${wageRows.length ? wageRows.map(item => `
          <div class="owner-wage-row">
            <span>${escapeHTML(item.name)}</span>
            <strong>${money(item.total)}</strong>
          </div>
        `).join('') : `
          <p class="owner-empty">Tidak ada upah yang belum dibayar pada periode ini.</p>
        `}
      </div>
    `;
  }

  // Progres penugasan yang masih berjalan.
  const progress = document.querySelector('.progress-list');

  if (progress) {
    const totalActive = activeJobs.reduce((sum, job) =>
      sum + Number(job.quantity || 0), 0);

    const returnedActive = activeJobs.reduce((sum, job) =>
      sum + Number(job.returned || 0), 0);

    const returnedPercent = totalActive
      ? Math.min(100, returnedActive / totalActive * 100)
      : 0;

    const remainingPercent = totalActive
      ? Math.max(0, 100 - returnedPercent)
      : 0;

    progress.innerHTML = `
      <div>
        <p>Sudah disetor <b>${returnedPercent.toFixed(1)}%</b></p>
        <div class="track">
          <i style="width:${returnedPercent}%"></i>
        </div>
      </div>
      <div>
        <p>Belum disetor <b>${remainingPercent.toFixed(1)}%</b></p>
        <div class="track">
          <i style="width:${remainingPercent}%"></i>
        </div>
      </div>
      <small class="owner-muted">${format(activeJobs.length)} penugasan aktif</small>
    `;
  }

  // Daftar barang yang masih dikerjakan dan durasi penugasan.
  const workPanel = document.querySelector('.owner-active-work');

  if (workPanel) {
    workPanel.innerHTML = activeJobs.length
      ? activeJobs.map(job => {
          const worker = workers.find(w =>
            String(w.id) === String(job.workerId)
          );

          const created = job.createdAt
            ? new Date(job.createdAt) : null;

          const validDate = created && !isNaN(created.getTime());
          let elapsed = 'Waktu mulai tidak tersedia';

          if (validDate) {
            const hours = Math.max(0,
              Math.floor((Date.now() - created.getTime()) / 3600000)
            );

            const days = Math.floor(hours / 24);
            const restHours = hours % 24;

            elapsed = days > 0
              ? `${days} hari ${restHours} jam`
              : `${restHours} jam`;
          }

          const left = Math.max(0,
            Number(job.quantity || 0) - Number(job.returned || 0)
          );

          return `
            <article class="owner-work-item">
              <div>
                <strong>${escapeHTML(job.product || '-')}</strong>
                <small>${escapeHTML(worker?.name || 'Pekerja tidak ditemukan')}</small>
              </div>
              <div class="owner-work-meta">
                <b>${format(left)} pcs tersisa</b>
                <span>Berjalan ${elapsed}</span>
              </div>
            </article>
          `;
        }).join('')
      : '<p class="owner-empty">Tidak ada barang yang sedang dipegang pekerja.</p>';
  }

  // Daftar catatan kekurangan dan umur catatan.
  const shortagePanel = document.querySelector('.owner-shortages');

  if (shortagePanel) {
    shortagePanel.innerHTML = `
      <div class="owner-shortage-total">
        <strong>${format(shortageTotal)} PCS</strong>
        <span>${shortages.length} catatan kekurangan</span>
      </div>

      ${shortages.length ? shortages.slice(0, 8).map(item => `
        <article class="owner-shortage-item">
          <div>
            <strong>${escapeHTML(item.product)}</strong>
            <small>${escapeHTML(item.worker)} · ${escapeHTML(item.note)}</small>
          </div>
          <div>
            <b>${format(item.quantity)} pcs</b>
            <small>${item.days === null
              ? 'Tanggal tidak tersedia'
              : `${item.days} hari sejak dicatat`}</small>
          </div>
        </article>
      `).join('') : `
        <p class="owner-empty">Belum ada catatan kekurangan.</p>
      `}

      <small class="owner-muted">
        Umur dihitung sejak laporan dibuat. Status penyelesaian belum tercatat.
      </small>
    `;
  }
}

function renderWorkers() {
  mainAction.style.display = 'none';

  content.innerHTML = `
    <section class="panel worker-list-panel">
      <div class="panel-heading">
        <div>
          <h2>Daftar pekerja</h2>
          <p id="workerCount">0 pekerja terdaftar</p>
        </div>
        <button class="primary" id="addWorkerBtn" type="button">
          + Tambah Pekerja
        </button>
      </div>

      <div class="table-scroll">
        <div id="workerTable"></div>
      </div>
      <div id="workerEmpty" class="empty-state">
        <strong>Belum ada pekerja</strong>
        <p>Tambahkan pekerja untuk mulai membangun database konveksi.</p>
      </div>
    </section>
  `;

  document.getElementById('addWorkerBtn')
    .addEventListener('click', openWorkerModal);

  renderWorkerTable();
}

function openWorkerModal() {
  const old = document.getElementById('workerModal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'workerModal';
  modal.className = 'worker-modal-overlay';

  modal.innerHTML = `
    <section class="worker-modal">
      <div class="worker-modal-head">
        <div>
          <span class="quick-modal-kicker">KONVEKSIBOS / DATA PEKERJA</span>
          <h2 id="formTitle">Tambah pekerja</h2>
          <p>Masukkan identitas pekerja konveksi</p>
        </div>
        <button type="button" class="quick-close"
          onclick="closeWorkerModal()">×</button>
      </div>

      <form id="workerForm" class="worker-form">
        <label>
          Nama pekerja
          <input id="workerName" required maxlength="80"
            placeholder="Contoh: Bambang">
        </label>

        <label>
          Nomor HP
          <input id="workerPhone" type="tel" maxlength="20"
            placeholder="Opsional">
        </label>

        <label>
          Bidang pekerjaan
          <select id="workerRole" required>
            <option value="">Pilih bidang</option>
            <option>Obras</option>
            <option>Jahit</option>
            <option>Kam</option>
            <option>Kancing</option>
            <option>Lainnya</option>
          </select>
        </label>

        <label>
          Status
          <select id="workerStatus">
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </label>

        <div class="worker-form-actions">
          <button class="primary" type="submit" id="saveWorker">
            Simpan pekerja
          </button>
          <button class="secondary" type="button"
            onclick="closeWorkerModal()">Batal</button>
        </div>
      </form>
    </section>
  `;

  document.body.appendChild(modal);
  document.getElementById('workerForm')
    .addEventListener('submit', submitWorker);
  document.getElementById('workerName').focus();
}

function closeWorkerModal() {
  document.getElementById('workerModal')?.remove();
  editingId = null;
}

function submitWorker(event) {
  event.preventDefault();

  const name = document.getElementById('workerName').value.trim();
  const phone = document.getElementById('workerPhone').value.trim();
  const role = document.getElementById('workerRole').value;
  const status = document.getElementById('workerStatus').value;

  if (!name || !role) return;

  if (editingId) {
    workers = workers.map(worker =>
      worker.id === editingId
        ? { ...worker, name, phone, role, status }
        : worker
    );
  } else {
    workers.push({
      id: crypto.randomUUID(),
      name,
      phone,
      role,
      status,
      createdAt: new Date().toISOString()
    });
  }

  saveWorkers();
  resetForm();
  renderWorkerTable();
}


document.addEventListener('click', function closeWorkerMenus(event) {
  if (!event.target.closest('.worker-contact-actions')) {
    document.querySelectorAll('.worker-contact-item.is-menu-open')
      .forEach(row => row.classList.remove('is-menu-open'));
  }
});

function renderWorkerTable() {
  const tbody = document.getElementById('workerTable');
  const empty = document.getElementById('workerEmpty');
  if (!tbody || !empty) return;

  document.getElementById('workerCount').textContent =
    `${workers.length} pekerja terdaftar`;

  empty.style.display = workers.length ? 'none' : 'block';
  tbody.style.display = workers.length ? 'block' : 'none';

  tbody.innerHTML = `
    <div class="worker-contact-list">
      ${workers.map(worker => {
        const initials = worker.name.trim()
          .split(/\s+/).slice(0, 2)
          .map(word => word[0].toUpperCase()).join('');

        return `
          <article class="worker-contact-item">
            <button type="button" class="worker-contact-profile"
              data-profile="${worker.id}">
              <span class="worker-contact-avatar">${escapeHTML(initials)}</span>
              <span class="worker-contact-info">
                <strong>${escapeHTML(worker.name)}</strong>
                <small>${escapeHTML(worker.role)} · ${escapeHTML(worker.status)}</small>
              </span>
              <span class="worker-contact-arrow">›</span>
            </button>
            <div class="worker-contact-actions">
              <button type="button" class="worker-more-btn"
                aria-label="Menu pekerja" data-menu="${worker.id}">⋮</button>
              <div class="worker-action-menu">
                <button type="button" data-edit="${worker.id}">✎ &nbsp; Edit</button>
                <button type="button" class="delete-action"
                  data-delete="${worker.id}">⌫ &nbsp; Hapus</button>
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  tbody.querySelectorAll('[data-profile]').forEach(button => {
    button.addEventListener('click', () =>
      renderWorkerProfile(button.dataset.profile)
    );
  });

  tbody.querySelectorAll('[data-menu]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const item = button.closest('.worker-contact-item');
      const wasOpen = item.classList.contains('is-menu-open');

      tbody.querySelectorAll('.worker-contact-item')
        .forEach(row => row.classList.remove('is-menu-open'));

      if (!wasOpen) item.classList.add('is-menu-open');
    });
  });

  tbody.querySelectorAll('[data-edit]').forEach(button => {
    button.addEventListener('click', () =>
      editWorker(button.dataset.edit)
    );
  });

  tbody.querySelectorAll('[data-delete]').forEach(button => {
    button.addEventListener('click', () =>
      deleteWorker(button.dataset.delete)
    );
  });
}

function renderWorkerProfile(id) {
  const worker = workers.find(item => item.id === id);
  if (!worker) return;

  const initials = worker.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');

  const joined = worker.createdAt
    ? new Date(worker.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '-';

  mainAction.style.display = 'none';
  pageTitle.textContent = worker.name;
  breadcrumb.textContent = 'Pekerja / Profil';
  description.textContent = 'Kartu identitas pekerja konveksi.';

  content.innerHTML = `
    <section class="worker-profile-page">

      <div class="worker-id-card">
        <div class="worker-id-top">
          <span>KONVEKSIBOS</span>
          <span>WORKER IDENTITY</span>
        </div>

        <div class="worker-id-main">
          <div class="worker-avatar">${escapeHTML(initials)}</div>

          <div class="worker-id-info">
            <span class="worker-profile-label">PROFIL PEKERJA</span>
            <h2>${escapeHTML(worker.name)}</h2>
            <p>${escapeHTML(worker.role)}</p>
            <span class="worker-profile-status ${worker.status === 'Aktif' ? 'active' : 'inactive'}">
              ● ${escapeHTML(worker.status)}
            </span>
          </div>
        </div>

        <div class="worker-id-bottom">
          <div>
            <small>NOMOR HP</small>
            <strong>${escapeHTML(worker.phone || '-')}</strong>
          </div>
          <div>
            <small>TERDAFTAR SEJAK</small>
            <strong>${joined}</strong>
          </div>
        </div>
      </div>

      <div class="worker-profile-section">
        <div class="worker-profile-section-heading">
          <h3>Identitas Lengkap</h3>
          <span>DATA PEKERJA</span>
        </div>

        <div class="worker-detail-row">
          <span>Nama lengkap</span>
          <strong>${escapeHTML(worker.name)}</strong>
        </div>
        <div class="worker-detail-row">
          <span>Nomor HP</span>
          <strong>${escapeHTML(worker.phone || '-')}</strong>
        </div>
        <div class="worker-detail-row">
          <span>Bidang pekerjaan</span>
          <strong>${escapeHTML(worker.role)}</strong>
        </div>
        <div class="worker-detail-row">
          <span>Status pekerja</span>
          <strong>${escapeHTML(worker.status)}</strong>
        </div>
      </div>

      <button class="secondary worker-profile-back" id="backToWorkers">
        ← Kembali ke daftar pekerja
      </button>
    </section>
  `;

  document.getElementById('backToWorkers').addEventListener('click', () => {
    navigate('Pekerja');
  });
}
function editWorker(id) {
  const worker = workers.find(item => item.id === id);
  if (!worker) return;

  openWorkerModal();
  editingId = id;
  document.getElementById('workerName').value = worker.name;
  document.getElementById('workerPhone').value = worker.phone;
  document.getElementById('workerRole').value = worker.role;
  document.getElementById('workerStatus').value = worker.status;
  document.getElementById('formTitle').textContent = 'Edit pekerja';
  document.getElementById('saveWorker').textContent = 'Simpan perubahan';
  document.getElementById('cancelEdit').style.display = '';
  document.getElementById('workerName').focus();
}

function deleteWorker(id) {
  const worker = workers.find(item => item.id === id);
  if (!worker) return;

  if (!confirm(`Hapus pekerja ${worker.name}?`)) return;

  workers = workers.filter(item => item.id !== id);
  saveWorkers();
  renderWorkerTable();
}

function resetForm() {
  editingId = null;
  closeWorkerModal();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => {
    navigate(button.dataset.page);

    const menu = document.getElementById('mobileMoreMenu');
    const toggle = document.getElementById('moreMenuToggle');

    if (menu) menu.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
});

const moreToggle = document.getElementById('moreMenuToggle');
const moreMenu = document.getElementById('mobileMoreMenu');

moreToggle?.addEventListener('click', () => {
  moreMenu.hidden = !moreMenu.hidden;
  moreToggle.setAttribute('aria-expanded', String(!moreMenu.hidden));
});
// MAIN ACTION HANDLER - EVENT DELEGATION
content.addEventListener('click', (event) => {
  const button = event.target.closest('#mainAction');
  if (!button) return;

  if (currentPage === 'Dashboard') {
    navigate('Pekerjaan');
  } else if (currentPage === 'Kekurangan') {
    content.innerHTML = `<div class="panel"><h3>Barang yang Kurang</h3><p>Belum ada aktivitas barang yang kurang.</p></div>`;
} else if (currentPage === 'Pekerja') {
    document.getElementById('workerName')?.focus();
  }
});

// ===============================
// MODUL PEKERJAAN
// ===============================

let jobs = JSON.parse(localStorage.getItem('kb_jobs') || '[]');

const defaultRates = {
  Obras: 8000,
  Jahit: 6000,
  Kam: 5000,
  Kancing: 300,
  Lainnya: 0
};

function saveJobs() {
  localStorage.setItem('kb_jobs', JSON.stringify(jobs));

  if (window.KBCloud?.saveJobs) {
    window.KBCloud.saveJobs();
  }
}


function getActiveAssignment(workerId) {
  return jobs
    .filter(job =>
      job.workerId === workerId &&
      job.distributionReleased !== true &&
      Number(job.returned || 0) < Number(job.quantity)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
}

function renderJobs() {
  mainAction.style.display = '';
  mainAction.textContent = '+ Catat pekerjaan';

  const activeWorkers = workers.filter(w => ['Aktif', 'Dikerjakan'].includes(w.status));

  content.innerHTML = `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h2>Catat pekerjaan baru</h2>
          <p>Distribusi barang kepada pekerja</p>
        </div>
      </div>

      ${activeWorkers.length ? `
        <form id="jobForm" class="worker-form" style="display:grid">
          <label>
            Pekerja
            <select id="jobWorker" required>
              <option value="">Pilih pekerja</option>
              ${activeWorkers.map(w =>
                `<option value="${w.id}">${escapeHTML(w.name)} — ${escapeHTML(w.role)}</option>`
              ).join('')}
            </select>
          </label>

          <div id="previousReportBox" style="display:none"></div>
          <div id="jobFlowMessage" style="display:none"></div>

          <div id="newJobFields" style="display:none">
            <label>
              Nama barang / produk
              <input id="jobProduct" required maxlength="80" placeholder="Contoh: Kaos oblong">
            </label>

            <label>
              Jenis pekerjaan
              <select id="jobType" required>
                <option value="">Pilih pekerjaan</option>
                <option>Obras</option>
                <option>Jahit</option>
                <option>Kam</option>
                <option>Kancing</option>
                <option>Lainnya</option>
              </select>
            </label>

            <label>
              Jumlah barang diberikan
              <input id="jobQty" type="number" min="1" required placeholder="Contoh: 120">
            </label>

            <label>
              Tarif
              <input id="jobRate" type="number" min="0" required value="8000">
            </label>

            <label>
              Satuan tarif
              <select id="jobUnit">
                <option value="lusin">Per lusin</option>
                <option value="pcs">Per pcs</option>
              </select>
            </label>

            <div class="worker-form-actions">
              <button class="primary" type="submit">Simpan pekerjaan</button>
            </div>
          </div>
        </form>
      ` : `
        <div class="empty-state">
          <strong>Belum ada pekerja aktif</strong>
          <p>Daftarkan pekerja terlebih dahulu sebelum mencatat pekerjaan.</p>
        </div>
      `}
    </section>

    <section class="panel worker-list-panel">
      <div class="panel-heading">
        <div>
          <h2>Daftar pekerjaan</h2>
          <p id="jobCount">0 pekerjaan tercatat</p>
        </div>
      </div>

      <div class="job-tabs">
        <button type="button" data-job-filter="Aktif">Aktif</button>
        <button type="button" data-job-filter="Selesai">Selesai</button>
      </div>

      <div class="table-scroll job-contact-scroll">
        <div id="jobTable"></div>
      </div>

      <div id="jobEmpty" class="empty-state">
        <strong>Belum ada pekerjaan</strong>
        <p>Catatan pekerjaan yang dibuat akan muncul di sini.</p>
      </div>
    </section>
  `;

  const typeSelect = document.getElementById('jobType');

  typeSelect?.addEventListener('change', () => {
    const type = typeSelect.value;
    document.getElementById('jobRate').value = defaultRates[type] ?? 0;
    document.getElementById('jobUnit').value =
      type === 'Kancing' ? 'pcs' : 'lusin';
  });

  document.getElementById('jobWorker')
    ?.addEventListener('change', handleJobWorkerChange);

  document.getElementById('jobForm')
    ?.addEventListener('submit', createJob);

  renderJobTable();
}

function handleJobWorkerChange() {
  const workerId = document.getElementById('jobWorker').value;
  const reportBox = document.getElementById('previousReportBox');
  const newFields = document.getElementById('newJobFields');
  const message = document.getElementById('jobFlowMessage');

  reportBox.style.display = 'none';
  newFields.style.display = 'none';
  message.style.display = 'none';

  if (!workerId) return;

  const job = getActiveAssignment(workerId);

  if (!job) {
    newFields.style.display = 'grid';
    return;
  }

  const payable = Number(job.payableQuantity ?? job.returned ?? 0);
  const remaining = Math.max(0, Number(job.quantity) - payable);

  reportBox.style.display = 'block';
  reportBox.innerHTML = `
    <div class="previous-report">

      <div class="report-header">
        <div>
          <span class="report-eyebrow">PEKERJAAN SEBELUMNYA</span>
          <h3>${escapeHTML(job.product)}</h3>
        </div>
        <span class="report-status">Menunggu laporan</span>
      </div>

      <div class="report-stats">
        <div class="report-stat">
          <span>Jumlah awal</span>
          <strong>${job.quantity}</strong>
          <small>pcs</small>
        </div>

        <div class="report-stat">
          <span>Sudah dilaporkan</span>
          <strong>${payable}</strong>
          <small>pcs</small>
        </div>
      </div>

      <div class="report-form">

        <label>
          Jumlah hasil pekerjaan
          <div class="report-input-wrap">
            <input id="reportQty" type="number"
              min="1" max="${remaining}"
              required placeholder="Masukkan jumlah">
            <span>PCS</span>
          </div>
          <small>Sisa pekerjaan: ${remaining} pcs</small>
        </label>

        <label>
          Keterangan pekerjaan
          <select id="reportNote" required>
            <option value="">Pilih keterangan</option>
            <option>Masih dikerjakan</option>
            <option>Selesai</option>
            <option>Kurang mangset</option>
            <option>Kurang rip</option>
            <option>Kurang mangset + rip</option>
            <option>Pekerja nonaktif</option>
          </select>
        </label>

        <div id="shortageBox" class="report-shortage"
          style="display:none">
          <label>
            Jumlah kekurangan
            <div class="report-input-wrap">
              <input id="shortageQty" type="number"
                min="1" max="${Number(job.quantity)}"
                placeholder="Masukkan jumlah kekurangan">
              <span>PCS</span>
            </div>
          </label>
        </div>

        <button class="primary report-save"
          type="button" id="savePreviousReport">
          Simpan laporan & lanjut
        </button>

      </div>
    </div>
  `;

  document.getElementById('reportNote')
    .addEventListener('change', event => {
      const needsShortage = [
        'Kurang mangset',
        'Kurang rip',
        'Kurang mangset + rip'
      ].includes(event.target.value);

      const box = document.getElementById('shortageBox');
      const input = document.getElementById('shortageQty');

      box.style.display = needsShortage ? 'block' : 'none';
      input.required = needsShortage;

      if (!needsShortage) input.value = '';
    });

  document.getElementById('savePreviousReport')
    .addEventListener('click', () => savePreviousWorkReport(job.id));
}

function savePreviousWorkReport(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  const quantity = Number(document.getElementById('reportQty').value);
  const note = document.getElementById('reportNote').value;
  const shortageInput = document.getElementById('shortageQty');
  const shortageQuantity = Number(shortageInput?.value || 0);
  const needsShortage = [
    'Kurang mangset',
    'Kurang rip',
    'Kurang mangset + rip'
  ].includes(note);

  const payable = Number(job.payableQuantity ?? job.returned ?? 0);
  const remaining = Number(job.quantity) - payable;

  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > remaining) {
    alert('Jumlah laporan tidak valid. Periksa sisa pcs pekerjaan.');
    return;
  }

  if (!note) {
    alert('Keterangan tambahan wajib dipilih.');
    return;
  }

  if (needsShortage &&
      (!Number.isInteger(shortageQuantity) ||
       shortageQuantity <= 0 ||
       shortageQuantity > Number(job.quantity))) {
    alert('Jumlah kekurangan tidak valid.');
    return;
  }

  if (!Array.isArray(job.workReports)) job.workReports = [];

  job.payableQuantity = payable + quantity;

  if (note === 'Selesai') {
    const physicalDeposit = Number(job.returned || 0);
    job.returned = physicalDeposit + quantity;

    if (!Array.isArray(job.depositHistory)) {
      job.depositHistory = [];
    }

    job.depositHistory.push({
      id: crypto.randomUUID(),
      quantity,
      date: new Date().toISOString()
    });
  }

  job.workReports.push({
    id: crypto.randomUUID(),
    quantity,
    note,
    shortageQuantity: needsShortage ? shortageQuantity : 0,
    date: new Date().toISOString()
  });

  job.distributionReleased = true;

  const worker = workers.find(w => w.id === job.workerId);
  if (worker && note !== 'Masih dikerjakan') {
    worker.status = 'Aktif';
    saveWorkers();
  }

  saveJobs();

  document.getElementById('previousReportBox').style.display = 'none';
  document.getElementById('newJobFields').style.display = 'grid';

  const message = document.getElementById('jobFlowMessage');
  message.style.display = 'block';
  message.innerHTML = `
    <p style="color:green">
      Laporan ${quantity} pcs tersimpan. Keterangan: ${escapeHTML(note)}.
      Silakan catat pekerjaan baru.
    </p>
  `;

  renderJobTable();
}

function createJob(event) {
  event.preventDefault();

  const workerId = document.getElementById('jobWorker').value;
  const worker = workers.find(w => w.id === workerId);

  if (!worker || worker.status === 'Nonaktif') {
    alert('Pekerja tidak valid atau sudah nonaktif.');
    return;
  }

  if (getActiveAssignment(workerId)) {
    alert('Laporan pekerjaan sebelumnya harus dicatat terlebih dahulu.');
    handleJobWorkerChange();
    return;
  }

  const quantity = Number(document.getElementById('jobQty').value);
  const rate = Number(document.getElementById('jobRate').value);
  const product = document.getElementById('jobProduct').value.trim();

  if (!product || !Number.isInteger(quantity) || quantity <= 0 || rate < 0) {
    alert('Periksa nama barang, jumlah barang, dan tarif.');
    return;
  }

  jobs.unshift({
    id: crypto.randomUUID(),
    workerId,
    product,
    type: document.getElementById('jobType').value,
    quantity,
    returned: 0,
    payableQuantity: 0,
    workReports: [],
    distributionReleased: false,
    rate,
    unit: document.getElementById('jobUnit').value,
    createdAt: new Date().toISOString()
  });

  worker.status = 'Dikerjakan';
  saveWorkers();

  saveJobs();
  renderJobs();
}

function calculateJobPay(job) {
  const completed = Number(job.returned || 0);

  return job.unit === 'lusin'
    ? (completed / 12) * job.rate
    : completed * job.rate;
}


function renderJobTable() {
  const tbody = document.getElementById('jobTable');
  if (!tbody) return;

  const isReportedComplete = job =>
    Array.isArray(job.workReports) &&
    job.workReports.some(item => item.note === 'Selesai');

  const completedJobs = jobs.filter(job =>
    isReportedComplete(job) ||
    Number(job.returned || 0) >= Number(job.quantity)
  );

  const activeJobs = jobs.filter(job =>
    !completedJobs.includes(job)
  );

  const selectedJobs = currentJobTab === 'Aktif'
    ? activeJobs : completedJobs;

  document.getElementById('jobCount').textContent =
    `${selectedJobs.length} pekerjaan ${currentJobTab.toLowerCase()}`;

  const empty = document.getElementById('jobEmpty');
  empty.style.display = selectedJobs.length ? 'none' : 'block';

  empty.innerHTML = selectedJobs.length ? '' :
    `<strong>${currentJobTab === 'Aktif'
      ? 'Tidak ada pekerjaan aktif'
      : 'Belum ada pekerjaan selesai'}</strong>
     <p>${currentJobTab === 'Aktif'
      ? 'Semua pekerjaan sudah disetor.'
      : 'Pekerjaan yang selesai akan muncul di sini.'}</p>`;

  document.querySelectorAll('[data-job-filter]').forEach(button => {
    const tab = button.dataset.jobFilter;
    button.classList.toggle('active', tab === currentJobTab);

    button.textContent = `${tab} (${tab === 'Aktif'
      ? activeJobs.length : completedJobs.length})`;

    button.onclick = () => {
      currentJobTab = tab;
      renderJobTable();
    };
  });

  tbody.innerHTML = selectedJobs.map(job => {
    const worker = workers.find(w => w.id === job.workerId);
    const name = worker?.name || 'Pekerja tidak ditemukan';
    const initials = name.split(/\s+/)
      .map(part => part[0] || '')
      .slice(0, 2).join('').toUpperCase();

    const returned = Number(job.returned || 0);
    const remaining = Math.max(0, Number(job.quantity) - returned);

    const status = isReportedComplete(job) || remaining === 0
      ? 'Selesai'
      : returned > 0 ? 'Sebagian setor' : 'Belum setor';

    return `
      <button type="button" class="job-contact-item"
        data-job-card="${escapeHTML(String(job.id))}">
        <span class="job-contact-avatar">${escapeHTML(initials)}</span>

        <span class="job-contact-info">
          <strong>${escapeHTML(name)}</strong>
          <small>${escapeHTML(job.product)} · ${escapeHTML(job.type)}</small>
        </span>

        <span class="job-contact-meta">
          <strong>${Number(job.quantity)} pcs</strong>
          <small>${escapeHTML(status)}</small>
        </span>

        <span class="job-contact-arrow">›</span>
      </button>
    `;
  }).join('');

  tbody.querySelectorAll('[data-job-card]').forEach(button => {
    button.addEventListener('click', () =>
      renderJobCard(button.dataset.jobCard)
    );
  });
}



function renderJobCard(id) {
  const job = jobs.find(item => item.id === id);
  if (!job) return;

  const worker = workers.find(w => w.id === job.workerId);
  const returned = Number(job.returned || 0);
  const reportedQuantity = Number(
    job.payableQuantity ?? returned
  );
  const remaining = Math.max(
    0,
    Number(job.quantity) - reportedQuantity
  );

  const reportedDone = Array.isArray(job.workReports) &&
    job.workReports.some(item => item.note === 'Selesai');

  const status = reportedDone || remaining === 0
    ? 'Selesai'
    : returned > 0 ? 'Sebagian setor' : 'Belum setor';

  const history = Array.isArray(job.depositHistory)
    ? job.depositHistory : [];

  const historyTotal = history.reduce(
    (sum, item) => sum + Number(item.quantity || 0), 0
  );

  const legacyQuantity = Math.max(0, returned - historyTotal);

  const workReports = Array.isArray(job.workReports)
    ? job.workReports : [];

  const historyHTML = [
    ...workReports.map(item => {
      const date = item.date
        ? new Date(item.date).toLocaleString('id-ID')
        : 'Tanggal tidak tersedia';

      return `<li>
        <strong>Laporan kerja: ${Number(item.quantity)} pcs</strong>
        — ${escapeHTML(item.note || 'Tanpa keterangan')}
        <br><small>${escapeHTML(date)}</small>
      </li>`;
    }),

    ...(legacyQuantity > 0
      ? [`<li>${legacyQuantity} pcs — Setoran lama (detail belum tercatat)</li>`]
      : []),

    ...history.map(item => {
      const date = item.date
        ? new Date(item.date).toLocaleString('id-ID')
        : 'Tanggal tidak tersedia';

      return `<li>
        <strong>Setoran fisik: ${Number(item.quantity)} pcs</strong>
        <br><small>${escapeHTML(date)}</small>
      </li>`;
    })
  ].join('');

  const workerName = worker?.name || 'Pekerja tidak ditemukan';

  mainAction.style.display = 'none';

  content.innerHTML = `
    <section class="job-card-page">

      <button type="button" class="job-card-back" id="backToJobList">
        <span>‹</span> Kembali ke daftar pekerjaan
      </button>

      <article class="job-detail-card">

        <div class="job-detail-heading">
          <div class="job-contact-avatar">
            ${escapeHTML(workerName.split(/\s+/)
              .map(part => part[0] || '')
              .slice(0, 2).join('').toUpperCase())}
          </div>

          <div>
            <small>DETAIL PEKERJAAN</small>
            <h2>${escapeHTML(workerName)}</h2>
            <p>${escapeHTML(job.product)} · ${escapeHTML(job.type)}</p>
          </div>
        </div>

        <div class="job-detail-grid">
          <div class="job-detail-field">
            <small>Pekerja</small>
            <strong>${escapeHTML(workerName)}</strong>
          </div>

          <div class="job-detail-field">
            <small>Barang</small>
            <strong>${escapeHTML(job.product)}</strong>
          </div>

          <div class="job-detail-field">
            <small>Jumlah</small>
            <strong>${Number(job.quantity)} pcs</strong>
          </div>

          <div class="job-detail-field">
            <small>Hasil dilaporkan</small>
            <strong>${reportedQuantity} pcs</strong>
          </div>

          <div class="job-detail-field">
            <small>Sisa</small>
            <strong>${remaining} pcs</strong>
          </div>

          <div class="job-detail-field">
            <small>Upah</small>
            <strong>Rp ${Math.round(calculateJobPay(job))
              .toLocaleString('id-ID')}</strong>
          </div>
        </div>

        <div class="job-detail-status">
          <span>Status pekerjaan</span>
          <strong class="status ${reportedDone || remaining === 0
            ? 'done' : 'progress'}">${escapeHTML(status)}</strong>
        </div>


        <button type="button" class="job-card-back"
          id="editJobDetail" style="margin-top:16px">
          ✎ Edit Detail Pekerjaan
        </button>

        <details class="job-detail-history">
          <summary>Riwayat pekerjaan</summary>
          ${historyHTML
            ? `<ul>${historyHTML}</ul>`
            : '<small>Belum ada riwayat laporan atau setoran.</small>'}
        </details>

      </article>
    </section>
  `;

  document.getElementById('backToJobList')
    ?.addEventListener('click', renderJobs);

  document.getElementById('editJobDetail')
    ?.addEventListener('click', () => editJobDetail(id));

}


function jobHasLockedPayroll(job) {
  const workerId = String(job.workerId);
  const reports = Array.isArray(job.workReports)
    ? job.workReports : [];

  const dates = reports.map(report => report.date);

  if (!reports.length && job.createdAt) {
    dates.push(job.createdAt);
  }

  const paidData = payrollPaidData();

  return dates.some(value => {
    const date = payrollDate(value);
    if (!date) return false;

    const period = payrollPeriod(payrollISO(date));

    return payrollIsArchived(period.key) ||
      !!paidData[period.key]?.[workerId];
  });
}


function editJobDetail(id) {
  const job = jobs.find(item => item.id === id);
  if (!job) return;

  if (jobHasLockedPayroll(job)) {
    alert('Detail tidak bisa diedit karena periode pekerjaan sudah dibayar atau tutup buku.');
    return;
  }

  document.getElementById('editJobModal')?.remove();

  const workerOptions = workers.map(worker => `
    <option value="${escapeHTML(worker.id)}"
      ${String(worker.id) === String(job.workerId) ? 'selected' : ''}>
      ${escapeHTML(worker.name || 'Tanpa nama')}
    </option>
  `).join('');

  const modal = document.createElement('div');
  modal.id = 'editJobModal';
  modal.className = 'worker-modal-overlay';

  modal.innerHTML = `
    <section class="worker-modal">
      <div class="worker-modal-head">
        <div>
          <span class="quick-modal-kicker">KONVEKSIBOS / EDIT</span>
          <h2>Edit Detail Pekerjaan</h2>
          <p>Perubahan tidak menghapus riwayat pekerjaan.</p>
        </div>
        <button type="button" class="quick-close"
          id="closeEditJob">×</button>
      </div>

      <form id="editJobForm">
        <label>Pekerja</label>
        <select name="workerId" required>
          ${workerOptions}
        </select>

        <label>Nama barang</label>
        <input name="product" required
          value="${escapeHTML(job.product || '')}">

        <label>Jenis pekerjaan</label>
        <input name="type" required
          value="${escapeHTML(job.type || '')}">

        <label>Jumlah barang (pcs)</label>
        <input name="quantity" type="number" min="1" step="1"
          required value="${Number(job.quantity) || 0}">

        <label>Satuan tarif</label>
        <select name="unit" required>
          <option value="pcs" ${job.unit !== 'lusin' ? 'selected' : ''}>Per pcs</option>
          <option value="lusin" ${job.unit === 'lusin' ? 'selected' : ''}>Per lusin</option>
        </select>

        <label>Tarif upah (Rp)</label>
        <input name="rate" type="number" min="0" step="1"
          required value="${Number(job.rate) || 0}">

        <button type="submit" class="primary-button"
          style="width:100%;margin-top:16px">
          Simpan Perubahan
        </button>
      </form>
    </section>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();

  document.getElementById('closeEditJob')
    ?.addEventListener('click', close);

  modal.addEventListener('click', event => {
    if (event.target === modal) close();
  });

  document.getElementById('editJobForm')
    ?.addEventListener('submit', event => {
      event.preventDefault();

      if (jobHasLockedPayroll(job)) {
        alert('Periode pekerjaan sudah dikunci oleh pembayaran.');
        close();
        return;
      }

      const form = event.currentTarget;
      const data = new FormData(form);

      const quantity = Number(data.get('quantity'));
      const rate = Number(data.get('rate'));

      const reports = Array.isArray(job.workReports)
        ? job.workReports : [];

      const reported = reports.reduce((sum, report) =>
        sum + (Number(report.quantity) || 0), 0);

      const returned = Number(job.returned || 0);

      if (!Number.isInteger(quantity) || quantity < 1) {
        alert('Jumlah barang harus berupa bilangan bulat positif.');
        return;
      }

      if (quantity < Math.max(reported, returned)) {
        alert('Jumlah barang tidak boleh lebih kecil dari hasil laporan atau setoran.');
        return;
      }

      if (!Number.isFinite(rate) || rate < 0) {
        alert('Tarif upah tidak valid.');
        return;
      }

      if (!confirm('Simpan perubahan detail pekerjaan ini?')) return;

      job.workerId = String(data.get('workerId'));
      job.product = String(data.get('product')).trim();
      job.type = String(data.get('type')).trim();
      job.quantity = quantity;
      job.unit = String(data.get('unit'));
      job.rate = rate;

      saveJobs();
      close();
      renderJobCard(id);
    });
}


function recordDeposit(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;

  document.getElementById('depositModal')?.remove();

  const remaining = Math.max(
    0,
    Number(job.quantity) - Number(job.returned || 0)
  );

  if (remaining <= 0) return;

  const modal = document.createElement('div');
  modal.id = 'depositModal';
  modal.className = 'worker-modal-overlay';

  modal.innerHTML = `
    <section class="worker-modal deposit-modal">
      <div class="worker-modal-head">
        <div>
          <span class="quick-modal-kicker">KONVEKSIBOS / SETORAN</span>
          <h2>Catat setoran</h2>
          <p>Masukkan jumlah barang yang dikembalikan</p>
        </div>
        <button type="button" class="quick-close"
          id="closeDepositModal">×</button>
      </div>

      <form id="depositForm" class="worker-form">
        <div class="deposit-info">
          <small>SISA BARANG BELUM DISETOR</small>
          <strong>${remaining.toLocaleString('id-ID')} <span>PCS</span></strong>
        </div>

        <label>
          Jumlah setoran (pcs)
          <input id="depositQuantity" type="number"
            min="1" max="${remaining}" step="1"
            required inputmode="numeric"
            placeholder="Masukkan jumlah pcs">
        </label>

        <small id="depositError" class="deposit-error"></small>

        <div class="worker-form-actions">
          <button class="primary" type="submit">
            Simpan setoran
          </button>
          <button class="secondary" type="button"
            id="cancelDepositModal">Batal</button>
        </div>
      </form>
    </section>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();

  document.getElementById('closeDepositModal')
    .addEventListener('click', close);

  document.getElementById('cancelDepositModal')
    .addEventListener('click', close);

  modal.addEventListener('click', event => {
    if (event.target === modal) close();
  });

  const input = document.getElementById('depositQuantity');
  const error = document.getElementById('depositError');

  input.focus();

  document.getElementById('depositForm')
    .addEventListener('submit', event => {
      event.preventDefault();

      const quantity = Number(input.value);

      if (!Number.isInteger(quantity) ||
          quantity <= 0 || quantity > remaining) {
        error.textContent =
          `Masukkan jumlah antara 1 sampai ${remaining} pcs.`;
        input.focus();
        return;
      }

      if (!Array.isArray(job.depositHistory)) {
        job.depositHistory = [];
      }

      job.returned = Number(job.returned || 0) + quantity;

      job.depositHistory.push({
        id: crypto.randomUUID(),
        quantity,
        date: new Date().toISOString()
      });

      saveJobs();
      close();

      if (document.getElementById('jobCardDeposit')) {
        renderJobCard(id);
      } else {
        renderJobTable();
      }
    });
}

function openJobForm() {
  navigate('Pekerjaan');

  const form = document.getElementById('jobForm');

  if (form) {
    form.style.display = 'grid';
    mainAction.textContent = 'Tutup form';
    document.getElementById('jobWorker')?.focus();
  }
}


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

  const allWorkers = Array.isArray(workers) ? workers : [];

  content.innerHTML = `
    <section class="panel payroll-panel payroll-simple">
      <div class="payroll-simple-heading">
        <div>
          <span class="payroll-kicker">PENGELOLAAN PEKERJA</span>
          <h3>Payroll</h3>
          <p>Kelola gaji dan kasbon setiap pekerja.</p>
        </div>
        <span class="payroll-worker-count">
          ${allWorkers.length} pekerja
        </span>
      </div>

      <div class="payroll-simple-list">
        ${allWorkers.map(worker => `
          <div class="payroll-segment">
            <button type="button"
              class="payroll-segment-name"
              onclick="renderWorkerProfile('${payrollEscape(worker.id)}')">
              <span class="payroll-segment-avatar">
                ${payrollEscape((worker.name || '?').trim().charAt(0).toUpperCase())}
              </span>
              <span>${payrollEscape(worker.name || 'Tanpa nama')}</span>
            </button>

            <button type="button" class="payroll-segment-action"
              onclick="renderPayrollPayment('${payrollEscape(worker.id)}')">
              Bayar Gaji
            </button>

            <button type="button" class="payroll-segment-action">
              Kasbon
            </button>

            <button type="button"
              class="payroll-segment-more"
              aria-label="Detail ${payrollEscape(worker.name || 'pekerja')}">
              ›
            </button>
          </div>
        `).join('') || `
          <div class="payroll-simple-empty">
            Belum ada pekerja terdaftar.
          </div>
        `}
      </div>
    </section>
  `;
}

function renderPayrollPayment(workerId) {
  const worker = workers.find(
    item => String(item.id) === String(workerId)
  );
  if (!worker) return;

  const rows = [];

  jobs
    .filter(job => String(job.workerId) === String(workerId))
    .forEach(job => {
      const reports = Array.isArray(job.workReports)
        ? job.workReports
        : [];

      reports.forEach(report => {
        const pcs = Number(report.quantity) || 0;
        const rate = Number(job.rate) || 0;

        const pricePerDozen = job.unit === 'lusin'
          ? rate
          : rate * 12;

        const total = (pcs / 12) * pricePerDozen;

        rows.push({
          date: report.date,
          product: job.product || '-',
          pcs,
          pricePerDozen,
          total,
          status: report.note || '-'
        });
      });
    });

  rows.sort((a, b) =>
    String(a.date || '').localeCompare(String(b.date || ''))
  );

  const grandTotal = rows.reduce(
    (sum, row) => sum + row.total,
    0
  );

  const formatDate = value => {
    const date = payrollDate(value);
    return date
      ? payrollISO(date).split('-').reverse().join('/')
      : '-';
  };

  mainAction.style.display = 'none';
  pageTitle.textContent = 'Bayar Gaji';
  breadcrumb.textContent = 'Payroll / Bayar Gaji';
  description.textContent = 'Rincian upah berdasarkan laporan pekerjaan.';

  content.innerHTML = `
    <section class="panel payroll-panel">
      <button type="button" class="secondary"
        onclick="renderPayroll()">
        ← Kembali ke Payroll
      </button>

      <div class="payroll-simple-heading">
        <div>
          <span class="payroll-kicker">PEMBAYARAN GAJI</span>
          <h3>${payrollEscape(worker.name || 'Pekerja')}</h3>
          <p>
            ${rows.length} catatan pekerjaan |
            Total pekerjaan: ${jobs.length} |
            Pekerjaan milik pekerja ini:
            ${jobs.filter(j => String(j.workerId) === String(workerId)).length} |
            Laporan:
            ${jobs.filter(j => String(j.workerId) === String(workerId))
              .reduce((n, j) => n + (Array.isArray(j.workReports) ? j.workReports.length : 0), 0)}
          </p>
        </div>
      </div>

      <div style="overflow-x:auto">
        <table class="payroll-payment-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama Barang</th>
              <th>PCS</th>
              <th>Status</th>
              <th>Harga/Lusin</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${formatDate(row.date)}</td>
                <td>${payrollEscape(row.product)}</td>
                <td>${row.pcs.toLocaleString('id-ID')}</td>
                <td>${payrollEscape(row.status)}</td>
                <td>${payrollMoney(row.pricePerDozen)}</td>
                <td><strong>${payrollMoney(row.total)}</strong></td>
              </tr>
            `).join('') || `
              <tr>
                <td colspan="6" style="text-align:center;padding:24px">
                  Belum ada laporan pekerjaan.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <div class="payroll-total-card">
        <span>TOTAL GAJI</span>
        <strong>${payrollMoney(grandTotal)}</strong>
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

renderDashboard();


// MODUL CATATAN KEKURANGAN
function renderKekurangan() {
  mainAction.style.display = 'none';

  const records = [];

  jobs.forEach(job => {
    const reports = Array.isArray(job.workReports) ? job.workReports : [];
    const worker = workers.find(w => String(w.id) === String(job.workerId));

    reports.forEach(report => {
      const shortage = Number(report.shortageQuantity) || 0;
      if (shortage <= 0) return;

      records.push({
        date: report.date,
        worker: worker?.name || 'Pekerja tidak ditemukan',
        product: job.product || '-',
        type: job.type || '-',
        note: report.note || 'Kekurangan',
        quantity: shortage
      });
    });
  });

  records.sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  const total = records.reduce((sum, item) => sum + item.quantity, 0);

  content.innerHTML = `
    <section class="panel shortage-panel">
      <div class="shortage-heading">
        <div>
          <h2>Catatan Kekurangan</h2>
          <p>Pengingat barang yang masih kurang dari laporan pekerjaan.</p>
        </div>
        <div class="shortage-summary">
          <strong>${records.length}</strong>
          <small>Catatan</small>
          <strong>${total.toLocaleString('id-ID')} PCS</strong>
          <small>Total kekurangan</small>
        </div>
      </div>

      <div class="shortage-list">
        ${records.length ? records.map(item => `
          <article class="shortage-item">
            <div class="shortage-item-top">
              <strong>${payrollEscape(item.worker)}</strong>
              <span>${item.date ? new Date(item.date).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : '-'}</span>
            </div>
            <div class="shortage-product">
              ${payrollEscape(item.product)} · ${payrollEscape(item.type)}
            </div>
            <div class="shortage-item-bottom">
              <span>${payrollEscape(item.note)}</span>
              <strong>${item.quantity.toLocaleString('id-ID')} PCS</strong>
            </div>
          </article>
        `).join('') : `
          <div class="empty-state">
            Belum ada catatan kekurangan barang.
          </div>
        `}
      </div>
    </section>
  `;
}


// MODUL KEUANGAN: REKAP PEMBAYARAN
function renderKeuangan() {
  mainAction.style.display = 'none';

  const period = payrollPeriod(payrollWeekDate);
  const status = payrollPaidData()[period.key] || {};

  const summaries = workers.map(worker => {
    const rows = payrollRows(worker.id, period);
    return {
      worker,
      total: rows.reduce((sum, row) => sum + (Number(row.pay) || 0), 0),
      paid: status[worker.id] === true
    };
  }).filter(x => x.total > 0);

  const paid = summaries.filter(x => x.paid);
  const unpaid = summaries.filter(x => !x.paid);
  const sum = list => list.reduce((n, x) => n + x.total, 0);

  const listHTML = (list, empty) => list.length ? list.map(x => `
    <article class="finance-item">
      <div>
        <strong>${payrollEscape(x.worker.name || 'Tanpa nama')}</strong>
        <small>${payrollEscape(x.worker.role || x.worker.position || 'Pekerja')}</small>
      </div>
      <strong>${payrollMoney(x.total)}</strong>
    </article>
  `).join('') : `<p class="finance-empty">${empty}</p>`;

  content.innerHTML = `
    <section class="finance-panel">
      <div class="finance-period">
        <div>
          <h2>Keuangan</h2>
          <p>Rekap pembayaran upah pekerja.</p>
        </div>
        <label>Periode minggu
          <input type="date" value="${payrollWeekDate}"
            onchange="payrollWeekDate=this.value;renderKeuangan()">
        </label>
      </div>

      <div class="finance-summary-grid">
        <div class="finance-summary paid">
          <small>Sudah Dibayarkan</small>
          <strong>${payrollMoney(sum(paid))}</strong>
          <span>${paid.length} pekerja</span>
        </div>
        <div class="finance-summary unpaid">
          <small>Belum Dibayarkan</small>
          <strong>${payrollMoney(sum(unpaid))}</strong>
          <span>${unpaid.length} pekerja</span>
        </div>
      </div>

      <div class="finance-section">
        <h3>Sudah Dibayarkan</h3>
        ${listHTML(paid, 'Belum ada pembayaran tercatat.')}
        <div class="finance-subtotal">
          Total dibayarkan <strong>${payrollMoney(sum(paid))}</strong>
        </div>
      </div>

      <div class="finance-section">
        <h3>Belum Dibayarkan</h3>
        ${listHTML(unpaid, 'Tidak ada upah yang belum dibayarkan.')}
        <div class="finance-subtotal">
          Total belum dibayarkan <strong>${payrollMoney(sum(unpaid))}</strong>
        </div>
      </div>

      <p class="finance-note">
        Mengikuti status Payroll periode ${period.start} – ${period.end}.
      </p>
    </section>
  `;
}


function renderLaporan(selectedMonth) {
  mainAction.style.display = 'none';

  const now = new Date();
  const currentMonth = selectedMonth || (
    now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  );

  const shippedJobs = jobs.filter(job => {
    const date = job.monitorDates && job.monitorDates.dikirim;
    if (!date) return false;

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return false;

    const month = parsed.getFullYear() + '-' +
      String(parsed.getMonth() + 1).padStart(2, '0');

    return month === currentMonth;
  }).sort((a, b) =>
    new Date(b.monitorDates.dikirim) - new Date(a.monitorDates.dikirim)
  );

  const totalPCS = shippedJobs.reduce((sum, job) =>
    sum + Number(job.quantity || 0), 0
  );

  const monthLabel = new Date(currentMonth + '-01T00:00:00')
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const details = shippedJobs.length ? shippedJobs.map(job => {
    const worker = workers.find(w => String(w.id) === String(job.workerId));
    const date = new Date(job.monitorDates.dikirim)
      .toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

    return `
      <tr>
        <td>${date}</td>
        <td>${job.product || '-'}</td>
        <td>${worker ? worker.name : '-'}</td>
        <td>${job.type || '-'}</td>
        <td>${Number(job.quantity || 0).toLocaleString('id-ID')} pcs</td>
      </tr>
    `;
  }).join('') : `
    <tr><td colspan="5" style="text-align:center;padding:24px">
      Belum ada pengiriman pada bulan ini
    </td></tr>
  `;

  content.innerHTML = `
    <section class="panel report-panel">
      <div class="panel-heading">
        <div>
          <h2>Laporan Pengiriman</h2>
          <p>Rekap barang yang sudah dikirim</p>
        </div>
        <input type="month" value="${currentMonth}"
          onchange="renderLaporan(this.value)">
      </div>

      <div class="report-summary">
        <div class="report-card">
          <span>Total PCS Terkirim</span>
          <strong>${totalPCS.toLocaleString('id-ID')}</strong>
          <small>PCS · ${monthLabel}</small>
        </div>
        <div class="report-card">
          <span>Jumlah Pengiriman</span>
          <strong>${shippedJobs.length}</strong>
          <small>Data pekerjaan terkirim</small>
        </div>
      </div>

      <div class="panel-heading report-detail-heading">
        <div>
          <h2>Rincian Pengiriman</h2>
          <p>${monthLabel}</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tanggal Kirim</th>
              <th>Barang</th>
              <th>Pekerja</th>
              <th>Jenis</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>${details}</tbody>
        </table>
      </div>
    </section>
  `;
}

// ==========================================
// KONVEKSIBOS CLOUD BRIDGE
// ==========================================
window.KBApp = {
  getData() {
    return { workers, jobs, currentPage };
  },

  setCloudData(data) {
    workers = data.workers || [];
    jobs = data.jobs || [];

    localStorage.setItem('kb_workers', JSON.stringify(workers));
    localStorage.setItem('kb_jobs', JSON.stringify(jobs));

    navigate('Dashboard');
  },

  cloudReady() {
    return {
      workers: [...workers],
      jobs: [...jobs]
    };
  },

  refresh() {
    navigate(currentPage);
  }
};
