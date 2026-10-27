# ClipKit Web

> **AI-First 3D Animation Sandbox, Linter, & Compiler.**  
> Lingkungan authoring dan validasi deklaratif yang menjembatani **Large Language Models (AI)** dengan **animasi karakter 3D (VRM 1.0 & Godot)**.

---

## 🎯 Visi & Tujuan Proyek

Model AI (LLM) sangat piawai dalam menghasilkan kode dan data terstruktur berbasis teks, tetapi **mustahil menghasilkan file biner animasi 3D secara langsung** (seperti `.fbx`, `.blend`, atau `.res` Godot). Format biner terlalu padat, tidak transparan terhadap token, dan tidak menyediakan mekanisme feedback loop yang mudah dipahami model bahasa.

**ClipKit Web diciptakan sebagai fasilitas runtime, linter, dan compiler untuk AI:**
1. **Bahasa Antara (DSL Berbasis JSON)**: Format animasi deklaratif yang sangat ramah token LLM, ringkas, dan mudah dipahami konsep ruang/waktunya oleh AI.
2. **Linter & Feedback Loop Otomatis**: Menyediakan evaluasi fisika dan anatomi instan dengan pesan galat terstruktur (`FAIL`/`WARN` beserta stempel waktu dan sendi spesifik) agar AI dapat melakukan *self-correction* secara otonom.
3. **Deterministic FK Sandbox**: Mengevaluasi pose 22 sendi pada 30 FPS secara deterministik dalam milidetik tanpa memerlukan engine game berat atau software DCC.
4. **Kompiler Biner ke `.vrma`**: Mengubah hasil JSON buatan AI yang telah tervalidasi menjadi file standar industri **`.vrma` (VRM Animation)** yang siap dipakai langsung oleh developer di Godot, Unity, Blender, atau Web.

---

## 🔄 Siklus Generasi Animasi oleh AI (Agentic Loop)

```mermaid
sequenceDiagram
    autonumber
    actor User as Manusia / Game Designer
    participant AI as AI Agent (LLM)
    participant CK as ClipKit Runtime & Linter
    participant Engine as Game Engine (Godot / Unity / VRM)

    User->>AI: "Buat animasi tebasan pedang cepat 0.8 detik dengan window hitbox di tengah"
    loop Agentic Feedback Loop (Self-Healing)
        AI->>CK: Generate / Update Clip JSON (DSL)
        CK->>CK: Evaluasi FK 30 FPS & Jalankan Aturan Validasi
        CK-->>AI: Laporan Validasi (FAIL / WARN / PASS + data metrik)
        Note over AI,CK: Jika ada FAIL (misal: siku over-speed / sliding), AI memperbaiki keyframe
    end
    CK->>Engine: Compile ke Binary .vrma (VRM 1.0 Animation)
    CK-->>User: Pratinjau 3D real-time (Rangka & Mesh VRM)
```

---

## 🧩 Mengapa Arsitektur Ini Cocok untuk AI?

### 1. Representasi Gerak yang "Bisa Dipikirkan" oleh AI
Alih-alih mengontrol ribuan matriks transformasi mentah per frame, ClipKit menyediakan channel semantik tingkat tinggi:
- **Channel Rotasi Anatomi**: `lean`, `twist`, `neck_pitch`, `armR_elev`, `armR_azim`, `legL_flex`, dst.
- **Keyframe Ber-easing**: `[waktu_detik, nilai, "inOutSine" | "outQuad" | "linear"]`.
- **Root Motion Terarah**: Vektor arah gerak, jarak, dan jendela translasi.
- **Jendela Mekanik Gameplay**: `hitbox`, `cancel`, `parry`, `invulnerable`.

### 2. Pesan Error Terstruktur sebagai Prompt Koreksi Otomatis
Ketika AI menghasilkan gerakan yang tidak realistis, validator mengembalikan petunjuk eksplisit:
```
[FAIL] kecepatan sudut RightForeArm maks 1420.5°/s di t=0.33s melebihi batas 1200.0°/s
[WARN] foot sliding LeftToeBase terdeteksi 0.18 m saat menapak di t=0.40s s.d 0.60s
[FAIL] lutut LeftLeg tertekuk ke depan (sudut -12.4° di t=0.20s), anatomi melarang hiperekstensi
```
Pesan ini berfungsi sebagai masukan *zero-shot prompt* berikutnya agar agen AI tahu persis channel apa dan detik ke berapa yang harus disesuaikan.

### 3. Ekspor Langsung ke Standar Industri
Setelah AI mencapai status `0 FAIL`, ClipKit mengompilasi data channel menjadi spesifikasi glTF biner dengan ekstensi `VRMC_vrm_animation`. Hasilnya adalah aset kelas produksi, bukan sekadar visualisasi konsep.

---

## 📋 Spesifikasi DSL Animasi (Input untuk AI)

AI menghasilkan objek JSON sesuai skema berikut:

```json
{
  "name": "slash_horizontal",
  "format_version": 1,
  "version": 1,
  "changelog": [
    { "v": 1, "catatan": "Draft awal tebasan pedang cepat." }
  ],
  "duration": 0.8,
  "loop": false,
  "channels": {
    "lean": [[0, 0], [0.3, 15, "inOutSine"], [0.8, 0, "outQuad"]],
    "twist": [[0, -20], [0.35, 30, "outQuad"], [0.8, 0, "inOutSine"]],
    "armR_elev": [[0, -70], [0.35, 45, "outQuad"], [0.8, -70, "inOutSine"]],
    "armR_azim": [[0, -20], [0.35, 80, "outQuad"], [0.8, -20, "inOutSine"]]
  },
  "windows": {
    "hitbox": [0.3, 0.45],
    "cancel": [0.55, 0.8]
  },
  "events": [
    { "t": 0.3, "type": "sfx", "id": "slash_heavy" }
  ],
  "claims": {
    "duration": 0.8,
    "tolerance": 0.05
  },
  "validate": {
    "foot_slide": true
  }
}
```

---

## 🛠️ Aturan Validasi Otomatis (Rules Matrix)

ClipKit memeriksa kualitas animasi buatan AI melalui rangkaian aturan:

| Kategori | Yang Diukur | Kriteria FAIL / WARN |
|---|---|---|
| **Kecepatan Sudut** | Laju rotasi antar-frame (°/detik) | Melebihi batas gaya (*stylized* vs *realistic*) |
| **Percepatan Sudut** | Lonjakan akselerasi rotasi | Menandakan gerakan patah (*snapping*) |
| **Lantai & Tumpuan** | Posisi telapak & jari kaki terhadap lantai | Menembus lantai atau bergeser (*sliding*) saat bertumpu |
| **Rentang Anatomi** | Batas gerak sendi manusia | Lutut/siku melipat terbalik, leher melintir ekstrem |
| **Loop Continuity** | Selisih nilai frame awal vs akhir | Animasi siklis (*walk/run/idle*) tidak menyatu mulus |
| **Root Motion** | Vektor translasi badan | Melompat terlalu jauh dalam satu interval frame |
| **Gameplay Window** | Urutan jendela waktu | Jendela *hitbox* melebihi durasi klip atau bertabrakan |
| **Standar VRM 1.0** | Kesesuaian T-Pose & Humanoid bones | Nama bone atau hierarki tidak sesuai spesifikasi VRM |

---

## 🚀 Kebutuhan Sistem & Penggunaan

### Prasyarat
- **Node.js**: Versi `>= 18` atau runtime **Bun** (`>= 1.0`).
- **Browser Modern**: Google Chrome, Edge, Firefox, atau Safari (dengan dukungan WebGL).

### Menjalankan Fasilitas
```bash
# 1. Install dependensi
npm install

# 2. Jalankan sandbox web lokal
npm run dev
# Akses http://localhost:5173

# 3. Jalankan automated test suite (untuk integrasi AI/CI)
npm test

# 4. Bangun versi standalone single-file HTML
npm run build
# Output berada di dist/index.html (dapat berjalan tanpa server Node)
```

---

## 🕹️ Integrasi Programatik & Mode Agent

ClipKit mengekspos instance inti ke lingkungan runtime global (`window.ClipKit` dan `window.__clipkit`) sehingga agen AI berkemampuan browser automation (seperti Puppeteer, Playwright, atau subagent AI) dapat berinteraksi langsung:

```javascript
// Contoh bagaimana agen AI menguji klip secara programatik:
const clipJson = { /* ... klip hasil rancangan AI ... */ };

// 1. Evaluasi & validasi klip
const res = ClipKit.validate(rig, ctx, limits, clipJson, 'stylized');

if (res.lines.some(l => l[0] === 'FAIL')) {
  console.error("AI perlu memperbaiki:", res.lines.filter(l => l[0] === 'FAIL'));
} else {
  // 2. Jika valid, ekspor langsung ke binary .vrma
  const vrmaBlob = ClipKit.buildVrmaGlb(rig, ctx, clipJson);
  // Simpan atau kirim ke game engine
}
```

---

## 📂 Struktur Repositori

```
clipkit-web/
├── index.html                   # Shell antarmuka visualizer & editor
├── package.json                 # Dependensi (three, @pixiv/three-vrm, vite, vitest)
├── src/
│   ├── domain/                  # 🧠 Pure Animation Math & Engine (Target API AI)
│   │   ├── math/                # Vektor 3D & Quaternion
│   │   ├── animation/           # Evaluator Easing, Keyframes, & Root Motion
│   │   ├── rig/                 # Rig Context & Pose Evaluator (Forward Kinematics)
│   │   ├── validation/          # Mesin Linter & Aturan Validasi (Rules Engine)
│   │   └── clipkit.js           # Facade terpadu
│   ├── infrastructure/          # 🔌 Driver I/O (Three.js 3D Mesh & Parser GLB)
│   ├── application/             # ⚙️ Manajemen State & Store
│   ├── presentation/            # 🖥️ Visualizer Viewport, Timeline, & UI Panels
│   └── data/                    # 📚 Rig MotusMan, VRM Sample, & 14 Klip Referensi
└── tests/                       # 🧪 Automated Golden Unit Tests
```
