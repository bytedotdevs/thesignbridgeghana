/**
 * generate-icons.mjs
 * Generates all PWA icons, Apple Touch Icon, favicon, and OG social share image
 * from the main logo at public/icons/favicon.png
 *
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_LOGO = path.join(ROOT, 'public', 'icons', 'favicon.png');
const ICONS_DIR = path.join(ROOT, 'public', 'icons');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');

// Ensure directories exist
fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ── Overlay: dark navy circular background ──────────────────────────────────
async function makeRoundedIconBuffer(size) {
  // Create a dark-navy rounded square background, then composite the logo on top
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" ry="${Math.round(size * 0.18)}" fill="#0f172a"/>
    </svg>`
  );

  const padding = Math.round(size * 0.1);
  const logoSize = size - padding * 2;

  const logo = await sharp(SRC_LOGO)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  return sharp(bg)
    .composite([{ input: logo, top: padding, left: padding }])
    .png()
    .toBuffer();
}

// ── Plain square (maskable safe-zone) ──────────────────────────────────────
async function makeMaskableIconBuffer(size) {
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#0f172a"/>
    </svg>`
  );

  // Maskable icons: logo should stay within the inner 80% safe zone
  const safeZone = Math.round(size * 0.8);
  const padding = Math.round((size - safeZone) / 2);

  const logo = await sharp(SRC_LOGO)
    .resize(safeZone, safeZone, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  return sharp(bg)
    .composite([{ input: logo, top: padding, left: padding }])
    .png()
    .toBuffer();
}

// ── Social share OG image (1200×630) ───────────────────────────────────────
async function makeOgImage() {
  const W = 1200;
  const H = 630;

  // Background gradient via SVG
  const bg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e3a5f"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#CF0921"/>
          <stop offset="33%" stop-color="#CF0921"/>
          <stop offset="33%" stop-color="#FCD116"/>
          <stop offset="66%" stop-color="#FCD116"/>
          <stop offset="66%" stop-color="#006B3F"/>
          <stop offset="100%" stop-color="#006B3F"/>
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <!-- Subtle grid lines -->
      <line x1="0" y1="${H * 0.25}" x2="${W}" y2="${H * 0.25}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <line x1="0" y1="${H * 0.5}" x2="${W}" y2="${H * 0.5}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <line x1="0" y1="${H * 0.75}" x2="${W}" y2="${H * 0.75}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <line x1="${W * 0.33}" y1="0" x2="${W * 0.33}" y2="${H}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <line x1="${W * 0.66}" y1="0" x2="${W * 0.66}" y2="${H}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <!-- Glassmorphism panel for text -->
      <rect x="${W * 0.42}" y="${H * 0.1}" width="${W * 0.52}" height="${H * 0.8}" rx="20" ry="20"
            fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <!-- Main headline -->
      <text x="${W * 0.46}" y="${H * 0.37}" font-family="system-ui, sans-serif" font-size="48"
            font-weight="700" fill="white" text-anchor="start">Bridging Deaf &amp;</text>
      <text x="${W * 0.46}" y="${H * 0.5}" font-family="system-ui, sans-serif" font-size="48"
            font-weight="700" fill="white" text-anchor="start">Hearing Communities</text>
      <!-- Feature line 1 -->
      <text x="${W * 0.46}" y="${H * 0.64}" font-family="system-ui, sans-serif" font-size="24"
            fill="#67e8f9" text-anchor="start">Real-time GSL Translation</text>
      <!-- Feature line 2 -->
      <text x="${W * 0.46}" y="${H * 0.74}" font-family="system-ui, sans-serif" font-size="24"
            fill="#67e8f9" text-anchor="start">1,500+ Signs · 3D Avatar Signing</text>
      <!-- Domain label -->
      <text x="${W * 0.46}" y="${H * 0.88}" font-family="system-ui, sans-serif" font-size="18"
            fill="rgba(255,255,255,0.5)" text-anchor="start">signbridgeghana.org</text>
      <!-- Ghana flag accent bar at bottom -->
      <rect x="0" y="${H - 10}" width="${W * 0.333}" height="10" fill="#CF0921"/>
      <rect x="${W * 0.333}" y="${H - 10}" width="${W * 0.333}" height="10" fill="#FCD116"/>
      <rect x="${W * 0.666}" y="${H - 10}" width="${W * 0.334}" height="10" fill="#006B3F"/>
    </svg>`
  );

  // Resize logo for left panel
  const logoSize = Math.round(H * 0.65);
  const logoPad = Math.round((H - logoSize) / 2);
  const logoLeft = Math.round(W * 0.01);

  const logo = await sharp(SRC_LOGO)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  return sharp(bg)
    .composite([{ input: logo, top: logoPad, left: logoLeft }])
    .png()
    .toBuffer();
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎨 Generating SignBridgeGhana icons and assets...\n');

  // 1. PWA icon 192×192 (maskable)
  console.log('  → pwa-icon-192.png (maskable)');
  const buf192 = await makeMaskableIconBuffer(192);
  fs.writeFileSync(path.join(ICONS_DIR, 'pwa-icon-192.png'), buf192);

  // 2. PWA icon 512×512 (maskable)
  console.log('  → pwa-icon-512.png (maskable)');
  const buf512 = await makeMaskableIconBuffer(512);
  fs.writeFileSync(path.join(ICONS_DIR, 'pwa-icon-512.png'), buf512);

  // 3. Apple Touch Icon 180×180 (rounded, no mask needed)
  console.log('  → apple-touch-icon.png (180×180)');
  const bufApple = await makeRoundedIconBuffer(180);
  fs.writeFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), bufApple);

  // 4. Favicon 32×32 for browsers
  console.log('  → favicon-32.png');
  const buf32 = await sharp(SRC_LOGO).resize(32, 32, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } }).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon-32.png'), buf32);

  // 5. Favicon 16×16
  console.log('  → favicon-16.png');
  const buf16 = await sharp(SRC_LOGO).resize(16, 16, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } }).png().toBuffer();
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon-16.png'), buf16);

  // 6. Shortcut icons 96×96
  console.log('  → shortcut-icon-96.png');
  const buf96 = await makeMaskableIconBuffer(96);
  fs.writeFileSync(path.join(ICONS_DIR, 'shortcut-icon-96.png'), buf96);

  // 7. OG social share image
  console.log('  → og-social-share.png (1200×630)');
  const bufOg = await makeOgImage();
  fs.writeFileSync(path.join(IMAGES_DIR, 'og-social-share.png'), bufOg);

  console.log('\n✅ All assets generated successfully!');
  console.log(`   Icons → ${ICONS_DIR}`);
  console.log(`   OG    → ${IMAGES_DIR}/og-social-share.png`);
}

main().catch((err) => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
