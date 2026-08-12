/* ============================================
   CounselSpace.Ai - Application Logic
   Premium Mobile-First Student Mental Health SPA
   ============================================ */

'use strict';

const App = {};
console.log('CounselSpace.Ai: app.js loaded');

/* ===========================================
   UTILITY FUNCTIONS
   =========================================== */
App.utils = {
  /** Show a toast notification */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /** Show global loading overlay */
  showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
  },

  /** Hide global loading overlay */
  hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
  },

  /** Format date in Indonesian */
  formatDate(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(date);
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  /** Format time HH:MM */
  formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },

  /** Generate unique session ID */
  generateSessionId() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  },

  /** Animate a number counting up */
  animateCounter(element, start, end, duration = 1500) {
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      element.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  /** Get time-based greeting */
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  },

  /** Get stored data from localStorage safely */
  getStorage(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  /** Save data to localStorage safely */
  setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable
    }
  }
};

/* ===========================================
   API HELPER
   =========================================== */
App.api = async function(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  // Attach Authorization Token if available
  const token = localStorage.getItem('student_token');
  if (token) {
    options.headers['Authorization'] = 'Bearer ' + token;
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  let url = endpoint;
  if (method === 'GET' && data) {
    const params = new URLSearchParams(data).toString();
    url += '?' + params;
  }

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `HTTP ${response.status}`);
    }
    return json;
  } catch (err) {
    console.warn(`API call failed: ${endpoint}`, err);
    throw err;
  }
};

/* ===========================================
   AUTHENTICATION MODULE
   =========================================== */
App.auth = {
  isAuthenticated() {
    return localStorage.getItem('student_token') !== null;
  },

  toggleForm(formType) {
    const loginCard = document.getElementById('login-card-view');
    const registerCard = document.getElementById('register-card-view');
    if (formType === 'login') {
      loginCard.style.display = 'block';
      registerCard.style.display = 'none';
    } else {
      loginCard.style.display = 'none';
      registerCard.style.display = 'block';
    }
  },

  async login() {
    const username = document.getElementById('student-login-username').value.trim();
    const password = document.getElementById('student-login-password').value;

    if (!username || !password) {
      App.utils.showToast('Email/Username dan password wajib diisi', 'error');
      return;
    }

    App.utils.showLoading();
    try {
      const res = await App.api('/api/auth/login', 'POST', { username, password });
      if (res.success && res.data) {
        localStorage.setItem('student_token', res.data.token);
        localStorage.setItem('student_user', JSON.stringify(res.data));
        
        // Auto-save identity to localStorage for screening
        App.utils.setStorage('student_name', res.data.name);
        App.utils.setStorage('student_class', res.data.student_class);

        App.utils.showToast('Login berhasil! Selamat datang.', 'success');
        
        // Redirect to dashboard
        App.router.navigate('dashboard');
      }
    } catch (err) {
      App.utils.showToast(err.message || 'Login gagal. Silakan periksa kembali.', 'error');
    } finally {
      App.utils.hideLoading();
    }
  },

  async register() {
    const name = document.getElementById('student-register-name').value.trim();
    const student_class = document.getElementById('student-register-class').value.trim();
    const email = document.getElementById('student-register-email').value.trim();
    const password = document.getElementById('student-register-password').value;

    if (!name || !student_class || !email || !password) {
      App.utils.showToast('Semua field pendaftaran wajib diisi', 'error');
      return;
    }

    if (password.length < 6) {
      App.utils.showToast('Password minimal 6 karakter', 'error');
      return;
    }

    App.utils.showLoading();
    try {
      const res = await App.api('/api/auth/register', 'POST', {
        name,
        student_class,
        email,
        password
      });
      if (res.success && res.data) {
        localStorage.setItem('student_token', res.data.token);
        localStorage.setItem('student_user', JSON.stringify(res.data));
        
        // Auto-save identity to localStorage for screening
        App.utils.setStorage('student_name', res.data.name);
        App.utils.setStorage('student_class', res.data.student_class);

        App.utils.showToast('Registrasi berhasil! Akun Anda aktif.', 'success');
        
        // Redirect to dashboard
        App.router.navigate('dashboard');
      }
    } catch (err) {
      App.utils.showToast(err.message || 'Registrasi gagal. Email mungkin sudah terdaftar.', 'error');
    } finally {
      App.utils.hideLoading();
    }
  },

  logout() {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    App.utils.showToast('Berhasil keluar.', 'info');
    App.router.navigate('login');
  }
};

/* ===========================================
   UI HELPERS
   =========================================== */
App.ui = {
  openModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
  },

  /** Show confetti celebration */
  celebrate() {
    const overlay = document.getElementById('celebration-overlay');
    const colors = ['#14B8A6', '#6366F1', '#F59E0B', '#22C55E', '#EF4444', '#818CF8', '#FBBF24'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = '-10px';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      overlay.appendChild(piece);
    }
    setTimeout(() => { overlay.innerHTML = ''; }, 5000);
  }
};

/* ===========================================
   ROUTER
   =========================================== */
App.router = {
  currentPage: null,
  history: [],

  /** Initialize router */
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Close modal on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') App.ui.closeModal();
    });
  },

  /** Navigate to a page */
  navigate(page) {
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash === page) {
      this.handleRoute();
    } else {
      window.location.hash = '#' + page;
    }
  },

  /** Handle hash route changes */
  handleRoute() {
    let hash = window.location.hash.replace('#', '') || 'splash';
    
    // Auth guard: Jika belum login dan mencoba ke halaman lain, arahkan ke login
    if (hash !== 'splash' && hash !== 'login' && !App.auth.isAuthenticated()) {
      hash = 'login';
      if (window.location.hash !== '#login') {
        window.location.hash = '#login';
      }
      this.showPage('login');
      return;
    }
    
    // Jika sudah login dan mencoba ke splash atau login, arahkan ke dashboard
    if ((hash === 'login' || hash === 'splash') && App.auth.isAuthenticated()) {
      hash = 'dashboard';
      if (window.location.hash !== '#dashboard') {
        window.location.hash = '#dashboard';
      }
      this.showPage('dashboard');
      return;
    }

    if (App.auth.isAuthenticated()) {
      App.chat.startPing();
    } else {
      App.chat.stopPing();
    }

    this.showPage(hash);
  },

  /** Show specified page with transition */
  showPage(pageId) {
    console.log('CounselSpace.Ai: Routing to page ->', pageId);
    const targetEl = document.getElementById('page-' + pageId);
    if (!targetEl) {
      if (pageId !== 'dashboard') this.showPage('dashboard');
      return;
    }

    // Track history
    if (this.currentPage && this.currentPage !== pageId) {
      this.history.push(this.currentPage);
      if (this.history.length > 20) this.history.shift();
    }

    this.currentPage = pageId;

    // Show target page immediately, hide others
    document.querySelectorAll('.page').forEach(p => {
      if (p === targetEl) {
        p.classList.add('page-active');
        p.classList.remove('page-exit');
      } else {
        p.classList.remove('page-active', 'page-exit');
      }
    });

    window.scrollTo(0, 0);

    // Bottom nav visibility — hide on splash & login
    const nav = document.getElementById('bottom-nav');
    if (pageId === 'splash' || pageId === 'login') {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }

    // Update active nav item immediately
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });

    // Page-specific initialization
    this.onPageEnter(pageId);
  },

  /** Run page-specific init logic */
  onPageEnter(pageId) {
    switch (pageId) {
      case 'dashboard':
        App.dashboard.init();
        break;
      case 'screening':
        App.screening.init();
        break;
      case 'result':
        App.result.render();
        break;
      case 'edu':
        App.edu.init();
        break;
      case 'chat':
        App.chat.init();
        break;
    }
  },

  /** Go back in history */
  goBack() {
    if (this.history.length > 0) {
      const prev = this.history.pop();
      window.location.hash = '#' + prev;
    } else {
      window.location.hash = '#dashboard';
    }
  }
};

/* ===========================================
   DASHBOARD MODULE
   =========================================== */
App.dashboard = {
  isAnimatingRobot: false,

  init() {
    console.log('CounselSpace.Ai: Initializing dashboard...');
    this.renderGreeting();
    this.renderQuickStats();
    this.renderHistory();
    this.resetRobotPosition();
    this.attachNavListeners();
  },

  resetRobotPosition() {
    const robotWrap = document.getElementById('dashboard-robot-wrap');
    if (robotWrap) {
      robotWrap.style.transition = 'none';
      robotWrap.style.transform = '';
      robotWrap.classList.remove('is-moving');
      void robotWrap.offsetWidth;
      robotWrap.style.transition = '';
    }
    this.isAnimatingRobot = false;
    const bubble = document.getElementById('robot-speech-bubble');
    const bubbleText = document.getElementById('robot-speech-text');
    if (bubbleText) bubbleText.textContent = 'Pilih menu di bawah! 👋';
    if (bubble) bubble.classList.remove('active-speech');
  },

  /** Attach click listeners to bottom-nav for robot animation */
  attachNavListeners() {
    const navBtns = document.querySelectorAll('#bottom-nav .nav-item');
    navBtns.forEach(btn => {
      // Remove old onclick to avoid double-fire
      const page = btn.dataset.page;
      btn.onclick = (e) => {
        e.preventDefault();
        this.animateRobotTo(page, btn);
      };
    });
  },

  /** Animate robot toward a nav button, then navigate */
  animateRobotTo(targetPage, btnElement) {
    // If already on target page & it's dashboard, just re-init
    if (targetPage === 'dashboard') {
      App.router.navigate('dashboard');
      return;
    }

    const robotWrap = document.getElementById('dashboard-robot-wrap');
    const onDashboard = App.router.currentPage === 'dashboard';

    // Not on dashboard — navigate directly
    if (!onDashboard || !robotWrap || !btnElement) {
      App.router.navigate(targetPage);
      return;
    }

    // Prevent double animation
    if (this.isAnimatingRobot) {
      App.router.navigate(targetPage);
      return;
    }
    this.isAnimatingRobot = true;

    // Show speech bubble reaction
    const speechBubble = document.getElementById('robot-speech-bubble');
    const speechText = document.getElementById('robot-speech-text');
    const messages = {
      screening: 'Otw Self Check! 🧠⚡',
      edu: 'Yuk Belajar! 📚✨',
      chat: 'Yuk Curhat! 💬🤖'
    };
    if (speechText && messages[targetPage]) speechText.textContent = messages[targetPage];
    if (speechBubble) speechBubble.classList.add('active-speech');

    // Reset position without animation
    robotWrap.style.transition = 'none';
    robotWrap.style.transform = '';
    robotWrap.classList.remove('is-moving');
    void robotWrap.offsetWidth;

    // Calculate target position
    const robotRect = robotWrap.getBoundingClientRect();
    const btnRect = btnElement.getBoundingClientRect();
    const deltaX = Math.round((btnRect.left + btnRect.width / 2) - (robotRect.left + robotRect.width / 2));
    const deltaY = Math.round((btnRect.top - 10) - (robotRect.top + robotRect.height / 2));
    const tilt = deltaX > 10 ? 12 : deltaX < -10 ? -12 : 0;

    // Animate!
    robotWrap.style.transition = 'transform 1.25s cubic-bezier(0.25, 1, 0.5, 1)';
    robotWrap.classList.add('is-moving');
    robotWrap.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.15) rotate(${tilt}deg)`;

    // Navigate after animation completes
    setTimeout(() => {
      this.isAnimatingRobot = false;
      App.router.navigate(targetPage);
    }, 1250);
  },

  renderGreeting() {
    const name = App.utils.getStorage('student_name');
    const greeting = App.utils.getGreeting();
    const displayName = name ? name : 'Sobat';
    const greetElem = document.getElementById('greeting-text');
    if (greetElem) {
      greetElem.textContent = `${greeting}, ${displayName}! 👋`;
    }
    const dateElem = document.getElementById('greeting-date');
    if (dateElem) {
      dateElem.textContent = App.utils.formatDate(new Date());
    }
  },

  renderQuickStats() {
    const container = document.getElementById('quick-stats');
    const history = App.utils.getStorage('screening_history', []);
    const last = history.length > 0 ? history[history.length - 1] : null;

    if (last) {
      const cat = this.getCategoryInfo(last.category);
      container.innerHTML = `
        <div class="stats-card">
          <div class="stats-icon">${cat.icon}</div>
          <div class="stats-info">
            <div class="stats-label">Hasil Terakhir</div>
            <div class="stats-value" style="color:${cat.color}">${last.category} (${last.score}%)</div>
          </div>
          <span class="badge badge-${(last.category || 'Aman').toLowerCase()}">${last.category || 'Aman'}</span>
        </div>`;
    } else {
      container.innerHTML = ''; // Hapus bagian belum ada hasil screening
    }
  },

  renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return; // Failsafe
    const history = App.utils.getStorage('screening_history', []);

    if (history.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <p>Belum ada riwayat skrining.<br>Mulai self-check pertamamu!</p>
        </div>`;
      return;
    }

    // Show last 3
    const recent = history.slice(-3).reverse();
    container.innerHTML = recent.map(item => {
      const cat = this.getCategoryInfo(item.category);
      return `
        <div class="history-item">
          <div class="history-score score-${(item.category || 'Aman').toLowerCase()}">${item.score}%</div>
          <div class="history-info">
            <div class="history-category" style="color:${cat.color}">${cat.icon} ${item.category}</div>
            <div class="history-date">${App.utils.formatDate(item.date)}</div>
          </div>
        </div>`;
    }).join('');
  },

  /** Open screening history inside a beautiful overlay modal */
  showHistoryModal() {
    const history = App.utils.getStorage('screening_history', []);

    if (history.length === 0) {
      const emptyHTML = `
        <div class="empty-state" style="padding: 40px 20px; text-align: center;">
          <div class="empty-icon" style="font-size: 3rem; margin-bottom: 12px; filter: drop-shadow(0 0 10px rgba(111,211,255,0.4));">📊</div>
          <h3 style="color:#fff; font-weight:700; margin:0 0 4px; font-size:1.15rem;">Belum Ada Riwayat</h3>
          <p style="color:#a0aec0; margin:0; font-size:0.9rem;">Mulai self-check pertamamu untuk melihat hasil di sini!</p>
        </div>`;
      App.ui.openModal('Riwayat Skrining', emptyHTML);
      return;
    }

    const listHTML = `
      <div class="history-modal-list" style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding:2px;">
        ${history.slice().reverse().map(item => {
          const cat = this.getCategoryInfo(item.category);
          const badgeClass = (item.category || 'Aman').toLowerCase();
          return `
            <div class="history-modal-card" style="display:flex; align-items:center; gap:14px; padding:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; transition:transform 0.2s ease;">
              <div class="history-modal-icon" style="width:42px; height:42px; border-radius:50%; background:${cat.color}15; color:${cat.color}; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0;">
                ${cat.icon}
              </div>
              <div style="flex:1;">
                <div style="font-weight:700; color:#fff; font-size:0.95rem; display:flex; align-items:center; gap:8px;">
                  ${item.category}
                  <span class="badge badge-${badgeClass}" style="font-size:0.65rem; padding:2px 6px; border-radius:6px; font-weight:600;">${item.category}</span>
                </div>
                <div style="font-size:0.78rem; color:#a0aec0; margin-top:2px;">
                  📅 ${App.utils.formatDate(item.date)}
                </div>
              </div>
              <div style="font-size:1.15rem; font-weight:800; color:${cat.color};">
                ${item.score}%
              </div>
            </div>`;
        }).join('')}
      </div>`;

    App.ui.openModal('Riwayat Skrining', listHTML);
  },

  getCategoryInfo(category) {
    const key = (category || 'Aman').toLowerCase();
    const map = {
      'aman':    { icon: '✅', color: 'var(--green-400)' },
      'waspada': { icon: '⚠️', color: 'var(--amber-400)' },
      'bahaya':  { icon: '🚨', color: 'var(--red-400)' }
    };
    return map[key] || map['aman'];
  }
};

/* ===========================================
   SCREENING MODULE
   =========================================== */
App.screening = {
  questions: [],
  answers: [],
  currentIndex: 0,
  studentName: '',
  studentClass: '',

  /** Fallback questions if API is unreachable */
  fallbackQuestions: [
    { id: 1,  question: "Saya merasa cemas ketika tidak bisa mengecek media sosial." },
    { id: 2,  question: "Saya takut ketinggalan informasi terbaru dari teman-teman di media sosial." },
    { id: 3,  question: "Saya sering membandingkan hidup saya dengan kehidupan orang lain di media sosial." },
    { id: 4,  question: "Saya merasa tidak tenang jika tidak membawa handphone." },
    { id: 5,  question: "Saya sering mengecek notifikasi handphone meskipun sedang belajar." },
    { id: 6,  question: "Saya merasa sedih ketika melihat teman-teman bersenang-senang tanpa saya di media sosial." },
    { id: 7,  question: "Saya menghabiskan lebih dari 3 jam sehari untuk media sosial." },
    { id: 8,  question: "Saya sulit tidur karena terus scrolling media sosial." },
    { id: 9,  question: "Saya merasa harus selalu update status atau story agar tidak dilupakan." },
    { id: 10, question: "Saya merasa cemas jika postingan saya tidak mendapat banyak like atau komentar." },
    { id: 11, question: "Saya sering membatalkan rencana belajar karena ingin terus melihat media sosial." },
    { id: 12, question: "Saya merasa hidup orang lain lebih menyenangkan daripada hidup saya." },
    { id: 13, question: "Saya merasa gelisah ketika WiFi atau data internet mati." },
    { id: 14, question: "Saya lebih suka berkomunikasi lewat chat daripada bertemu langsung." },
    { id: 15, question: "Saya merasa kesepian meskipun memiliki banyak teman di media sosial." },
    { id: 16, question: "Saya sering memeriksa handphone segera setelah bangun tidur." },
    { id: 17, question: "Saya merasa khawatir tidak diundang ke acara yang saya lihat di media sosial." },
    { id: 18, question: "Saya merasa tertekan untuk selalu tampil sempurna di media sosial." },
    { id: 19, question: "Saya sulit berkonsentrasi belajar karena terus memikirkan media sosial." },
    { id: 20, question: "Saya merasa mood saya sangat dipengaruhi oleh apa yang saya lihat di media sosial." }
  ],

  /** Initialize the screening page */
  init() {
    // Show identity form, hide quiz
    document.getElementById('screening-identity').classList.remove('hidden');
    document.getElementById('screening-quiz').classList.add('hidden');

    // Restore saved identity
    const savedName = App.utils.getStorage('student_name', '');
    const savedClass = App.utils.getStorage('student_class', '');
    document.getElementById('input-name').value = savedName;
    document.getElementById('input-class').value = savedClass;
  },

  /** Start the quiz after identity */
  async startQuiz() {
    // Save identity
    this.studentName = document.getElementById('input-name').value.trim();
    this.studentClass = document.getElementById('input-class').value.trim();
    if (this.studentName) App.utils.setStorage('student_name', this.studentName);
    if (this.studentClass) App.utils.setStorage('student_class', this.studentClass);

    // Load questions
    App.utils.showLoading();
    try {
      const res = await App.api('/api/questions');
      if (res && res.data && res.data.length > 0) {
        this.questions = res.data.map(item => ({
          id: parseInt(item.id),
          question: item.question_text || item.question || '',
          category: item.category || 'fomo',
          weight: parseInt(item.weight || 1)
        }));
      } else {
        this.questions = [...this.fallbackQuestions];
      }
    } catch {
      this.questions = [...this.fallbackQuestions];
      App.utils.showToast('Mode offline — menggunakan pertanyaan bawaan', 'warning');
    }
    App.utils.hideLoading();

    // Reset state
    this.currentIndex = 0;
    this.answers = new Array(this.questions.length).fill(null);

    // Show quiz
    document.getElementById('screening-identity').classList.add('hidden');
    document.getElementById('screening-quiz').classList.remove('hidden');

    this.renderQuestion();
  },

  /** Render current question */
  renderQuestion() {
    const q = this.questions[this.currentIndex];
    const total = this.questions.length;
    const idx = this.currentIndex;

    // Update counter & progress
    document.getElementById('screening-counter').textContent = `${idx + 1} / ${total}`;
    document.getElementById('screening-progress-fill').style.width = `${((idx + 1) / total) * 100}%`;

    // Back button visibility
    document.getElementById('screening-back-btn').style.visibility = idx > 0 ? 'visible' : 'hidden';

    // Answer options
    const options = [
      { value: 1, label: 'Sangat Tidak Setuju' },
      { value: 2, label: 'Tidak Setuju' },
      { value: 3, label: 'Setuju' },
      { value: 4, label: 'Sangat Setuju' }
    ];

    const selectedVal = this.answers[idx];

    const container = document.getElementById('question-container');
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="cs-quiz-card">
        <span class="cs-quiz-number">${idx + 1}</span>
        <p class="cs-quiz-text">${q.question}</p>
      </div>
      <div class="cs-options">
        ${options.map((opt, i) => `
          <div class="answer-option cs-option ${selectedVal === opt.value ? 'selected' : ''}"
               onclick="App.screening.selectAnswer(${opt.value})">
            <div class="cs-option-letter">${letters[i]}</div>
            <span class="cs-option-body">${opt.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  /** Handle answer selection */
  selectAnswer(value) {
    this.answers[this.currentIndex] = value;

    // Update UI immediately
    document.querySelectorAll('.answer-option').forEach(opt => opt.classList.remove('selected'));
    const options = document.querySelectorAll('.answer-option');
    const idx = value - 1;
    if (options[idx]) options[idx].classList.add('selected');

    // Auto-advance after brief delay
    setTimeout(() => {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
        this.renderQuestion();
      } else {
        this.submitQuiz();
      }
    }, 400);
  },

  /** Go to previous question */
  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderQuestion();
    }
  },

  /** Calculate score and submit */
  async submitQuiz() {
    const qLength = this.questions ? this.questions.length : 0;
    const maxScore = qLength > 0 ? qLength * 4 : 80;
    const rawScore = this.answers ? this.answers.reduce((sum, v) => sum + (v || 1), 0) : 20;
    let percentage = Math.round((rawScore / maxScore) * 100);
    if (isNaN(percentage)) percentage = 0;

    let category;
    if (percentage <= 40) {
      category = 'Aman';
    } else if (percentage <= 70) {
      category = 'Waspada';
    } else {
      category = 'Bahaya';
    }

    // Save result locally
    const result = {
      score: percentage,
      rawScore,
      maxScore,
      category,
      date: new Date().toISOString(),
      name: this.studentName || 'Sobat',
      class: this.studentClass || '-',
      answerCount: qLength
    };

    App.utils.setStorage('last_result', result);
    const history = App.utils.getStorage('screening_history', []);
    history.push(result);
    App.utils.setStorage('screening_history', history);

    // Save to API in background (do not await, to ensure instant result loading)
    if (qLength > 0) {
      try {
        const formattedAnswers = this.questions.map((q, index) => ({
          question_id: parseInt(q.id),
          answer_value: parseInt(this.answers[index] || 1)
        }));

        App.api('/api/screenings', 'POST', {
          student_name: this.studentName || 'Anonim',
          student_class: this.studentClass || '-',
          answers: formattedAnswers
        }).catch(err => {
          console.warn('Failed to save screening to API:', err);
        });
      } catch (err) {
        console.warn('Error formatting answers for API:', err);
      }
    }

    // Navigate to result immediately
    App.router.navigate('result');
  }
};

/* ===========================================
   RESULT MODULE
   =========================================== */
App.result = {
  render() {
    try {
      const result = App.utils.getStorage('last_result');
      if (!result) {
        App.router.navigate('dashboard');
        return;
      }

      let score = result.score;
      if (isNaN(score)) score = 0;
      const category = result.category ? (result.category.charAt(0).toUpperCase() + result.category.slice(1).toLowerCase()) : 'Aman';

      // Animate score circle (using setAttribute for SVG standards safety)
      const circleFill = document.getElementById('result-circle-fill');
      if (circleFill) {
        circleFill.setAttribute('class', 'circle-fill ' + category.toLowerCase());
        const circumference = 2 * Math.PI * 78; // r=78
        circleFill.setAttribute('stroke-dasharray', circumference);
        circleFill.setAttribute('stroke-dashoffset', circumference);
        setTimeout(() => {
          const offset = circumference - (circumference * score / 100);
          circleFill.setAttribute('stroke-dashoffset', offset);
        }, 200);
      }

      // Animate counter
      const scoreEl = document.getElementById('result-score-number');
      if (scoreEl) {
        setTimeout(() => App.utils.animateCounter(scoreEl, 0, score, 1500), 300);
      }

      // Local category helper to avoid cross-module dependency
      const getCategoryInfo = (cat) => {
        const key = (cat || 'Aman').toLowerCase();
        const map = {
          'aman':    { icon: '✅', color: 'var(--green-400)' },
          'waspada': { icon: '⚠️', color: 'var(--amber-400)' },
          'bahaya':  { icon: '🚨', color: 'var(--red-400)' }
        };
        return map[key] || map['aman'];
      };

      // Category badge
      const catInfo = getCategoryInfo(category);
      const categoryEl = document.getElementById('result-category');
      if (categoryEl) {
        categoryEl.innerHTML = `<span class="badge badge-${category.toLowerCase()}">${catInfo.icon} ${category}</span>`;
      }

      // Description
      const descriptions = {
        'Aman': 'Selamat! 🎉 Tingkat FOMO kamu tergolong rendah. Kamu sudah cukup bijak dalam menggunakan media sosial. Tetap jaga keseimbanganmu ya! Kunjungi Edu Corner untuk tips menjaga kesehatan digitalmu.',
        'Waspada': 'Tingkat FOMO kamu berada di level sedang. ⚠️ Ada beberapa tanda bahwa media sosial mulai memengaruhi kehidupanmu. Coba baca materi di Edu Corner dan praktikkan tips dari AI Chatbot kami.',
        'Bahaya': 'Tingkat FOMO kamu tergolong tinggi. 🚨 Media sosial tampaknya sangat memengaruhi emosi dan keseharianmu. Sangat disarankan untuk berbicara dengan guru BK atau konselor profesional.'
      };
      const descEl = document.getElementById('result-description');
      if (descEl) {
        descEl.textContent = descriptions[category] || '';
      }

      // Action buttons
      const actionsEl = document.getElementById('result-actions');
      if (actionsEl) {
        if (category === 'Aman') {
          actionsEl.innerHTML = `
            <button class="btn btn-success btn-block" onclick="App.router.navigate('edu')">📚 Kunjungi Edu Corner</button>`;
        } else if (category === 'Waspada') {
          actionsEl.innerHTML = `
            <button class="btn btn-warning btn-block" onclick="App.router.navigate('edu')">📚 Buka Edu Corner</button>
            <button class="btn btn-primary btn-block" onclick="App.router.navigate('chat')">🤖 Chat dengan AI</button>`;
        } else {
          actionsEl.innerHTML = `
            <button class="btn btn-danger btn-block" onclick="App.router.navigate('chat');setTimeout(()=>App.chat.switchTab('bk'),100)">💬 Chat Anonim Guru BK</button>
            <button class="btn btn-warning btn-block" onclick="App.router.navigate('emergency')">🆘 Kontak Darurat</button>`;
        }
      }
    } catch (err) {
      console.error('App.result.render error:', err);
      try {
        App.utils.showToast('Gagal memuat hasil: ' + err.message, 'error');
      } catch (e) {}
    }
  }
};

/* ===========================================
   EDU CORNER MODULE
   =========================================== */
App.edu = {
  content: [],
  activeFilter: 'semua',
  activeCategory: 'semua',
  categories: [],
  tabsBound: false,

  /** Fallback content if API unavailable */
  fallbackContent: [
    {
      id: 1, type: 'video', title: 'Apa itu FOMO? Kenali Tandanya!',
      snippet: 'Video edukasi singkat tentang Fear of Missing Out dan dampaknya bagi remaja.',
      thumbnail: '', youtube_id: 'dQw4w9WgXcQ',
      content: 'FOMO (Fear of Missing Out) adalah perasaan cemas atau takut ketinggalan momen, pengalaman, atau informasi yang dialami orang lain.',
      category: 'fomo'
    },
    {
      id: 2, type: 'video', title: '5 Cara Mengatasi Kecanduan Media Sosial',
      snippet: 'Tips praktis yang bisa kamu lakukan untuk mengurangi waktu di media sosial.',
      thumbnail: '', youtube_id: 'sYZvgaGCm8g',
      content: 'Lima langkah mengurangi kecanduan: 1. Atur batas waktu, 2. Matikan notifikasi, 3. Hapus aplikasi dari home screen, 4. Temukan hobi offline, 5. Gunakan mode fokus.',
      category: 'digital-wellness'
    },
    {
      id: 3, type: 'poster', title: 'Infografis: Dampak FOMO pada Kesehatan Mental',
      snippet: 'Poster informatif tentang hubungan FOMO dengan stres, kecemasan, dan gangguan tidur.',
      thumbnail: '', image_url: '',
      content: 'FOMO dapat menyebabkan: kecemasan meningkat, gangguan tidur, penurunan konsentrasi belajar, rendahnya kepercayaan diri, dan isolasi sosial.',
      category: 'fomo'
    },
    {
      id: 4, type: 'poster', title: 'Tips Digital Wellness untuk Pelajar',
      snippet: 'Panduan visual tentang kebiasaan sehat menggunakan teknologi.',
      thumbnail: '', image_url: '',
      content: '1. Batasi screen time 2 jam per hari. 2. No phone 1 jam sebelum tidur. 3. Lakukan aktivitas fisik setiap hari. 4. Buat jadwal media sosial. 5. Prioritaskan interaksi tatap muka.',
      category: 'digital-wellness'
    },
    {
      id: 5, type: 'artikel', title: 'Mengapa Remaja Rentan FOMO?',
      snippet: 'Artikel tentang faktor psikologis yang membuat remaja lebih mudah mengalami FOMO.',
      thumbnail: '',
      content: 'Masa remaja adalah periode perkembangan identitas di mana kebutuhan akan penerimaan sosial sangat tinggi. Media sosial menciptakan ilusi bahwa semua orang menjalani kehidupan yang sempurna. Otak remaja yang masih berkembang, terutama bagian prefrontal cortex, membuat mereka lebih impulsif dalam menggunakan teknologi.\n\nBeberapa faktor yang membuat remaja rentan FOMO:\n• Kebutuhan tinggi akan validasi sosial\n• Kemudahan akses media sosial 24/7\n• Tekanan teman sebaya (peer pressure)\n• Kurangnya literasi digital\n• Perbandingan sosial yang tidak realistis\n\nYang bisa dilakukan:\n1. Sadari bahwa media sosial hanya menampilkan highlight reel\n2. Fokus pada hubungan nyata dan bermakna\n3. Praktikkan gratitude journaling\n4. Batasi penggunaan media sosial\n5. Cari bantuan profesional jika diperlukan',
      category: 'fomo'
    },
    {
      id: 6, type: 'artikel', title: 'Digital Detox: Panduan Lengkap untuk Pelajar',
      snippet: 'Langkah-langkah melakukan digital detox yang efektif tanpa merasa tersiksa.',
      thumbnail: '',
      content: 'Digital detox bukan berarti harus menghentikan semua penggunaan teknologi. Ini tentang menemukan keseimbangan yang sehat.\n\nPanduan Digital Detox:\n\n📱 Mulai dari yang kecil:\n• Coba 30 menit tanpa handphone setiap hari\n• Matikan notifikasi media sosial\n• Gunakan mode "Jangan Ganggu" saat belajar\n\n🏃 Ganti dengan aktivitas positif:\n• Olahraga atau jalan-jalan di alam\n• Membaca buku fisik\n• Bermain dengan hewan peliharaan\n• Memasak atau membuat kerajinan tangan\n\n😴 Jaga kualitas tidur:\n• Letakkan handphone di luar kamar tidur\n• Berhenti menggunakan gadget 1 jam sebelum tidur\n• Gunakan alarm fisik, bukan alarm handphone\n\n📊 Evaluasi kemajuan:\n• Catat waktu penggunaan media sosial\n• Perhatikan perubahan mood\n• Rayakan setiap kemajuan kecil!',
      category: 'digital-wellness'
    }
  ],

  /** Initialize */
  async init() {
    // Set up tab listeners.
    if (!this.tabsBound) {
      document.querySelectorAll('.edu-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.activeFilter = tab.dataset.filter;
          document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.renderContent();
        });
      });
      this.tabsBound = true;
    }

    // Load categories
    try {
      const catRes = await App.api('/api/edu-categories');
      if (catRes && catRes.data && catRes.data.length > 0) {
        this.categories = catRes.data;
      } else {
        this.categories = [
          { name: 'FOMO', slug: 'fomo' },
          { name: 'JOMO', slug: 'jomo' },
          { name: 'Kecemasan', slug: 'kecemasan' },
          { name: 'Digital Wellness', slug: 'digital-wellness' },
          { name: 'Umum', slug: 'umum' }
        ];
      }
    } catch (e) {
      this.categories = [
        { name: 'FOMO', slug: 'fomo' },
        { name: 'JOMO', slug: 'jomo' },
        { name: 'Kecemasan', slug: 'kecemasan' },
        { name: 'Digital Wellness', slug: 'digital-wellness' },
        { name: 'Umum', slug: 'umum' }
      ];
    }

    this.renderCategories();

    // Load content
    if (this.content.length === 0) {
      try {
        const res = await App.api('/api/edu');
        if (res && res.data && res.data.length > 0) {
          this.content = res.data.map(item => {
            const normalized = {
              id: parseInt(item.id),
              type: item.content_type || 'artikel',
              title: item.title,
              snippet: item.description || '',
              thumbnail: item.thumbnail_url || '',
              category: item.category || 'umum',
              source: item.source || ''
            };

            if (normalized.type === 'video') {
              let ytId = '';
              const url = item.content_url || '';
              if (url.includes('embed/')) {
                ytId = url.split('embed/')[1]?.split('?')[0] || '';
              } else if (url.includes('v=')) {
                ytId = url.split('v=')[1]?.split('&')[0] || '';
              } else if (url.includes('youtu.be/')) {
                ytId = url.split('youtu.be/')[1]?.split('?')[0] || '';
              }
              normalized.youtube_id = ytId;
              normalized.content = item.description || '';
            } else if (normalized.type === 'poster') {
              normalized.image_url = item.content_url || '';
              normalized.content = item.description || '';
            } else if (normalized.type === 'artikel') {
              normalized.content = item.content_url || ''; // HTML content
            }
            return normalized;
          });
        } else {
          this.content = this.fallbackContent.map(item => ({
            ...item,
            category: item.category || 'umum',
            source: item.source || ''
          }));
        }
      } catch (err) {
        console.warn('Failed to load online edu content, using fallback:', err);
        this.content = this.fallbackContent.map(item => ({
          ...item,
          category: item.category || 'umum',
          source: item.source || ''
        }));
      }
    }

    this.renderContent();
  },

  /** Render category filter pills */
  renderCategories() {
    const container = document.getElementById('edu-category-pills');
    if (!container) return;

    const allPills = [{ name: 'Semua Kategori', slug: 'semua' }, ...this.categories];
    
    container.innerHTML = allPills.map(cat => {
      const isActive = this.activeCategory === cat.slug;
      return `<button class="edu-category-pill ${isActive ? 'active' : ''}" 
        onclick="App.edu.selectCategory('${cat.slug}')">${cat.name}</button>`;
    }).join('');
  },

  /** Select category filter */
  selectCategory(slug) {
    this.activeCategory = slug;
    this.renderCategories();
    this.renderContent();
  },

  /** Render content grid */
  renderContent() {
    const grid = document.getElementById('edu-grid');
    let items = this.content;

    if (this.activeFilter !== 'semua') {
      items = items.filter(c => c.type === this.activeFilter);
    }

    if (this.activeCategory !== 'semua') {
      items = items.filter(c => c.category && c.category.toLowerCase() === this.activeCategory.toLowerCase());
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <p>Belum ada konten di kategori ini.</p>
        </div>`;
      return;
    }

    grid.innerHTML = items.map(item => {
      const typeIcons = { video: '🎬', poster: '🖼️', artikel: '📖' };
      const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);

      let thumbHTML = '';
      if (item.type === 'video') {
        const ytThumb = item.youtube_id
          ? `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg`
          : '';
        thumbHTML = `
          <div class="edu-card-thumb">
            ${ytThumb ? `<img src="${ytThumb}" alt="${item.title}" onerror="this.style.display='none'">` : ''}
            <div class="play-icon">▶</div>
          </div>`;
      } else if (item.type === 'poster') {
        thumbHTML = `
          <div class="edu-card-thumb">
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" onerror="this.style.display='none'">` : ''}
            <div class="poster-icon">🖼️</div>
          </div>`;
      } else if (item.type === 'artikel') {
        thumbHTML = `
          <div class="edu-card-thumb">
            ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}" onerror="this.style.display='none'">` : ''}
            <div class="poster-icon">📖</div>
          </div>`;
      }

      return `
        <div class="edu-card" onclick="App.edu.openDetail(${item.id})">
          ${thumbHTML}
          <div class="edu-card-body">
            <div class="edu-card-type">${typeIcons[item.type] || '📄'} ${typeLabel}</div>
            <div class="edu-card-title">${item.title}</div>
            <div class="edu-card-snippet">${item.snippet || ''}</div>
          </div>
        </div>`;
    }).join('');
  },

  /** Open content detail modal */
  openDetail(id) {
    const item = this.content.find(c => c.id === id);
    if (!item) return;

    let bodyHTML = '';

    if (item.type === 'video' && item.youtube_id) {
      bodyHTML = `
        <div class="video-embed">
          <iframe src="https://www.youtube.com/embed/${item.youtube_id}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen></iframe>
        </div>
        <p class="mt-md text-muted" style="font-size:var(--font-sm);line-height:1.6;">${item.content || item.snippet || ''}</p>`;
    } else if (item.type === 'poster') {
      bodyHTML = `
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" style="border-radius:var(--radius-md);margin-bottom:var(--space-md);width:100%;height:auto;object-fit:contain;">` : ''}
        <p style="font-size:var(--font-sm);line-height:1.7;color:var(--text-secondary);white-space:pre-line;">${item.content || item.snippet || ''}</p>`;
    } else {
      bodyHTML = `
        ${item.thumbnail ? `<div style="text-align:center;margin-bottom:var(--space-md);"><img src="${item.thumbnail}" alt="${item.title}" style="max-height:220px;width:100%;object-fit:cover;border-radius:var(--radius-md);"></div>` : ''}
        <div style="font-size:var(--font-sm);line-height:1.8;color:var(--text-secondary);white-space:pre-line;">${item.content || item.snippet || ''}</div>`;
    }

    if (item.source) {
      bodyHTML += `<div class="mt-md" style="font-size:0.75rem; color:var(--text-muted); font-style:italic; border-top:1px solid rgba(255,255,255,0.08); padding-top:var(--space-sm);">Sumber: ${item.source}</div>`;
    }

    App.ui.openModal(item.title, bodyHTML);
  }
};

/* ===========================================
   CHAT MODULE
   =========================================== */
App.chat = {
  aiHistory: [],
  bkSessionId: null,
  bkPollInterval: null,
  activeTab: 'ai',
  renderedMessageIds: new Set(),
  selectedCounselorId: null,
  isAnonymous: true,
  counselors: [],
  pingInterval: null,

  /** AI response database */
  aiResponses: {
    fomo: [
      'FOMO (Fear of Missing Out) itu normal kok, tapi kalau sudah mengganggu keseharianmu, saatnya kamu mengambil langkah. 💪 Coba kurangi cek media sosial secara bertahap — mulai dari 30 menit tanpa handphone.',
      'Kamu tahu, apa yang terlihat di media sosial itu cuma highlight reel? Mereka tidak menunjukkan saat-saat sulit. Jadi jangan bandingkan behind-the-scenes kamu dengan highlight reel orang lain ya! 🎬'
    ],
    cemas: [
      'Rasa cemas itu sinyal tubuh kamu bahwa ada sesuatu yang perlu diperhatikan. Coba teknik grounding 5-4-3-2-1: Sebutkan 5 hal yang bisa kamu lihat, 4 yang bisa disentuh, 3 yang didengar, 2 yang dicium, dan 1 yang dikecap. 🌿',
      'Kecemasan bisa dikurangi dengan latihan pernapasan. Coba tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik. Ulangi 5 kali sambil duduk tenang ya! 🫁'
    ],
    sedih: [
      'Merasa sedih itu wajar dan tidak apa-apa. Kamu tidak harus selalu bahagia. 💙 Yang penting, jangan simpan perasaan itu sendirian. Ceritakan pada seseorang yang kamu percaya.',
      'Kalau kamu sedang sedih, coba tulis perasaanmu di jurnal. Menulis bisa membantu melepaskan emosi yang terpendam. Dan ingat, badai pasti berlalu. 🌈'
    ],
    stres: [
      'Stres itu wajar, apalagi sebagai pelajar. 📚 Coba atur prioritas: buat to-do list, kerjakan satu per satu, dan jangan lupa beri dirimu waktu istirahat. Kamu sudah hebat!',
      'Ketika merasa stres, tubuhmu butuh gerakan. Coba peregangan 5 menit, jalan kaki sebentar, atau dengarkan musik favoritmu. Kadang hal kecil membuat perbedaan besar! 🎵'
    ],
    medsos: [
      'Media sosial dirancang untuk membuat kita terus scroll. Ini bukan salahmu kalau sulit berhenti! 📱 Coba atur batasan waktu di pengaturan handphonemu, atau baca panduannya di Edu Corner.',
      'Tips: Coba unfollow akun yang membuat kamu merasa buruk tentang dirimu sendiri. Follow akun yang menginspirasi dan membuatmu belajar hal baru. Kamu punya kuasa atas feed-mu! ✨'
    ],
    'media sosial': [
      'Media sosial punya sisi positif dan negatif. Kuncinya ada di cara kamu menggunakannya. 🔑 Gunakan untuk belajar dan terhubung, bukan untuk membandingkan diri.',
    ],
    tidur: [
      'Susah tidur karena terus scrolling? Kamu tidak sendirian. 😴 Coba letakkan handphone di luar jangkauan 1 jam sebelum tidur. Ganti dengan baca buku atau dengarkan podcast menenangkan.',
      'Cahaya biru dari layar mengganggu produksi melatonin, hormon tidur. Aktifkan night mode dan coba batasi screen time sebelum tidur. Kualitas tidurmu akan membaik! 🌙'
    ],
    konsentrasi: [
      'Susah fokus belajar? Coba teknik Pomodoro: belajar 25 menit, istirahat 5 menit. Saat belajar, matikan semua notifikasi. Otak kamu butuh fokus tanpa gangguan! 🧠',
      'Multitasking itu mitos lho! Otak kita sebenarnya hanya bisa fokus pada satu hal pada satu waktu. Coba belajar satu hal pada satu waktu, hasilnya pasti lebih maksimal. 📖'
    ],
    teman: [
      'Hubungan pertemanan yang sehat itu yang mendukung pertumbuhanmu, bukan yang membuatmu merasa buruk. 🤝 Fokus pada teman-teman yang menghargai kehadiranmu.',
      'Kalau merasa left out dari teman-teman, coba ajak mereka kegiatan bareng secara langsung. Interaksi tatap muka jauh lebih bermakna daripada interaksi online. 💚'
    ],
    sendiri: [
      'Merasa sendirian meskipun online terus? Itu bisa jadi tanda kamu butuh koneksi yang lebih dalam. 💙 Coba kurangi online dan ajak satu teman ngobrol langsung — kualitas lebih penting dari kuantitas.',
      'Sendirian bukan berarti kesepian. Kadang kita butuh waktu sendiri untuk mengenal diri kita lebih baik. Tapi kalau perasaan kesepian terus berlanjut, jangan ragu untuk bicara dengan guru BK ya. 🫂'
    ],
    marah: [
      'Marah itu emosi yang normal. Yang penting adalah cara kamu mengekspresikannya. 🌊 Coba hitung sampai 10, tarik napas dalam-dalam, atau tulis perasaanmu sebelum bereaksi.',
    ],
    belajar: [
      'Semangat belajar! 📚 Ingat, belajar sedikit tapi konsisten lebih baik daripada belajar banyak sekaligus. Jangan lupa istirahat dan jaga kesehatanmu ya!',
    ],
    halo: [
      'Halo! 👋 Aku di sini siap membantu. Kamu bisa cerita tentang perasaanmu, tanya tentang FOMO, media sosial, atau apapun yang mengganggu pikiranmu. Aku siap mendengarkan! 💚'
    ],
    hai: [
      'Hai! 😊 Senang kamu mampir. Ada yang ingin kamu bicarakan? Aku siap mendengarkan dengan sepenuh hati.'
    ],
    terima: [
      'Sama-sama! 😊 Senang bisa membantu. Jangan ragu untuk kembali kapanpun ya. Kamu selalu punya tempat untuk cerita di sini. 💚'
    ],
    makasih: [
      'Makasih juga sudah mau berbagi! 💚 Berani cerita itu langkah yang hebat. Kalau butuh bantuan lagi, aku selalu di sini ya!'
    ]
  },

  /** Default response if no keyword matches */
  defaultResponses: [
    'Terima kasih sudah berbagi. 💚 Bisa ceritakan lebih lanjut tentang perasaanmu? Aku di sini untuk mendengarkan.',
    'Aku mengerti. Kadang memang sulit mengekspresikan perasaan ya. Coba cerita pelan-pelan, tidak perlu buru-buru. 🤗',
    'Hmm, aku ingin memahami lebih dalam. Bisa kamu ceritakan apa yang membuat kamu merasa seperti itu? 💙',
    'Perasaanmu valid, apapun itu. Mau coba bahas tentang FOMO, kecemasan, atau tips digital wellness? Atau kamu bisa langsung chat dengan Guru BK untuk bantuan lebih lanjut. 🫂'
  ],

  /** Quick reply suggestions */
  quickReplies: [
    'Apa itu FOMO?',
    'Saya merasa cemas',
    'Tips kurangi medsos',
    'Saya susah tidur',
    'Saya merasa sendiri',
    'Sulit konsentrasi'
  ],

  /** Initialize chat */
  init() {
    // Restore AI chat history
    const saved = App.utils.getStorage('ai_chat_history', []);
    this.aiHistory = saved;

    this.initTheme(); // Load saved theme settings
    this.renderAiChat();
    this.renderQuickReplies();

    // Show initial AI greeting if no history
    if (this.aiHistory.length === 0) {
      this.addAiMessage('received',
        'Halo! 👋 Aku CounselBot, asisten kesehatan mentalmu. Kamu bisa curhat tentang perasaanmu, tanya tentang FOMO, atau minta tips digital wellness. Aku di sini untuk mendengarkan! 💚');
    }

    if (this.activeTab === 'bk') {
      this.initBkChat();
    }
  },

  /** Switch between AI and BK tabs */
  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.chat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.getElementById('chat-panel-ai').classList.toggle('active', tab === 'ai');
    document.getElementById('chat-panel-bk').classList.toggle('active', tab === 'bk');

    if (tab === 'bk') {
      this.initBkChat();
    } else {
      this.stopBkPolling();
    }
  },

  /** Render AI chat messages */
  renderAiChat() {
    const container = document.getElementById('chat-messages-ai');
    container.innerHTML = this.aiHistory.map(msg => `
      <div class="chat-bubble ${msg.type}">
        ${msg.text}
        <span class="bubble-time">${msg.time || ''}</span>
      </div>
    `).join('');
    this.scrollToBottom(container);
  },

  /** Render quick reply buttons */
  renderQuickReplies() {
    const container = document.getElementById('quick-replies-ai');
    container.innerHTML = this.quickReplies.map(reply => `
      <button class="quick-reply-btn" onclick="App.chat.sendQuickReply('${reply}')">${reply}</button>
    `).join('');
  },

  /** Send quick reply */
  sendQuickReply(text) {
    document.getElementById('chat-input-ai').value = text;
    this.sendAi();
  },

  /** Send message in AI chat */
  sendAi() {
    const input = document.getElementById('chat-input-ai');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    this.addAiMessage('sent', text);
    input.value = '';

    // Show typing indicator
    const container = document.getElementById('chat-messages-ai');
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.id = 'ai-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typingEl);
    this.scrollToBottom(container);

    // Generate response after delay
    setTimeout(() => {
      const typing = document.getElementById('ai-typing');
      if (typing) typing.remove();

      const response = this.getAiResponse(text);
      this.addAiMessage('received', response);
    }, 800 + Math.random() * 1200);
  },

  /** Get AI response based on keywords */
  getAiResponse(input) {
    const lower = input.toLowerCase();

    // Search for keyword matches
    for (const [keyword, responses] of Object.entries(this.aiResponses)) {
      if (lower.includes(keyword)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Default response
    return this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
  },

  /** Add message to AI chat */
  addAiMessage(type, text) {
    const msg = {
      type,
      text,
      time: App.utils.formatTime(new Date())
    };
    this.aiHistory.push(msg);
    App.utils.setStorage('ai_chat_history', this.aiHistory);

    const container = document.getElementById('chat-messages-ai');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type}`;
    bubble.innerHTML = `${text}<span class="bubble-time">${msg.time}</span>`;
    container.appendChild(bubble);
    this.scrollToBottom(container);
  },

  /** Initialize BK chat */
  async initBkChat() {
    this.stopBkPolling();
    
    const counselorListEl = document.getElementById('bk-counselor-list-view');
    const activeChatEl = document.getElementById('bk-chat-active-view');
    
    if (!this.selectedCounselorId) {
      counselorListEl.classList.remove('hidden');
      activeChatEl.classList.add('hidden');
      await this.loadCounselors();
    } else {
      counselorListEl.classList.add('hidden');
      activeChatEl.classList.remove('hidden');
      
      const container = document.getElementById('chat-messages-bk');
      container.innerHTML = '';
      this.renderedMessageIds.clear();

      let studentId = 0;
      try {
        const studUser = JSON.parse(localStorage.getItem('student_user'));
        studentId = studUser ? studUser.id : 0;
      } catch (e) {}
      
      this.bkSessionId = `chat_${studentId}_${this.selectedCounselorId}`;

      const counselor = this.counselors.find(c => c.id == this.selectedCounselorId);
      if (counselor) {
        document.getElementById('counselor-header-name').textContent = counselor.name;
        document.getElementById('counselor-header-hours').textContent = `Jam Layanan: ${counselor.service_hours || 'Tidak diatur'}`;
        
        const avatarEl = document.getElementById('counselor-header-avatar');
        if (counselor.photo_url) {
          avatarEl.innerHTML = `<img src="${counselor.photo_url}" alt="${counselor.name}">`;
        } else {
          avatarEl.innerHTML = '👤';
        }

        const statusEl = document.getElementById('counselor-header-status');
        if (counselor.is_online) {
          statusEl.className = 'chat-status-badge online';
          statusEl.querySelector('.status-text').textContent = 'Sedang Aktif';
        } else {
          statusEl.className = 'chat-status-badge offline';
          statusEl.querySelector('.status-text').textContent = 'Tidak Aktif';
        }
      }

      this.updateIdentityToggleUI();

      try {
        const res = await App.api('/api/chats/' + this.bkSessionId, 'GET');
        if (res && res.data && res.data.length > 0) {
          res.data.forEach(msg => {
            const msgId = parseInt(msg.id);
            this.renderedMessageIds.add(msgId);

            const type = msg.sender_type === 'student' ? 'sent' : 'received';
            const bubbleEl = document.createElement('div');
            bubbleEl.className = `chat-bubble ${type}`;
            bubbleEl.innerHTML = `${msg.message}<span class="bubble-time">${App.utils.formatTime(msg.created_at || new Date())}</span>`;
            container.appendChild(bubbleEl);
          });
          this.scrollToBottom(container);
        }
      } catch (err) {
        console.warn('Failed to load chat history:', err);
      }

      this.startBkPolling();
    }
  },

  async loadCounselors() {
    const listContainer = document.getElementById('counselor-list-container');
    listContainer.innerHTML = `<div class="spinner-overlay" style="position:relative; height:100px; background:transparent;"><div class="spinner"></div></div>`;
    try {
      const res = await App.api('/api/counselors', 'GET');
      if (res && res.success && res.data) {
        this.counselors = res.data;
        if (this.counselors.length === 0) {
          listContainer.innerHTML = `
            <div style="text-align:center; padding: 2rem var(--space-sm); color:var(--text-tertiary);">
              <p>Belum ada Guru BK yang terdaftar saat ini.</p>
            </div>`;
          return;
        }

        listContainer.innerHTML = this.counselors.map(c => {
          const statusText = c.is_online ? 'Sedang Aktif' : 'Tidak Aktif';
          const statusClass = c.is_online ? 'online' : 'offline';
          const avatarHTML = c.photo_url 
            ? `<img src="${c.photo_url}" alt="${c.name}">` 
            : `👤`;

          return `
            <div class="counselor-card" onclick="App.chat.selectCounselor(${c.id})">
              <div class="counselor-avatar">${avatarHTML}</div>
              <div class="counselor-info">
                <h4>${c.name}</h4>
                <span class="service-hours">⏰ Jam Layanan: ${c.service_hours || 'Tidak Diatur'}</span>
              </div>
              <div class="counselor-status ${statusClass}">
                <span class="status-dot"></span>
                <span>${statusText}</span>
              </div>
            </div>`;
        }).join('');
      }
    } catch (err) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding: 2rem var(--space-sm); color:var(--text-tertiary);">
          <p class="text-danger">Gagal memuat daftar Guru BK.</p>
        </div>`;
    }
  },

  selectCounselor(counselorId) {
    this.selectedCounselorId = counselorId;
    this.initBkChat();
  },

  backToCounselors() {
    this.selectedCounselorId = null;
    this.stopBkPolling();
    this.initBkChat();
  },

  setAnonymous(isAnon) {
    this.isAnonymous = isAnon;
    this.updateIdentityToggleUI();
  },

  updateIdentityToggleUI() {
    const btnAnon = document.getElementById('identity-btn-anon');
    const btnIdent = document.getElementById('identity-btn-ident');
    if (!btnAnon || !btnIdent) return;
    if (this.isAnonymous) {
      btnAnon.classList.add('active');
      btnIdent.classList.remove('active');
    } else {
      btnAnon.classList.remove('active');
      btnIdent.classList.add('active');
    }
  },

  /** Send message in BK chat */
  async sendBk() {
    const input = document.getElementById('chat-input-bk');
    const text = input.value.trim();
    if (!text || !this.selectedCounselorId) return;

    // Show message immediately
    const container = document.getElementById('chat-messages-bk');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble sent';
    bubble.innerHTML = `${text}<span class="bubble-time">${App.utils.formatTime(new Date())}</span>`;
    container.appendChild(bubble);
    this.scrollToBottom(container);
    input.value = '';

    // Send to API
    try {
      const res = await App.api('/api/chats', 'POST', {
        session_id: this.bkSessionId,
        message: text,
        sender_type: 'student',
        counselor_id: this.selectedCounselorId,
        is_anonymous: this.isAnonymous
      });
      if (res && res.success && res.data && res.data.id) {
        this.renderedMessageIds.add(parseInt(res.data.id));
      }
    } catch (err) {
      console.warn('Failed to send BK message:', err);
    }
  },

  /** Start polling BK chat for new messages */
  startBkPolling() {
    this.stopBkPolling();
    this.bkPollInterval = setInterval(() => this.pollBkMessages(), 5000);
  },

  /** Stop polling */
  stopBkPolling() {
    if (this.bkPollInterval) {
      clearInterval(this.bkPollInterval);
      this.bkPollInterval = null;
    }
  },

  /** Poll for new BK messages */
  async pollBkMessages() {
    try {
      const res = await App.api('/api/chats/' + this.bkSessionId, 'GET');
      if (res && res.data && res.data.length > 0) {
        const container = document.getElementById('chat-messages-bk');
        let newRendered = false;

        res.data.forEach(msg => {
          const msgId = parseInt(msg.id);
          if (!this.renderedMessageIds.has(msgId)) {
            this.renderedMessageIds.add(msgId);
            
            const type = msg.sender_type === 'student' ? 'sent' : 'received';
            const bubble = document.createElement('div');
            bubble.className = `chat-bubble ${type}`;
            bubble.innerHTML = `${msg.message}<span class="bubble-time">${App.utils.formatTime(msg.created_at || new Date())}</span>`;
            container.appendChild(bubble);
            newRendered = true;
          }
        });

        if (newRendered) {
          this.scrollToBottom(container);
        }
      }
    } catch {
      // Silently fail polling
    }
  },

  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(async () => {
      try {
        await App.api('/api/ping', 'POST');
      } catch (err) {}
    }, 15000);
    App.api('/api/ping', 'POST').catch(()=>{});
  },

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  },

  scrollToBottom(container) {
    setTimeout(() => {
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
  },

  // Preset definitions
  themePresets: {
    wallpapers: [
      { name: 'Deep Navy', value: 'linear-gradient(135deg, #101A33 0%, #1A2649 100%)', bg: '#101A33' },
      { name: 'Dark Aurora', value: 'linear-gradient(135deg, #2b103c 0%, #0f1035 100%)', bg: '#2b103c' },
      { name: 'Mint Green', value: 'linear-gradient(135deg, #0a1f10 0%, #0c2d1b 100%)', bg: '#0a1f10' },
      { name: 'Soft Crimson', value: 'linear-gradient(135deg, #301020 0%, #141026 100%)', bg: '#301020' },
      { name: 'Royal Violet', value: 'linear-gradient(135deg, #1c1033 0%, #0e1124 100%)', bg: '#1c1033' },
      { name: 'Charcoal Dark', value: 'linear-gradient(135deg, #090a0f 0%, #151620 100%)', bg: '#090a0f' }
    ],
    bubbles: [
      { name: 'Electric Blue', value: '#1E9BF0' },
      { name: 'Cyberpunk Pink', value: '#F94FA5' },
      { name: 'Royal Purple', value: '#8B5CF6' },
      { name: 'Mint Green', value: '#10B981' },
      { name: 'Cyan Spark', value: '#06B6D4' },
      { name: 'Sunset Orange', value: '#F59E0B' }
    ]
  },

  /** Initialize chat theme from localStorage */
  initTheme() {
    const savedWallpaper = localStorage.getItem('chat_theme_wallpaper');
    const savedBubble = localStorage.getItem('chat_theme_bubble');
    
    const pageChat = document.getElementById('page-chat');
    if (!pageChat) return;

    if (savedWallpaper) {
      pageChat.style.setProperty('--chat-wallpaper', savedWallpaper);
    }
    if (savedBubble) {
      pageChat.style.setProperty('--bubble-sent-bg', savedBubble);
      pageChat.style.setProperty('--bubble-sent-color', this.getContrastColor(savedBubble));
      pageChat.style.setProperty('--bubble-sent-shadow', this.hexToRgba(savedBubble, 0.45));
    }

    this.renderThemeMenuElements();
  },

  /** Helper to determine text contrast based on color brightness */
  getContrastColor(hexColor) {
    if (!hexColor || hexColor.trim() === '') return '#ffffff';
    // If it's a gradient, extract the first color or default to white text
    if (hexColor.includes('gradient')) {
      return '#ffffff';
    }
    hexColor = hexColor.replace('#', '');
    if (hexColor.length === 3) {
      hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
    }
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 140) ? '#101A33' : '#ffffff';
  },

  /** Helper to convert hex to rgba for box shadow */
  hexToRgba(hexColor, alpha) {
    if (!hexColor || hexColor.includes('gradient')) return `rgba(11, 62, 143, ${alpha})`;
    hexColor = hexColor.replace('#', '');
    if (hexColor.length === 3) {
      hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
    }
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /** Toggle the personalization menu visibility */
  toggleThemeMenu() {
    const menu = document.getElementById('chat-theme-menu');
    if (menu) {
      menu.classList.toggle('hidden');
      if (!menu.classList.contains('hidden')) {
        // sync input color elements with current properties
        const pageChat = document.getElementById('page-chat');
        if (pageChat) {
          const currentWallpaper = pageChat.style.getPropertyValue('--chat-wallpaper');
          const currentBubble = pageChat.style.getPropertyValue('--bubble-sent-bg');
          
          const customWallInput = document.getElementById('student-custom-wallpaper');
          const customBubbleInput = document.getElementById('student-custom-bubble');
          
          if (customWallInput && currentWallpaper && !currentWallpaper.includes('gradient')) {
            customWallInput.value = currentWallpaper.trim();
          }
          if (customBubbleInput && currentBubble) {
            customBubbleInput.value = currentBubble.trim();
          }
        }
        this.updateActivePresetClasses();
      }
    }
  },

  /** Render preset buttons in the overlay menu */
  renderThemeMenuElements() {
    const wallPresetsContainer = document.getElementById('student-wallpaper-presets');
    const bubblePresetsContainer = document.getElementById('student-bubble-presets');
    if (!wallPresetsContainer || !bubblePresetsContainer) return;

    // Render wallpaper presets
    wallPresetsContainer.innerHTML = this.themePresets.wallpapers.map((preset, index) => {
      return `<button class="theme-preset-btn" 
        style="background: ${preset.value};" 
        title="${preset.name}" 
        data-type="wallpaper"
        data-value="${preset.value}"
        onclick="App.chat.selectWallpaperPreset(${index}, '${preset.value}')"></button>`;
    }).join('');

    // Render bubble presets
    bubblePresetsContainer.innerHTML = this.themePresets.bubbles.map((preset, index) => {
      return `<button class="theme-preset-btn" 
        style="background: ${preset.value};" 
        title="${preset.name}" 
        data-type="bubble"
        data-value="${preset.value}"
        onclick="App.chat.selectBubblePreset(${index}, '${preset.value}')"></button>`;
    }).join('');

    this.updateActivePresetClasses();
  },

  /** Highlight the active presets in the menu */
  updateActivePresetClasses() {
    const pageChat = document.getElementById('page-chat');
    if (!pageChat) return;

    const currentWallpaper = pageChat.style.getPropertyValue('--chat-wallpaper').trim();
    const currentBubble = pageChat.style.getPropertyValue('--bubble-sent-bg').trim();

    // Check wallpaper buttons
    const wallBtns = document.querySelectorAll('#student-wallpaper-presets .theme-preset-btn');
    wallBtns.forEach(btn => {
      const val = btn.getAttribute('data-value').trim();
      btn.classList.toggle('active', val === currentWallpaper);
    });

    // Check bubble buttons
    const bubbleBtns = document.querySelectorAll('#student-bubble-presets .theme-preset-btn');
    bubbleBtns.forEach(btn => {
      const val = btn.getAttribute('data-value').trim();
      btn.classList.toggle('active', val === currentBubble);
    });
  },

  /** Apply wallpaper preset */
  selectWallpaperPreset(index, value) {
    const pageChat = document.getElementById('page-chat');
    if (pageChat) {
      pageChat.style.setProperty('--chat-wallpaper', value);
      localStorage.setItem('chat_theme_wallpaper', value);
      this.updateActivePresetClasses();
    }
  },

  /** Apply bubble preset */
  selectBubblePreset(index, value) {
    const pageChat = document.getElementById('page-chat');
    if (pageChat) {
      pageChat.style.setProperty('--bubble-sent-bg', value);
      const contrastColor = this.getContrastColor(value);
      pageChat.style.setProperty('--bubble-sent-color', contrastColor);
      pageChat.style.setProperty('--bubble-sent-shadow', this.hexToRgba(value, 0.45));
      localStorage.setItem('chat_theme_bubble', value);
      this.updateActivePresetClasses();
    }
  },

  /** Apply custom wallpaper color from color input */
  setCustomWallpaper(color) {
    const pageChat = document.getElementById('page-chat');
    if (pageChat && color) {
      pageChat.style.setProperty('--chat-wallpaper', color);
      localStorage.setItem('chat_theme_wallpaper', color);
      this.updateActivePresetClasses();
    }
  },

  /** Apply custom bubble color from color input */
  setCustomBubble(color) {
    const pageChat = document.getElementById('page-chat');
    if (pageChat && color) {
      pageChat.style.setProperty('--bubble-sent-bg', color);
      const contrastColor = this.getContrastColor(color);
      pageChat.style.setProperty('--bubble-sent-color', contrastColor);
      pageChat.style.setProperty('--bubble-sent-shadow', this.hexToRgba(color, 0.45));
      localStorage.setItem('chat_theme_bubble', color);
      this.updateActivePresetClasses();
    }
  },

  /** Reset theme to default settings */
  resetTheme() {
    const pageChat = document.getElementById('page-chat');
    if (pageChat) {
      pageChat.style.removeProperty('--chat-wallpaper');
      pageChat.style.removeProperty('--bubble-sent-bg');
      pageChat.style.removeProperty('--bubble-sent-color');
      pageChat.style.removeProperty('--bubble-sent-shadow');
      
      localStorage.removeItem('chat_theme_wallpaper');
      localStorage.removeItem('chat_theme_bubble');

      // reset inputs
      const customWallInput = document.getElementById('student-custom-wallpaper');
      const customBubbleInput = document.getElementById('student-custom-bubble');
      if (customWallInput) customWallInput.value = '#000000';
      if (customBubbleInput) customBubbleInput.value = '#1e9bf0';

      this.updateActivePresetClasses();
    }
  }
};

/* ===========================================
   INITIALIZATION
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('CounselSpace.Ai: DOMContentLoaded event fired');
  // Initialize router
  App.router.init();

  const hash = window.location.hash.replace('#', '');

  if (hash) {
    App.router.handleRoute();
  } else if (App.auth.isAuthenticated()) {
    App.router.navigate('dashboard');
  } else {
    App.router.navigate('splash');
  }

  // Clean up BK polling on page unload
  window.addEventListener('beforeunload', () => {
    App.chat.stopBkPolling();
  });
});
