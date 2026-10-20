import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// Ensure target directories exist
fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Source image paths from user upload
const USER_UPLOAD_DIR = 'C:/Users/Theo-Kyei/.gemini/antigravity-ide/brain/a3a60717-613d-4971-86d3-96cee58f5e3c/.user_uploaded';
const IMG1_MAIN_LOGO = path.join(USER_UPLOAD_DIR, 'media_1792506864838.png');
const IMG2_APP_ICON = path.join(USER_UPLOAD_DIR, 'media_1792506871597.png');
const IMG3_LOGO_FAVICON = path.join(USER_UPLOAD_DIR, 'media_1792506895362.jpg');

/**
 * Converts pure/near white pixels to transparent with anti-aliasing feather
 */
function makeWhiteTransparent(rawBuffer, width, height, channels = 3) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const destIdx = i * 4;
    const r = rawBuffer[srcIdx];
    const g = rawBuffer[srcIdx + 1];
    const b = rawBuffer[srcIdx + 2];

    rgba[destIdx] = r;
    rgba[destIdx + 1] = g;
    rgba[destIdx + 2] = b;

    const brightness = (r + g + b) / 3;
    if (brightness >= 248) {
      rgba[destIdx + 3] = 0;
    } else if (brightness > 230) {
      // Smooth feathering
      const alphaFactor = (248 - brightness) / 18;
      rgba[destIdx + 3] = Math.round(alphaFactor * 255);
    } else {
      rgba[destIdx + 3] = 255;
    }
  }
  return rgba;
}

async function runRebrand() {
  console.log('🎨 Starting Full Brand Asset Redesign Pipeline...\n');

  // ─── 1. Process Image 1: Main Logo (Cupped Hands & Black Star) ───────────────
  console.log('1️⃣ Extracting Main Logo (Image 1)...');
  // Crop around content: minX: 182, maxX: 603, minY: 187, maxY: 585
  const img1Raw = await sharp(IMG1_MAIN_LOGO)
    .extract({ left: 175, top: 180, width: 435, height: 410 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const img1Rgba = makeWhiteTransparent(img1Raw.data, img1Raw.info.width, img1Raw.info.height, img1Raw.info.channels);
  
  // Save high-resolution transparent main logo
  const mainLogoBuf = await sharp(img1Rgba, {
    raw: { width: img1Raw.info.width, height: img1Raw.info.height, channels: 4 },
  })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(IMAGES_DIR, 'main-logo.png'), mainLogoBuf);
  console.log('  ✓ Saved public/images/main-logo.png');

  // ─── 2. Process Image 2: App Icon (Circular Forest Green & Reaching Hands) ───
  console.log('2️⃣ Processing App Icon (Image 2)...');
  // Resize to 512x512 PWA app icon
  const appIcon512Buf = await sharp(IMG2_APP_ICON)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(ICONS_DIR, 'app-icon.png'), appIcon512Buf);
  fs.writeFileSync(path.join(ICONS_DIR, 'pwa-icon-512.png'), appIcon512Buf);
  console.log('  ✓ Saved public/icons/app-icon.png (512x512)');
  console.log('  ✓ Saved public/icons/pwa-icon-512.png (512x512)');

  // 192x192 PWA mobile icon
  const appIcon192Buf = await sharp(IMG2_APP_ICON)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'pwa-icon-192.png'), appIcon192Buf);
  console.log('  ✓ Saved public/icons/pwa-icon-192.png (192x192)');

  // 180x180 Apple Touch Icon (with clean iOS squircle canvas)
  const appleTouchBuf = await sharp(IMG2_APP_ICON)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), appleTouchBuf);
  console.log('  ✓ Saved public/icons/apple-touch-icon.png (180x180)');

  // ─── 3. Process Image 3: Brand Symbol ("S" Red/Green Hands + Star) ───────────
  console.log('3️⃣ Extracting Brand Emblem & Wordmark (Image 3)...');
  // Extract "S" Symbol: left: 390, top: 155, width: 245, height: 260
  const symbolRaw = await sharp(IMG3_LOGO_FAVICON)
    .extract({ left: 390, top: 155, width: 245, height: 260 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const symbolRgba = makeWhiteTransparent(symbolRaw.data, symbolRaw.info.width, symbolRaw.info.height, symbolRaw.info.channels);
  const brandSymbolBuf = await sharp(symbolRgba, {
    raw: { width: symbolRaw.info.width, height: symbolRaw.info.height, channels: 4 },
  })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(IMAGES_DIR, 'brand-symbol-s.png'), brandSymbolBuf);
  console.log('  ✓ Saved public/images/brand-symbol-s.png (Transparent Symbol)');

  // Extract Full Brand Logo (Emblem + SignBridgeGhana + Ghanaian Sign Language)
  // left: 110, top: 150, width: 805, height: 450
  const fullLogoRaw = await sharp(IMG3_LOGO_FAVICON)
    .extract({ left: 110, top: 150, width: 805, height: 450 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const fullLogoRgba = makeWhiteTransparent(fullLogoRaw.data, fullLogoRaw.info.width, fullLogoRaw.info.height, fullLogoRaw.info.channels);
  const brandFullLogoBuf = await sharp(fullLogoRgba, {
    raw: { width: fullLogoRaw.info.width, height: fullLogoRaw.info.height, channels: 4 },
  })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(IMAGES_DIR, 'brand-logo-full.png'), brandFullLogoBuf);
  console.log('  ✓ Saved public/images/brand-logo-full.png');

  // ─── 4. Generate Master Favicon Suite from Image 3 Favicon Squircle ──────────
  console.log('4️⃣ Building Favicon Suite from Image 3 Squircle...');
  // The favicon in Image 3 is a crisp white squircle with subtle drop shadow containing the "S" emblem
  // Let's create an ultra-crisp 512x512 master favicon:
  // Render a pure white squircle with subtle soft border, and composite the emblem centered
  const symbolForFavicon = await sharp(brandSymbolBuf)
    .resize(340, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const squircleSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sqGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#F8FAFC"/>
      </linearGradient>
      <filter id="sqShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(15,23,42,0.08)"/>
      </filter>
    </defs>
    <!-- Modern iOS/PWA Squircle rx=112 (approx 22% of 512) -->
    <rect width="500" height="500" x="6" y="6" rx="112" fill="url(#sqGrad)" stroke="rgba(226,232,240,0.9)" stroke-width="3" filter="url(#sqShadow)"/>
  </svg>
  `;

  const squircleBaseBuf = await sharp(Buffer.from(squircleSvg)).png().toBuffer();

  const masterFaviconBuf = await sharp(squircleBaseBuf)
    .composite([
      {
        input: symbolForFavicon,
        gravity: 'centre',
      },
    ])
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();

  // Save 512x512 master favicons
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.png'), masterFaviconBuf);
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon.png'), masterFaviconBuf);
  console.log('  ✓ Saved public/favicon.png (512x512)');
  console.log('  ✓ Saved public/icons/favicon.png (512x512)');

  // 96x96 Shortcut Icon
  const favicon96Buf = await sharp(masterFaviconBuf).resize(96, 96).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'shortcut-icon-96.png'), favicon96Buf);
  console.log('  ✓ Saved public/icons/shortcut-icon-96.png (96x96)');

  // 32x32 Favicon
  const favicon32Buf = await sharp(masterFaviconBuf).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon-32.png'), favicon32Buf);
  console.log('  ✓ Saved public/icons/favicon-32.png (32x32)');

  // 16x16 Favicon
  const favicon16Buf = await sharp(masterFaviconBuf).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon-16.png'), favicon16Buf);
  console.log('  ✓ Saved public/icons/favicon-16.png (16x16)');

  // ─── 5. Generate 1200x630 Open Graph & Social Share Card ──────────────────────
  console.log('5️⃣ Generating 1200x630 Open Graph Social Share Card...');
  
  // Prepare composite components for OG card
  const ogFaviconBadge = await sharp(masterFaviconBuf).resize(280, 280).toBuffer();
  const ogAppIconBadge = await sharp(appIcon512Buf).resize(140, 140).toBuffer();
  const ogMainLogoBadge = await sharp(mainLogoBuf).resize(180, 170, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();

  const ogCardSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ogBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0A0F1D"/>
        <stop offset="50%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>

      <!-- Glow filter -->
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="60" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#ogBg)"/>

    <!-- Ambient Lights in Ghana National Colors -->
    <circle cx="220" cy="300" r="220" fill="#E52B2B" opacity="0.14" filter="url(#glow)"/>
    <circle cx="980" cy="200" r="200" fill="#009739" opacity="0.12" filter="url(#glow)"/>
    <circle cx="600" cy="500" r="180" fill="#F59E0B" opacity="0.08" filter="url(#glow)"/>

    <!-- Subtle Tech Grid -->
    <g opacity="0.04" stroke="#FFFFFF" stroke-width="1">
      <line x1="0" y1="105" x2="1200" y2="105"/>
      <line x1="0" y1="210" x2="1200" y2="210"/>
      <line x1="0" y1="315" x2="1200" y2="315"/>
      <line x1="0" y1="420" x2="1200" y2="420"/>
      <line x1="0" y1="525" x2="1200" y2="525"/>
      <line x1="200" y1="0" x2="200" y2="630"/>
      <line x1="400" y1="0" x2="400" y2="630"/>
      <line x1="600" y1="0" x2="600" y2="630"/>
      <line x1="800" y1="0" x2="800" y2="630"/>
      <line x1="1000" y1="0" x2="1000" y2="630"/>
    </g>

    <!-- Left Emblem Area Frame -->
    <rect x="70" y="115" width="360" height="400" rx="44" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="2"/>

    <!-- Right Brand Typography & Information -->
    <g transform="translate(480, 130)">
      
      <!-- Eyebrow Pill -->
      <rect x="0" y="0" width="260" height="34" rx="17" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1"/>
      <circle cx="20" cy="17" r="5" fill="#E52B2B"/>
      <circle cx="34" cy="17" r="5" fill="#F59E0B"/>
      <circle cx="48" cy="17" r="5" fill="#009739"/>
      <text x="64" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#CBD5E1" letter-spacing="1.5px">
        GHANAIAN SIGN LANGUAGE
      </text>

      <!-- Main Wordmark -->
      <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Space Grotesk', system-ui, sans-serif" font-size="64" font-weight="800" letter-spacing="-1.5px" fill="#FFFFFF">
        SignBridge<tspan fill="#E52B2B">G</tspan><tspan fill="#F59E0B">h</tspan><tspan fill="#009739">ana</tspan>
      </text>

      <!-- Subtitle -->
      <text x="2" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#94A3B8" letter-spacing="3px">
        GHANAIAN SIGN LANGUAGE PLATFORM
      </text>

      <!-- Mission Statement -->
      <text x="2" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700" fill="#F8FAFC" letter-spacing="-0.5px">
        Bridging Deaf &amp; Hearing Communities
      </text>

      <!-- Feature Bullet Points -->
      <text x="2" y="220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#94A3B8">
        1,514+ GSL Dictionary Signs  ·  Real-Time Camera AI  ·  2D/3D Avatar Signing
      </text>

      <!-- Value Badges -->
      <g transform="translate(0, 260)">
        <!-- GSL 3rd Edition Badge -->
        <rect x="0" y="0" width="165" height="40" rx="12" fill="rgba(37,99,235,0.2)" stroke="rgba(56,189,248,0.5)" stroke-width="1.5"/>
        <text x="82" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#38BDF8" text-anchor="middle">
          GSL 3RD EDITION
        </text>

        <!-- Certified GNAD & GES Badge -->
        <rect x="180" y="0" width="180" height="40" rx="12" fill="rgba(0,151,57,0.2)" stroke="rgba(0,151,57,0.5)" stroke-width="1.5"/>
        <text x="270" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#34D399" text-anchor="middle">
          GNAD &amp; GES SOURCED
        </text>

        <!-- Web URL -->
        <rect x="375" y="0" width="220" height="40" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
        <text x="485" y="25" font-family="monospace" font-size="13" font-weight="700" fill="#F8FAFC" text-anchor="middle">
          signbridgeghana.org
        </text>
      </g>
    </g>

    <!-- Ghana National Tricolor Signature Bottom Ribbon -->
    <g transform="translate(0, 620)">
      <rect x="0" y="0" width="400" height="10" fill="#E52B2B"/>
      <rect x="400" y="0" width="400" height="10" fill="#F59E0B"/>
      <rect x="800" y="0" width="400" height="10" fill="#009739"/>
    </g>
  </svg>
  `;

  const ogCardBaseBuf = await sharp(Buffer.from(ogCardSvg)).png().toBuffer();

  // Composite the brand assets onto the card
  const finalOgBuf = await sharp(ogCardBaseBuf)
    .composite([
      // Main Favicon Badge centered in left panel
      {
        input: ogFaviconBadge,
        left: 110,
        top: 175,
      },
    ])
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(IMAGES_DIR, 'og-social-share.png'), finalOgBuf);
  console.log('  ✓ Saved public/images/og-social-share.png (1200x630 Social Card)');

  console.log('\n🎉 Brand asset redesign generation complete!');
}

runRebrand().catch((err) => {
  console.error('Error executing rebrand pipeline:', err);
  process.exit(1);
});
