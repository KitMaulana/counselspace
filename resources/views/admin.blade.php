<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CounselSpace Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/admin.css') }}">
</head>
<body>

    <!-- ============================================
         TOAST CONTAINER
         ============================================ -->
    <div class="toast-container" id="toast-container"></div>

    <!-- ============================================
         LOGIN PAGE
         ============================================ -->
    <div id="admin-login">
        <div class="login-container">
            <div class="login-brand">
                <div class="logo-icon">🧠</div>
                <h1>Counsel<span>Space</span>.Ai</h1>
                <p>Admin Dashboard — Panel Guru BK</p>
            </div>
            <form id="login-form" autocomplete="off">
                <div class="form-group">
                    <label for="login-username">Email / Username</label>
                    <input type="text" id="login-username" class="form-control" placeholder="Masukkan email atau username" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" class="form-control" placeholder="Masukkan password" required>
                </div>
                <div id="login-error" class="login-error"></div>
                <button type="submit" class="btn btn-primary btn-full" id="login-btn" style="margin-top:0.5rem">
                    Masuk
                </button>
            </form>
        </div>
    </div>

    <!-- ============================================
         ADMIN APP (hidden until authenticated)
         ============================================ -->
    <div id="admin-app">
        <div class="app-layout">

            <!-- Mobile topbar -->
            <div class="topbar-mobile" id="topbar-mobile">
                <button class="hamburger-btn" id="hamburger-btn" aria-label="Menu">☰</button>
                <span class="topbar-title">CounselSpace Admin</span>
                <span style="width:28px"></span>
            </div>

            <!-- Sidebar overlay (mobile) -->
            <div class="sidebar-overlay" id="sidebar-overlay"></div>

            <!-- Sidebar -->
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-brand">
                    <div class="brand-icon">🧠</div>
                    <div class="brand-text">
                        <h2>CounselSpace</h2>
                        <span>Admin Panel</span>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    <div class="nav-item active" data-page="dashboard">
                        <span class="nav-icon">📊</span> Dashboard
                    </div>
                    <div class="nav-item" data-page="questions">
                        <span class="nav-icon">📝</span> Soal Kuesioner
                    </div>
                    <div class="nav-item" data-page="edu">
                        <span class="nav-icon">📚</span> Konten Edukasi
                    </div>
                    <div class="nav-item" data-page="chat">
                        <span class="nav-icon">💬</span> Chat Konseling
                    </div>
                    <div class="nav-item" data-page="screenings">
                        <span class="nav-icon">📋</span> Riwayat Skrining
                    </div>
                    <div class="nav-item nav-logout" id="nav-logout">
                        <span class="nav-icon">🚪</span> Logout
                    </div>
                </nav>
                <div class="sidebar-footer">
                    &copy; 2026 CounselSpace.Ai
                </div>
            </aside>

            <!-- Main content -->
            <main class="main-content">

                <!-- ===== DASHBOARD PAGE ===== -->
                <div class="page active" id="page-dashboard">
                    <div class="page-header">
                        <div>
                            <h1>📊 Dashboard</h1>
                            <p>Ringkasan data skrining kesehatan mental siswa</p>
                        </div>
                    </div>

                    <div class="stats-grid" id="stats-grid">
                        <div class="stat-card stat-total">
                            <div class="stat-header">
                                <span class="stat-label">Total Skrining</span>
                                <div class="stat-icon">📋</div>
                            </div>
                            <div class="stat-value" id="stat-total">0</div>
                            <div class="stat-sub">keseluruhan skrining</div>
                        </div>
                        <div class="stat-card stat-safe">
                            <div class="stat-header">
                                <span class="stat-label">Siswa Aman</span>
                                <div class="stat-icon">✅</div>
                            </div>
                            <div class="stat-value" id="stat-safe">0</div>
                            <div class="stat-sub" id="stat-safe-pct">0% dari total</div>
                        </div>
                        <div class="stat-card stat-warning">
                            <div class="stat-header">
                                <span class="stat-label">Siswa Waspada</span>
                                <div class="stat-icon">⚠️</div>
                            </div>
                            <div class="stat-value" id="stat-warning">0</div>
                            <div class="stat-sub" id="stat-warning-pct">0% dari total</div>
                        </div>
                        <div class="stat-card stat-danger">
                            <div class="stat-header">
                                <span class="stat-label">Siswa Bahaya</span>
                                <div class="stat-icon">🚨</div>
                            </div>
                            <div class="stat-value" id="stat-danger">0</div>
                            <div class="stat-sub" id="stat-danger-pct">0% dari total</div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:1rem;">
                        <!-- Recent screenings table -->
                        <div class="card">
                            <div class="card-header">
                                <h3>Skrining Terbaru</h3>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nama</th>
                                                <th>Kelas</th>
                                                <th>Skor</th>
                                                <th>Kategori</th>
                                                <th>Tanggal</th>
                                            </tr>
                                        </thead>
                                        <tbody id="recent-screenings-body">
                                            <tr><td colspan="5" class="table-empty"><div class="spinner-overlay"><div class="spinner"></div></div></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Bar chart -->
                        <div class="card">
                            <div class="card-header">
                                <h3>Distribusi Kategori</h3>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <div class="bar-chart" id="bar-chart">
                                        <!-- Filled by JS -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== QUESTIONS PAGE ===== -->
                <div class="page" id="page-questions">
                    <div class="page-header">
                        <div>
                            <h1>📝 Kelola Soal Kuesioner</h1>
                            <p>Atur pertanyaan untuk skrining kesehatan mental</p>
                        </div>
                        <button class="btn btn-primary" id="btn-add-question">+ Tambah Soal</button>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Pertanyaan</th>
                                            <th>Kategori</th>
                                            <th>Bobot</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="questions-table-body">
                                        <tr><td colspan="6" class="table-empty"><div class="spinner-overlay"><div class="spinner"></div></div></td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== EDU CONTENT PAGE ===== -->
                <div class="page" id="page-edu">
                    <div class="page-header">
                        <div>
                            <h1>📚 Konten Edukasi</h1>
                            <p>Kelola konten edukasi kesehatan mental untuk siswa</p>
                        </div>
                        <button class="btn btn-primary" id="btn-add-edu">+ Tambah Konten</button>
                    </div>

                    <div class="card">
                        <div class="tabs" id="edu-tabs">
                            <div class="tab-item active" data-type="all">Semua</div>
                            <div class="tab-item" data-type="video">🎬 Video</div>
                            <div class="tab-item" data-type="poster">🖼️ Poster</div>
                            <div class="tab-item" data-type="artikel">📰 Artikel</div>
                        </div>
                        <div class="edu-grid" id="edu-grid">
                            <div class="spinner-overlay"><div class="spinner"></div></div>
                        </div>
                    </div>
                </div>

                <!-- ===== CHAT PAGE ===== -->
                <div class="page" id="page-chat">
                    <div class="page-header">
                        <div>
                            <h1>💬 Chat Konseling</h1>
                            <p>Komunikasi langsung dengan siswa yang memerlukan pendampingan</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <div class="chat-layout">
                                <!-- Sessions list -->
                                <div class="chat-sessions" id="chat-sessions">
                                    <div class="spinner-overlay"><div class="spinner"></div></div>
                                </div>
                                <!-- Conversation view -->
                                <div class="chat-conversation" id="chat-conversation">
                                    <div class="chat-placeholder" id="chat-placeholder">
                                        <div class="placeholder-icon">💬</div>
                                        <p>Pilih sesi chat untuk memulai percakapan</p>
                                    </div>
                                    <div class="chat-conv-header" id="chat-conv-header" style="display:none">
                                        <span>🟢</span>
                                        <span id="chat-conv-title">—</span>
                                    </div>
                                    <div class="chat-messages" id="chat-messages" style="display:none"></div>
                                    <div class="chat-input-area" id="chat-input-area" style="display:none">
                                        <input type="text" class="form-control" id="chat-input" placeholder="Ketik pesan...">
                                        <button class="btn btn-primary" id="chat-send-btn">Kirim</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== SCREENINGS PAGE ===== -->
                <div class="page" id="page-screenings">
                    <div class="page-header">
                        <div>
                            <h1>📋 Riwayat Skrining</h1>
                            <p>Data lengkap hasil skrining kesehatan mental siswa</p>
                        </div>
                        <button class="btn btn-secondary" id="btn-export-csv">📥 Export CSV</button>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="toolbar">
                                <div class="search-input">
                                    <span class="search-icon">🔍</span>
                                    <input type="text" class="form-control" id="screening-search" placeholder="Cari nama siswa..." style="padding-left:2.25rem; min-width:220px;">
                                </div>
                                <select class="form-control" id="screening-category-filter" style="width:auto; min-width:140px;">
                                    <option value="">Semua Kategori</option>
                                    <option value="aman">Aman</option>
                                    <option value="waspada">Waspada</option>
                                    <option value="bahaya">Bahaya</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama</th>
                                            <th>Kelas</th>
                                            <th>Skor</th>
                                            <th>Persentase</th>
                                            <th>Kategori</th>
                                            <th>Tanggal</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="screenings-table-body">
                                        <tr><td colspan="8" class="table-empty"><div class="spinner-overlay"><div class="spinner"></div></div></td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="pagination" id="screenings-pagination"></div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    </div>

    <!-- ============================================
         GENERIC MODAL
         ============================================ -->
    <div class="modal-overlay" id="modal-overlay">
        <div class="modal" id="modal-container">
            <!-- Populated dynamically by JS -->
        </div>
    </div>

    <script src="{{ asset('js/admin.js') }}"></script>
</body>
</html>
