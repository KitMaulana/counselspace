<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CounselSpace.Ai - Teman Kesehatan Mentalmu</title>
  <meta name="description" content="Aplikasi konseling digital untuk membantu siswa mengatasi FOMO dan menjaga kesehatan mental">
  <meta name="theme-color" content="#1E2C50">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/style.css') }}?v=4.1">
</head>
<body>

  <div class="app-container" id="app">

    <!-- ==================== SPLASH PAGE ==================== -->
    <section class="page page-active cs-splash" id="page-splash">
      <h1 class="cs-splash-title">Counsel Space.Ai</h1>

      <picture class="cs-splash-scene">
        <source srcset="{{ asset('images/splash-scene.webp') }}" type="image/webp">
        <img src="{{ asset('images/splash-scene.png') }}" alt="Ilustrasi ruang konseling">
      </picture>

      <x-btn size="lg" class="cs-splash-btn" onclick="App.router.navigate('dashboard')">
        Mulai
      </x-btn>
    </section>

    <!-- ==================== LOGIN/REGISTER PAGE ==================== -->
    <section class="page cs-auth" id="page-login">
      <div class="cs-auth-card" id="login-card-view">
        <x-title-pill size="sm">Masuk</x-title-pill>
        <p class="cs-auth-sub">Akses penuh fitur self-check dan konseling</p>

        <form id="student-login-form" onsubmit="event.preventDefault(); App.auth.login();">
          <x-input label="Email atau Username" id="student-login-username"
                   placeholder="cth: siswa@counselspace.ai" :required="true" />
          <x-input label="Password" id="student-login-password" type="password"
                   placeholder="Masukkan password" :required="true" />
          <x-btn type="submit" :block="true" class="cs-auth-submit">Masuk</x-btn>
        </form>

        <p class="cs-auth-toggle">
          Belum punya akun?
          <a href="javascript:void(0)" onclick="App.auth.toggleForm('register')">Daftar di sini</a>
        </p>
      </div>

      <div class="cs-auth-card" id="register-card-view" style="display:none;">
        <x-title-pill size="sm">Daftar</x-title-pill>
        <p class="cs-auth-sub">Mulai perjalanan kesehatan mentalmu</p>

        <form id="student-register-form" onsubmit="event.preventDefault(); App.auth.register();">
          <x-input label="Nama Lengkap" id="student-register-name"
                   placeholder="cth: Budi Pratama" :required="true" />
          <x-input label="Kelas" id="student-register-class"
                   placeholder="cth: XII MIPA 2" :required="true" />
          <x-input label="Email" id="student-register-email" type="email"
                   placeholder="cth: budi@counselspace.ai" :required="true" />
          <x-input label="Password (Min. 6 Karakter)" id="student-register-password" type="password"
                   placeholder="Buat password baru" :required="true" />
          <x-btn type="submit" :block="true" class="cs-auth-submit">Daftar Sekarang</x-btn>
        </form>

        <p class="cs-auth-toggle">
          Sudah punya akun?
          <a href="javascript:void(0)" onclick="App.auth.toggleForm('login')">Masuk di sini</a>
        </p>
      </div>
    </section>

    <!-- ==================== DASHBOARD PAGE ==================== -->
    <section class="page" id="page-dashboard">
      <!-- Full-screen Hero Card -->
      <div class="cs-hero-card" id="dashboard-hero">
        <!-- Header -->
        <div class="cs-hero-header">
          <button class="cs-hero-avatar" onclick="App.auth.logout()" title="Logout">
            <span>👤</span>
          </button>
          <div class="cs-hero-greeting">
            <h2 id="greeting-text">Halo sobat Counselspace</h2>
            <p id="greeting-date">Bagaimana Harimu?</p>
          </div>
        </div>

        <!-- Robot floating in the scene -->
        <div class="cs-hero-robot-area" id="robot-stage">
          <div class="cs-robot-wrapper" id="dashboard-robot-wrap">
            <div class="cs-robot-bubble" id="robot-speech-bubble">
              <span class="cs-bubble-text" id="robot-speech-text">Pilih menu di bawah! 👋</span>
            </div>
            <img src="{{ asset('images/spacebot.png') }}" class="cs-robot-img" id="dashboard-robot" alt="Robot Spacebot">
            <div class="cs-robot-glow"></div>
          </div>
        </div>
      </div>

      <!-- Quick Stats (Shows last result if exists) -->
      <div class="quick-stats" id="quick-stats"></div>

      <!-- History Button -->
      <div class="cs-history-btn-wrapper" style="padding: 24px 20px 32px; text-align: center;">
        <x-btn size="lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #1E9BF0, #0B3E8F); border: 2.5px solid rgba(111, 211, 255, 0.8); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(111, 211, 255, 0.35);" onclick="App.dashboard.showHistoryModal()">
          📊 Lihat Riwayat Skrining
        </x-btn>
      </div>
    </section>

    <!-- ==================== SCREENING PAGE ==================== -->
    <section class="page" id="page-screening">
      <!-- Identity Form (shown first) -->
      <div id="screening-identity">
        <x-title-pill>Self Check</x-title-pill>

        <div class="cs-selfcheck-hero">
          <div class="cs-selfcheck-copy">
            <h2 class="cs-hero-title">Cek Level<br>FOMO<br>Minggu Ini! ⚡</h2>
            <p class="cs-hero-sub">Cuma 2 menit, yuk liat kondisi mentalmu</p>
          </div>
          <picture class="cs-selfcheck-img">
            <source srcset="{{ asset('images/siswi-fomo.webp') }}" type="image/webp">
            <img src="{{ asset('images/siswi-fomo.png') }}" alt="Ilustrasi siswi memegang ponsel">
          </picture>
        </div>

        <div class="cs-form cs-selfcheck-form">
          <p class="cs-form-note">Isi data singkat ini (opsional) agar hasilmu tersimpan.</p>
          <x-input label="Nama (opsional)" id="input-name" placeholder="Contoh: Andi" />
          <x-input label="Kelas (opsional)" id="input-class" placeholder="Contoh: XII IPA 3" />
        </div>

        <x-btn shape="pill" size="lg" :block="true" onclick="App.screening.startQuiz()">
          Mulai Self Check
        </x-btn>
        <x-btn variant="ghost" shape="pill" :block="true" class="cs-mt-sm"
               onclick="App.router.navigate('dashboard')">
          Kembali
        </x-btn>
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
    <section class="page cs-result" id="page-result">
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

      <div class="cs-result-panel">
        <div class="cs-result-label">Hasil:</div>

        <div class="result-category" id="result-category">
          <!-- Badge rendered dynamically -->
        </div>

        <p class="result-description" id="result-description">
          <!-- Description rendered dynamically -->
        </p>

        <div class="result-actions" id="result-actions">
          <!-- Buttons rendered dynamically -->
        </div>

        <x-btn variant="ghost" shape="pill" :block="true" class="cs-mt-sm"
               onclick="App.router.navigate('dashboard')">
          Menu
        </x-btn>
      </div>
    </section>

    <!-- ==================== EDU CORNER PAGE ==================== -->
    <section class="page" id="page-edu">
      <x-title-pill>Edukasi</x-title-pill>

      <div class="edu-tabs cs-edu-tabs" id="edu-tabs">
        <button class="edu-tab active" data-filter="semua">Semua</button>
        <button class="edu-tab" data-filter="poster">Poster</button>
        <button class="edu-tab" data-filter="video">Video</button>
        <button class="edu-tab" data-filter="artikel">Artikel</button>
      </div>

      <div class="edu-category-pills" id="edu-category-pills">
        <!-- Filled dynamically -->
      </div>

      <div class="edu-grid" id="edu-grid">
        <!-- Filled dynamically -->
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
        <div class="cs-chat-header">
          <x-avatar :src="asset('images/spacebot.png')" alt="Spacebot" />
          <div style="flex: 1;">
            <div class="cs-chat-header-name">Obrolan Spacebot</div>
            <div class="cs-chat-header-status">
              <span class="cs-status-dot"></span> ONLINE
            </div>
          </div>
          <button class="chat-theme-btn" onclick="App.chat.toggleThemeMenu()" title="Personalisasi Obrolan">🎨</button>
        </div>

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
          <div class="chat-counselor-header cs-chat-header">
            <button class="btn-back-counselors" onclick="App.chat.backToCounselors()">←</button>
            <div class="counselor-header-profile" style="flex: 1;">
              <div class="counselor-header-avatar" id="counselor-header-avatar">👤</div>
              <div class="counselor-header-info">
                <h4 id="counselor-header-name" class="cs-chat-header-name">—</h4>
                <span id="counselor-header-hours" class="cs-chat-header-hours">—</span>
              </div>
            </div>
            <div class="chat-status-badge" id="counselor-header-status" style="margin-right: 8px;">
              <span class="status-dot"></span>
              <span class="status-text">Offline</span>
            </div>
            <button class="chat-theme-btn" onclick="App.chat.toggleThemeMenu()" title="Personalisasi Obrolan">🎨</button>
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

      <!-- Theme Personalization Menu -->
      <div class="chat-theme-overlay hidden" id="chat-theme-menu" onclick="if(event.target===this) App.chat.toggleThemeMenu()">
        <div class="chat-theme-container">
          <div class="chat-theme-header">
            <h4>🎨 Personalisasi Chat</h4>
            <button class="btn-close-theme" onclick="App.chat.toggleThemeMenu()">✕</button>
          </div>
          
          <div class="chat-theme-body">
            <!-- Wallpaper Section -->
            <div class="theme-section">
              <label>Warna Wallpaper</label>
              <div class="theme-presets" id="student-wallpaper-presets">
                <!-- Filled dynamically via JS -->
              </div>
              <div class="theme-custom-picker">
                <span>Warna Kustom Wallpaper:</span>
                <input type="color" id="student-custom-wallpaper" oninput="App.chat.setCustomWallpaper(this.value)">
              </div>
            </div>
            
            <!-- Chat Bubble Section -->
            <div class="theme-section">
              <label>Warna Chat Bubble (Terkirim)</label>
              <div class="theme-presets" id="student-bubble-presets">
                <!-- Filled dynamically via JS -->
              </div>
              <div class="theme-custom-picker">
                <span>Warna Kustom Bubble:</span>
                <input type="color" id="student-custom-bubble" oninput="App.chat.setCustomBubble(this.value)">
              </div>
            </div>
          </div>
          
          <div class="chat-theme-footer">
            <button class="btn-reset-theme" onclick="App.chat.resetTheme()">Atur Ulang ke Default</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== EMERGENCY PAGE ==================== -->
    <section class="page" id="page-emergency">
      <x-title-pill>Butuh Bantuan?</x-title-pill>

      <div class="emergency-header">
        <div class="sos-icon">🆘</div>
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

      <x-btn variant="ghost" shape="pill" :block="true" onclick="App.router.navigate('dashboard')">
        Kembali ke Menu
      </x-btn>
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

  <script src="{{ asset('js/app.js') }}?v=4.1"></script>
</body>
</html>
