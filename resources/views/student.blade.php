<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <script>
    window.addEventListener('error', function(e) {
      alert('JS Error: ' + e.message + ' in ' + e.filename + ' at line ' + e.lineno);
    });
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CounselSpace.Ai - Teman Kesehatan Mentalmu</title>
  <meta name="description" content="Aplikasi konseling digital untuk membantu siswa mengatasi FOMO dan menjaga kesehatan mental">
  <meta name="theme-color" content="#0F172A">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/style.css') }}?v=1.3">
</head>
<body>

  <div class="app-container" id="app">

    <!-- ==================== SPLASH PAGE ==================== -->
    <section class="page page-active" id="page-splash">
      <div class="splash-particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>
      <div class="splash-logo">🧠💚</div>
      <h1 class="splash-title">CounselSpace.Ai</h1>
      <p class="splash-tagline">Teman Kesehatan Mentalmu 🧠💚</p>
      <button class="btn btn-primary btn-lg btn-pill splash-btn" onclick="App.router.navigate('dashboard')">
        Mulai Sekarang ✨
      </button>
    </section>

    <!-- ==================== LOGIN/REGISTER PAGE ==================== -->
    <section class="page" id="page-login" style="padding-top: var(--space-xl);">
      <div class="card login-card" id="login-card-view" style="max-width:400px; margin:0 auto;">
        <div class="login-header" style="text-align:center; margin-bottom:var(--space-lg);">
          <div class="login-logo" style="font-size:3rem; margin-bottom:var(--space-sm);">🧠💚</div>
          <h2>Masuk ke CounselSpace</h2>
          <p class="text-muted" style="font-size:var(--font-sm); margin-top:var(--space-xs);">Akses penuh fitur self-check dan konseling</p>
        </div>
        <form id="student-login-form" onsubmit="event.preventDefault(); App.auth.login();">
          <div class="form-group">
            <label class="form-label">Email atau Username</label>
            <input type="text" class="form-input" id="student-login-username" placeholder="cth: siswa@counselspace.ai" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="student-login-password" placeholder="Masukkan password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg mt-md" style="margin-top:var(--space-md);">Masuk ✨</button>
        </form>
        <p class="auth-toggle-text" style="text-align:center; margin-top:var(--space-lg); font-size:var(--font-sm); color:var(--text-secondary);">
          Belum punya akun? <a href="javascript:void(0)" onclick="App.auth.toggleForm('register')" style="color:var(--teal-400); font-weight:600;">Daftar di sini</a>
        </p>
      </div>

      <div class="card login-card" id="register-card-view" style="max-width:400px; margin:0 auto; display:none;">
        <div class="login-header" style="text-align:center; margin-bottom:var(--space-lg);">
          <div class="login-logo" style="font-size:3rem; margin-bottom:var(--space-sm);">🧠💚</div>
          <h2>Daftar Akun Baru</h2>
          <p class="text-muted" style="font-size:var(--font-sm); margin-top:var(--space-xs);">Mulai perjalanan kesehatan mentalmu</p>
        </div>
        <form id="student-register-form" onsubmit="event.preventDefault(); App.auth.register();">
          <div class="form-group">
            <label class="form-label">Nama Lengkap</label>
            <input type="text" class="form-input" id="student-register-name" placeholder="cth: Budi Pratama" required>
          </div>
          <div class="form-group">
            <label class="form-label">Kelas</label>
            <input type="text" class="form-input" id="student-register-class" placeholder="cth: XII MIPA 2" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="student-register-email" placeholder="cth: budi@counselspace.ai" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password (Min. 6 Karakter)</label>
            <input type="password" class="form-input" id="student-register-password" placeholder="Buat password baru" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg mt-md" style="margin-top:var(--space-md);">Daftar Sekarang ✨</button>
        </form>
        <p class="auth-toggle-text" style="text-align:center; margin-top:var(--space-lg); font-size:var(--font-sm); color:var(--text-secondary);">
          Sudah punya akun? <a href="javascript:void(0)" onclick="App.auth.toggleForm('login')" style="color:var(--teal-400); font-weight:600;">Masuk di sini</a>
        </p>
      </div>
    </section>

    <!-- ==================== DASHBOARD PAGE ==================== -->
    <section class="page" id="page-dashboard">
      <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-lg);">
        <div>
          <h1 class="greeting-text" id="greeting-text">Halo, Sobat! 👋</h1>
          <p class="greeting-date" id="greeting-date"></p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.auth.logout()" style="padding: 6px 12px; font-size: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); display: inline-flex; align-items: center; gap: 4px;">🚪 Keluar</button>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats" id="quick-stats">
        <!-- Filled dynamically -->
      </div>

      <!-- Feature Grid -->
      <div class="feature-grid">
        <div class="feature-card" onclick="App.router.navigate('screening')">
          <span class="feature-icon">🧠</span>
          <div class="feature-title">Self-Check</div>
          <div class="feature-desc">Cek tingkat FOMO kamu</div>
        </div>
        <div class="feature-card" onclick="App.router.navigate('edu')">
          <span class="feature-icon">📚</span>
          <div class="feature-title">Edu Corner</div>
          <div class="feature-desc">Konten edukasi digital</div>
        </div>
        <div class="feature-card" onclick="App.router.navigate('detox')">
          <span class="feature-icon">🧘</span>
          <div class="feature-title">Digital Detox</div>
          <div class="feature-desc">Istirahat dari layar</div>
        </div>
        <div class="feature-card" onclick="App.router.navigate('chat')">
          <span class="feature-icon">💬</span>
          <div class="feature-title">Chat BK</div>
          <div class="feature-desc">Curhat aman & anonim</div>
        </div>
      </div>

      <!-- History -->
      <div class="section-title">📊 Riwayat Skrining</div>
      <div class="history-list" id="history-list">
        <!-- Filled dynamically -->
      </div>
    </section>

    <!-- ==================== SCREENING PAGE ==================== -->
    <section class="page" id="page-screening">
      <!-- Identity Form (shown first) -->
      <div id="screening-identity">
        <div class="card identity-card">
          <div class="identity-icon">📋</div>
          <h2>Sebelum Mulai</h2>
          <p class="text-muted mt-sm mb-lg" style="text-align:center;">Isi data singkat ini (opsional) agar hasilmu tersimpan.</p>
          <div class="form-group">
            <label class="form-label">Nama (opsional)</label>
            <input type="text" class="form-input" id="input-name" placeholder="Contoh: Andi">
          </div>
          <div class="form-group">
            <label class="form-label">Kelas (opsional)</label>
            <input type="text" class="form-input" id="input-class" placeholder="Contoh: XII IPA 3">
          </div>
          <button class="btn btn-primary btn-block btn-lg mt-lg" onclick="App.screening.startQuiz()">
            Mulai Self-Check 🧠
          </button>
          <button class="btn btn-secondary btn-block mt-sm" onclick="App.router.navigate('dashboard')">
            Kembali
          </button>
        </div>
      </div>

      <!-- Quiz Section (hidden initially) -->
      <div id="screening-quiz" class="hidden">
        <div class="screening-nav">
          <button class="screening-back" id="screening-back-btn" onclick="App.screening.prevQuestion()">
            ← Kembali
          </button>
          <span class="screening-counter" id="screening-counter">1 / 10</span>
        </div>
        <div class="screening-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="screening-progress-fill" style="width: 0%"></div>
          </div>
        </div>
        <div id="question-container">
          <!-- Filled dynamically -->
        </div>
      </div>
    </section>

    <!-- ==================== RESULT PAGE ==================== -->
    <section class="page" id="page-result">
      <div class="result-circle-wrap">
        <div class="result-circle">
          <svg viewBox="0 0 180 180">
            <circle class="circle-bg" cx="90" cy="90" r="78"></circle>
            <circle class="circle-fill" id="result-circle-fill" cx="90" cy="90" r="78"
              stroke-dasharray="490" stroke-dashoffset="490"></circle>
          </svg>
          <div class="result-score-text">
            <div class="result-score-number" id="result-score-number">0</div>
            <div class="result-score-label">SKOR</div>
          </div>
        </div>
      </div>

      <div class="result-category" id="result-category">
        <!-- Badge rendered dynamically -->
      </div>

      <p class="result-description" id="result-description">
        <!-- Description rendered dynamically -->
      </p>

      <div class="result-actions" id="result-actions">
        <!-- Buttons rendered dynamically -->
      </div>

      <button class="btn btn-secondary btn-block" onclick="App.router.navigate('dashboard')">
        🏠 Kembali ke Dashboard
      </button>
    </section>

    <!-- ==================== EDU CORNER PAGE ==================== -->
    <section class="page" id="page-edu">
      <h2 class="section-title">📚 Edu Corner</h2>

      <div class="edu-tabs" id="edu-tabs">
        <button class="edu-tab active" data-filter="semua">Semua</button>
        <button class="edu-tab" data-filter="video">🎬 Video</button>
        <button class="edu-tab" data-filter="poster">🖼️ Poster</button>
        <button class="edu-tab" data-filter="artikel">📖 Artikel</button>
      </div>

      <div class="edu-grid" id="edu-grid">
        <!-- Filled dynamically -->
      </div>
    </section>

    <!-- ==================== DETOX TIMER PAGE ==================== -->
    <section class="page" id="page-detox">
      <div class="detox-header">
        <h2>🧘 Digital Detox</h2>
        <p>Istirahatkan pikiran dari dunia digital</p>
      </div>

      <!-- Timer Circle -->
      <div class="timer-circle-wrap">
        <div class="timer-circle">
          <svg viewBox="0 0 220 220">
            <circle class="timer-bg" cx="110" cy="110" r="100"></circle>
            <circle class="timer-fill" id="timer-fill" cx="110" cy="110" r="100"
              stroke-dasharray="628.3" stroke-dashoffset="0"></circle>
          </svg>
          <div class="timer-text">
            <div class="timer-time" id="timer-time">05:00</div>
            <div class="timer-label" id="timer-label">SIAP</div>
          </div>
        </div>
      </div>

      <!-- Preset Times -->
      <div class="preset-times">
        <button class="preset-btn active" data-minutes="5" onclick="App.detox.setPreset(5, this)">5 min</button>
        <button class="preset-btn" data-minutes="10" onclick="App.detox.setPreset(10, this)">10 min</button>
        <button class="preset-btn" data-minutes="15" onclick="App.detox.setPreset(15, this)">15 min</button>
        <button class="preset-btn" data-minutes="30" onclick="App.detox.setPreset(30, this)">30 min</button>
      </div>

      <!-- Timer Controls -->
      <div class="timer-controls">
        <button class="btn btn-primary btn-pill" id="btn-timer-start" onclick="App.detox.start()">▶ Mulai</button>
        <button class="btn btn-secondary btn-pill" id="btn-timer-reset" onclick="App.detox.reset()">↺ Reset</button>
      </div>

      <!-- Breathing Exercise -->
      <div class="breathing-section">
        <h3>🫁 Latihan Pernapasan</h3>
        <div class="breathing-circle" id="breathing-circle">🌿</div>
        <div class="breathing-text" id="breathing-text">Tekan untuk mulai</div>
        <button class="btn btn-outline btn-sm btn-pill mt-md" id="btn-breathe" onclick="App.detox.toggleBreathing()">
          Mulai Bernapas
        </button>
      </div>

      <!-- Motivational Quote -->
      <div class="motivational-quote" id="motivational-quote">
        <div class="quote-icon">💡</div>
        <p id="quote-text">"Kamu tidak perlu melihat semua yang terjadi di dunia maya untuk bahagia."</p>
      </div>
    </section>

    <!-- ==================== CHAT PAGE ==================== -->
    <section class="page" id="page-chat">
      <!-- Chat Tabs -->
      <div class="chat-tabs">
        <button class="chat-tab active" data-tab="ai" onclick="App.chat.switchTab('ai')">🤖 AI Chatbot</button>
        <button class="chat-tab" data-tab="bk" onclick="App.chat.switchTab('bk')">👨‍🏫 Guru BK</button>
      </div>

      <!-- AI Chat Panel -->
      <div class="chat-panel active" id="chat-panel-ai">
        <div class="chat-messages" id="chat-messages-ai">
          <!-- Filled dynamically -->
        </div>
        <div class="quick-replies" id="quick-replies-ai">
          <!-- Filled dynamically -->
        </div>
        <div class="chat-input-bar">
          <input type="text" class="form-input" id="chat-input-ai" placeholder="Ketik pesanmu..." 
            onkeydown="if(event.key==='Enter')App.chat.sendAi()">
          <button class="btn-send" onclick="App.chat.sendAi()">➤</button>
        </div>
      </div>

      <!-- BK Chat Panel -->
      <div class="chat-panel" id="chat-panel-bk">
        <!-- Counselor List View (Shown first) -->
        <div id="bk-counselor-list-view" style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
          <p class="text-muted mb-md" style="font-size:0.8rem; padding: 0 0.5rem; margin-top: 0.5rem;">Pilih Guru BK untuk memulai percakapan:</p>
          <div class="counselor-list" id="counselor-list-container" style="flex:1; overflow-y:auto;">
            <!-- Filled dynamically -->
          </div>
        </div>

        <!-- Active Chat View (Hidden initially) -->
        <div id="bk-chat-active-view" class="hidden" style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
          <!-- Counselor Profile Header -->
          <div class="chat-counselor-header">
            <button class="btn-back-counselors" onclick="App.chat.backToCounselors()">← Kembali</button>
            <div class="counselor-header-profile">
              <div class="counselor-header-avatar" id="counselor-header-avatar">👤</div>
              <div class="counselor-header-info">
                <h4 id="counselor-header-name" style="margin:0; font-size:0.85rem;">—</h4>
                <span id="counselor-header-hours" style="font-size:0.7rem; color:var(--text-muted);">—</span>
              </div>
            </div>
            <div class="chat-status-badge" id="counselor-header-status">
              <span class="status-dot"></span>
              <span class="status-text" style="font-size:0.7rem;">Offline</span>
            </div>
          </div>

          <!-- Identity Selector Toggle -->
          <div class="identity-selector-bar">
            <span style="font-size:0.75rem; font-weight:500; color:var(--text-secondary);">Identitas:</span>
            <div class="identity-toggle-group">
              <button class="identity-btn active" id="identity-btn-anon" onclick="App.chat.setAnonymous(true)">
                🔒 Anonim
              </button>
              <button class="identity-btn" id="identity-btn-ident" onclick="App.chat.setAnonymous(false)">
                👤 Tampilkan Nama
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div class="chat-messages" id="chat-messages-bk" style="flex:1; min-height:0; overflow-y:auto; padding: 0.75rem;">
            <!-- Filled dynamically -->
          </div>

          <!-- Input Bar -->
          <div class="chat-input-bar">
            <input type="text" class="form-input" id="chat-input-bk" placeholder="Ketik pesanmu..." 
              onkeydown="if(event.key==='Enter')App.chat.sendBk()">
            <button class="btn-send" onclick="App.chat.sendBk()">➤</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== EMERGENCY PAGE ==================== -->
    <section class="page" id="page-emergency">
      <div class="emergency-header">
        <div class="sos-icon">🆘</div>
        <h2>Butuh Bantuan?</h2>
        <p>Kamu tidak sendirian. Hubungi bantuan profesional kapan saja.</p>
      </div>

      <div class="calming-message">
        <p>💚 Kamu tidak sendirian. Perasaanmu valid dan bantuan selalu tersedia untukmu. Berani bicara adalah langkah pertama menuju pulih.</p>
      </div>

      <div class="emergency-contacts">
        <a href="tel:119" class="emergency-card">
          <div class="e-icon">📞</div>
          <div class="e-info">
            <div class="e-name">Into The Light / Sejiwa</div>
            <div class="e-detail">119 ext 8 — Hotline Kesehatan Jiwa 24 jam</div>
          </div>
          <div class="e-action">→</div>
        </a>

        <a href="tel:021-500-454" class="emergency-card">
          <div class="e-icon">🏥</div>
          <div class="e-info">
            <div class="e-name">Halodoc Psikolog</div>
            <div class="e-detail">Konsultasi dengan psikolog online</div>
          </div>
          <div class="e-action">→</div>
        </a>

        <div class="emergency-card" onclick="App.router.navigate('chat');App.chat.switchTab('bk')">
          <div class="e-icon">👨‍🏫</div>
          <div class="e-info">
            <div class="e-name">Chat Guru BK</div>
            <div class="e-detail">Chat anonim dengan guru konseling sekolah</div>
          </div>
          <div class="e-action">→</div>
        </div>

        <a href="tel:112" class="emergency-card">
          <div class="e-icon">🚨</div>
          <div class="e-info">
            <div class="e-name">Nomor Darurat 112</div>
            <div class="e-detail">Layanan darurat nasional Indonesia</div>
          </div>
          <div class="e-action">→</div>
        </a>
      </div>

      <button class="btn btn-secondary btn-block" onclick="App.router.navigate('dashboard')">
        🏠 Kembali ke Dashboard
      </button>
    </section>

    <!-- ==================== MODAL ==================== -->
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content" id="modal-content">
        <div class="modal-header">
          <h3 id="modal-title">Detail</h3>
          <button class="modal-close" onclick="App.ui.closeModal()">✕</button>
        </div>
        <div class="modal-body" id="modal-body">
          <!-- Dynamic content -->
        </div>
      </div>
    </div>

    <!-- ==================== BOTTOM NAVIGATION ==================== -->
    <nav class="bottom-nav hidden" id="bottom-nav">
      <button class="nav-item active" data-page="dashboard" onclick="App.router.navigate('dashboard')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item" data-page="screening" onclick="App.router.navigate('screening')">
        <span class="nav-icon">🧠</span>
        <span class="nav-label">Check</span>
      </button>
      <button class="nav-item" data-page="edu" onclick="App.router.navigate('edu')">
        <span class="nav-icon">📚</span>
        <span class="nav-label">Edu</span>
      </button>
      <button class="nav-item" data-page="detox" onclick="App.router.navigate('detox')">
        <span class="nav-icon">🧘</span>
        <span class="nav-label">Detox</span>
      </button>
      <button class="nav-item" data-page="chat" onclick="App.router.navigate('chat')">
        <span class="nav-icon">💬</span>
        <span class="nav-label">Chat</span>
      </button>
    </nav>

  </div><!-- /.app-container -->

  <!-- Toast Container -->
  <div class="toast-container" id="toast-container"></div>

  <!-- Loading Overlay -->
  <div class="loading-overlay" id="loading-overlay">
    <div class="spinner"></div>
    <div class="loading-text">Memuat...</div>
  </div>

  <!-- Celebration Overlay -->
  <div class="celebration-overlay" id="celebration-overlay"></div>

  <script src="{{ asset('js/app.js') }}?v=1.3"></script>
</body>
</html>
