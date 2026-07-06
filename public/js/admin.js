/**
 * ============================================
 * CounselSpace.Ai — Admin Dashboard JS
 * ============================================
 * Semua logika klien untuk panel admin Guru BK.
 * Berkomunikasi dengan Laravel RESTful API.
 */

(function () {
    'use strict';

    // ============================================
    // CONFIG & STATE
    // ============================================
    const API_BASE = '/api/';
    const POLL_INTERVAL = 5000; // 5 detik polling chat

    const state = {
        currentPage: 'dashboard',
        questions: [],
        eduContent: [],
        eduFilter: 'all',
        chatSessions: [],
        activeChatSessionId: null,
        chatMessages: [],
        chatPollTimer: null,
        screenings: [],
        screeningsPage: 1,
        screeningsLimit: 15,
        screeningsTotal: 0,
        screeningsFilter: '',
        screeningsSearch: '',
        recapUsers: [],
        recapFilter: 'all',
    };

    // ============================================
    // DOM REFERENCES
    // ============================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const dom = {
        loginSection: $('#admin-login'),
        appSection: $('#admin-app'),
        loginForm: $('#login-form'),
        loginBtn: $('#login-btn'),
        loginError: $('#login-error'),
        loginUsername: $('#login-username'),
        loginPassword: $('#login-password'),
        sidebar: $('#sidebar'),
        sidebarOverlay: $('#sidebar-overlay'),
        hamburgerBtn: $('#hamburger-btn'),
        navItems: $$('.nav-item[data-page]'),
        navRecap: $('#nav-recap'),
        navCounselors: $('#nav-counselors'),
        navProfile: $('#nav-profile'),
        counselorsBody: $('#counselors-table-body'),
        counselorForm: $('#counselor-form'),
        profileForm: $('#profile-form'),
        btnCounselorAdd: $('#btn-add-counselor'),
        recapBody: $('#recap-table-body'),
        recapRoleFilter: $('#recap-role-filter'),
        navLogout: $('#nav-logout'),
        pages: $$('.page'),
        modalOverlay: $('#modal-overlay'),
        modalContainer: $('#modal-container'),
        toastContainer: $('#toast-container'),
        // Dashboard
        statTotal: $('#stat-total'),
        statSafe: $('#stat-safe'),
        statSafePct: $('#stat-safe-pct'),
        statWarning: $('#stat-warning'),
        statWarningPct: $('#stat-warning-pct'),
        statDanger: $('#stat-danger'),
        statDangerPct: $('#stat-danger-pct'),
        recentBody: $('#recent-screenings-body'),
        barChart: $('#bar-chart'),
        // Questions
        questionsBody: $('#questions-table-body'),
        btnAddQuestion: $('#btn-add-question'),
        // Edu
        eduTabs: $('#edu-tabs'),
        eduGrid: $('#edu-grid'),
        btnAddEdu: $('#btn-add-edu'),
        // Chat
        chatSessions: $('#chat-sessions'),
        chatConversation: $('#chat-conversation'),
        chatPlaceholder: $('#chat-placeholder'),
        chatConvHeader: $('#chat-conv-header'),
        chatConvTitle: $('#chat-conv-title'),
        chatMessages: $('#chat-messages'),
        chatInputArea: $('#chat-input-area'),
        chatInput: $('#chat-input'),
        chatSendBtn: $('#chat-send-btn'),
        // Screenings
        screeningsBody: $('#screenings-table-body'),
        screeningsPagination: $('#screenings-pagination'),
        screeningSearch: $('#screening-search'),
        screeningCategoryFilter: $('#screening-category-filter'),
        btnExportCsv: $('#btn-export-csv'),
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Fetch wrapper — mengirim request ke API
     * @param {string} endpoint - relatif ke /api/
     * @param {string} method - HTTP method
     * @param {object|null} data - body JSON (untuk POST/PUT)
     * @returns {Promise<object>}
     */
    async function api(endpoint, method = 'GET', data = null) {
        const url = API_BASE + endpoint;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        // Sertakan token jika ada
        const token = sessionStorage.getItem('admin_token');
        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.message || `HTTP ${response.status}`);
        }
        return json;
    }

    /**
     * Tampilkan notifikasi toast
     * @param {string} message
     * @param {'success'|'error'|'info'} type
     */
    function showToast(message, type = 'info') {
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    /**
     * Escape HTML untuk keamanan XSS
     */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Format tanggal ke format Indonesia
     * @param {string} dateString
     * @returns {string}
     */
    function formatDate(dateString) {
        if (!dateString) return '-';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${mins}`;
    }

    /**
     * Format tanggal singkat (tanpa jam)
     */
    function formatDateShort(dateString) {
        if (!dateString) return '-';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    /**
     * Format waktu singkat untuk chat
     */
    function formatTime(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    /**
     * Badge HTML berdasarkan kategori
     */
    function categoryBadge(category) {
        const c = (category || '').toLowerCase();
        if (c === 'aman' || c === 'safe') return `<span class="badge badge-green">Aman</span>`;
        if (c === 'waspada' || c === 'warning') return `<span class="badge badge-amber">Waspada</span>`;
        if (c === 'bahaya' || c === 'danger') return `<span class="badge badge-red">Bahaya</span>`;
        return `<span class="badge badge-teal">${escapeHtml(category || '-')}</span>`;
    }

    /**
     * Show modal dengan konten HTML
     */
    function showModal(html) {
        dom.modalContainer.innerHTML = html;
        dom.modalOverlay.classList.add('show');
        // Close saat klik overlay
        dom.modalOverlay.onclick = (e) => {
            if (e.target === dom.modalOverlay) hideModal();
        };
        // Fokus elemen pertama yang bisa difokus
        const first = dom.modalContainer.querySelector('input, textarea, select, button');
        if (first) setTimeout(() => first.focus(), 100);
    }

    function hideModal() {
        dom.modalOverlay.classList.remove('show');
        dom.modalContainer.innerHTML = '';
    }

    /**
     * Dialog konfirmasi — mengembalikan Promise<boolean>
     */
    function confirmDialog(message) {
        return new Promise((resolve) => {
            showModal(`
                <div class="modal-header">
                    <h3>⚠️ Konfirmasi</h3>
                    <button class="modal-close" onclick="void(0)" data-action="close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color:var(--text-secondary); line-height:1.6;">${escapeHtml(message)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="cancel">Batal</button>
                    <button class="btn btn-danger" data-action="confirm">Ya, Lanjutkan</button>
                </div>
            `);
            dom.modalContainer.querySelector('[data-action="close"]').onclick = () => { hideModal(); resolve(false); };
            dom.modalContainer.querySelector('[data-action="cancel"]').onclick = () => { hideModal(); resolve(false); };
            dom.modalContainer.querySelector('[data-action="confirm"]').onclick = () => { hideModal(); resolve(true); };
        });
    }

    /**
     * Animasi counter angka
     */
    function animateCounter(element, target, duration = 800) {
        const start = parseInt(element.textContent) || 0;
        const diff = target - start;
        if (diff === 0) { element.textContent = target; return; }
        const startTime = performance.now();
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(start + diff * eased);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /**
     * Extract YouTube video ID
     */
    function extractYoutubeId(url) {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
        return match ? match[1] : null;
    }

    // ============================================
    // AUTHENTICATION
    // ============================================

    function isAuthenticated() {
        if (sessionStorage.getItem('admin_authenticated') !== 'true') return false;
        try {
            const user = JSON.parse(sessionStorage.getItem('admin_user'));
            return user && (user.role === 'admin' || user.role === 'guru');
        } catch {
            return false;
        }
    }

    function showLogin() {
        dom.loginSection.style.display = 'flex';
        dom.appSection.style.display = 'none';
        stopChatPolling();
    }

    function getUserRole() {
        try {
            const user = JSON.parse(sessionStorage.getItem('admin_user'));
            return user ? user.role : 'guru';
        } catch {
            return 'guru';
        }
    }

    function showApp() {
        dom.loginSection.style.display = 'none';
        dom.appSection.style.display = 'block';

        const role = getUserRole();
        if (role === 'admin') {
            dom.navRecap.style.display = 'flex';
            dom.navCounselors.style.display = 'flex';
            dom.navProfile.style.display = 'none';
            if (dom.btnAddQuestion) dom.btnAddQuestion.style.display = 'inline-block';
            if (dom.btnAddEdu) dom.btnAddEdu.style.display = 'inline-block';
        } else {
            dom.navRecap.style.display = 'none';
            dom.navCounselors.style.display = 'none';
            dom.navProfile.style.display = 'flex';
            if (dom.btnAddQuestion) dom.btnAddQuestion.style.display = 'none';
            if (dom.btnAddEdu) dom.btnAddEdu.style.display = 'none';
            if (state.currentPage === 'recap' || state.currentPage === 'counselors') {
                state.currentPage = 'dashboard';
            }
        }

        startPing();
        navigateTo(state.currentPage);
    }

    function logout() {
        stopPing();
        stopChatPolling();
        sessionStorage.clear();
        window.location.hash = '';
        showLogin();
        showToast('Berhasil logout', 'info');
    }

    async function handleLogin(e) {
        e.preventDefault();
        const username = dom.loginUsername.value.trim();
        const password = dom.loginPassword.value;

        if (!username || !password) {
            dom.loginError.textContent = 'Email/Username dan password wajib diisi.';
            dom.loginError.style.display = 'block';
            return;
        }

        dom.loginBtn.classList.add('loading');
        dom.loginError.style.display = 'none';

        try {
            const result = await api('auth/login', 'POST', { username, password });
            
            // Validasi role: siswa dilarang masuk panel admin
            if (result.data.role === 'siswa') {
                throw new Error('Akses ditolak. Panel ini hanya untuk Admin dan Guru BK.');
            }

            // Simpan sesi
            sessionStorage.setItem('admin_authenticated', 'true');
            if (result.data.token) sessionStorage.setItem('admin_token', result.data.token);
            if (result.data) sessionStorage.setItem('admin_user', JSON.stringify(result.data));
            showToast('Login berhasil! Selamat datang.', 'success');
            showApp();
        } catch (err) {
            dom.loginError.textContent = err.message || 'Login gagal. Periksa kembali data Anda.';
            dom.loginError.style.display = 'block';
        } finally {
            dom.loginBtn.classList.remove('loading');
        }
    }

    // ============================================
    // ROUTER — Hash-based navigation
    // ============================================

    function navigateTo(page) {
        state.currentPage = page;
        window.location.hash = '#admin-' + page;

        // Update sidebar active
        dom.navItems.forEach((item) => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Show/hide pages
        dom.pages.forEach((p) => {
            p.classList.toggle('active', p.id === 'page-' + page);
        });

        // Close mobile sidebar
        closeSidebar();

        // Load data sesuai halaman
        switch (page) {
            case 'dashboard': loadDashboard(); break;
            case 'questions': loadQuestions(); break;
            case 'edu': loadEduContent(); break;
            case 'chat': loadChatSessions(); break;
            case 'screenings': loadScreenings(); break;
            case 'recap': fetchRecapData(); break;
            case 'counselors': loadCounselors(); break;
            case 'profile': loadProfile(); break;
        }

        // Stop polling chat jika bukan halaman chat
        if (page !== 'chat') stopChatPolling();
    }

    function handleHashChange() {
        if (!isAuthenticated()) return;
        const hash = window.location.hash.replace('#admin-', '');
        const validPages = ['dashboard', 'questions', 'edu', 'chat', 'screenings', 'recap', 'counselors', 'profile'];
        if (validPages.includes(hash)) {
            navigateTo(hash);
        }
    }

    // ============================================
    // SIDEBAR (mobile)
    // ============================================

    function openSidebar() {
        dom.sidebar.classList.add('open');
        dom.sidebarOverlay.classList.add('show');
    }

    function closeSidebar() {
        dom.sidebar.classList.remove('open');
        dom.sidebarOverlay.classList.remove('show');
    }

    // ============================================
    // DASHBOARD MODULE
    // ============================================

    async function loadDashboard() {
        try {
            const data = await api('admin/stats');
            renderStats(data.data || {});
        } catch (err) {
            renderStats({
                total_screenings: 0,
                per_category: { aman: 0, waspada: 0, bahaya: 0 }
            });
        }

        try {
            const data = await api('admin/screenings?limit=10');
            renderRecentScreenings(data.data || []);
        } catch (err) {
            renderRecentScreenings([]);
        }
    }

    function renderStats(data) {
        const total = data.total_screenings || 0;
        const safe = data.per_category?.aman || 0;
        const warning = data.per_category?.waspada || 0;
        const danger = data.per_category?.bahaya || 0;

        animateCounter(dom.statTotal, total);
        animateCounter(dom.statSafe, safe);
        animateCounter(dom.statWarning, warning);
        animateCounter(dom.statDanger, danger);

        const pct = (val) => total > 0 ? ((val / total) * 100).toFixed(1) : 0;
        dom.statSafePct.textContent = `${pct(safe)}% dari total`;
        dom.statWarningPct.textContent = `${pct(warning)}% dari total`;
        dom.statDangerPct.textContent = `${pct(danger)}% dari total`;

        // Bar chart
        renderBarChart(safe, warning, danger);
    }

    function renderBarChart(safe, warning, danger) {
        const max = Math.max(safe, warning, danger, 1);
        const barH = (val) => Math.max((val / max) * 160, 4);

        dom.barChart.innerHTML = `
            <div class="bar-group">
                <div class="bar-fill" style="height:${barH(safe)}px; background:var(--green);">
                    <span class="bar-value" style="color:var(--green)">${safe}</span>
                </div>
                <span class="bar-label">Aman</span>
            </div>
            <div class="bar-group">
                <div class="bar-fill" style="height:${barH(warning)}px; background:var(--amber);">
                    <span class="bar-value" style="color:var(--amber)">${warning}</span>
                </div>
                <span class="bar-label">Waspada</span>
            </div>
            <div class="bar-group">
                <div class="bar-fill" style="height:${barH(danger)}px; background:var(--red);">
                    <span class="bar-value" style="color:var(--red)">${danger}</span>
                </div>
                <span class="bar-label">Bahaya</span>
            </div>
        `;
    }

    function renderRecentScreenings(screenings) {
        if (!screenings.length) {
            dom.recentBody.innerHTML = `
                <tr><td colspan="5" class="table-empty">
                    <div class="empty-icon">📋</div>
                    <p>Belum ada data skrining</p>
                </td></tr>`;
            return;
        }
        dom.recentBody.innerHTML = screenings.map((s) => `
            <tr>
                <td style="color:var(--text-primary); font-weight:500;">${escapeHtml(s.student_name || '-')}</td>
                <td>${escapeHtml(s.student_class || '-')}</td>
                <td><strong>${s.total_score || 0}</strong></td>
                <td>${categoryBadge(s.category)}</td>
                <td>${formatDateShort(s.created_at || s.date)}</td>
            </tr>
        `).join('');
    }

    // ============================================
    // QUESTIONS CRUD MODULE
    // ============================================

    async function loadQuestions() {
        dom.questionsBody.innerHTML = `<tr><td colspan="6"><div class="spinner-overlay"><div class="spinner"></div></div></td></tr>`;
        try {
            const data = await api('admin/questions');
            state.questions = data.data || [];
            renderQuestionsTable();
        } catch (err) {
            state.questions = [];
            renderQuestionsTable();
        }
    }

    function renderQuestionsTable() {
        if (!state.questions.length) {
            dom.questionsBody.innerHTML = `
                <tr><td colspan="6" class="table-empty">
                    <div class="empty-icon">📝</div>
                    <p>Belum ada soal kuesioner</p>
                </td></tr>`;
            return;
        }

        const isAdmin = getUserRole() === 'admin';

        dom.questionsBody.innerHTML = state.questions.map((q, i) => `
            <tr>
                <td>${i + 1}</td>
                <td style="white-space:normal; max-width:400px; color:var(--text-primary);">${escapeHtml(q.question_text || '')}</td>
                <td>${categoryBadge(q.category || '-')}</td>
                <td><strong>${q.weight || 1}</strong></td>
                <td>
                    <label class="toggle">
                        <input type="checkbox" ${q.is_active ? 'checked' : ''} ${isAdmin ? '' : 'disabled'} onchange="window.adminApp.toggleQuestion(${q.id}, this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    ${isAdmin ? `
                    <div style="display:flex; gap:0.35rem;">
                        <button class="btn btn-icon btn-sm" title="Edit" onclick="window.adminApp.showEditQuestionModal(${q.id})">✏️</button>
                        <button class="btn btn-icon btn-sm" title="Hapus" onclick="window.adminApp.deleteQuestion(${q.id})">🗑️</button>
                    </div>` : '<span class="text-muted" style="font-size:0.8rem;">Hanya Admin</span>'}
                </td>
            </tr>
        `).join('');
    }

    function showAddQuestionModal() {
        showModal(`
            <div class="modal-header">
                <h3>Tambah Soal Baru</h3>
                <button class="modal-close" onclick="window.adminApp.hideModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="question-form">
                    <div class="form-group">
                        <label>Pertanyaan *</label>
                        <textarea class="form-control" id="qf-text" rows="3" placeholder="Tulis pertanyaan..." required></textarea>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                        <div class="form-group">
                            <label>Kategori *</label>
                            <select class="form-control" id="qf-category" required>
                                <option value="">Pilih kategori</option>
                                <option value="fomo">FOMO</option>
                                <option value="umum">Umum</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Bobot (1-3) *</label>
                            <input type="number" class="form-control" id="qf-weight" min="1" max="3" value="1" required>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.adminApp.hideModal()">Batal</button>
                <button class="btn btn-primary" onclick="window.adminApp.saveQuestion()">Simpan</button>
            </div>
        `);
    }

    function showEditQuestionModal(id) {
        const q = state.questions.find((x) => x.id == id);
        if (!q) return showToast('Soal tidak ditemukan', 'error');

        showModal(`
            <div class="modal-header">
                <h3>Edit Soal</h3>
                <button class="modal-close" onclick="window.adminApp.hideModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="question-form">
                    <input type="hidden" id="qf-id" value="${q.id}">
                    <div class="form-group">
                        <label>Pertanyaan *</label>
                        <textarea class="form-control" id="qf-text" rows="3" required>${escapeHtml(q.question_text || '')}</textarea>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                        <div class="form-group">
                            <label>Kategori *</label>
                            <select class="form-control" id="qf-category" required>
                                <option value="fomo" ${q.category === 'fomo' ? 'selected' : ''}>FOMO</option>
                                <option value="umum" ${q.category === 'umum' ? 'selected' : ''}>Umum</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Bobot (1-3) *</label>
                            <input type="number" class="form-control" id="qf-weight" min="1" max="3" value="${q.weight || 1}" required>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.adminApp.hideModal()">Batal</button>
                <button class="btn btn-primary" onclick="window.adminApp.saveQuestion()">Simpan Perubahan</button>
            </div>
        `);
    }

    async function saveQuestion() {
        const idEl = document.getElementById('qf-id');
        const text = document.getElementById('qf-text').value.trim();
        const category = document.getElementById('qf-category').value;
        const weight = parseInt(document.getElementById('qf-weight').value);

        if (!text || !category || isNaN(weight)) {
            showToast('Semua field wajib diisi.', 'error');
            return;
        }

        const isEdit = idEl && idEl.value;
        const payload = {
            question_text: text,
            category: category,
            weight: weight,
        };

        try {
            if (isEdit) {
                await api('admin/questions/' + idEl.value, 'PUT', payload);
            } else {
                await api('admin/questions', 'POST', payload);
            }
            hideModal();
            showToast(isEdit ? 'Soal berhasil diperbarui!' : 'Soal berhasil ditambahkan!', 'success');
            loadQuestions();
        } catch (err) {
            showToast('Gagal menyimpan: ' + err.message, 'error');
        }
    }

    async function deleteQuestion(id) {
        const confirmed = await confirmDialog('Apakah Anda yakin ingin menghapus soal ini?');
        if (!confirmed) return;

        try {
            await api('admin/questions/' + id, 'DELETE');
            showToast('Soal berhasil dihapus.', 'success');
            loadQuestions();
        } catch (err) {
            showToast('Gagal menghapus: ' + err.message, 'error');
        }
    }

    async function toggleQuestion(id, active) {
        try {
            await api('admin/questions/' + id + '/toggle', 'PATCH');
            showToast(`Soal ${active ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
        } catch (err) {
            showToast('Gagal mengubah status: ' + err.message, 'error');
            loadQuestions(); // revert tampilan
        }
    }

    // ============================================
    // EDU CONTENT CRUD MODULE
    // ============================================

    async function loadEduContent() {
        dom.eduGrid.innerHTML = `<div class="spinner-overlay"><div class="spinner"></div></div>`;
        try {
            const data = await api('admin/edu');
            state.eduContent = data.data || [];
            renderEduContent();
        } catch (err) {
            state.eduContent = [];
            renderEduContent();
        }
    }

    function renderEduContent() {
        let filtered = state.eduContent;
        if (state.eduFilter !== 'all') {
            filtered = filtered.filter((c) => c.content_type === state.eduFilter);
        }

        if (!filtered.length) {
            dom.eduGrid.innerHTML = `
                <div class="table-empty" style="grid-column:1/-1;">
                    <div class="empty-icon">📚</div>
                    <p>Belum ada konten edukasi${state.eduFilter !== 'all' ? ' untuk kategori ini' : ''}</p>
                </div>`;
            return;
        }

        const isAdmin = getUserRole() === 'admin';

        dom.eduGrid.innerHTML = filtered.map((c) => {
            const type = c.content_type || 'artikel';
            const typeIcons = { video: '🎬', poster: '🖼️', artikel: '📰' };
            const typeLabels = { video: 'Video', poster: 'Poster', artikel: 'Artikel' };
            const thumbUrl = c.thumbnail_url || '';
            const ytId = type === 'video' ? extractYoutubeId(c.content_url || '') : null;
            const thumbSrc = thumbUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '');

            return `
                <div class="edu-card">
                    <div class="edu-card-thumb">
                        ${thumbSrc
                            ? `<img src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(c.title)}" onerror="this.parentElement.innerHTML='${typeIcons[type] || '📄'}';">`
                            : typeIcons[type] || '📄'
                        }
                        <span class="edu-card-type-badge badge badge-teal">${typeLabels[type] || type}</span>
                    </div>
                    <div class="edu-card-body">
                        <div class="edu-card-title">${escapeHtml(c.title || '-')}</div>
                        <div class="edu-card-desc">${escapeHtml(c.description || '-')}</div>
                        <div class="edu-card-footer">
                            <span class="badge badge-teal">${escapeHtml(c.category || '-')}</span>
                            ${isAdmin ? `
                            <div style="display:flex; gap:0.35rem;">
                                <button class="btn btn-icon btn-sm" title="Edit" onclick="window.adminApp.showEditEduModal(${c.id})">✏️</button>
                                <button class="btn btn-icon btn-sm" title="Hapus" onclick="window.adminApp.deleteEduContent(${c.id})">🗑️</button>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function showAddEduModal() {
        showEduModal();
    }

    function showEditEduModal(id) {
        const c = state.eduContent.find((x) => x.id == id);
        if (!c) return showToast('Konten tidak ditemukan', 'error');
        showEduModal(c);
    }

    function showEduModal(data = null) {
        const isEdit = !!data;
        const title = isEdit ? 'Edit Konten' : 'Tambah Konten Baru';
        const type = data ? data.content_type : '';
        const url = data ? data.content_url : '';

        showModal(`
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="window.adminApp.hideModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edu-form">
                    ${isEdit ? `<input type="hidden" id="ef-id" value="${data.id}">` : ''}
                    <div class="form-group">
                        <label>Judul *</label>
                        <input type="text" class="form-control" id="ef-title" value="${escapeHtml(data?.title || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Deskripsi</label>
                        <textarea class="form-control" id="ef-desc" rows="2">${escapeHtml(data?.description || '')}</textarea>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                        <div class="form-group">
                            <label>Tipe Konten *</label>
                            <select class="form-control" id="ef-type" required onchange="window.adminApp.updateEduPreview()">
                                <option value="">Pilih tipe</option>
                                <option value="video" ${type === 'video' ? 'selected' : ''}>Video</option>
                                <option value="poster" ${type === 'poster' ? 'selected' : ''}>Poster</option>
                                <option value="artikel" ${type === 'artikel' ? 'selected' : ''}>Artikel</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Kategori</label>
                            <input type="text" class="form-control" id="ef-category" value="${escapeHtml(data?.category || '')}" placeholder="cth: fomo">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>URL Konten * <small style="color:var(--text-muted)">(YouTube URL / Image URL / HTML)</small></label>
                        <input type="text" class="form-control" id="ef-url" value="${escapeHtml(url)}" placeholder="https://..." required oninput="window.adminApp.updateEduPreview()">
                    </div>
                    <div class="form-group">
                        <label>URL Thumbnail <small style="color:var(--text-muted)">(opsional)</small></label>
                        <input type="text" class="form-control" id="ef-thumb" value="${escapeHtml(data?.thumbnail_url || '')}" placeholder="https://...">
                    </div>
                    <div id="ef-preview"></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="window.adminApp.hideModal()">Batal</button>
                <button class="btn btn-primary" onclick="window.adminApp.saveEduContent()">Simpan</button>
            </div>
        `);

        // Tampilkan preview jika sedang edit
        if (isEdit) updateEduPreview();
    }

    function updateEduPreview() {
        const type = document.getElementById('ef-type')?.value;
        const url = document.getElementById('ef-url')?.value?.trim();
        const preview = document.getElementById('ef-preview');
        if (!preview) return;

        if (!type || !url) {
            preview.innerHTML = '';
            return;
        }

        if (type === 'video') {
            const ytId = extractYoutubeId(url);
            if (ytId) {
                preview.innerHTML = `<div class="preview-container"><iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen></iframe></div>`;
            } else {
                preview.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; margin-top:0.5rem;">URL YouTube tidak valid</p>`;
            }
        } else if (type === 'poster') {
            preview.innerHTML = `<div class="preview-container"><img src="${escapeHtml(url)}" alt="Preview" onerror="this.parentElement.innerHTML='<p style=\\'padding:1rem; color:var(--text-muted)\\'>Gagal memuat gambar</p>';"></div>`;
        } else {
            preview.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; margin-top:0.5rem;">Preview tidak tersedia untuk tipe artikel</p>`;
        }
    }

    async function saveEduContent() {
        const idEl = document.getElementById('ef-id');
        const title = document.getElementById('ef-title').value.trim();
        const description = document.getElementById('ef-desc').value.trim();
        const content_type = document.getElementById('ef-type').value;
        const content_url = document.getElementById('ef-url').value.trim();
        const thumbnail_url = document.getElementById('ef-thumb').value.trim();
        const category = document.getElementById('ef-category').value.trim();

        if (!title || !content_type || !content_url) {
            showToast('Judul, tipe, dan URL konten wajib diisi.', 'error');
            return;
        }

        const isEdit = idEl && idEl.value;
        const payload = {
            title,
            description,
            content_type,
            content_url,
            thumbnail_url,
            category,
        };

        try {
            if (isEdit) {
                await api('admin/edu/' + idEl.value, 'PUT', payload);
            } else {
                await api('admin/edu', 'POST', payload);
            }
            hideModal();
            showToast(isEdit ? 'Konten berhasil diperbarui!' : 'Konten berhasil ditambahkan!', 'success');
            loadEduContent();
        } catch (err) {
            showToast('Gagal menyimpan: ' + err.message, 'error');
        }
    }

    async function deleteEduContent(id) {
        const confirmed = await confirmDialog('Apakah Anda yakin ingin menghapus konten ini?');
        if (!confirmed) return;

        try {
            await api('admin/edu/' + id, 'DELETE');
            showToast('Konten berhasil dihapus.', 'success');
            loadEduContent();
        } catch (err) {
            showToast('Gagal menghapus: ' + err.message, 'error');
        }
    }

    // ============================================
    // CHAT MODULE
    // ============================================

    async function loadChatSessions() {
        dom.chatSessions.innerHTML = `<div class="spinner-overlay"><div class="spinner"></div></div>`;
        try {
            const data = await api('chats/sessions');
            state.chatSessions = data.data || [];
            renderChatSessions();
        } catch (err) {
            state.chatSessions = [];
            renderChatSessions();
        }
        startChatPolling();
    }

    function renderChatSessions() {
        if (!state.chatSessions.length) {
            dom.chatSessions.innerHTML = `
                <div class="table-empty" style="padding:2rem;">
                    <div class="empty-icon">💬</div>
                    <p>Belum ada sesi chat aktif</p>
                </div>`;
            return;
        }

        dom.chatSessions.innerHTML = state.chatSessions.map((s) => {
            const sessionId = s.session_id;
            const isActive = state.activeChatSessionId == sessionId;
            
            let name = '';
            if (s.is_anonymous) {
                name = `Siswa Anonim (Siswa #${sessionId.substring(5, 12)})`;
            } else {
                name = `${s.student_name || 'Siswa'} (${s.student_class || '-'})`;
            }

            const preview = s.last_message || 'Belum ada pesan';
            const time = formatTime(s.last_time);
            const unread = s.unread_count || 0;

            return `
                <div class="chat-session-item ${isActive ? 'active' : ''}" onclick="window.adminApp.openChat('${sessionId}')">
                    <div class="chat-session-avatar">👤</div>
                    <div class="chat-session-info">
                        <div class="chat-session-name">${escapeHtml(name)}</div>
                        <div class="chat-session-preview">${escapeHtml(preview)}</div>
                    </div>
                    <div class="chat-session-meta">
                        <span class="chat-session-time">${time}</span>
                        ${unread > 0 ? `<span class="chat-unread">${unread}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    async function openChat(sessionId) {
        state.activeChatSessionId = sessionId;
        renderChatSessions(); // update highlight

        // Tampilkan area chat
        dom.chatPlaceholder.style.display = 'none';
        dom.chatConvHeader.style.display = 'flex';
        dom.chatMessages.style.display = 'flex';
        dom.chatInputArea.style.display = 'flex';

        const session = state.chatSessions.find(s => s.session_id === sessionId);
        let title = 'Siswa';
        if (session) {
            if (session.is_anonymous) {
                title = `Siswa Anonim (Siswa #${sessionId.substring(5, 12)})`;
            } else {
                title = `${session.student_name} (${session.student_class})`;
            }
        } else {
            title = `Siswa #${sessionId.substring(5, 12)}`;
        }
        dom.chatConvTitle.textContent = title;

        await loadChatMessages(sessionId);
        markAsRead(sessionId);
    }

    async function loadChatMessages(sessionId) {
        try {
            const data = await api(`chats/${sessionId}`);
            state.chatMessages = data.data || [];
            renderChatBubbles();
        } catch (err) {
            state.chatMessages = [];
            renderChatBubbles();
        }
    }

    function renderChatBubbles() {
        if (!state.chatMessages.length) {
            dom.chatMessages.innerHTML = `<div class="chat-placeholder" style="height:auto; padding:2rem;"><p style="color:var(--text-muted);">Belum ada pesan</p></div>`;
            return;
        }

        dom.chatMessages.innerHTML = state.chatMessages.map((m) => {
            const isCounselor = m.sender_type === 'counselor';
            return `
                <div class="chat-bubble ${isCounselor ? 'counselor' : 'student'}">
                    <div>${escapeHtml(m.message || '')}</div>
                    <div class="bubble-time">${formatTime(m.created_at)}</div>
                </div>
            `;
        }).join('');

        // Auto scroll ke bawah
        dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    }

    async function sendReply() {
        const message = dom.chatInput.value.trim();
        if (!message || !state.activeChatSessionId) return;

        dom.chatInput.value = '';
        dom.chatSendBtn.disabled = true;

        try {
            await api('chats', 'POST', {
                session_id: state.activeChatSessionId,
                sender_type: 'counselor',
                message: message,
            });
            // Reload pesan
            await loadChatMessages(state.activeChatSessionId);
        } catch (err) {
            showToast('Gagal mengirim pesan: ' + err.message, 'error');
            dom.chatInput.value = message; // Kembalikan pesan ke input
        } finally {
            dom.chatSendBtn.disabled = false;
        }
    }

    async function markAsRead(sessionId) {
        try {
            await api(`chats/${sessionId}/read`, 'PUT');
        } catch (err) {
            // Silent fail
        }
    }

    function startChatPolling() {
        stopChatPolling();
        state.chatPollTimer = setInterval(async () => {
            // Refresh sessions list
            try {
                const data = await api('chats/sessions');
                state.chatSessions = data.data || [];
                renderChatSessions();
            } catch (err) { /* silent */ }

            // Refresh current conversation
            if (state.activeChatSessionId) {
                await loadChatMessages(state.activeChatSessionId);
            }
        }, POLL_INTERVAL);
    }

    function stopChatPolling() {
        if (state.chatPollTimer) {
            clearInterval(state.chatPollTimer);
            state.chatPollTimer = null;
        }
    }

    // ============================================
    // SCREENINGS MODULE
    // ============================================

    async function loadScreenings(page, limit, filters) {
        page = page || state.screeningsPage;
        limit = limit || state.screeningsLimit;
        const category = filters?.category ?? state.screeningsFilter;
        const search = filters?.search ?? state.screeningsSearch;

        state.screeningsPage = page;
        if (filters?.category !== undefined) state.screeningsFilter = filters.category;
        if (filters?.search !== undefined) state.screeningsSearch = filters.search;

        dom.screeningsBody.innerHTML = `<tr><td colspan="8"><div class="spinner-overlay"><div class="spinner"></div></div></td></tr>`;

        let endpoint = `admin/screenings?page=${page}&limit=${limit}`;
        if (category) endpoint += `&category=${encodeURIComponent(category)}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;

        try {
            const data = await api(endpoint);
            const screenings = data.data || [];
            state.screeningsTotal = data.pagination?.total_records || screenings.length;
            state.screenings = screenings;
            renderScreeningsTable();
            renderPagination();
        } catch (err) {
            state.screenings = [];
            state.screeningsTotal = 0;
            renderScreeningsTable();
            renderPagination();
        }
    }

    function renderScreeningsTable() {
        if (!state.screenings.length) {
            dom.screeningsBody.innerHTML = `
                <tr><td colspan="8" class="table-empty">
                    <div class="empty-icon">📋</div>
                    <p>Tidak ada data skrining ditemukan</p>
                </td></tr>`;
            return;
        }

        const offset = (state.screeningsPage - 1) * state.screeningsLimit;

        dom.screeningsBody.innerHTML = state.screenings.map((s, i) => {
            const score = s.total_score || 0;
            const maxScore = s.max_score || 100;
            const pct = s.percentage || 0;

            return `
                <tr style="cursor:pointer;" onclick="window.adminApp.showDetailModal(${s.id})">
                    <td>${offset + i + 1}</td>
                    <td style="color:var(--text-primary); font-weight:500;">${escapeHtml(s.student_name || '-')}</td>
                    <td>${escapeHtml(s.student_class || '-')}</td>
                    <td><strong>${score}</strong></td>
                    <td>${pct}%</td>
                    <td>${categoryBadge(s.category)}</td>
                    <td>${formatDateShort(s.created_at)}</td>
                    <td><button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); window.adminApp.showDetailModal(${s.id})">Detail</button></td>
                </tr>
            `;
        }).join('');
    }

    function renderPagination() {
        const totalPages = Math.ceil(state.screeningsTotal / state.screeningsLimit) || 1;
        if (totalPages <= 1) {
            dom.screeningsPagination.innerHTML = '';
            return;
        }

        let html = '';

        // Previous
        html += `<button ${state.screeningsPage <= 1 ? 'disabled' : ''} onclick="window.adminApp.goToPage(${state.screeningsPage - 1})">‹</button>`;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, state.screeningsPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button onclick="window.adminApp.goToPage(1)">1</button>`;
            if (startPage > 2) html += `<button disabled>…</button>`;
        }

        for (let p = startPage; p <= endPage; p++) {
            html += `<button class="${p === state.screeningsPage ? 'active' : ''}" onclick="window.adminApp.goToPage(${p})">${p}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<button disabled>…</button>`;
            html += `<button onclick="window.adminApp.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Next
        html += `<button ${state.screeningsPage >= totalPages ? 'disabled' : ''} onclick="window.adminApp.goToPage(${state.screeningsPage + 1})">›</button>`;

        dom.screeningsPagination.innerHTML = html;
    }

    function goToPage(page) {
        loadScreenings(page);
    }

    async function showDetailModal(id) {
        showModal(`
            <div class="modal-header">
                <h3>Detail Hasil Skrining</h3>
                <button class="modal-close" onclick="window.adminApp.hideModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="spinner-overlay"><div class="spinner"></div></div>
            </div>
        `);

        try {
            const data = await api(`admin/screenings/${id}`);
            const s = data.data || {};
            const answers = s.answers_json || [];
            const score = s.total_score || 0;
            const maxScore = s.max_score || 100;
            const pct = s.percentage || 0;

            let answersHtml = '';
            if (answers.length) {
                // We don't have the question_text inside answers_json in database, but we can reconstruct it or get active questions.
                // Let's display the question ID and score
                answersHtml = `
                    <h4 style="margin:1.25rem 0 0.75rem; font-size:0.9rem; color:var(--text-primary);">Detail Jawaban</h4>
                    <table style="width:100%;">
                        <thead>
                            <tr>
                                <th style="width:100px;">ID Soal</th>
                                <th style="width:100px;">Bobot</th>
                                <th style="width:80px;">Skor Jawaban</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${answers.map((a) => `
                                <tr>
                                    <td>Soal #${a.question_id}</td>
                                    <td>${a.weight || 1}</td>
                                    <td><strong>${a.answer_value || '-'}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }

            showModal(`
                <div class="modal-header">
                    <h3>Detail Hasil Skrining</h3>
                    <button class="modal-close" onclick="window.adminApp.hideModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Nama Siswa</label>
                            <span style="color:var(--text-primary)">${escapeHtml(s.student_name || '-')}</span>
                        </div>
                        <div class="detail-item">
                            <label>Kelas</label>
                            <span>${escapeHtml(s.student_class || '-')}</span>
                        </div>
                        <div class="detail-item">
                            <label>Skor</label>
                            <span style="font-size:1.1rem; font-weight:700;">${score} <small style="color:var(--text-muted);">/ ${maxScore}</small></span>
                        </div>
                        <div class="detail-item">
                            <label>Persentase</label>
                            <span>${pct}%</span>
                        </div>
                        <div class="detail-item">
                            <label>Kategori</label>
                            <span>${categoryBadge(s.category)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Tanggal</label>
                            <span>${formatDate(s.created_at)}</span>
                        </div>
                    </div>
                    ${answersHtml}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.adminApp.hideModal()">Tutup</button>
                </div>
            `);
        } catch (err) {
            showModal(`
                <div class="modal-header">
                    <h3>Detail Hasil Skrining</h3>
                    <button class="modal-close" onclick="window.adminApp.hideModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color:var(--red);">Gagal memuat detail: ${escapeHtml(err.message)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.adminApp.hideModal()">Tutup</button>
                </div>
            `);
        }
    }

    /**
     * Export seluruh data skrining ke file CSV
     */
    function exportCSV() {
        if (!state.screenings.length) {
            showToast('Tidak ada data untuk diekspor.', 'error');
            return;
        }

        const headers = ['No', 'Nama', 'Kelas', 'Skor', 'Persentase', 'Kategori', 'Tanggal'];
        const rows = state.screenings.map((s, i) => {
            const score = s.total_score || 0;
            const maxScore = s.max_score || 100;
            const pct = s.percentage || 0;
            return [
                i + 1,
                `"${(s.student_name || '-').replace(/"/g, '""')}"`,
                `"${(s.student_class || '-').replace(/"/g, '""')}"`,
                score,
                pct + '%',
                `"${(s.category || '-').replace(/"/g, '""')}"`,
                `"${formatDateShort(s.created_at)}"`,
            ];
        });

        let csv = '\uFEFF'; // BOM untuk Excel UTF-8
        csv += headers.join(',') + '\n';
        csv += rows.map((r) => r.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `skrining_counselspace_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('File CSV berhasil diunduh!', 'success');
    }

    // ============================================
    // USERS RECAP MODULE (ADMIN ONLY)
    // ============================================
    async function fetchRecapData() {
        if (!dom.recapBody) return;
        dom.recapBody.innerHTML = `<tr><td colspan="8" class="table-empty"><div class="spinner-overlay"><div class="spinner"></div></div></td></tr>`;
        try {
            const res = await api('admin/users/recap');
            if (res.success && res.data) {
                state.recapUsers = res.data;
                renderRecapTable();
            }
        } catch (err) {
            showToast(err.message || 'Gagal memuat rekapitulasi', 'error');
            dom.recapBody.innerHTML = `<tr><td colspan="8" class="table-empty"><p class="text-danger">Gagal memuat data.</p></td></tr>`;
        }
    }

    function renderRecapTable() {
        if (!dom.recapBody) return;
        let filtered = state.recapUsers;
        if (state.recapFilter !== 'all') {
            filtered = filtered.filter(u => u.role === state.recapFilter);
        }

        if (!filtered.length) {
            dom.recapBody.innerHTML = `
                <tr><td colspan="8" class="table-empty">
                    <div class="empty-icon">👥</div>
                    <p>Tidak ada pengguna ditemukan</p>
                </td></tr>`;
            return;
        }

        dom.recapBody.innerHTML = filtered.map((u, i) => {
            const roleBadge = u.role === 'guru' 
                ? '<span class="badge badge-purple">Guru BK</span>' 
                : '<span class="badge badge-teal">Siswa</span>';
            
            const latestScore = u.latest_score !== null 
                ? `<strong>${u.latest_score}</strong> (${categoryBadge(u.latest_category)})`
                : '<span class="text-muted">-</span>';
                
            const regDate = u.created_at 
                ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : '-';

            return `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${escapeHtml(u.name || '')}</strong></td>
                    <td>${escapeHtml(u.email || '')}</td>
                    <td>${roleBadge}</td>
                    <td>${escapeHtml(u.student_class || '-')}</td>
                    <td>${u.role === 'siswa' ? `<strong>${u.screenings_count}</strong>` : '-'}</td>
                    <td>${u.role === 'siswa' ? latestScore : '-'}</td>
                    <td>${regDate}</td>
                </tr>
            `;
        }).join('');
    }

    // Debounce untuk pencarian
    let searchDebounce = null;
    function handleScreeningSearch(value) {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            loadScreenings(1, state.screeningsLimit, { search: value });
        }, 400);
    }

    // ============================================
    // EVENT BINDINGS
    // ============================================

    function bindEvents() {
        // Login
        dom.loginForm.addEventListener('submit', handleLogin);

        // Sidebar nav
        dom.navItems.forEach((item) => {
            item.addEventListener('click', () => navigateTo(item.dataset.page));
        });

        // Logout
        dom.navLogout.addEventListener('click', logout);

        // Mobile sidebar
        dom.hamburgerBtn.addEventListener('click', openSidebar);
        dom.sidebarOverlay.addEventListener('click', closeSidebar);

        // Hash change
        window.addEventListener('hashchange', handleHashChange);

        // Questions
        dom.btnAddQuestion.addEventListener('click', showAddQuestionModal);

        // Counselors (Admin Only)
        if (dom.btnCounselorAdd) {
            dom.btnCounselorAdd.addEventListener('click', showAddCounselorModal);
        }
        if (dom.counselorForm) {
            dom.counselorForm.addEventListener('submit', saveCounselor);
        }
        const cAvatarInput = document.getElementById('c-avatar-input');
        if (cAvatarInput) {
            cAvatarInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    showToast('Mengunggah foto...', 'info');
                    const res = await uploadFile(file);
                    if (res && res.success && res.url) {
                        document.getElementById('c-photo-url').value = res.url;
                        document.getElementById('c-avatar-preview').innerHTML = `<img src="${res.url}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        showToast('Foto berhasil diunggah!', 'success');
                    }
                } catch (err) {
                    showToast(err.message || 'Gagal mengunggah foto', 'error');
                }
            });
        }

        // Profile (Guru Only)
        if (dom.profileForm) {
            dom.profileForm.addEventListener('submit', saveProfile);
        }
        const profileAvatarInput = document.getElementById('profile-avatar-input');
        if (profileAvatarInput) {
            profileAvatarInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    showToast('Mengunggah foto...', 'info');
                    const res = await uploadFile(file);
                    if (res && res.success && res.url) {
                        document.getElementById('profile-photo-url').value = res.url;
                        document.getElementById('profile-avatar-preview').innerHTML = `<img src="${res.url}" style="width: 100%; height: 100%; object-fit: cover;">`;
                        showToast('Foto berhasil diunggah!', 'success');
                    }
                } catch (err) {
                    showToast(err.message || 'Gagal mengunggah foto', 'error');
                }
            });
        }

        // Edu content
        dom.btnAddEdu.addEventListener('click', showAddEduModal);
        dom.eduTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab-item');
            if (!tab) return;
            dom.eduTabs.querySelectorAll('.tab-item').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            state.eduFilter = tab.dataset.type || 'all';
            renderEduContent();
        });

        // Chat
        dom.chatSendBtn.addEventListener('click', sendReply);
        dom.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendReply();
            }
        });

        // Screenings
        dom.screeningSearch.addEventListener('input', (e) => handleScreeningSearch(e.target.value));
        dom.screeningCategoryFilter.addEventListener('change', (e) => {
            loadScreenings(1, state.screeningsLimit, { category: e.target.value });
        });
        dom.btnExportCsv.addEventListener('click', exportCSV);

        // Recap
        if (dom.recapRoleFilter) {
            dom.recapRoleFilter.addEventListener('change', (e) => {
                state.recapFilter = e.target.value;
                renderRecapTable();
            });
        }

        // Close modal on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dom.modalOverlay.classList.contains('show')) {
                hideModal();
            }
        });
    }

    function logout() {
        stopPing();
        stopChatPolling();
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        window.location.hash = '';
        showLogin();
    }

    let pingTimer = null;
    function startPing() {
        stopPing();
        pingTimer = setInterval(async () => {
            try {
                await api('ping', 'POST');
            } catch (err) {}
        }, 15000);
        api('ping', 'POST').catch(()=>{});
    }

    function stopPing() {
        if (pingTimer) {
            clearInterval(pingTimer);
            pingTimer = null;
        }
    }

    async function uploadFile(file) {
        const url = API_BASE + 'upload';
        const formData = new FormData();
        formData.append('photo', file);

        const options = {
            method: 'POST',
            headers: {},
        };

        const token = sessionStorage.getItem('admin_token');
        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }
        options.body = formData;

        const response = await fetch(url, options);
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.message || `HTTP ${response.status}`);
        }
        return json;
    }

    // ============================================
    // COUNSELOR CRUD MODULE (ADMIN ONLY)
    // ============================================
    async function loadCounselors() {
        dom.counselorsBody.innerHTML = `<tr><td colspan="7" class="table-empty"><div class="spinner-overlay"><div class="spinner"></div></div></td></tr>`;
        try {
            const data = await api('admin/counselors');
            state.counselors = data.data || [];
            renderCounselorsTable();
        } catch (err) {
            showToast(err.message || 'Gagal memuat Guru BK', 'error');
            dom.counselorsBody.innerHTML = `<tr><td colspan="7" class="table-empty"><p class="text-danger">Gagal memuat data.</p></td></tr>`;
        }
    }

    function renderCounselorsTable() {
        if (!state.counselors.length) {
            dom.counselorsBody.innerHTML = `
                <tr><td colspan="7" class="table-empty">
                    <div class="empty-icon">👨‍🏫</div>
                    <p>Belum ada data Guru BK</p>
                </td></tr>`;
            return;
        }

        dom.counselorsBody.innerHTML = state.counselors.map((c, i) => {
            const avatar = c.photo_url 
                ? `<img src="${c.photo_url}" alt="${escapeHtml(c.name)}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`
                : `<span style="font-size: 1.5rem;">👤</span>`;
            
            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>${avatar}</td>
                    <td><strong>${escapeHtml(c.name || '')}</strong></td>
                    <td>${escapeHtml(c.email || '')}</td>
                    <td>${escapeHtml(c.username || '')}</td>
                    <td>${escapeHtml(c.service_hours || '-')}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="window.adminApp.showEditCounselorModal(${c.id})">✏️ Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="window.adminApp.deleteCounselor(${c.id})">🗑️ Hapus</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function showAddCounselorModal() {
        document.getElementById('counselor-modal-title').textContent = 'Tambah Guru BK';
        document.getElementById('c-id').value = '';
        document.getElementById('c-name').value = '';
        document.getElementById('c-email').value = '';
        document.getElementById('c-username').value = '';
        document.getElementById('c-password').value = '';
        document.getElementById('c-hours').value = '';
        document.getElementById('c-photo-url').value = '';
        document.getElementById('c-avatar-preview').innerHTML = '👤';
        document.getElementById('modal-counselor-wrapper').style.display = 'flex';
    }

    function showEditCounselorModal(id) {
        const c = state.counselors.find(item => item.id == id);
        if (!c) return;

        document.getElementById('counselor-modal-title').textContent = 'Edit Guru BK';
        document.getElementById('c-id').value = c.id;
        document.getElementById('c-name').value = c.name;
        document.getElementById('c-email').value = c.email;
        document.getElementById('c-username').value = c.username;
        document.getElementById('c-password').value = '';
        document.getElementById('c-hours').value = c.service_hours || '';
        document.getElementById('c-photo-url').value = c.photo_url || '';
        
        if (c.photo_url) {
            document.getElementById('c-avatar-preview').innerHTML = `<img src="${c.photo_url}" alt="${escapeHtml(c.name)}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            document.getElementById('c-avatar-preview').innerHTML = '👤';
        }

        document.getElementById('modal-counselor-wrapper').style.display = 'flex';
    }

    async function saveCounselor(e) {
        if (e) e.preventDefault();
        
        const id = document.getElementById('c-id').value;
        const name = document.getElementById('c-name').value.trim();
        const email = document.getElementById('c-email').value.trim();
        const username = document.getElementById('c-username').value.trim();
        const password = document.getElementById('c-password').value;
        const service_hours = document.getElementById('c-hours').value.trim();
        const photo_url = document.getElementById('c-photo-url').value;

        if (!name || !email || !username || (!id && !password)) {
            showToast('Field wajib tidak boleh kosong!', 'error');
            return;
        }

        const data = { name, email, username, service_hours, photo_url };
        if (password) data.password = password;

        const saveBtn = document.getElementById('c-save-btn');
        saveBtn.disabled = true;

        try {
            if (id) {
                await api(`admin/counselors/${id}`, 'PUT', data);
                showToast('Guru BK berhasil diperbarui!', 'success');
            } else {
                await api('admin/counselors', 'POST', data);
                showToast('Guru BK berhasil ditambahkan!', 'success');
            }
            document.getElementById('modal-counselor-wrapper').style.display = 'none';
            loadCounselors();
        } catch (err) {
            showToast(err.message || 'Gagal menyimpan data', 'error');
        } finally {
            saveBtn.disabled = false;
        }
    }

    async function deleteCounselor(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus Guru BK ini? Semua chat terkait juga akan terhapus.')) return;
        try {
            await api(`admin/counselors/${id}`, 'DELETE');
            showToast('Guru BK berhasil dihapus!', 'success');
            loadCounselors();
        } catch (err) {
            showToast(err.message || 'Gagal menghapus data', 'error');
        }
    }

    // ============================================
    // COUNSELOR PROFILE SETTINGS MODULE (GURU ONLY)
    // ============================================
    async function loadProfile() {
        try {
            const res = await api('admin/profile');
            if (res.success && res.data) {
                const user = res.data;
                document.getElementById('profile-name').value = user.name || '';
                document.getElementById('profile-email').value = user.email || '';
                document.getElementById('profile-hours').value = user.service_hours || '';
                document.getElementById('profile-photo-url').value = user.photo_url || '';
                document.getElementById('profile-password').value = '';

                if (user.photo_url) {
                    document.getElementById('profile-avatar-preview').innerHTML = `<img src="${user.photo_url}" alt="${escapeHtml(user.name)}" style="width: 100%; height: 100%; object-fit: cover;">`;
                } else {
                    document.getElementById('profile-avatar-preview').innerHTML = '👤';
                }
            }
        } catch (err) {
            showToast(err.message || 'Gagal memuat profil', 'error');
        }
    }

    async function saveProfile(e) {
        if (e) e.preventDefault();
        
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const service_hours = document.getElementById('profile-hours').value.trim();
        const photo_url = document.getElementById('profile-photo-url').value;
        const password = document.getElementById('profile-password').value;

        if (!name || !email) {
            showToast('Nama dan Email wajib diisi!', 'error');
            return;
        }

        const data = { name, email, service_hours, photo_url };
        if (password) data.password = password;

        try {
            const res = await api('admin/profile', 'PUT', data);
            if (res.success && res.data) {
                sessionStorage.setItem('admin_user', JSON.stringify(res.data));
                showToast('Profil berhasil disimpan!', 'success');
                loadProfile();
            }
        } catch (err) {
            showToast(err.message || 'Gagal menyimpan profil', 'error');
        }
    }

    // ============================================
    // INIT
    // ============================================

    function init() {
        bindEvents();

        // Cek status login
        if (isAuthenticated()) {
            showApp();
            // Periksa hash saat ini
            const hash = window.location.hash.replace('#admin-', '');
            const validPages = ['dashboard', 'questions', 'edu', 'chat', 'screenings', 'recap', 'counselors', 'profile'];
            if (validPages.includes(hash)) {
                navigateTo(hash);
            } else {
                navigateTo('dashboard');
            }
        } else {
            showLogin();
        }
    }

    // ============================================
    // PUBLIC API — dipanggil dari onclick di HTML
    // ============================================
    window.adminApp = {
        hideModal,
        // Questions
        showEditQuestionModal,
        saveQuestion,
        deleteQuestion,
        toggleQuestion,
        // Edu
        showEditEduModal,
        saveEduContent,
        deleteEduContent,
        updateEduPreview,
        // Chat
        openChat,
        // Screenings
        showDetailModal,
        goToPage,
        // Counselor CRUD
        showEditCounselorModal,
        deleteCounselor,
    };

    // Start!
    document.addEventListener('DOMContentLoaded', init);
})();
