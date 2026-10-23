# SwaraNusa Implementation Plan

> For agentic workers: implementation owner works inline with bounded content and backend subagents. Human explicitly authorized direct execution and subagents.

Goal: Ship a working local website at /Users/raii/Documents/SwaraNusa and provide a browser preview.
Architecture: Buildless HTML/CSS/ES modules; Node 24 HTTP server with SQLite for accounts, sessions and requests. No third-party npm dependencies. Serve on 127.0.0.1. Stage work in the chat workspace, copy the finished project to the explicitly requested folder, then run from there.
Spec: docs/konsep-dan-alur.md.

Constraints: Province-first, 10 provinces; four activity tabs; six content categories; browse without login; distinguish introduction from practice guide; sources on entries; actual missing-content states. No fabricated experts, prices, availability, videos or reviews. Clearly label demonstration accounts. Local preview only, no external publication requested.
Visual contract: warm ivory canvas, forest green and brown, expressive serif display with plain sans UI, large documented regional photography, magazine composition and numbered province rows. Reference SIGAP's action clarity and polish; preserve SwaraNusa's identity. Primary action is choosing a province. Targets 1440x900 and 390x844. Keyboard focus and reduced motion supported.

Tasks:
- [x] Backend: durable SQLite authentication, user/admin/expert scopes, request transitions, notifications, tests for authorization and reopen.
- [x] Content/assets: 10 province profiles and sourced seed entries; useful empty categories; local photos and attribution.
- [x] Frontend: landing, province/category, entry, request form, auth, account/request detail, admin/expert workflows, about/sources.
- [x] Review copy with stop-slop; inspect desktop/mobile; fix observed failures.
- [x] Sync to requested directory, run there, hand off localhost URL.

Review focus: direct deep links and unknown slugs; unauthorized access to other requests; cancellation/reopen while responses exist; empty content and failed images; form state after login and refresh.

Shared interface: public/data.json documented in docs/interfaces.md. Backend entry server.mjs and database in .data/. Frontend files public/index.html, styles.css, app.js, components.js. Backend owns server.mjs and tests/server.test.mjs; content owns public/data.json, public/assets photo files, docs/sources.md. Main owner integrates UI.

Final verification: 10/10 server checks pass from the requested final directory. Browser checked 1440x900 and 390x844, guest province/category navigation, sourced entry, absent content, request/auth/draft, demo approval/response/selection/reopen, invalid login and GitHub Mermaid ERD rendering. All external source files uploaded; operational SQLite files excluded.


## Publikasi dan perbaikan tampilan, 23 Oktober 2026

Pengguna menunda penambahan materi. Repo dijadikan publik atas permintaan pengguna. Situs GitHub Pages menerbitkan berkas statis dari cabang gh-pages, dengan jalur /SwaraNusa dan halaman index untuk semua provinsi serta artikel. Layanan akun, demo peran dan request tetap hanya berjalan di server lokal.

Tampilan menambahkan sudut membulat, dropdown provinsi dan kategori, menu seluler bertingkat, hover/press, serta scroll reveal. Gerak menghormati prefers-reduced-motion. Referensi SIGAP dibaca pada komponen site-header.tsx dan token motion.ts; implementasi SwaraNusa tetap HTML/CSS/JavaScript tanpa mengambil kode aplikasi SIGAP.
