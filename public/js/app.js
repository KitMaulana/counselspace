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
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json;
  } catch (err) {
    console.warn(`API call failed: ${endpoint}`, err);
    throw err;
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
    window.location.hash = '#' + page;
  },

  /** Handle hash route changes */
  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'splash';
    this.showPage(hash);
  },

  /** Show specified page with transition */
  showPage(pageId) {
    console.log('CounselSpace.Ai: Routing to page ->', pageId);
    const targetEl = document.getElementById('page-' + pageId);
    if (!targetEl) {
      this.showPage('dashboard');
      return;
    }

    // Track history
    if (this.currentPage && this.currentPage !== pageId) {
      this.history.push(this.currentPage);
      if (this.history.length > 20) this.history.shift();
    }

    // Exit current page
    const currentEl = this.currentPage ? document.getElementById('page-' + this.currentPage) : null;
    if (currentEl) {
      currentEl.classList.remove('page-active');
      currentEl.classList.add('page-exit');
      setTimeout(() => {
        currentEl.classList.remove('page-exit');
      }, 250);
    }

    // Enter new page
    document.querySelectorAll('.page').forEach(p => {
      if (p !== targetEl) {
        p.classList.remove('page-active', 'page-exit');
      }
    });

    // Small delay for exit animation to start
    setTimeout(() => {
      console.log('CounselSpace.Ai: Adding page-active class to page-', pageId);
      targetEl.classList.add('page-active');
      window.scrollTo(0, 0);
    }, currentEl ? 100 : 0);

    this.currentPage = pageId;

    // Bottom nav visibility
    const nav = document.getElementById('bottom-nav');
    if (pageId === 'splash') {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }

    // Update active nav item
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
      case 'detox':
        App.detox.init();
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
  init() {
    console.log('CounselSpace.Ai: Initializing dashboard...');
    this.renderGreeting();
    this.renderQuickStats();
    this.renderHistory();
  },

  renderGreeting() {
    const name = App.utils.getStorage('student_name');
    const greeting = App.utils.getGreeting();
    const displayName = name ? name : 'Sobat';
    document.getElementById('greeting-text').textContent = `${greeting}, ${displayName}! 👋`;
    document.getElementById('greeting-date').textContent = App.utils.formatDate(new Date());
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
      container.innerHTML = `
        <div class="stats-card" style="cursor:pointer" onclick="App.router.navigate('screening')">
          <div class="stats-icon">🧠</div>
          <div class="stats-info">
            <div class="stats-label">Belum ada hasil</div>
            <div class="stats-value" style="font-size:var(--font-base);">Yuk, cek tingkat FOMO-mu!</div>
          </div>
          <span style="color:var(--teal-400);font-size:1.2rem;">→</span>
        </div>`;
    }
  },

  renderHistory() {
    const container = document.getElementById('history-list');
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
    container.innerHTML = `
      <div class="question-card card">
        <div class="question-number">${idx + 1}</div>
        <p class="question-text">${q.question}</p>
      </div>
      <div class="answer-options">
        ${options.map(opt => `
          <div class="answer-option ${selectedVal === opt.value ? 'selected' : ''}" 
               onclick="App.screening.selectAnswer(${opt.value})">
            <div class="answer-radio"></div>
            <span class="answer-label">${opt.label}</span>
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
    const maxScore = this.questions.length * 4;
    const rawScore = this.answers.reduce((sum, v) => sum + (v || 1), 0);
    const percentage = Math.round((rawScore / maxScore) * 100);

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
      name: this.studentName,
      class: this.studentClass,
      answerCount: this.questions.length
    };

    App.utils.setStorage('last_result', result);
    const history = App.utils.getStorage('screening_history', []);
    history.push(result);
    App.utils.setStorage('screening_history', history);

    // Try saving to API
    try {
      const formattedAnswers = this.questions.map((q, index) => ({
        question_id: parseInt(q.id),
        answer_value: parseInt(this.answers[index] || 1)
      }));

      await App.api('/api/screenings', 'POST', {
        student_name: this.studentName || 'Anonim',
        student_class: this.studentClass || '-',
        answers: formattedAnswers
      });
    } catch (err) {
      console.warn('Failed to save screening to API:', err);
    }

    // Navigate to result
    App.router.navigate('result');
  }
};

/* ===========================================
   RESULT MODULE
   =========================================== */
App.result = {
  render() {
    const result = App.utils.getStorage('last_result');
    if (!result) {
      App.router.navigate('dashboard');
      return;
    }

    const { score, category } = result;

    // Animate score circle
    const circleFill = document.getElementById('result-circle-fill');
    circleFill.className = 'circle-fill ' + category.toLowerCase();
    const circumference = 2 * Math.PI * 78; // r=78
    circleFill.style.strokeDasharray = circumference;
    circleFill.style.strokeDashoffset = circumference;
    setTimeout(() => {
      const offset = circumference - (circumference * score / 100);
      circleFill.style.strokeDashoffset = offset;
    }, 200);

    // Animate counter
    const scoreEl = document.getElementById('result-score-number');
    setTimeout(() => App.utils.animateCounter(scoreEl, 0, score, 1500), 300);

    // Category badge
    const catInfo = App.dashboard.getCategoryInfo(category);
    document.getElementById('result-category').innerHTML =
      `<span class="badge badge-${category.toLowerCase()}">${catInfo.icon} ${category}</span>`;

    // Description
    const descriptions = {
      'Aman': 'Selamat! 🎉 Tingkat FOMO kamu tergolong rendah. Kamu sudah cukup bijak dalam menggunakan media sosial. Tetap jaga keseimbanganmu ya! Kunjungi Edu Corner untuk tips menjaga kesehatan digitalmu.',
      'Waspada': 'Tingkat FOMO kamu berada di level sedang. ⚠️ Ada beberapa tanda bahwa media sosial mulai memengaruhi kesejahteraanmu. Coba lakukan Digital Detox dan praktikkan tips dari AI Chatbot kami.',
      'Bahaya': 'Tingkat FOMO kamu tergolong tinggi. 🚨 Media sosial tampaknya sangat memengaruhi emosi dan keseharianmu. Sangat disarankan untuk berbicara dengan guru BK atau konselor profesional.'
    };
    document.getElementById('result-description').textContent = descriptions[category] || '';

    // Action buttons
    const actionsEl = document.getElementById('result-actions');
    if (category === 'Aman') {
      actionsEl.innerHTML = `
        <button class="btn btn-success btn-block" onclick="App.router.navigate('edu')">📚 Kunjungi Edu Corner</button>`;
    } else if (category === 'Waspada') {
      actionsEl.innerHTML = `
        <button class="btn btn-warning btn-block" onclick="App.router.navigate('detox')">🧘 Digital Detox</button>
        <button class="btn btn-primary btn-block" onclick="App.router.navigate('chat')">🤖 Chat dengan AI</button>`;
    } else {
      actionsEl.innerHTML = `
        <button class="btn btn-danger btn-block" onclick="App.router.navigate('chat');setTimeout(()=>App.chat.switchTab('bk'),100)">💬 Chat Anonim Guru BK</button>
        <button class="btn btn-warning btn-block" onclick="App.router.navigate('emergency')">🆘 Kontak Darurat</button>`;
    }
  }
};

/* ===========================================
   EDU CORNER MODULE
   =========================================== */
App.edu = {
  content: [],
  activeFilter: 'semua',

  /** Fallback content if API unavailable */
  fallbackContent: [
    {
      id: 1, type: 'video', title: 'Apa itu FOMO? Kenali Tandanya!',
      snippet: 'Video edukasi singkat tentang Fear of Missing Out dan dampaknya bagi remaja.',
      thumbnail: '', youtube_id: 'dQw4w9WgXcQ',
      content: 'FOMO (Fear of Missing Out) adalah perasaan cemas atau takut ketinggalan momen, pengalaman, atau informasi yang dialami orang lain.'
    },
    {
      id: 2, type: 'video', title: '5 Cara Mengatasi Kecanduan Media Sosial',
      snippet: 'Tips praktis yang bisa kamu lakukan untuk mengurangi waktu di media sosial.',
      thumbnail: '', youtube_id: 'sYZvgaGCm8g',
      content: 'Lima langkah mengurangi kecanduan: 1. Atur batas waktu, 2. Matikan notifikasi, 3. Hapus aplikasi dari home screen, 4. Temukan hobi offline, 5. Gunakan mode fokus.'
    },
    {
      id: 3, type: 'poster', title: 'Infografis: Dampak FOMO pada Kesehatan Mental',
      snippet: 'Poster informatif tentang hubungan FOMO dengan stres, kecemasan, dan gangguan tidur.',
      thumbnail: '', image_url: '',
      content: 'FOMO dapat menyebabkan: kecemasan meningkat, gangguan tidur, penurunan konsentrasi belajar, rendahnya kepercayaan diri, dan isolasi sosial.'
    },
    {
      id: 4, type: 'poster', title: 'Tips Digital Wellness untuk Pelajar',
      snippet: 'Panduan visual tentang kebiasaan sehat menggunakan teknologi.',
      thumbnail: '', image_url: '',
      content: '1. Batasi screen time 2 jam per hari. 2. No phone 1 jam sebelum tidur. 3. Lakukan aktivitas fisik setiap hari. 4. Buat jadwal media sosial. 5. Prioritaskan interaksi tatap muka.'
    },
    {
      id: 5, type: 'artikel', title: 'Mengapa Remaja Rentan FOMO?',
      snippet: 'Artikel tentang faktor psikologis yang membuat remaja lebih mudah mengalami FOMO.',
      thumbnail: '',
      content: 'Masa remaja adalah periode perkembangan identitas di mana kebutuhan akan penerimaan sosial sangat tinggi. Media sosial menciptakan ilusi bahwa semua orang menjalani kehidupan yang sempurna. Otak remaja yang masih berkembang, terutama bagian prefrontal cortex, membuat mereka lebih impulsif dalam menggunakan teknologi.\n\nBeberapa faktor yang membuat remaja rentan FOMO:\n• Kebutuhan tinggi akan validasi sosial\n• Kemudahan akses media sosial 24/7\n• Tekanan teman sebaya (peer pressure)\n• Kurangnya literasi digital\n• Perbandingan sosial yang tidak realistis\n\nYang bisa dilakukan:\n1. Sadari bahwa media sosial hanya menampilkan highlight reel\n2. Fokus pada hubungan nyata dan bermakna\n3. Praktikkan gratitude journaling\n4. Batasi penggunaan media sosial\n5. Cari bantuan profesional jika diperlukan'
    },
    {
      id: 6, type: 'artikel', title: 'Digital Detox: Panduan Lengkap untuk Pelajar',
      snippet: 'Langkah-langkah melakukan digital detox yang efektif tanpa merasa tersiksa.',
      thumbnail: '',
      content: 'Digital detox bukan berarti harus menghentikan semua penggunaan teknologi. Ini tentang menemukan keseimbangan yang sehat.\n\nPanduan Digital Detox:\n\n📱 Mulai dari yang kecil:\n• Coba 30 menit tanpa handphone setiap hari\n• Matikan notifikasi media sosial\n• Gunakan mode "Jangan Ganggu" saat belajar\n\n🏃 Ganti dengan aktivitas positif:\n• Olahraga atau jalan-jalan di alam\n• Membaca buku fisik\n• Bermain dengan hewan peliharaan\n• Memasak atau membuat kerajinan tangan\n\n😴 Jaga kualitas tidur:\n• Letakkan handphone di luar kamar tidur\n• Berhenti menggunakan gadget 1 jam sebelum tidur\n• Gunakan alarm fisik, bukan alarm handphone\n\n📊 Evaluasi kemajuan:\n• Catat waktu penggunaan media sosial\n• Perhatikan perubahan mood\n• Rayakan setiap kemajuan kecil!'
    }
  ],

  /** Initialize */
  async init() {
    // Set up tab listeners
    document.querySelectorAll('.edu-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeFilter = tab.dataset.filter;
        document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderContent();
      });
    });

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
              thumbnail: item.thumbnail_url || ''
            };

            if (normalized.type === 'video') {
              // Extract youtube id from URL
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
          this.content = [...this.fallbackContent];
        }
      } catch (err) {
        console.warn('Failed to load online edu content, using fallback:', err);
        this.content = [...this.fallbackContent];
      }
    }

    this.renderContent();
  },

  /** Render content grid */
  renderContent() {
    const grid = document.getElementById('edu-grid');
    let items = this.content;

    if (this.activeFilter !== 'semua') {
      items = items.filter(c => c.type === this.activeFilter);
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
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" style="border-radius:var(--radius-md);margin-bottom:var(--space-md);">` : ''}
        <p style="font-size:var(--font-sm);line-height:1.7;color:var(--text-secondary);white-space:pre-line;">${item.content || item.snippet || ''}</p>`;
    } else {
      bodyHTML = `<div style="font-size:var(--font-sm);line-height:1.8;color:var(--text-secondary);white-space:pre-line;">${item.content || item.snippet || ''}</div>`;
    }

    App.ui.openModal(item.title, bodyHTML);
  }
};

/* ===========================================
   DETOX TIMER MODULE
   =========================================== */
App.detox = {
  totalSeconds: 5 * 60,
  remainingSeconds: 5 * 60,
  timerInterval: null,
  isRunning: false,
  breathingInterval: null,
  breathingPhase: 0,
  isBreathing: false,
  quoteIndex: 0,

  quotes: [
    '"Kamu tidak perlu melihat semua yang terjadi di dunia maya untuk bahagia."',
    '"Kebahagiaan sejati datang dari dalam, bukan dari jumlah like."',
    '"Istirahat dari layar adalah investasi untuk kesehatan mentalmu."',
    '"Bandingkan dirimu hanya dengan dirimu yang kemarin."',
    '"Tidak semua yang berkilau di media sosial itu nyata."',
    '"Kamu sudah cukup, tanpa perlu validasi dari siapapun."',
    '"Waktu terbaik untuk berhenti scroll adalah sekarang."',
    '"Koneksi nyata jauh lebih berharga dari ribuan follower."',
    '"Otakmu butuh istirahat dari informasi yang berlebihan."',
    '"Hidup ini terlalu indah untuk hanya dilihat dari layar."',
    '"Setiap menit tanpa media sosial adalah hadiah untuk dirimu."',
    '"Kamu berhak merasakan ketenangan tanpa gangguan notifikasi."',
    '"Alam telah menyediakan keindahan yang tak bisa ditangkap kamera."',
    '"Rileks. Tarik napas. Kamu aman di sini."'
  ],

  init() {
    this.updateTimerDisplay();
    this.showRandomQuote();
  },

  /** Set preset time */
  setPreset(minutes, btnEl) {
    if (this.isRunning) return;
    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateTimerDisplay();

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
  },

  /** Start or pause the timer */
  start() {
    const btn = document.getElementById('btn-timer-start');

    if (this.isRunning) {
      // Pause
      clearInterval(this.timerInterval);
      this.isRunning = false;
      btn.textContent = '▶ Lanjut';
      btn.className = 'btn btn-primary btn-pill';
      document.getElementById('timer-label').textContent = 'JEDA';
    } else {
      // Start / Resume
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = this.totalSeconds;
      }
      this.isRunning = true;
      btn.textContent = '⏸ Jeda';
      btn.className = 'btn btn-warning btn-pill';
      document.getElementById('timer-label').textContent = 'BERJALAN';

      this.timerInterval = setInterval(() => {
        this.remainingSeconds--;
        this.updateTimerDisplay();

        if (this.remainingSeconds <= 0) {
          this.complete();
        }
      }, 1000);
    }
  },

  /** Reset the timer */
  reset() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.remainingSeconds = this.totalSeconds;
    this.updateTimerDisplay();

    const btn = document.getElementById('btn-timer-start');
    btn.textContent = '▶ Mulai';
    btn.className = 'btn btn-primary btn-pill';
    document.getElementById('timer-label').textContent = 'SIAP';
  },

  /** Update timer display */
  updateTimerDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    document.getElementById('timer-time').textContent =
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Update circle
    const circumference = 2 * Math.PI * 100; // r=100
    const progress = this.remainingSeconds / this.totalSeconds;
    const offset = circumference * (1 - progress);
    document.getElementById('timer-fill').style.strokeDashoffset = offset;
  },

  /** Timer completed */
  complete() {
    clearInterval(this.timerInterval);
    this.isRunning = false;

    const btn = document.getElementById('btn-timer-start');
    btn.textContent = '▶ Mulai';
    btn.className = 'btn btn-primary btn-pill';
    document.getElementById('timer-label').textContent = 'SELESAI! 🎉';

    App.utils.showToast('Detox selesai! Kamu hebat! 🎉', 'success');
    App.ui.celebrate();
  },

  /** Toggle breathing exercise */
  toggleBreathing() {
    const btn = document.getElementById('btn-breathe');
    if (this.isBreathing) {
      clearInterval(this.breathingInterval);
      this.isBreathing = false;
      btn.textContent = 'Mulai Bernapas';
      document.getElementById('breathing-circle').className = 'breathing-circle';
      document.getElementById('breathing-text').textContent = 'Tekan untuk mulai';
    } else {
      this.isBreathing = true;
      btn.textContent = 'Berhenti';
      this.breathingPhase = 0;
      this.runBreathingCycle();
    }
  },

  /** Run one cycle of the breathing exercise */
  runBreathingCycle() {
    if (!this.isBreathing) return;

    const circle = document.getElementById('breathing-circle');
    const text = document.getElementById('breathing-text');
    const phases = [
      { label: 'Tarik Napas...', className: 'breathing-circle inhale', duration: 4000 },
      { label: 'Tahan...', className: 'breathing-circle inhale', duration: 4000 },
      { label: 'Hembuskan...', className: 'breathing-circle exhale', duration: 4000 }
    ];

    const phase = phases[this.breathingPhase % 3];
    circle.className = phase.className;
    text.textContent = phase.label;

    this.breathingPhase++;
    this.breathingInterval = setTimeout(() => this.runBreathingCycle(), phase.duration);
  },

  /** Show random motivational quote */
  showRandomQuote() {
    this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
    const quoteEl = document.getElementById('quote-text');
    if (quoteEl) quoteEl.textContent = this.quotes[this.quoteIndex];
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

  /** AI response database */
  aiResponses: {
    fomo: [
      'FOMO (Fear of Missing Out) itu normal kok, tapi kalau sudah mengganggu keseharianmu, saatnya kamu mengambil langkah. 💪 Coba kurangi cek media sosial secara bertahap — mulai dari 30 menit tanpa handphone.',
      'Kamu tahu, apa yang terlihat di media sosial itu cuma highlight reel? Mereka tidak menunjukkan saat-saat sulit. Jadi jangan bandingkan behind-the-scenes kamu dengan highlight reel orang lain ya! 🎬'
    ],
    cemas: [
      'Rasa cemas itu sinyal tubuh kamu bahwa ada sesuatu yang perlu diperhatikan. Coba teknik grounding 5-4-3-2-1: Sebutkan 5 hal yang bisa kamu lihat, 4 yang bisa disentuh, 3 yang didengar, 2 yang dicium, dan 1 yang dikecap. 🌿',
      'Kecemasan bisa dikurangi dengan latihan pernapasan. Coba tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik. Ulangi 5 kali. Kamu bisa coba di menu Detox kami! 🫁'
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
      'Media sosial dirancang untuk membuat kita terus scroll. Ini bukan salahmu kalau sulit berhenti! 📱 Coba atur batasan waktu di pengaturan handphonemu, atau gunakan fitur Digital Detox kami.',
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

    // BK session
    this.bkSessionId = App.utils.getStorage('bk_session_id');
    if (!this.bkSessionId) {
      this.bkSessionId = App.utils.generateSessionId();
      App.utils.setStorage('bk_session_id', this.bkSessionId);
    }

    this.renderAiChat();
    this.renderQuickReplies();

    // Show initial AI greeting if no history
    if (this.aiHistory.length === 0) {
      this.addAiMessage('received',
        'Halo! 👋 Aku CounselBot, asisten kesehatan mentalmu. Kamu bisa curhat tentang perasaanmu, tanya tentang FOMO, atau minta tips digital wellness. Aku di sini untuk mendengarkan! 💚');
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
    const container = document.getElementById('chat-messages-bk');
    container.innerHTML = ''; // Clear container to load fresh history
    this.renderedMessageIds.clear();

    // Add welcome message
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble received';
    bubble.innerHTML = `Selamat datang di Chat Anonim Guru BK! 👨‍🏫 Kamu bisa curhat dengan aman di sini. Identitasmu dilindungi. <span class="bubble-time">${App.utils.formatTime(new Date())}</span>`;
    container.appendChild(bubble);

    // Load message history from DB
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

    // Start polling for responses
    this.startBkPolling();
  },

  /** Send message in BK chat */
  async sendBk() {
    const input = document.getElementById('chat-input-bk');
    const text = input.value.trim();
    if (!text) return;

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
        sender_type: 'student'
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

  /** Scroll chat to bottom */
  scrollToBottom(container) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }
};

/* ===========================================
   INITIALIZATION
   =========================================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('CounselSpace.Ai: DOMContentLoaded event fired');
  // Initialize router
  App.router.init();

  // Check if returning user
  const hasVisited = App.utils.getStorage('has_visited', false);
  const hash = window.location.hash.replace('#', '');

  if (hash && hash !== 'splash') {
    // Direct navigation via URL
    App.router.showPage(hash);
  } else if (hasVisited) {
    // Returning user — go to dashboard
    App.router.showPage('dashboard');
  } else {
    // First time — show splash
    App.router.showPage('splash');
    App.utils.setStorage('has_visited', true);
  }

  // Rotate detox quotes every 15 seconds
  setInterval(() => {
    if (App.router.currentPage === 'detox') {
      App.detox.showRandomQuote();
    }
  }, 15000);

  // Clean up BK polling on page unload
  window.addEventListener('beforeunload', () => {
    App.chat.stopBkPolling();
    if (App.detox.timerInterval) clearInterval(App.detox.timerInterval);
    if (App.detox.breathingInterval) clearTimeout(App.detox.breathingInterval);
  });
});
