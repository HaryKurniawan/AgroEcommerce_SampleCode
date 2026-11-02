# Agro-Ecommerce Platform (Architecture & Sample Code Showcase)

Repositori ini merupakan showcase arsitektur dan sample code untuk platform Agro-Ecommerce skala enterprise. Dokumen ini mendeskripsikan secara komprehensif arsitektur perangkat lunak, pola desain (design patterns), pembagian modul, alur komunikasi antar-layanan, serta otomasi CI/CD yang diterapkan pada proyek ini.

> [!IMPORTANT]
> Catatan Penting Keamanan & Sifat Repositori (Sample Only):
> 1. Monorepo Hanya Sebagai Example:
>    Penggabungan folder `backend/`, `frontend-operasional/`, dan `frontend-user/` di dalam satu repositori ini semata-mata ditujukan sebagai contoh showcase atau portofolio arsitektur. Pada lingkungan produksi nyata, masing-masing layanan ini dikelola secara terpisah (polyrepo / microservices) dengan siklus rilis, repository Git, dan infrastruktur container yang independen.
> 2. Proteksi Kode Runtime (Incomplete by Design):
>    Untuk melindungi hak kekayaan intelektual (proprietary logic) serta mencegah penggunaan instan (turn-key clone) tanpa otorisasi, beberapa file penghubung runtime inti sengaja dihilangkan:
>    - Backend: Driver koneksi database utama (`src/infrastructure/database/prisma.service.ts`) dan skrip seeding (`prisma/seed.ts`) telah dihilangkan.
>    - Frontend Operasional: Modul proxy handler (`src/lib/proxy-handler.ts`) dan API client utama (`src/lib/api-client.ts`) telah dihilangkan.
> `.env.example`.

---

## Arsitektur Keseluruhan Sistem

Platform Agro-Ecommerce dirancang dengan pendekatan Service-Oriented Architecture (SOA) yang memisahkan tanggung jawab antara Core Backend Service, Operational Backoffice Portal, dan Public Consumer Storefront:

```text
├── backend/                  # Core REST API Service (NestJS + Prisma + PostgreSQL)
│   ├── src/
│   │   ├── common/           # Cross-cutting concerns (Guards, Interceptors, Filters, Pipes)
│   │   ├── config/           # Centralized environment & app configurations
│   │   ├── core/             # Platform foundation (Auth, Pengguna, Alamat, Logistik, Chat)
│   │   ├── docs/             # OpenAPI / Swagger documentation definitions
│   │   ├── ecommerce/        # Domain bisnis e-commerce (Produk, Pesanan, Gudang, Stok)
│   │   └── infrastructure/   # Observability, Logger (Winston), Metrics (Prometheus)
│   ├── prisma/               # Database multi-schema (base, core, ecommerce)
│   ├── Jenkinsfile           # CI/CD pipeline template (Build, DB Prep, Health Check, Alerts)
│   └── Dockerfile.prod       # Multi-stage production container build
│
├── frontend-operasional/     # Backoffice & Warehouse Portal (Next.js App Router)
│   ├── src/
│   │   └── app/
│   │       ├── (admin)/      # Sub-aplikasi Administrator (Master data, user management)
│   │       ├── (cs)/         # Sub-aplikasi Customer Support & live ticket chat
│   │       ├── (kurir)/      # Sub-aplikasi Operasional Kurir & batch pengiriman
│   │       ├── (seller)/     # Sub-aplikasi Mitra Petani & Merchant pengajuan stok
│   │       └── api/          # Internal Next.js API Routes (BFF Proxy)
│   ├── __tests__/            # E2E (Playwright) & Unit Tests (Vitest)
│   ├── Jenkinsfile           # Automated safe-restart deployment pipeline
│   └── Dockerfile.prod       # Standalone Next.js production build
│
└── frontend-user/            # Consumer E-Commerce Storefront (Next.js App Router)
    ├── src/
    │   └── app/              # Katalog komoditas, keranjang, checkout, payment, tracking
    ├── __tests__/            # E2E (Playwright) & Unit Tests (Vitest)
    ├── Jenkinsfile           # CI/CD pipeline dengan automated Gitleaks secret scanner
    └── Dockerfile.prod       # Optimized production container build
```

---

## Arsitektur Backend (NestJS + Prisma + PostgreSQL)

Backend dibangun di atas framework NestJS menggunakan TypeScript dengan prinsip Modular Architecture, Inversion of Control (IoC), dan Dependency Injection (DI).

### 1. Struktur Layering & Domain Partitioning
Backend dibagi menjadi dua domain fungsional utama untuk mencegah tight coupling:
- Core Domain (`src/core/`):
  Mengelola fungsi identitas, otentikasi, dan pondasi sistem:
  - `auth`: Otentikasi berbasis JWT, hashing BCrypt, token refresh, dan validasi sesi.
  - `pengguna`: Pengelolaan entitas akun dengan Role-Based Access Control (RBAC) mencakup Administrator, Staff Gudang, Kurir, Petani/Seller, dan Pembeli.
  - `alamat`: Standarisasi geolokasi dan alamat pengiriman pengguna.
  - `logistik`: Engine penentuan armada, tracking nomor resi, dan integrasi kurir internal.
  - `percakapan-chat`: Komunikasi interaktif terenkripsi antara pembeli, penjual, dan admin operasional.
  - `notifikasi` & `telegram`: Dispatcher notifikasi internal dan integrasi webhook bot Telegram untuk alert sistem.
  - `unggah-foto`: Penanganan upload berkas dan kompresi media statis (KTP, bukti serah terima, foto produk).
- Ecommerce Domain (`src/ecommerce/`):
  Mengelola siklus transaksi perdagangan hasil komoditas agrikultur:
  - `master-komoditas` & `master-produk`: Manajemen katalog standar komoditas tani nasional dan varian produk olahan.
  - `toko` & `gudang`: Manajemen multi-warehouse dan entitas toko mitra.
  - `pengajuan-stok` & `stok-masuk`: Alur pasokan dari petani ke fasilitas gudang logistik sebelum dijual ke publik.
  - `keranjang` & `ecom-pesanan`: State pesanan, perhitungan diskon, simulasi ongkos kirim, dan status transaksi.
  - `delivery-batch`: Pengelompokan pengiriman pesanan ke kurir berdasarkan rute geografis terdekat.
  - `profit-report` & `analytics`: Agregasi data penjualan dan laporan finansial berkala.

### 2. Multi-Schema Database Partitioning (PostgreSQL)
Skema database pada Prisma dipisahkan menjadi namespace terpisah pada level PostgreSQL:
- Skema `core`: Tabel akun pengguna, otentikasi, preferensi, dan log audit.
- Skema `ecommerce`: Tabel katalog produk, batch inventori, item pesanan, dan transaksi.
Pemisahan ini memungkinkan pemeliharaan skema database secara independen dan mempermudah migrasi horizontal di masa depan.

### 3. Cross-Cutting Concerns & Security Layers
- API Key Guard (`src/common/guards/api-key.guard.ts`): Memvalidasi header `x-api-key` untuk mencegah akses liar langsung ke REST API selain dari reverse proxy atau BFF yang terdaftar.
- Rate Limiting (OWASP A04): `ThrottlerModule` dikonfigurasi dengan dua tingkatan: limit burst jangka pendek (20 req/detik per IP) dan limit jangka menengah (300 req/menit per IP) untuk mencegah Distributed Denial of Service (DDoS) dan brute-force.
- Global Exception Filters: `AllExceptionsFilter` dan `HttpExceptionFilter` menangkap seluruh unhandled exceptions dan mengembalikan struktur payload JSON yang seragam (`statusCode`, `message`, `timestamp`).
- Logging & Observability: Terintegrasi dengan Winston Logger serta Prometheus Metrics Interceptor (`src/infrastructure/monitoring/metrics.interceptor.ts`) untuk memantau request latency, counter error HTTP, dan load performa.
- Event-Driven Architecture: Memanfaatkan `EventEmitterModule` untuk pemrosesan event asinkron (misalnya penulisan audit log dan pengiriman pesan bot Telegram tanpa memblokir thread HTTP utama).

---

## Arsitektur Frontend Operasional (Next.js Backoffice)

Frontend Operasional dirancang untuk memenuhi kebutuhan berbagai divisi internal perusahaan agrikultur dalam satu platform terpadu.

### 1. Role-Based Route Groups (Next.js App Router)
Navigasi dan layout dipisahkan secara struktural menggunakan fitur Route Groups pada Next.js:
- `(admin)`: Dashboard manajemen akun pengguna, master katalog komoditas, persetujuan toko, dan pelaporan keuangan terpusat.
- `(seller)`: Portal khusus mitra tani/pedagang untuk mengajukan stok hasil panen, mengatur harga komoditas, dan mencetak label barcode gudang.
- `(kurir)`: Antarmuka mobile-responsive untuk kurir dalam menerima delivery-batch, konfirmasi penerimaan barang di titik gudang, dan mengunggah foto bukti serah terima (Proof of Delivery).
- `(cs)`: Panel layanan pelanggan untuk mengelola live chat dispute komoditas dan tiket kendala pesanan.

### 2. Backend-for-Frontend (BFF) & Reverse Proxy Pattern
Untuk melindungi kredensial backend dan menghindari CORS issue di browser internal:
- Seluruh pemanggilan ke backend NestJS diarahkan melalui Next.js API Routes (`src/app/api/...`).
- API Route ini bertindak sebagai secure proxy yang menyuntikkan `x-api-key` dan Authorization Bearer token secara aman dari sisi server (Server-Side Execution), sehingga client browser tidak pernah mengekspos API key rahasia tersebut.

### 3. Quality Assurance & Testing
- Vitest: Digunakan untuk unit testing komponen antarmuka, utilitas validasi data, dan transformasi state.
- Playwright: Pengujian End-to-End (E2E) otomatis untuk memastikan alur kritis operasional (seperti proses approval stok gudang dan login kurir) berjalan tanpa regresi sebelum deployment.

---

## Arsitektur Frontend User (Next.js Storefront)

Frontend User merupakan antarmuka publik yang dikhususkan bagi konsumen akhir (B2C) maupun pembeli komoditas skala grosir (B2B).

### 1. Customer Shopping Flow
Struktur aplikasi memandu pembeli melalui alur transaksi yang mulus:
- Discovery: Pencarian dan filter komoditas tani berdasarkan kategori, asal daerah panen, dan ketersediaan stok di gudang terdekat.
- Checkout & Logistics: Kalkulasi otomatis ongkos kirim berdasarkan berat total komoditas dan titik koordinat gudang distribusi terdekat.
- Order Tracking & Chat: Fitur percakapan langsung dengan admin atau seller untuk menanyakan kondisi fisik hasil panen serta tracking posisi kurir secara real-time.

### 2. Rendering Strategy & Performance
- Mengkombinasikan Server Components untuk halaman katalog komoditas publik (guna optimasi SEO dan initial page load cepat) dengan Client Components untuk interaktivitas keranjang belanja dan formulir transaksi pembayaran.
- Desain sepenuhnya adaptif dan mobile-first menggunakan Tailwind CSS.

---

## CI/CD Pipeline & DevOps Architecture

Setiap modul dilengkapi dengan file `Jenkinsfile` deklaratif yang mengimplementasikan pipeline continuous integration dan deployment berbasis container:

1. Secret Scanning (Gitleaks):
   Pada tahap pre-build, pipeline menjalankan image Docker `zricethezav/gitleaks` untuk memverifikasi tidak adanya private keys, sertifikat, atau credential string yang bocor pada commit terbaru.
2. Multi-Stage Docker Builds:
   Memanfaatkan `Dockerfile.prod` bertahap (multi-stage) untuk memisahkan stage build dependencies dari stage runtime final, menghasilkan image container berukuran minimal tanpa toolset compiler yang tidak perlu.
3. Safe-Restart & Automated Health Probing:
   Sebelum mengganti container aktif di server produksi, Jenkins menaikkan container sementara (`tester-container`) di dalam isolated network. Pipeline melakukan polling `wget http://127.0.0.1:PORT/api/health` hingga 30 kali iterasi. Container produksi hanya direstart menggunakan zero-downtime recreation jika health check tester dinyatakan valid.
4. Telegram Webhook Notification:
   Notifikasi otomatis dikirimkan ke grup monitoring Telegram pada awal build dimulai, saat deployment sukses berjalan, atau ketika proses gagal beserta link console log Jenkins.

---

## Ringkasan Tech Stack

| Domain | Layer / Tool | Teknologi Utama |
| --- | --- | --- |
| Backend | Runtime & Language | Node.js, TypeScript |
| Backend | Application Framework | NestJS |
| Backend | ORM & Database | Prisma ORM, PostgreSQL (Multi-Schema) |
| Backend | Security & Protection | Throttler (OWASP rate limit), Helmet, BCrypt, API Key Guard |
| Backend | Observability | Winston Logger, Prometheus Metrics Interceptor |
| Frontend Ops | Framework & Layout | Next.js (App Router, Role Route Groups), Tailwind CSS |
| Frontend Ops | Testing | Vitest, Playwright E2E |
| Frontend User | Framework & Styling | Next.js (SSR / Client Components), Tailwind CSS |
| DevOps | Containerization | Docker, Docker Compose |
| DevOps | CI/CD Engine | Jenkins Declarative Pipeline |
| DevOps | Security & Audit | Gitleaks Automated Secret Scanner |

---

## Lisensi & Disclaimer

Kode dalam repositori ini disediakan semata-mata sebagai referensi portofolio teknis dan contoh implementasi arsitektur perangkat lunak skala enterprise. Seluruh hak cipta modul bisnis dan rancangan grafis dilindungi.
