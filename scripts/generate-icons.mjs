import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'public', 'icons');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Ensure directories exist
fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Master Vector Generator for the Hand-Bridge Icon
function getIconSvg({ size = 512, isSquare = true, isMaskable = true, isApple = false }) {
  const rx = isApple ? Math.round(size * 0.22) : Math.round(size * 0.226);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Dark Obsidian Navy -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="55%" stop-color="#0B1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Hand Pure Ceramic Light -->
    <linearGradient id="handGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>

    <!-- Bridge Roadway Tech Gradient -->
    <linearGradient id="deckGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>

    <!-- Ghana Gold Star -->
    <linearGradient id="starGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>

    <!-- Soft Glow Filter -->
    <filter id="ambientGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="28" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  ${isSquare ? `
  <!-- Squircle Canvas for App Icon & PWA -->
  <rect width="512" height="512" rx="${rx}" fill="url(#bgGrad)"/>
  <rect width="508" height="508" x="2" y="2" rx="${rx - 2}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  ` : `
  <!-- Full Bleed Square for Maskable Icons -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  `}

  <!-- Ambient Light Reflection -->
  <circle cx="256" cy="270" r="150" fill="#2563EB" opacity="0.12" filter="url(#ambientGlow)"/>

  <!-- MASTER GLYPH: THE SIGNBRIDGE HAND-BRIDGE -->
  <g transform="translate(242, 252) scale(0.96)">
    
    <!-- 1. The Hand Silhouette with Bridge Arch Negative Space Cutout -->
    <path d="
      M -50, 175
      L -50, 80
      C -64, 65, -92, 35, -106, 0
      C -116, -35, -102, -55, -82, -42
      C -62, -30, -56, -5, -50, 20
      L -50, -170
      C -50, -182, -38, -192, -26, -192
      C -14, -192, -2, -182, -2, -170
      L -2, -40
      L 2, -40
      L 2, -200
      C 2, -212, 14, -222, 26, -222
      C 38, -222, 50, -212, 50, -200
      L 50, -40
      L 54, -40
      L 54, -175
      C 54, -187, 66, -197, 78, -197
      C 90, -197, 102, -187, 102, -175
      L 102, -40
      L 106, -40
      L 106, -135
      C 106, -147, 118, -157, 130, -157
      C 142, -157, 154, -147, 154, -135
      L 154, 70
      C 154, 105, 150, 145, 146, 175
      L 102, 175
      C 98, 95, 75, 55, 48, 55
      C 21, 55, -2, 95, -6, 175
      Z
    " fill="url(#handGrad)"/>

    <!-- Subtle finger separation grooves -->
    <line x1="0" y1="-30" x2="0" y2="35" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <line x1="52" y1="-30" x2="52" y2="35" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <line x1="104" y1="-30" x2="104" y2="35" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>

    <!-- 2. The Bridge Roadway / Deck -->
    <rect x="-70" y="112" width="236" height="12" rx="6" fill="url(#deckGrad)"/>

    <!-- 3. The Ghana Black Star inside the Archway -->
    <g transform="translate(48, 134)">
      <polygon points="
        0, -20
        5.8, -5.8
        20, -5.8
        8.5, 3
        13, 17
        0, 8.5
        -13, 17
        -8.5, 3
        -20, -5.8
        -5.8, -5.8
      " fill="url(#starGrad)"/>
    </g>

    <!-- 4. Ghana National Tricolor Micro-Indicator Bar -->
    <g transform="translate(18, 192)">
      <rect x="0" y="0" width="18" height="5" rx="2.5" fill="#EF4444"/>
      <rect x="23" y="0" width="18" height="5" rx="2.5" fill="#F59E0B"/>
      <rect x="46" y="0" width="18" height="5" rx="2.5" fill="#10B981"/>
    </g>

  </g>
</svg>
  `;
}

// Master Vector Generator for the 1200x630 OG Social Share Card
function getOgImageSvg() {
  const W = 1200;
  const H = 630;

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Deep Obsidian Slate Gradient -->
    <linearGradient id="ogBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#0B1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Electric Cyan-Blue Tech Gradient -->
    <linearGradient id="ogBlue" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>

    <!-- Ghana Gold Star Gradient -->
    <linearGradient id="ogGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>

    <!-- Subtle Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Deep Obsidian Canvas -->
  <rect width="${W}" height="${H}" fill="url(#ogBg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <!-- Ambient Light Halos -->
  <circle cx="280" cy="315" r="260" fill="#2563EB" opacity="0.14" filter="blur(60px)"/>
  <circle cx="950" cy="200" r="200" fill="#38BDF8" opacity="0.08" filter="blur(50px)"/>

  <!-- ── LEFT: MASTER ICON EMBLEM ────────────────────────────────────────── -->
  <g transform="translate(80, 115)">
    <!-- App Badge Frame -->
    <rect width="400" height="400" rx="92" fill="#0B1120" stroke="rgba(255,255,255,0.12)" stroke-width="2.5"/>
    <rect width="396" height="396" x="2" y="2" rx="90" fill="none" stroke="rgba(56,189,248,0.15)" stroke-width="1"/>

    <!-- Scaled Hand-Bridge Glyph -->
    <g transform="translate(188, 196) scale(0.76)">
      <!-- Hand Silhouette with Arch Cutout -->
      <path d="
        M -50, 175
        L -50, 80
        C -64, 65, -92, 35, -106, 0
        C -116, -35, -102, -55, -82, -42
        C -62, -30, -56, -5, -50, 20
        L -50, -170
        C -50, -182, -38, -192, -26, -192
        C -14, -192, -2, -182, -2, -170
        L -2, -40
        L 2, -40
        L 2, -200
        C 2, -212, 14, -222, 26, -222
        C 38, -222, 50, -212, 50, -200
        L 50, -40
        L 54, -40
        L 54, -175
        C 54, -187, 66, -197, 78, -197
        C 90, -197, 102, -187, 102, -175
        L 102, -40
        L 106, -40
        L 106, -135
        C 106, -147, 118, -157, 130, -157
        C 142, -157, 154, -147, 154, -135
        L 154, 70
        C 154, 105, 150, 145, 146, 175
        L 102, 175
        C 98, 95, 75, 55, 48, 55
        C 21, 55, -2, 95, -6, 175
        Z
      " fill="#FFFFFF"/>

      <!-- Finger Separation Grooves -->
      <line x1="0" y1="-30" x2="0" y2="35" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
      <line x1="52" y1="-30" x2="52" y2="35" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
      <line x1="104" y1="-30" x2="104" y2="35" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>

      <!-- Bridge Roadway / Deck -->
      <rect x="-70" y="112" width="236" height="12" rx="6" fill="url(#ogBlue)"/>

      <!-- Ghana Star Keystone -->
      <g transform="translate(48, 134)">
        <polygon points="
          0, -20
          5.8, -5.8
          20, -5.8
          8.5, 3
          13, 17
          0, 8.5
          -13, 17
          -8.5, 3
          -20, -5.8
          -5.8, -5.8
        " fill="url(#ogGold)"/>
      </g>

      <!-- Ghana Tricolor Accent -->
      <g transform="translate(18, 192)">
        <rect x="0" y="0" width="18" height="5" rx="2.5" fill="#EF4444"/>
        <rect x="23" y="0" width="18" height="5" rx="2.5" fill="#F59E0B"/>
        <rect x="46" y="0" width="18" height="5" rx="2.5" fill="#10B981"/>
      </g>
    </g>
  </g>

  <!-- ── RIGHT: EDITORIAL TYPOGRAPHY & BRAND VALUE ──────────────────────── -->
  <g transform="translate(520, 160)">
    
    <!-- Culture & Origin Eyebrow Pill -->
    <g transform="translate(0, 0)">
      <rect width="216" height="32" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <!-- Ghana Flag Dots -->
      <circle cx="18" cy="16" r="4" fill="#EF4444"/>
      <circle cx="28" cy="16" r="4" fill="#F59E0B"/>
      <circle cx="38" cy="16" r="4" fill="#10B981"/>
      <text x="50" y="21" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#94A3B8" letter-spacing="1.5px">
        GHANA SIGN LANGUAGE
      </text>
    </g>

    <!-- Master Wordmark -->
    <text x="0" y="85" font-family="'Space Grotesk', -apple-system, system-ui, sans-serif" font-size="64" font-weight="800" letter-spacing="-2px" fill="#FFFFFF">
      Sign<tspan fill="url(#ogBlue)">Bridge</tspan><tspan font-size="28" font-weight="700" fill="#38BDF8" dx="10" dy="-16">GHANA</tspan>
    </text>

    <!-- Mission Statement Headline -->
    <text x="2" y="136" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="26" font-weight="700" fill="#F1F5F9" letter-spacing="-0.5px">
      Bridging Deaf &amp; Hearing Communities
    </text>

    <!-- Feature Pillars -->
    <text x="2" y="174" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="17" font-weight="500" fill="#94A3B8">
      Real-Time GSL AI Translation  ·  1,500+ Signs  ·  3D Avatar Signing
    </text>

    <!-- Metadata Badges -->
    <g transform="translate(2, 218)">
      <!-- GSL 3rd Edition -->
      <rect x="0" y="0" width="145" height="36" rx="18" fill="rgba(37,99,235,0.18)" stroke="rgba(56,189,248,0.4)" stroke-width="1"/>
      <text x="72" y="23" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">
        GSL 3RD EDITION
      </text>

      <!-- GNAD & GES Certified -->
      <rect x="157" y="0" width="160" height="36" rx="18" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" stroke-width="1"/>
      <text x="237" y="23" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="#34D399" text-anchor="middle">
        GNAD &amp; GES SOURCED
      </text>

      <!-- Web Domain -->
      <rect x="330" y="0" width="175" height="36" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <text x="417" y="23" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#E2E8F0" text-anchor="middle">
        signbridgeghana.org
      </text>
    </g>

  </g>

  <!-- ── BOTTOM: GHANA NATIONAL TRICOLOR SIGNATURE STRIPE ───────────────── -->
  <g transform="translate(0, ${H - 8})">
    <rect x="0" y="0" width="${W * 0.333}" height="8" fill="#EF4444"/>
    <rect x="${W * 0.333}" y="0" width="${W * 0.334}" height="8" fill="#F59E0B"/>
    <rect x="${W * 0.667}" y="0" width="${W * 0.333}" height="8" fill="#10B981"/>
  </g>

</svg>
  `;
}

async function buildAllAssets() {
  console.log('🚀 Generating complete brand identity asset suite...\n');

  // 1. PWA Icon 512x512
  console.log('  → public/icons/pwa-icon-512.png (512x512, maskable)');
  const svg512 = getIconSvg({ size: 512, isSquare: true, isMaskable: true });
  const buf512 = await sharp(Buffer.from(svg512)).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'pwa-icon-512.png'), buf512);

  // 2. PWA Icon 192x192
  console.log('  → public/icons/pwa-icon-192.png (192x192, maskable)');
  const buf192 = await sharp(Buffer.from(svg512)).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'pwa-icon-192.png'), buf192);

  // 3. Apple Touch Icon 180x180 (iOS specific)
  console.log('  → public/icons/apple-touch-icon.png (180x180)');
  const svgApple = getIconSvg({ size: 180, isSquare: true, isMaskable: true, isApple: true });
  const bufApple = await sharp(Buffer.from(svgApple)).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), bufApple);

  // 4. Shortcut Icon 96x96
  console.log('  → public/icons/shortcut-icon-96.png (96x96)');
  const buf96 = await sharp(Buffer.from(svg512)).resize(96, 96).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'shortcut-icon-96.png'), buf96);

  // 5. Favicon 32x32
  console.log('  → public/icons/favicon-32.png (32x32)');
  const buf32 = await sharp(Buffer.from(svg512)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon-32.png'), buf32);

  // 6. Favicon 16x16
  console.log('  → public/icons/favicon-16.png (16x16)');
  const buf16 = await sharp(Buffer.from(svg512)).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon-16.png'), buf16);

  // 7. Master Brand Favicon in icons directory (512x512)
  console.log('  → public/icons/favicon.png (512x512)');
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon.png'), buf512);

  // 8. Root fallback Favicon (512x512)
  console.log('  → public/favicon.png (512x512)');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.png'), buf512);

  // 9. OG Social Share Image (1200x630)
  console.log('  → public/images/og-social-share.png (1200x630)');
  const svgOg = getOgImageSvg();
  const bufOg = await sharp(Buffer.from(svgOg)).png().toBuffer();
  fs.writeFileSync(path.join(IMAGES_DIR, 'og-social-share.png'), bufOg);

  console.log('\n✨ All brand assets successfully generated!');
}

buildAllAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
