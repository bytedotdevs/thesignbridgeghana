<div align="center">

  <img src="./public/favicon.png" alt="SignBridgeGhana Logo" width="96" height="96" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />

  # 🇬🇭 SignBridgeGhana
  ### **Ghanaian Sign Language (GSL) Digital Dictionary & Real-Time Translation Platform**

  [![Version](https://img.shields.io/badge/Version-2.0.0-emerald?style=for-the-badge&logo=semver)](package.json)
  [![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&logo=vercel)](https://github.com/charwayyyyyy/thesignbridgeghana)
  [![Corpus](https://img.shields.io/badge/GSL%20Corpus-1%2C514%20Official%20Signs-blue?style=for-the-badge&logo=bookmeter)](public/data/dictionary/index.json)
  [![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-f59e0b?style=for-the-badge&logo=pwa)](public/manifest.webmanifest)
  [![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)
  [![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%206%20%7C%20Three.js%20%7C%20MediaPipe-purple?style=for-the-badge&logo=react)](https://vitejs.dev/)

  <p align="center">
    <strong>The official digital gateway and real-time translation engine for Ghanaian Sign Language.</strong><br/>
    Digitized with precision from the authoritative 318-page <em>Ghanaian Sign Language Dictionary (3rd Edition)</em> published by the <strong>Ghana National Association of the Deaf (GNAD)</strong> and the <strong>Special Education Division of the Ghana Education Service (GES)</strong>.
  </p>

  <p align="center">
    <a href="#-table-of-contents">Explore Docs</a> •
    <a href="#-whats-new-in-v20">What's New in v2.0</a> •
    <a href="#-key-platform-features">Features</a> •
    <a href="#-bidirectional-translation-engine">Translation Engine</a> •
    <a href="#-progressive-web-app--mobile-readiness">PWA & Mobile</a> •
    <a href="#-collaborator-briefing">Collaborator Guide</a> •
    <a href="#-quickstart--local-development">Quickstart</a>
  </p>

</div>

---

## 📖 Table of Contents

- [🌟 Project Overview & Vision](#-project-overview--vision)
- [🚀 What's New in v2.0](#-whats-new-in-v20)
- [✨ Key Platform Features](#-key-platform-features)
- [🤖 Bidirectional Translation Engine & Infrastructure](#-bidirectional-translation-engine--infrastructure)
  - [1. Sign → Text & Audio (Camera AI)](#1-sign--text--audio-camera-ai)
  - [2. Text/Voice → Sign (3D Avatar Engine)](#2-textvoice--sign-3d-avatar-engine)
  - [3. Interactive Sign Composer](#3-interactive-sign-composer)
- [📱 Progressive Web App (PWA) & Mobile Readiness](#-progressive-web-app-pwa--mobile-readiness)
- [💎 Design Guidelines & Aesthetic System](#-design-guidelines--aesthetic-system)
- [🛠️ Tech Stack & Dependencies](#️-tech-stack--dependencies)
- [📁 Repository & Data Architecture](#-repository--data-architecture)
- [🚀 Quickstart & Local Development](#-quickstart--local-development)
- [🧪 Data Pipeline & Validation](#-data-pipeline--validation)
- [🏛️ Deaf Schools of Ghana Directory](#️-deaf-schools-of-ghana-directory)
- [🤝 Collaborator Briefing & Onboarding](#-collaborator-briefing--onboarding)
- [📜 Attribution & Provenance](#-attribution--provenance)
- [📄 License](#-license)

---

## 🌟 Project Overview & Vision

**SignBridgeGhana** is a high-performance web-native platform and cross-platform PWA engineered to preserve, teach, and elevate **Ghanaian Sign Language (GSL)**. Over 110,000 Deaf and hard-of-hearing Ghanaians use GSL daily as their primary language, yet digital tools and two-way translation accessibility have historically been sparse.

SignBridgeGhana bridges deaf and hearing communities through:
1. **Authoritative Preservation**: Full digital preservation of all 1,514 official GSL signs from the GNAD/GES national curriculum.
2. **Two-Way Real-Time Translation**:
   - Watching someone sign through their webcam/camera and translating into English text and spoken audio.
   - Typing or speaking an English sentence and watching an animated 3D avatar perform the sign sequence alongside synchronized official GSL dictionary cards.
3. **Zero-Latency Offline Access**: Full PWA precaching ensuring the dictionary works seamlessly without internet in classrooms, clinics, and rural communities across Ghana.

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
       │             SignBridgeGhana v2.0 Platform                    │
       │  ┌──────────────────────┐      ┌──────────────────────────┐  │
       │  │ Sign → Text AI       │      │ Text → 3D Avatar Signer  │  │
       │  │ MediaPipe Holistic   │ ◄──► │ Three.js Procedural Rig  │  │
       │  │ Audio TTS Narration  │      │ Speech Recognition Input │  │
       │  └──────────────────────┘      └──────────────────────────┘  │
       │  ┌────────────────────────────────────────────────────────┐  │
       │  │ MiniSearch Engine • Liquid Chrome UI • Offline PWA     │  │
       │  └────────────────────────────────────────────────────────┘  │
       └──────────────────────────────────────────────────────────────┘
```

---

## 🚀 What's New in v2.0

Version 2.0 transforms SignBridgeGhana from a static digital dictionary into an **active, bidirectional communication studio**:

- 🎥 **Real-Time Camera Sign-to-Text AI**: MediaPipe Holistic spatial tracking with 21 hand landmarks, 33 body pose points, and 468 face mesh keypoints. Matches gestures against the GSL dictionary corpus with live confidence scores.
- 🗣️ **Text-to-Speech (TTS) Narration**: Hearing partners can listen to the detected signs spoken aloud in real-time using the Web Speech Synthesis API.
- 🧍 **3D Avatar GSL Signing Engine**: Three.js procedural skeletal avatar with humanoid joint IK rotations, smooth Euler/quaternion interpolation, speed control (0.5x to 2.0x), and looping.
- 🎙️ **Speech-to-Sign Input**: Hearing users can speak directly into their microphone (Web Speech Recognition) to translate spoken English into GSL sign sequences.
- 🧩 **Interactive Sign Composer**: Build, arrange, and preview custom GSL sign sentences with timing indicators and sign illustration cards.
- 📲 **Full PWA & Offline Support**: Workbox service worker precaching 1,537 assets. Installable on desktop, iOS (Safari "Add to Home Screen"), and Android.

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
| 🤖 **GSL Translation Studio** | Multi-mode studio: Camera Sign-to-Text, 3D Avatar Text-to-Sign, and Sign Sequence Composer. |
| ⭐ **Offline Favorites & Study Notes** | LocalStorage-persisted bookmarks with custom study notes and JSON export/import. |
| 📱 **PWA & Mobile Installable** | Add to Home Screen on mobile and desktop, full offline capability with service worker precaching. |
| ♿ **Accessible & High-Contrast** | WCAG high-contrast compliance, screen-reader semantic HTML, keyboard shortcuts (`/` to search, `Esc` to close), and mobile-first glassmorphism. |

---

## 🤖 Bidirectional Translation Engine & Infrastructure

The Translation Studio (`/translate`) consists of three production subsystems:

### 1. Sign → Text & Audio (Camera AI)
- **Component**: [`src/components/translator/SignToTextView.tsx`](src/components/translator/SignToTextView.tsx)
- **Service**: [`src/services/gestureRecognitionService.ts`](src/services/gestureRecognitionService.ts)
- **Computer Vision Pipeline**:
  - Connects to front/rear camera streams via `navigator.mediaDevices.getUserMedia`.
  - Uses `@mediapipe/holistic` to extract 21 3D hand keypoints per hand, 33 body pose landmarks, and facial orientation.
  - Normalizes coordinate spaces relative to wrist and shoulder references.
  - Feature vector extraction computes finger extensions, knuckle curl angles, and spatial positions.
  - Nearest-neighbor matcher checks feature vectors against the 1,514 GSL sign index with confidence thresholds.
  - Temporal phoneme buffer prevents flickering and confirms repeated sign frames before publishing word events.
  - Integrated **Web Speech API SpeechSynthesis** speaks detected words aloud for hearing conversation partners.

### 2. Text/Voice → Sign (3D Avatar Engine)
- **Component**: [`src/components/translator/TextToSignAvatar.tsx`](src/components/translator/TextToSignAvatar.tsx)
- **Service**: [`src/services/avatarSigningService.ts`](src/services/avatarSigningService.ts)
- **3D Graphics & Animation Pipeline**:
  - Procedural Three.js humanoid rig built with geometric segments (head, torso, shoulders, upper arms, forearms, hands) with studio lighting and shadow mapping.
  - User can type text or speak via microphone (**Web Speech Recognition API**).
  - Lexical token parser queries the in-memory GSL dictionary for matching vocabulary cards.
  - Words with dictionary matches trigger procedural pose sequences (Shoulder, Elbow, Wrist, Spine, and Head Euler rotation angles).
  - Unmatched words fallback to fingerspelling character sequences.
  - Real-time slerp/Euler interpolation provides fluid 60fps transitions between poses.
  - UI synchronizes the 3D avatar animation with the official high-resolution GSL dictionary card preview.

### 3. Interactive Sign Composer
- **Component**: [`src/components/translator/SignComposer.tsx`](src/components/translator/SignComposer.tsx)
- Allows educators, interpreters, and learners to construct complex GSL sentence sequences.
- Step-by-step playback with customizable dwell times per sign.
- Direct links from sequenced cards into the full vocabulary detail pages.

---

## 📱 Progressive Web App (PWA) & Mobile Readiness

SignBridgeGhana is architected as an installable PWA that functions seamlessly on web, mobile browsers, and packaged native shells:

- **Service Worker Engine**: Built using `vite-plugin-pwa` and Google Workbox (`sw.js`).
- **Precache Corpus**: 1,537 essential application bundles, styles, icons, and dictionary files precached for instant offline loading.
- **Runtime Caching**:
  - Dictionary images & JSON assets cached via `CacheFirst` strategy with 30-day persistence.
  - Google Fonts cached with `StaleWhileRevalidate` and `CacheFirst`.
- **Web App Manifest**: Configured in `vite.config.ts` and `public/manifest.webmanifest` with standalone display mode, orientation support, shortcuts (`/translate`, `/dictionary`), and high-res maskable icons.
- **Install Prompt UI**: Custom [`PWAInstallPrompt.tsx`](src/components/common/PWAInstallPrompt.tsx) non-intrusively notifies users when the app can be installed to their desktop or home screen.
- **Mobile Wrapper Compatibility**: Ready to be wrapped into iOS/Android native app stores via Capacitor or Cordova.

---

## 💎 Design Guidelines & Aesthetic System

SignBridgeGhana adopts a **Liquid Chrome & Frosted Glassmorphism** visual language inspired by luxury industrial product design:

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

### 4. Design Documentation
- See [`DESIGN-uber (1).md`](DESIGN-uber%20(1).md) for the foundational design tokens, color scales, and layout specifications.
- See [`COLLAB.md`](COLLAB.md) for full design system component mappings.

---

## 🛠️ Tech Stack & Dependencies

| Area | Technologies |
| :--- | :--- |
| **Core Framework** | [React 18.3](https://react.dev/) • [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Bundler & Tooling** | [Vite 6.1](https://vitejs.dev/) • [vite-plugin-pwa 0.21](https://vite-pwa-org.netlify.app/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **3D Rendering** | [Three.js 0.177](https://threejs.org/) |
| **Computer Vision** | [@mediapipe/holistic](https://developers.google.com/mediapipe) • [@mediapipe/camera_utils](https://developers.google.com/mediapipe) • [react-webcam](https://github.com/mozmorris/react-webcam) |
| **Speech APIs** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Search Engine** | [MiniSearch 7.1](https://github.com/lucaong/minisearch) |
| **Animation & Icons** | [Framer Motion 12.12](https://www.framer.com/motion/) • [Lucide React 0.475](https://lucide.dev/) |
| **Styling** | Vanilla CSS Design Tokens + Hardware-Accelerated Glassmorphism |
| **Data Extraction** | Python 3.10+ • [PyMuPDF (fitz)](https://pymupdf.readthedocs.io/) • [Pillow](https://pillow.readthedocs.io/) |

---

## 📁 Repository & Data Architecture

```text
thesignbridge/
├── COLLAB.md                  # Comprehensive collaborator onboarding & system guide
├── DESIGN-uber (1).md         # Design system specifications & token analysis
├── README.md                  # Main project documentation (this file)
├── package.json               # Scripts and dependencies
├── vite.config.ts             # Vite configuration + PWA Workbox settings
├── tsconfig.json              # TypeScript strict compiler configuration
│
├── public/                    # Static assets & partitioned GSL dataset
│   ├── favicon.png            # High-resolution brand logo & PWA icon
│   ├── robots.txt             # Search crawler directives
│   └── data/dictionary/
│       ├── vocabulary/        # Partitioned alphabetical sign files (a.json ... z.json)
│       ├── images/            # Optimized 300 DPI WebP sign crops
│       ├── index.json         # 1,514 compact search records
│       ├── categories.json    # 24 thematic categories
│       ├── schools.json       # 9 historic Deaf schools in Ghana
│       └── manifest.json      # Dataset metadata, version & checksums
│
├── scripts/                   # Data engineering tools
│   ├── extract_dictionary.py  # PDF to JSON + WebP image cropper
│   └── validate_dictionary.py # Dataset integrity audit & verification
│
└── src/                       # Application source code
    ├── components/
    │   ├── common/            # LiquidChromeButton, FrostedGlassCard, Badge, PWA prompt
    │   ├── dictionary/        # SignCard, SearchBar, CategoryFilter, Ribbon
    │   └── translator/        # SignToTextView, TextToSignAvatar, SignComposer, CameraView
    ├── context/               # DictionaryContext, FavoritesContext
    ├── pages/                 # Home, Dictionary, VocabularyDetail, Categories,
    │                          # Alphabet, Numerals, Schools, Favorites, Translator, About
    ├── services/
    │   ├── avatarSigningService.ts     # Three.js 3D avatar rig & pose interpolator
    │   ├── gestureRecognitionService.ts # MediaPipe Holistic & GSL feature matcher
    │   ├── searchService.ts            # MiniSearch client indexing
    │   ├── dictionaryService.ts        # Data loader & vocabulary cache
    │   └── storageService.ts           # LocalStorage favorites & study notes
    ├── styles/                # design-tokens.css, chrome-glass.css, index.css
    └── types/                 # dictionary.ts (data schemas & models)
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

### 4. Build for Production & PWA
```bash
npm run build
```
This compiles TypeScript (`tsc --noEmit`), bundles client assets via Vite, and generates the offline service worker (`dist/sw.js`).

### 5. Preview Production Bundle
```bash
npm run preview
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

## 🤝 Collaborator Briefing & Onboarding

Are you contributing code, refining the 3D avatar rig, training sign recognition models, or contributing design assets?

👉 **Please read [`COLLAB.md`](COLLAB.md) first!**

[`COLLAB.md`](COLLAB.md) contains:
- Deep breakdown of all systems in place (Data, Search, CV, 3D Graphics, PWA, Persistence).
- Comprehensive catalog of all design files, tokens, and component guidelines.
- Technical roadmap for upcoming milestones (TFLite models, skinned GLTF avatars, Capacitor packaging).
- Contribution standards and coding conventions.

---

## 📜 Attribution & Provenance

- **Primary Source**: *Ghanaian Sign Language Dictionary (Third Edition, 2018)*
- **Publishing Authority**: Special Education Division (SPED), Ghana Education Service (GES) & Ghana National Association of the Deaf (GNAD).
- **Digitization & Web Platform**: SignBridgeGhana. Dedicated to the deaf learners, educators, families, and sign language interpreters of Ghana.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
