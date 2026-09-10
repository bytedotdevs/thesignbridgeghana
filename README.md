<div align="center">

  <img src="./public/favicon.png" alt="SignBridgeGhana Logo" width="96" height="96" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />

  # 🇬🇭 SignBridgeGhana
  ### **Ghanaian Sign Language (GSL) Digital Dictionary & Translation Platform**

  [![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&logo=vercel)](https://github.com/charwayyyyyy/thesignbridgeghana)
  [![Corpus](https://img.shields.io/badge/GSL%20Corpus-1%2C514%20Official%20Signs-blue?style=for-the-badge&logo=bookmeter)](https://github.com/charwayyyyyy/thesignbridgeghana)
  [![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)
  [![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%20%7C%20TypeScript-purple?style=for-the-badge&logo=react)](https://vitejs.dev/)

  <p align="center">
    <strong>The official digital gateway to Ghanaian Sign Language.</strong><br/>
    Digitized with precision from the authoritative 318-page <em>Ghanaian Sign Language Dictionary (3rd Edition)</em> published by the <strong>Ghana National Association of the Deaf (GNAD)</strong> and the <strong>Special Education Division of the Ghana Education Service (GES)</strong>.
  </p>

  <p align="center">
    <a href="#-table-of-contents">Explore Docs</a> •
    <a href="#-key-platform-features">Features</a> •
    <a href="#-quickstart--local-development">Quickstart</a> •
    <a href="#-design-guidelines--aesthetic-system">Design System</a> •
    <a href="#-translation-studio-architecture">Translator Studio</a> •
    <a href="#-attribution--provenance">Attribution</a>
  </p>

</div>

---

## 📖 Table of Contents

- [🌟 Project Overview & Vision](#-project-overview--vision)
- [✨ Key Platform Features](#-key-platform-features)
- [💎 Design Guidelines & Aesthetic System](#-design-guidelines--aesthetic-system)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [📁 Git-Friendly Dataset Distribution](#-git-friendly-dataset-distribution)
- [🚀 Quickstart & Local Development](#-quickstart--local-development)
- [🧪 Data Pipeline & Validation](#-data-pipeline--validation)
- [🤖 Translation Studio Architecture](#-translation-studio-architecture)
- [🏛️ Deaf Schools of Ghana Directory](#️-deaf-schools-of-ghana-directory)
- [📜 Attribution & Provenance](#-attribution--provenance)
- [📄 License](#-license)

---

## 🌟 Project Overview & Vision

**SignBridgeGhana** is a high-performance web-native platform engineered to preserve, teach, and elevate Ghanaian Sign Language (GSL). It bridges deaf and hearing communities through interactive technology, instant typo-tolerant search, and studio-grade visual design.

```
       ┌──────────────────────────────────────────────────────────────┐
       │     Ghanaian Sign Language Dictionary (3rd Edition PDF)      │
       │                   [ 241.2 MB / 318 Pages ]                   │
       └──────────────────────────────┬───────────────────────────────┘
                                      │
                         [ Extraction & Validation ]
                                      │
                                      ▼
       ┌──────────────────────────────────────────────────────────────┐
       │            Git-Friendly Partitioned JSON & WebP              │
       │   • 1,514 Signs   • 24 Categories   • 9 Deaf Schools Plates  │
       └──────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
       ┌──────────────────────────────────────────────────────────────┐
       │               SignBridgeGhana Web Application                │
       │   • MiniSearch Engine  • Liquid Chrome UI  • Camera Studio   │
       └──────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Platform Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Zero-Latency Global Search** | In-memory MiniSearch index supporting exact matches, prefix completion, fuzzy typo tolerance (`sch` ➔ `School`), and instant live dropdown previews. |
| 🔤 **A–Z Alphabetical Navigation** | Interactive ribbon with live sign counts for every letter of the alphabet (e.g. `A · 90`, `B · 106`, `S · 163`). |
| 📚 **24 Thematic GSL Categories** | Complete organization into official chapters including *Family & People*, *Food*, *Education & Communication*, *Towns & Regions*, *Technology*, *Health*, and *Idiomatic Expressions*. |
| 🖼️ **High-Resolution Sign Plates** | Crystal-clear 200–300 DPI sign illustration crops, phonetic breakdowns, step-by-step signing movements, and book page attributions. |
| ✋ **Manual Alphabet & Numerals** | High-fidelity interactive plates for GSL Fingerspelling (A–Z) and GSL Base Numerals (1–1,000). |
| 🏫 **Deaf Schools of Ghana Directory** | Interactive historical guide to Ghana's 9 specialized deaf institutions founded since 1957 (Mampong-Akuapem, Bechem, Cape Coast, SEC-TECH, etc.). |
| 🎥 **GSL Translation Studio** | Connected local camera stream with real-time landmark visualizer and interactive **Text-to-GSL Sign Sequence Composer**. |
| ⭐ **Offline Favorites & Study Notes** | LocalStorage-persisted bookmarks with custom study notes and JSON export/import. |
| 📱 **Responsive & Accessible** | WCAG high-contrast compliant, screen-reader semantic HTML, keyboard shortcuts (`/` to search, `Esc` to close), and mobile-first glassmorphism. |

---

## 💎 Design Guidelines & Aesthetic System

SignBridgeGhana adopts a **Liquid Chrome & Frosted Glassmorphism** visual language inspired by luxury industrial product design and high-end studio lighting:

### 1. Liquid Chrome Material Surface
- High-frequency specular border highlights (`rgba(255, 255, 255, 0.75)` with inner refraction glows).
- Tactile dimensional transitions on hover and active click states.
- Restrained metallic reflection bands (`linear-gradient(135deg, #ffffff 0%, #eef2f7 35%, #d8e1ed 70%, #ffffff 100%)`).

### 2. Multi-Layer Frosted Glass Slabs
- Hardware-accelerated backdrop blur (`backdrop-filter: blur(16px) saturate(180%)`).
- Dual softbox studio drop shadows (`0 8px 30px rgba(15, 23, 42, 0.05)`).
- High text-contrast ratios for pristine readability against frosted panels.

### 3. Typography & Micro-Interactions
- **Display Sans**: `Space Grotesk` for display headings and numerals.
- **Body & Metadata**: `Plus Jakarta Sans` with high legibility across all viewport sizes.
- **Monospace**: `JetBrains Mono` for source page badges and keyboard shortcuts.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: [React 18](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite 6](https://vitejs.dev/)
- **Search Engine**: [MiniSearch](https://github.com/lucaong/minisearch) (Fast client-side indexing)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS Design Tokens + Hardware-Accelerated Glassmorphism
- **Data Engineering**: Python 3.13 + [PyMuPDF (fitz)](https://pymupdf.readthedocs.io/) + [Pillow](https://pillow.readthedocs.io/)

---

## 📁 Git-Friendly Dataset Distribution

The 241.2 MB source PDF is kept outside Git via `.gitignore`. The dictionary is partitioned into clean, version-controlled JSON files and lightweight WebP assets:

```text
public/data/dictionary/
├── vocabulary/
│   ├── a.json, b.json, c.json ... z.json, 0-9.json
├── images/
│   ├── [category-slug]/[slug].webp (Optimized 300DPI WebP sign crops)
│   └── plates/ (Alphabet, numerals, handshapes)
├── index.json        (1,514 records - Compact instant search catalog)
├── categories.json   (24 thematic categories with counts & icons)
├── schools.json      (Ghana deaf educational institutions directory)
└── manifest.json     (Dataset metadata, version, checksums)
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.10+ *(Only required if re-extracting from the source PDF)*

### 1. Clone Repository
```bash
git clone https://github.com/charwayyyyyy/thesignbridgeghana.git
cd thesignbridgeghana
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🧪 Data Pipeline & Validation

To rebuild or validate the GSL dictionary dataset from the source PDF:

```bash
# Extract vocabulary, plates, and optimize images to WebP
npm run dictionary:extract

# Validate all 1,514 entries, images, and schema integrity
npm run dictionary:validate

# Combined extraction + validation pipeline
npm run dictionary:build
```

### Validation Report Output
```text
============================================================
      GHANAIAN SIGN LANGUAGE DICTIONARY VALIDATION
============================================================
Manifest Version: 1.0.0 (3rd Edition)
Total Declared Entries: 1514
Search Index Records: 1514
Categories Count: 24
Deaf Schools in Ghana: 9

--- DETAILED AUDIT RESULTS ---
Vocabulary Entries Audited: 1514
Valid Sign Images:          1514
Missing/Broken Images:      0
Empty Definitions:          0
Duplicate IDs:              0
Special Plates Validated:   5/5

============================================================
STATUS: PASSED - PRODUCTION READY DATASET
============================================================
```

---

## 🤖 Translation Studio Architecture

The Translation Studio (`/translate`) provides an honest, production-ready framework for computer vision translation:

1. **Spatial Hand & Pose Tracking**: Browser webcam feed with 21-keypoint landmark visualization.
2. **Text-to-GSL Sign Sequence Composer**: Type any English sentence (e.g. *"School family Ghana teacher friend"*) to dynamically sequence real GSL sign illustration cards.
3. **Model Integration Pipeline**: Prepared interfaces for Spatial-Temporal Transformer weights and Akan/Twi glossing.

---

## 🏛️ Deaf Schools of Ghana Directory

SignBridgeGhana honors the institutions that nurtured Ghanaian Sign Language:
- **Demonstration School for the Deaf** (Mampong-Akuapem, Eastern Region — Est. 1957 by Andrew Foster)
- **Secondary Technical School for the Deaf (SEC-TECH)** (Mampong-Akuapem — Only Deaf Senior Tech in West Africa)
- **Bechem School for the Deaf** (Ahafo Region)
- **Cape Coast School for the Deaf** (Central Region)
- **Wa School for the Deaf** (Upper West Region)
- **Savelugu School for the Deaf** (Northern Region)
- **Hohoe School for the Deaf** (Volta Region)
- **Gbeogo School for the Deaf** (Upper East Region)
- **Twin-City Special School** (Sekondi-Takoradi, Western Region)

---

## 📜 Attribution & Provenance

- **Primary Source**: *Ghanaian Sign Language Dictionary (Third Edition, 2018)*
- **Publishing Authority**: Special Education Division (SPED), Ghana Education Service (GES) & Ghana National Association of the Deaf (GNAD).
- **Digitization & Web Platform**: SignBridgeGhana. Dedicated to the deaf learners, educators, families, and sign language interpreters of Ghana.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
