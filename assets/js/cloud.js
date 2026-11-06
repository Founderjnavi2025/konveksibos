(async function () {
  const app = document.querySelector('.app');

  if (!window.sb) {
    alert('Koneksi Supabase belum tersedia. Periksa supabase.js');
    return;
  }

  const sb = window.sb;
  let roomId = null;
  let currentUser = null;

  const panel = document.createElement('div');
  panel.id = 'kbAuth';
  panel.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    background:#0c1018;color:white;
    display:flex;align-items:center;justify-content:center;
    padding:20px;font-family:Arial,sans-serif;
  `;

  panel.innerHTML = `
    <div style="width:100%;max-width:390px;background:#171e2b;
      padding:26px;border-radius:18px">
      <h1 style="margin:0 0 5px">KonveksiBos</h1>
      <p style="color:#9ba9bd">Business Workspace</p>

      <div id="kbAuthContent">
        <h3>Masuk ke akun</h3>
        <input id="kbEmail" type="email" placeholder="Email"
          style="width:100%;padding:13px;margin:7px 0;box-sizing:border-box">
        <input id="kbPassword" type="password" placeholder="Password"
          style="width:100%;padding:13px;margin:7px 0;box-sizing:border-box">
        <button id="kbLogin" style="width:100%;padding:13px;margin-top:10px">
          Masuk
        </button>
        <button id="kbRegister" style="width:100%;padding:13px;margin-top:8px">
          Daftar akun
        </button>
        <p id="kbMessage" style="color:#ffbd70"></p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  if (app) app.style.display = 'none';

  const message = (value) => {
    const el = document.getElementById('kbMessage');
    if (el) el.textContent = value;
    else console.log('[KonveksiBos]', value);
  };

  async function loadWorkspace(user) {
    currentUser = user;

    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('platform_role,full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data: memberships, error: memberError } = await sb
      .from('room_members')
      .select('room_id,role')
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    if (!memberships || !memberships.length) {
      showCreateRoom(profile?.platform_role === 'super_admin');
      return;
    }

    const { data: rooms, error: roomError } = await sb
      .from('rooms')
      .select('*')
      .in('id', memberships.map(x => x.room_id));

    if (roomError) throw roomError;

    if (!rooms || !rooms.length) {
      showCreateRoom(profile?.platform_role === 'super_admin');
      return;
    }

    showRoomPicker(rooms, memberships, profile);
  }

  function showCreateRoom(isSuperAdmin) {
    document.getElementById('kbAuthContent').innerHTML = `
      <h3>Buat workspace konveksi</h3>
      <input id="kbRoomName" placeholder="Nama usaha konveksi"
        style="width:100%;padding:13px;box-sizing:border-box">
      <button id="kbCreateRoom" style="width:100%;padding:13px;margin-top:12px">
        Buat Workspace
      </button>
      <p id="kbMessage" style="color:#ffbd70"></p>
      ${isSuperAdmin ? '<p>SUPER ADMIN PLATFORM</p>' : ''}
      <button id="kbLogout">Keluar</button>
    `;

    document.getElementById('kbCreateRoom').onclick = async () => {
      try {
        const name = document.getElementById('kbRoomName').value.trim();
        if (!name) return message('Nama usaha wajib diisi.');

        const { data, error } = await sb
          .from('rooms')
          .insert({ name, owner_id: currentUser.id })
          .select()
          .single();

        if (error) throw error;
        await activateRoom(data.id);
      } catch (e) {
        message(e.message);
      }
    };

    document.getElementById('kbLogout').onclick = () => sb.auth.signOut();
  }

  function showRoomPicker(rooms, memberships, profile) {
    document.getElementById('kbAuthContent').innerHTML = `
      <h3>Pilih workspace</h3>
      ${rooms.map(room => `
        <button data-room="${room.id}"
          style="display:block;width:100%;padding:14px;margin:8px 0">
          ${room.name}
        </button>
      `).join('')}
      ${profile?.platform_role === 'super_admin'
        ? '<p>SUPER ADMIN PLATFORM</p>' : ''}
      <button id="kbLogout">Keluar</button>
    `;

    document.querySelectorAll('[data-room]').forEach(button => {
      button.onclick = async () => {
        try {
          await activateRoom(button.dataset.room);
        } catch (e) {
          message('Gagal membuka workspace: ' + e.message);
        }
      };
    });

    document.getElementById('kbLogout').onclick = () => sb.auth.signOut();
  }

  async function activateRoom(id) {
    roomId = id;
    message('Mengambil data cloud...');

    let [workerResult, jobResult] = await Promise.all([
      sb.from('workers').select('*').eq('room_id', id),
      sb.from('jobs').select('*').eq('room_id', id)
    ]);

    if (workerResult.error) throw workerResult.error;
    if (jobResult.error) throw jobResult.error;

    // MIGRASI DATA LOKAL KE CLOUD JIKA TABEL MASIH KOSONG
    const localData = window.KBApp.cloudReady();

    if (!workerResult.data.length && localData.workers.length) {
      await saveWorkers();
    }

    if (!jobResult.data.length && localData.jobs.length) {
      await saveJobs();
    }

    // Ambil ulang data setelah migrasi
    [workerResult, jobResult] = await Promise.all([
      sb.from('workers').select('*').eq('room_id', id),
      sb.from('jobs').select('*').eq('room_id', id)
    ]);

    if (workerResult.error) throw workerResult.error;
    if (jobResult.error) throw jobResult.error;

    const cloudWorkers = (workerResult.data || []).map(w => ({
      ...w.details,
      id: w.id,
      name: w.name,
      phone: w.phone || '',
      role: w.role,
      status: w.details?.status || (w.is_active ? 'Aktif' : 'Nonaktif')
    }));

    const cloudJobs = (jobResult.data || []).map(j => ({
      ...j.details,
      id: j.id,
      workerId: j.assigned_worker_id,
      product: j.product_name,
      quantity: Number(j.quantity),
      stage: j.stage,
      unit: j.unit
    }));

    window.KBApp.setCloudData({
      workers: cloudWorkers,
      jobs: cloudJobs
    });

    panel.remove();
    if (app) app.style.display = '';

    window.KBCloud = {
      roomId,
      user: currentUser,
      saveWorkers,
      saveJobs
    };

    console.log('KonveksiBos cloud active:', roomId);
  }

  async function saveWorkers() {
    if (!roomId) return;

    const workers = window.KBApp.cloudReady().workers;

    const rows = workers.map(w => ({
      id: w.id,
      room_id: roomId,
      name: w.name,
      phone: w.phone || null,
      role: w.role,
      is_active: w.status !== 'Nonaktif',
      details: w
    }));

    if (rows.length) {
      const { error } = await sb.from('workers').upsert(rows);
      if (error) {
        console.error('Worker sync:', error.message);
        return;
      }
    }

    let deletion = sb.from('workers').delete().eq('room_id', roomId);

    if (rows.length) {
      deletion = deletion.not(
        'id',
        'in',
        '(' + rows.map(w => w.id).join(',') + ')'
      );
    }

    const { error } = await deletion;
    if (error) console.error('Worker delete sync:', error.message);
  }

  async function saveJobs() {
    if (!roomId) return;

    const jobs = window.KBApp.cloudReady().jobs;

    const rows = jobs.map(j => ({
      id: j.id,
      room_id: roomId,
      product_name: j.product,
      stage: j.stage || 'monitor',
      quantity: Number(j.quantity || 0),
      unit: j.unit || 'pcs',
      assigned_worker_id: j.workerId || null,
      details: j
    }));

    if (rows.length) {
      const { error } = await sb.from('jobs').upsert(rows);
      if (error) {
        console.error('Job sync:', error.message);
        return;
      }
    }

    let deletion = sb.from('jobs').delete().eq('room_id', roomId);

    if (rows.length) {
      deletion = deletion.not(
        'id',
        'in',
        '(' + rows.map(j => j.id).join(',') + ')'
      );
    }

    const { error } = await deletion;
    if (error) console.error('Job delete sync:', error.message);
  }

  document.getElementById('kbLogin').onclick = async () => {
    try {
      const email = document.getElementById('kbEmail').value.trim();
      const password = document.getElementById('kbPassword').value;

      const { data, error } = await sb.auth.signInWithPassword({
        email, password
      });

      if (error) throw error;
      await loadWorkspace(data.user);
    } catch (e) {
      message(e.message);
    }
  };

  document.getElementById('kbRegister').onclick = async () => {
    try {
      const email = document.getElementById('kbEmail').value.trim();
      const password = document.getElementById('kbPassword').value;

      if (password.length < 6) {
        return message('Password minimal 6 karakter.');
      }

      const { data, error } = await sb.auth.signUp({
        email, password
      });

      if (error) throw error;

      if (data.session) {
        await loadWorkspace(data.user);
      } else {
        message('Registrasi berhasil. Periksa email untuk konfirmasi, lalu login.');
      }
    } catch (e) {
      message(e.message);
    }
  };

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') location.reload();
  });

  try {
    const { data, error } = await sb.auth.getSession();
    if (error) throw error;

    if (data.session) {
      await loadWorkspace(data.session.user);
    }
  } catch (e) {
    message(e.message);
  }
})();
