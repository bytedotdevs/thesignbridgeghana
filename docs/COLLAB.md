# 🤝 SignBridgeGhana — Collaborator & Architecture Guide (COLLAB.md)

> **LIVING COLLABORATION DOCUMENT**  
> *Version:* `2.0.0`  
> *Last Updated:* `September 2026`  
> *Repository:* [thesignbridgeghana](https://github.com/charwayyyyyy/thesignbridgeghana)  
> *Official Source:* Ghanaian Sign Language Dictionary (3rd Edition, GNAD & GES-SPED)  
> 
> ⚠️ **Rule for all Collaborators:** Whenever you introduce a new feature, service, page, model, design token, or build script, **you MUST update this file** so the next collaborator is instantly briefed on the exact state of the project.

---

## 📌 Table of Contents

1. [Executive Brief & Mission](#1-executive-brief--mission)
2. [What We Have Built (Current State & Inventory)](#2-what-we-have-built-current-state--inventory)
   - [Page Catalog](#page-catalog)
   - [Component Registry](#component-registry)
   - [Service Layer Registry](#service-layer-registry)
   - [Contexts & State Management](#contexts--state-management)
3. [The Systems in Place & Technical Architecture](#3-the-systems-in-place--technical-architecture)
   - [System 1: Data Digitization & Partitioned Corpus](#system-1-data-digitization--partitioned-corpus)
   - [System 2: Zero-Latency Client Search Engine](#system-2-zero-latency-client-search-engine)
   - [System 3: Real-Time Computer Vision & Gesture Recognition](#system-3-real-time-computer-vision--gesture-recognition)
   - [System 4: Procedural 3D Avatar Signing Engine](#system-4-procedural-3d-avatar-signing-engine)
   - [System 5: Progressive Web App (PWA) & Offline Infrastructure](#system-5-progressive-web-app-pwa--offline-infrastructure)
   - [System 6: User Persistence & Study Notes](#system-6-user-persistence--study-notes)
4. [Design Files, Aesthetic System & Tokens](#4-design-files-aesthetic-system--tokens)
   - [Design Specification File: `DESIGN-uber (1).md`](#design-specification-file-design-uber-1md)
   - [Liquid Chrome & Frosted Glassmorphism](#liquid-chrome--frosted-glassmorphism)
   - [Typography System](#typography-system)
   - [CSS Architecture & Tokens](#css-architecture--tokens)
5. [Codebase Directory Map](#5-codebase-directory-map)
6. [Developer Workflows & Commands](#6-developer-workflows--commands)
7. [Roadmap & Opportunities for Collaborators](#7-roadmap--opportunities-for-collaborators)
8. [Maintenance Protocol: How to Keep This File Updated](#8-maintenance-protocol-how-to-keep-this-file-updated)

---

## 1. Executive Brief & Mission

### The Context
Over **110,000 Deaf and hard-of-hearing individuals** live in Ghana. Their primary language is **Ghanaian Sign Language (GSL)**, an indigenous visual-gestural language with unique grammatical structures, idiomatic expressions, and cultural signs distinct from American Sign Language (ASL) or British Sign Language (BSL).

Historically, the national reference has existed only as a heavy physical printed dictionary or a 241 MB scanned PDF published by the **Ghana National Association of the Deaf (GNAD)** and the **Special Education Division of the Ghana Education Service (GES)**.

### Our Mission
SignBridgeGhana is an open-source, web-native accessibility platform and Progressive Web App designed to:
1. **Digitize and preserve** all 1,514 official GSL signs with pristine 300 DPI illustrations, step-by-step instructions, and phonetic descriptions.
2. **Provide two-way real-time translation**:
   - **Deaf ➔ Hearing**: Uses a camera to watch someone signing, classifies the gesture in real-time, outputs written text, and speaks it aloud via Text-to-Speech (TTS).
   - **Hearing ➔ Deaf**: Accepts typed or spoken English, translates it into GSL sign sequences, and animates a 3D procedural humanoid avatar performing the signs alongside synchronized dictionary cards.
3. **Operate offline across Ghana**: With full PWA caching, the application operates in rural classrooms, hospitals, courts, and churches without requiring constant internet access.

---

## 2. What We Have Built (Current State & Inventory)

### Page Catalog

All pages are located under [`src/pages/`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages) and wired into React Router v7 in [`src/App.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/App.tsx):

| Page | File | URL Route | Description |
| :--- | :--- | :--- | :--- |
| **Home** | [`HomePage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/HomePage.tsx) | `/` | Hero section, quick search bar, featured category cards, A–Z alphabet ribbons, statistics counter, Deaf schools spotlight, and quick links. |
| **Dictionary** | [`DictionaryPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/DictionaryPage.tsx) | `/dictionary` | Full catalog browser with letter filtering (A–Z, 0–9), category filtering, grid/list view switcher, pagination, and instant keyword filter. |
| **Vocabulary Detail** | [`VocabularyDetailPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/VocabularyDetailPage.tsx) | `/sign/:slug` | Deep-dive view of a single sign: high-res illustration zoom, step-by-step movement instructions, phonetic breakdown, PDF source page reference, related category signs, and favorite/notes drawer. |
| **Categories** | [`CategoriesPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/CategoriesPage.tsx) | `/categories` | Visual grid of all 24 official GSL thematic categories (e.g. *Family & People*, *Food*, *Towns & Regions*, *Education*) with counts and custom Lucide icons. |
| **Alphabet Fingerspelling** | [`AlphabetPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/AlphabetPage.tsx) | `/alphabet` | High-resolution interactive plates for GSL manual fingerspelling (A through Z) with zoom and individual character letter cards. |
| **Base Numerals** | [`NumeralsPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/NumeralsPage.tsx) | `/numerals` | GSL number signs from base digits (1–10) through tens, hundreds, and thousands with signing rules. |
| **Deaf Schools** | [`SchoolsPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/SchoolsPage.tsx) | `/schools` | Historical directory of all 9 specialized educational institutions for the Deaf across Ghana, founded from 1957 onward. |
| **Favorites & Notes** | [`FavoritesPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/FavoritesPage.tsx) | `/favorites` | Bookmarked signs persisted in LocalStorage. Users can write custom study notes for each sign, filter bookmarks, and export/import bookmarks as JSON. |
| **Translator Studio** | [`TranslatorPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/TranslatorPage.tsx) | `/translate` | Unified translation studio hosting 3 modes: **Sign ➔ Text (Camera AI)**, **Text ➔ Sign (3D Avatar)**, and **Sign Composer**. |
| **About & Provenance** | [`AboutPage.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/pages/AboutPage.tsx) | `/about` | Project history, Andrew Foster's legacy, GNAD & GES acknowledgments, dictionary 3rd edition metadata, technical methodology, and citation info. |

---

### Component Registry

#### Common Components ([`src/components/common/`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common))
- [`LiquidChromeButton.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/LiquidChromeButton.tsx): Signature tactile button with specular border highlights, dimensional pressed states, and loading states.
- [`FrostedGlassCard.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/FrostedGlassCard.tsx): Reusable multi-layer blurred card container with soft drop shadows and customizable hover lifts.
- [`Badge.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/Badge.tsx): Categorical, status, and metadata pill tags in various brand colorways.
- [`LoadingSkeleton.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/LoadingSkeleton.tsx): Animated shimmer placeholder skeletons for cards and list views during asynchronous loads.
- [`PWAInstallPrompt.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/PWAInstallPrompt.tsx): Floating bottom banner capturing `beforeinstallprompt` event to provide one-tap PWA installation.
- [`Toast.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/Toast.tsx): Non-intrusive feedback notifications (e.g. copied to clipboard, bookmark added).
- [`AppHeader.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/AppHeader.tsx): Sticky glass navigation bar with search bar trigger, navigation links, mobile hamburger drawer, and quick translate shortcut.
- [`AppFooter.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/common/AppFooter.tsx): Comprehensive footer with institutional acknowledgments, sitemap links, and dataset audit badges.

#### Dictionary Components ([`src/components/dictionary/`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/dictionary))
- `SignCard.tsx`: Grid item presenting a sign's WebP crop, English term, Akan/Twi equivalent (where available), category badge, and bookmark toggle.
- `SearchBar.tsx`: Global search input tied to MiniSearch with live dropdown suggestions, keyboard arrow navigation, and shortcut (`/`).
- `CategoryFilter.tsx`: Horizontal chip selector for quick category filtering.
- `AlphabetRibbon.tsx`: Compact A–Z letter selector with live sign count badges.

#### Translation Studio Components ([`src/components/translator/`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator))
- [`SignToTextView.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator/SignToTextView.tsx): Camera AI feed with MediaPipe landmark canvas overlay, detected sign cards, streaming transcript buffer, and Text-to-Speech (TTS) voice reading.
- [`TextToSignAvatar.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator/TextToSignAvatar.tsx): **2D canvas skeletal avatar** (HTML5 Canvas) with detailed finger poses (MCP/PIP/DIP joints per finger), facial expressions (eyebrows, pupils, mouth), movement direction arrows, text input + speech-to-text mic input, dictionary image preview, and GSL sign playlist.
- [`SignComposer.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator/SignComposer.tsx): Sentence sequence builder allowing users to assemble custom sign sequences with dwell time and loop controls.
- [`CameraView.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator/CameraView.tsx): Lightweight camera viewport wrapper with 21-point hand landmark overlay for testing and diagnostics.
- [`TranslationPipelineInfo.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator/TranslationPipelineInfo.tsx): Expandable architecture modal/drawer explaining the computer vision and animation pipelines to learners and developers.

---

### Service Layer Registry

All services are located under [`src/services/`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services):

1. [`avatarSigningService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/avatarSigningService.ts):
   - **Role**: 2D Canvas skeletal avatar engine (no Three.js dependency).
   - Provides `AvatarRig` (canvas + ctx), `SignPose2D`, `FingerPose`, `FaceExpression`, `ArmPose`, `MovementArrow` types.
   - `buildAvatarRig(canvas)` sets up the 2D render surface.
   - `applyPoseToRig(rig, pose)` renders the full 2D human figure: head, torso, arms with detailed 3-segment finger joints, facial expressions, and directional arrows.
   - `buildSignSequence(word, sign)` selects category-appropriate GSL poses from a multi-category library.
   - `interpolatePose(a, b, t)` with `easeInOutCubic` for smooth keyframe transitions.
   - GSL pose library keyed to 12+ categories (greeting, family, education, food, colors, emotions, time, verbs, places, health, nature, numbers, religion).
   - `MovementArrow` support with straight, arc, and circular arrow paths indicating hand movement direction as shown in the dictionary.

2. [`gestureRecognitionService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/gestureRecognitionService.ts):
   - **Role**: Real-time sign classification from video streams.
   - Integrates `@mediapipe/holistic` capturing 21 hand landmarks, 33 body pose points, and 468 face mesh points.
   - `extractHandFeatures()`: Extracts spread, height, per-finger extension (MCP/PIP/DIP check), closeness, finger count, palm facing.
   - `matchSignFromFeatures()`: Scores GSL index candidates using category + definition keyword mapping against detected gesture type.
   - 8 gesture types: `open-hand`, `fist`, `point`, `two-fingers`, `three-fingers`, `thumbs`, `curved`, `generic` — each mapped to GSL categories.
   - Simulation fallback mode: Emits real dictionary matches from the GSL index when MediaPipe is unavailable.
   - `onRecognition()` / `onFrame()` pub-sub API for decoupled component updates.

3. [`searchService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/searchService.ts):
   - **Role**: High-speed, client-side full-text search.
   - Instantiates `MiniSearch` indexing `term`, `category`, `description`, and `pageNumber`.
   - Configures fuzzy matching (distance 0.2), prefix matching, and category boosting.

4. [`dictionaryService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/dictionaryService.ts):
   - **Role**: Data loading and caching layer.
   - Lazily loads partitioned letter JSONs (`public/data/dictionary/vocabulary/{letter}.json`) to avoid fetching a single massive JSON file.
   - Caches parsed vocabulary entries in memory.

5. [`storageService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/storageService.ts):
   - **Role**: LocalStorage persistence.
   - Handles saving, removing, and updating favorite signs and notes.
   - Provides JSON export and import for backing up user notes.

6. [`vocabularySuggestionService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/vocabularySuggestionService.ts):
   - **Role**: Context-aware, typo-tolerant fuzzy vocabulary resolution and numbers processing.
   - Fast Levenshtein distance combined with phonetic sound key hashing (`phoneticKey`) to recognize phonetic typos (e.g. "skool" ➔ "SCHOOL", "doktor" ➔ "DOCTOR", "wter" ➔ "WATER", "fone" ➔ "PHONE").
   - Confidence scoring and semantic category-based suggestion generation.
   - Numeric input parser (`parseNumberInput`): extracts raw digits ("5", "42"), compound numerals, and English number words ("seven", "forty") for dedicated GSL number sign sequence generation.

---

### Contexts & State Management

- [`DictionaryContext.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/context/DictionaryContext.tsx): Provides global access to the 1,514 search index items, categories list, Deaf schools list, active search query, and loading states.
- [`FavoritesContext.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/context/FavoritesContext.tsx): Manages user bookmarks, study notes, and synchronizes changes with LocalStorage.

---

## 3. The Systems in Place & Technical Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │   GNAD/GES Dictionary 3rd Edition PDF   │
                                  │         (318 Pages, 241.2 MB)           │
                                  └────────────────────┬────────────────────┘
                                                       │
                                        [ PyMuPDF + Pillow Pipeline ]
                                                       │
                         ┌─────────────────────────────┴─────────────────────────────┐
                         ▼                                                           ▼
         ┌───────────────────────────────┐                           ┌───────────────────────────────┐
         │     1,514 Optimized WebP      │                           │      Partitioned JSONs        │
         │   Sign Illustration Crops     │                           │  a.json ... z.json, index.json │
         └───────────────┬───────────────┘                           └───────────────┬───────────────┘
                         │                                                           │
                         └─────────────────────────────┬─────────────────────────────┘
                                                       │
                                                       ▼
                                     ┌──────────────────────────────────┐
                                     │     Vite PWA & Workbox Engine    │
                                     │  • Precached 1,537 Assets        │
                                     │  • CacheFirst Dictionary Cache   │
                                     └─────────────────┬────────────────┘
                                                       │
         ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
         ▼                                             ▼                                             ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Client Search Engine        │   │    Vision & Gesture Pipeline    │   │      3D Avatar Engine           │
│  • MiniSearch in-memory index   │   │  • MediaPipe Holistic           │   │  • Three.js Procedural Rig      │
│  • Fuzzy typo tolerance         │   │  • Hand/Pose feature vectors    │   │  • Slerp/Euler Interpolation    │
│  • Instant prefix completion    │   │  • Temporal smoothing buffer    │   │  • SpeechRecognition & TTS      │
│  • Zero server round-trips      │   │  • Web Speech Synthesis TTS     │   │  • Sign Card Synchronization    │
└─────────────────────────────────┘   └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

### System 1: Data Digitization & Partitioned Corpus

- **Source File**: `Ghanaian Sign Language Dictionary - 3rd Edition.pdf` (kept outside Git via `.gitignore`).
- **Extraction Scripts**:
  - `python scripts/extract_dictionary.py`: Reads the 318 pages using PyMuPDF (`fitz`), isolates sign bounding boxes, crops illustration plates, resizes and compresses them to lightweight WebP format at 80% quality, and structures metadata into JSON files.
  - `python scripts/validate_dictionary.py`: Performs a 100% schema audit verifying every one of the 1,514 declared entries has a valid image, non-empty definition, category assignment, and valid book page number.
- **Data Partitioning**:
  - Rather than loading a massive 10 MB JSON blob, the dataset is partitioned alphabetically into `public/data/dictionary/vocabulary/{letter}.json`.
  - A lightweight `index.json` (~200 KB) contains only search keys, category slugs, and image paths for instantaneous global search and lookup.

---

### System 2: Zero-Latency Client Search Engine

- **Technology**: `minisearch` v7.1.
- **Index Construction**: Instantiated on app load using the lightweight `index.json`.
- **Fields Indexed**: `term`, `category`, `description`.
- **Search Capabilities**:
  - Exact substring and prefix matching (e.g. typing `"fam"` instantly matches `"Family"`).
  - Levenshtein typo tolerance with edit distance 0.2 (e.g. typing `"scool"` matches `"School"`).
  - Instant dropdown results within `< 5ms`, fully client-side.

---

### System 3: Real-Time Computer Vision & Gesture Recognition

- **Location**: [`src/services/gestureRecognitionService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/gestureRecognitionService.ts) and [`SignToTextView.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator/SignToTextView.tsx).
- **Core Engine**: `@mediapipe/holistic` v0.5.
- **Landmarks Tracked**:
  - 21 landmarks per hand (x, y, z coordinates).
  - 33 body pose landmarks (shoulders, elbows, wrists, nose, eyes).
  - 468 face mesh points.
- **Pipeline Stages**:
  1. **Video Capture**: 30fps webcam stream with facing-mode switching (front/rear).
  2. **Landmark Extraction**: Video frames processed by MediaPipe Holistic worker.
  3. **Feature Vector Normalization**: Coordinates are normalized relative to wrist anchor and palm scale to make gesture detection scale- and position-invariant.
  4. **Classification**: Vector distance check against gesture signatures representing GSL signs.
  5. **Temporal Confirmation**: Signs must be held for 3 consecutive frames to prevent momentary glitches from registering.
  6. **Narration**: When a new sign is confirmed, Web Speech Synthesis speaks the English word aloud for hearing companions.

---

### System 4: 2D Canvas Skeletal Avatar Signing Engine

- **Location**: [`src/services/avatarSigningService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/avatarSigningService.ts), [`vocabularySuggestionService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/vocabularySuggestionService.ts), and [`TextToSignAvatar.tsx`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/components/translator/TextToSignAvatar.tsx).
- **Core Engine**: HTML5 Canvas 2D API — pure hardware-accelerated canvas rendering with zero external 3D runtime overhead.
- **Coordinate System**: Avatar-local, centered at shoulder midpoint. Right arm (avatar perspective) is on **screen left** at x=-75. Left arm at x=+75. Y increases downward.
- **2-Bone Inverse Kinematics (IK) & Forward Kinematics Engine**:
  - `solve2BoneIK(sx, sy, tx, ty, l1, l2, isRight)`: Closed-form analytical IK solver based on the Law of Cosines. Ensures natural human outward elbow bend without limb stretching or snapping.
  - `computeArmFK`: Seamlessly switches between 2-bone IK (when absolute spatial wrist targets `handTargetX/Y` are defined) and forward kinematics when floating freely.
- **Human Signing Fluidity & Organic Physics**:
  - **Parabolic Arc Hand Lifting**: Hand travel paths follow dynamic curved parabolic arcs ($arcY = -\sin(\pi t) \cdot \min(26, dist \cdot 0.22)$) to simulate natural human arm lifting during transitions instead of robotic straight-line lerping.
  - **Lateral Flare**: Hands flare outward slightly during flight, preventing intersecting with the chest.
  - **Trailing Wrist Lag**: Realistic secondary wrist flexion ($dy \cdot 0.0018 \cdot \sin(\pi t)$) trailing arm motion.
  - **Secondary Finger Transit Relaxation**: Fingers soften into a relaxed neutral curve (`RELAXED_TRANSIT`) between $t \in [0.15, 0.78]$ and snap into the target handshape upon arrival.
  - **Dynamic Breathing & Weight Shifting**: Subtle chest breathing ($1.5 \sin(0.0016 t)$) and torso counter-balance when reaching high.
  - **Natural Eye Blinking**: Periodic human blinking every ~3.5s (`now % 3600 < 95ms`).
- **Complete GSL Number Signing System (0–1,000)**:
  - Exact manual signing for numbers 0–20, 30, 40, 50, 60, 70, 80, 90, 100, and 1,000 derived from GSL 3rd Edition Plates 13–14.
  - Multi-digit compound numbers (e.g. "42", "2024") automatically broken into sequential digit poses with fluid intermediate transitions.
  - Horizontal interactive scrollable GSL Number Signs ribbon for instant single-click sign inspection.
- **Context-Aware & Typo-Tolerant Vocabulary Resolution**:
  - Auto-resolves typos using Levenshtein distance combined with phonetic sound key hashing (`phoneticKey`).
  - Typo Alert Banner showing original query, resolved dictionary sign, and match confidence percentage.
  - Related vocabulary chips dynamically surfaced by category and semantic similarity.
- **Finger & Joint Rendering**:
  - Tapered limbs with specular highlights, contoured palm with knuckle crease lines, and specular joint dots.
  - All 5 colored fingers per hand (Thumb: Purple, Index: Blue, Middle: Green, Ring: Orange, Pinky: Pink) with 3 articulated joint segments (MCP, PIP, DIP).
- **Movement Arrows**: Straight, arc-up, arc-down, and circular path arrows indicating hand movement direction matching the official dictionary plates.
- **Speed Selector**: Interactive playback speed controls (`0.75x`, `1.0x`, `1.25x`) for learning and practice.

---

### System 5: Progressive Web App (PWA) & Offline Infrastructure

- **Vite Configuration**: [`vite.config.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/vite.config.ts) utilizing `vite-plugin-pwa`.
- **Precached Entries**: 1,537 assets compiled into the service worker (`dist/sw.js`).
- **Caching Policies**:
  - `CacheFirst` for `/data/dictionary/*` assets (max 100 entries, 30-day expiration).
  - `StaleWhileRevalidate` for Google Fonts stylesheets.
  - `CacheFirst` for Google Fonts woff2 binaries (1-year expiration).
- **Manifest Configuration**: Defined in `public/manifest.webmanifest` with `standalone` display, `any` orientation, maskable icons, and app shortcuts for `/translate` and `/dictionary`.
- **Install Experience**: Supported across Chrome, Edge, Safari (iOS "Add to Home Screen"), and Android browsers.

---

### System 6: User Persistence & Study Notes

- **Location**: [`src/services/storageService.ts`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/services/storageService.ts).
- **Storage Mechanism**: Browser `window.localStorage` under key `signbridge_favorites_v1`.
- **Data Model**: Stores sign IDs, timestamps, and free-form markdown study notes.
- **Backup & Portability**: Built-in JSON export and import functions allow users to transfer study notes between devices or keep backups.

---

## 4. Design Files, Aesthetic System & Tokens

### Design Specification File: `docs/DESIGN.md`

In the `docs/` directory, [`DESIGN.md`](DESIGN.md) (and `DESIGN-uber (1).md`) provides our comprehensive design benchmark. It outlines:
- High-contrast monochromatic foundations (`#000000` canvas/ink, `#ffffff` card slabs, `#5e5e5e` muted body).
- Signature pill geometry (`border-radius: 9999px`) on all primary buttons and badges.
- Strict typography scale based on UberMove / Space Grotesk geometry (display-xxl down to body-sm).
- Editorial layouts with ample white space, high-frequency specular edges, and tactile hover states.

---

### Liquid Chrome & Frosted Glassmorphism

SignBridgeGhana elevates this specification with an **industrial luxury aesthetic**:

1. **Liquid Chrome Specular Edges**:
   - Class: `.liquid-chrome-btn`, `.chrome-border`
   - Gradient borders created with inner and outer refraction glows:
     ```css
     box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4), 
                 0 8px 24px -4px rgba(0, 0, 0, 0.12),
                 inset 0 1px 0 rgba(255, 255, 255, 0.6);
     ```
2. **Multi-Layer Frosted Glass Slabs**:
   - Class: `.frosted-glass-card`, `.glass-panel`
   - Hardware-accelerated backdrop filter:
     ```css
     backdrop-filter: blur(16px) saturate(180%);
     -webkit-backdrop-filter: blur(16px) saturate(180%);
     background: rgba(255, 255, 255, 0.85);
     ```

---

### Typography System

Configured in `index.html` via Google Fonts:
- **Display Headings**: `Space Grotesk` (Weights 600, 700) — geometric, technical, assertive.
- **Body & Interfaces**: `Plus Jakarta Sans` (Weights 400, 500, 600) — clean, highly legible at small sizes.
- **Badges, Page Numbers & Code**: `JetBrains Mono` (Weights 500, 700) — tabular numbers, source references.

---

### CSS Architecture & Tokens

- [`src/styles/design-tokens.css`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/styles/design-tokens.css): Defines custom properties:
  - Colors: `--color-primary`, `--color-accent`, `--color-canvas`, `--color-surface`, `--color-ink`, `--color-mute`.
  - Spacing: `--space-1` through `--space-16`.
  - Radii: `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (20px), `--radius-pill` (9999px).
  - Shadows: Softbox drop shadows `--shadow-card`, `--shadow-float`.
- [`src/styles/chrome-glass.css`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/styles/chrome-glass.css): Utilities for frosted panels, glass buttons, chrome badges, and micro-animations.
- [`src/styles/index.css`](file:///c:/Users/Theo-Kyei/Desktop/thesignbridge/src/styles/index.css): Base document reset, focus visible rings, scrollbar styling, and root variables.

---

## 5. Codebase Directory Map

```text
thesignbridge/
├── docs/                                   # Central Documentation Hub
│   ├── COLLAB.md                           # ◄── YOU ARE HERE: Collaborator Guide & Architecture
│   ├── PROJECT_PHASE.md                    # Project phase tracker & progression ledger
│   ├── DESIGN.md                           # Foundational design token analysis
│   └── README.md                           # Comprehensive platform manual
├── README.md                               # Root landing page & portal to /docs
├── package.json                            # Scripts, dependencies, and project metadata
├── vite.config.ts                          # Vite 6 config, PWA Workbox precache & runtime caching
├── tsconfig.json                           # TypeScript strict compiler config
│
├── public/                                 # Public static files and partitioned dataset
│   ├── icons/                              # Brand favicons & PWA icons (favicon.png, etc.)
│   ├── favicon.png                         # Root web fallback icon
│   ├── robots.txt                          # Web crawler indexing instructions
│   └── data/dictionary/
│       ├── index.json                      # 1,514 compact search index records
│       ├── categories.json                 # 24 official GSL chapters with icon keys
│       ├── schools.json                    # 9 historical Ghanaian Deaf schools
│       ├── manifest.json                   # Version, checksums, and audit statistics
│       ├── vocabulary/                     # Partitioned JSON dictionaries
│       │   ├── a.json, b.json ... z.json   # Letter-specific vocabulary records
│       │   └── 0-9.json                    # Numeric vocabulary records
│       └── images/                         # 1,514 WebP sign illustration crops (300 DPI)
│
├── scripts/                                # Python automation and validation tools
│   ├── extract_dictionary.py               # PyMuPDF extractor (PDF -> JSON & WebP)
│   └── validate_dictionary.py              # 100% integrity validation auditor
│
└── src/                                    # Application source code
    ├── main.tsx                            # React 18 root mounting
    ├── App.tsx                             # Top-level routes & Layout shell
    │
    ├── components/
    │   ├── common/                         # Shared UI primitives
    │   │   ├── AppHeader.tsx               # Sticky frosted navbar with search modal trigger
    │   │   ├── AppFooter.tsx               # Institutional footer & directory links
    │   │   ├── LiquidChromeButton.tsx      # Tactile specular button with loading state
    │   │   ├── FrostedGlassCard.tsx        # Blurred backdrop card container
    │   │   ├── Badge.tsx                   # Category and status pill badges
    │   │   ├── LoadingSkeleton.tsx         # Content loading placehholders
    │   │   ├── PWAInstallPrompt.tsx        # One-tap Add-to-Home-Screen banner
    │   │   └── Toast.tsx                   # Action feedback toast notification
    │   │
    │   ├── dictionary/                     # Dictionary-specific UI components
    │   │   ├── SignCard.tsx                # Vocabulary grid card with quick bookmark
    │   │   ├── SearchBar.tsx               # MiniSearch real-time autocomplete bar
    │   │   ├── CategoryFilter.tsx          # 24-category filter pills
    │   │   └── AlphabetRibbon.tsx          # A–Z ribbon with live letter counts
    │   │
    │   └── translator/                     # Translation Studio components
    │       ├── SignToTextView.tsx          # Camera feed, MediaPipe AI, Transcript, TTS
    │       ├── TextToSignAvatar.tsx        # 3D Avatar canvas, voice/text input, sign player
    │       ├── SignComposer.tsx            # Manual GSL sentence sequencer
    │       ├── CameraView.tsx              # Diagnostic camera feed with landmark canvas
    │       └── TranslationPipelineInfo.tsx # Explanatory pipeline modal
    │
    ├── context/                            # Global React state
    │   ├── DictionaryContext.tsx           # Search index, categories, and schools provider
    │   └── FavoritesContext.tsx            # Bookmarks, notes, and LocalStorage sync
    │
    ├── pages/                              # Main application views
    │   ├── HomePage.tsx                    # Landing hero, search, ribbon, and features
    │   ├── DictionaryPage.tsx              # Complete catalog browser with filters
    │   ├── VocabularyDetailPage.tsx        # In-depth sign analysis & instructions
    │   ├── CategoriesPage.tsx              # 24 thematic category cards
    │   ├── AlphabetPage.tsx                # Fingerspelling A–Z plates
    │   ├── NumeralsPage.tsx                # Numerals 1–1,000 plates
    │   ├── SchoolsPage.tsx                 # Directory of 9 Ghanaian Deaf schools
    │   ├── FavoritesPage.tsx               # Saved signs & study notes manager
    │   ├── TranslatorPage.tsx              # 3-tab studio (/translate)
    │   └── AboutPage.tsx                   # Historical context & institutional citations
    │
    ├── services/                           # Pure business logic & API services
    │   ├── avatarSigningService.ts         # Three.js rig, pose interpolator, TTS
    │   ├── gestureRecognitionService.ts    # MediaPipe Holistic & feature matcher
    │   ├── searchService.ts                # MiniSearch full-text indexing
    │   ├── dictionaryService.ts            # Partitioned JSON loader
    │   └── storageService.ts               # LocalStorage serializer & export/import
    │
    ├── styles/                             # Global styling
    │   ├── design-tokens.css               # Core CSS variables (colors, radii, shadows)
    │   ├── chrome-glass.css                # Glassmorphism & liquid chrome utility classes
    │   └── index.css                       # Reset, fonts, base styles
    │
    └── types/                              # TypeScript interfaces & types
        └── dictionary.ts                   # GSLSign, SearchItem, Category, School interfaces
```

---

## 6. Developer Workflows & Commands

### Running Locally
```bash
# Install dependencies
npm install

# Start development server on http://localhost:5173 (Vite default)
npm run dev

# Watch for changes and rebuild (using nodemon)
npm run dev:watch
```

### Production Build & PWA Testing
```bash
# Typecheck and build production bundle + service worker
npm run build

# Preview production build locally
npm run preview
```

### Type Checking & Linting
```bash
# Run TypeScript compilation check without emitting files
npm run typecheck

# Run ESLint across TypeScript source files
npm run lint
```

### Dataset Re-extraction & Validation
*(Requires Python 3.10+ and the source PDF in root)*
```bash
# Extract vocabulary from PDF to JSON and WebP
npm run dictionary:extract

# Verify 1,514 signs, images, and schema integrity
npm run dictionary:validate

# Run both extraction and validation sequentially
npm run dictionary:build
```

---

## 7. Roadmap & Opportunities for Collaborators

If you are joining as a collaborator, here are high-impact areas where contributions are welcomed:

### 1. Computer Vision & Machine Learning
- **TFLite / ONNX Model Training**: Replace the nearest-neighbor statistical feature matcher with a lightweight transformer or spatial-temporal graph convolutional network (ST-GCN) trained on GSL video datasets.
- **Continuous Gesture Segmentation**: Implement continuous dynamic time warping (DTW) to better isolate word boundaries during fast signing.

### 2. 3D Graphics & Avatar Realism
- **Skinned GLTF/GLB Avatar**: Replace the procedural primitive rig in `avatarSigningService.ts` with a fully rigged 3D character mesh (e.g. created in Blender / Ready Player Me).
- **Hand Armature Detail**: Add individual finger bone rotations (metacarpals and phalanges) for precise manual fingerspelling and subtle handshape distinctions.
- **Facial Non-Manual Markers (NMM)**: Sign language grammar heavily relies on eyebrow movement, mouth morphemes, and head tilts. Adding morph target blendshapes to the avatar will dramatically improve linguistic authenticity.

### 3. Native Mobile Packaging
- **Capacitor Integration**: Package the existing Vite PWA build with `@capacitor/core` and `@capacitor/cli` for zero-overhead deployment to the **Google Play Store** and **Apple App Store**.
- **Haptic Feedback**: Trigger subtle haptic clicks on mobile devices when signs are successfully recognized or sequenced.

### 4. Linguistic & Cultural Expansions
- **Regional Dialect Flags**: Annotate signs that differ between the Greater Accra, Ashanti, Northern, or Volta regional Deaf communities.
- **Akan / Twi & Ewe Glossing**: Expand the dictionary metadata to include Ghanaian local language translations alongside English for bilingual signers.

---

## 8. Maintenance Protocol: How to Keep This File Updated

Whenever you make changes to the repository:

1. **New Page or Route Added?**  
   Add it to [Page Catalog](#page-catalog) and update the [Codebase Directory Map](#5-codebase-directory-map).
2. **New Service or Component Created?**  
   Add an entry under [Component Registry](#component-registry) or [Service Layer Registry](#service-layer-registry).
3. **Design System / Tokens Modified?**  
   Update the [CSS Architecture & Tokens](#css-architecture--tokens) section.
4. **Build Scripts or Dependencies Changed?**  
   Update the [Tech Stack](#3-the-systems-in-place--technical-architecture) and [Developer Workflows](#6-developer-workflows--commands).
5. **Milestone Completed?**  
   Move items from [Roadmap](#7-roadmap--opportunities-for-collaborators) to [What We Have Built](#2-what-we-have-built-current-state--inventory).
6. **Progress Logged?**  
   Record your changes in [`docs/PROJECT_PHASE.md`](PROJECT_PHASE.md) under the Chronological Progression Ledger.

Thank you for contributing to **SignBridgeGhana** and making Ghanaian Sign Language accessible to everyone! 🇬🇭
