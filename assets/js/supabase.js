(function () {
  const SUPABASE_URL = 'https://pbwkjdtqhzmqtcecsjot.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBid2tqZHRxaHptcXRjZWNzam90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjI0NDAsImV4cCI6MjEwOTUzODQ0MH0.22jUMqyd1UoECMGzD1eB9clcHdS-N3gmySRA4yQW-ZM';

  if (!window.supabase) {
    console.error('Supabase SDK belum dimuat');
    return;
  }

  if (
    SUPABASE_URL === 'ISI_PROJECT_URL' ||
    SUPABASE_ANON_KEY === 'ISI_PUBLISHABLE_OR_ANON_KEY'
  ) {
    console.warn('Konfigurasi Supabase belum diisi');
    return;
  }

  window.sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  console.log('KonveksiBos: Supabase connected');
})();
