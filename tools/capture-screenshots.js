#!/usr/bin/env node
/**
 * Captures screenshots of the FireFly configurator UI for use in the docs.
 *
 * Usage:
 *   cd tools && npm install && node capture-screenshots.js --db /path/to/backup.json
 *
 * The backup file must be a valid Dexie export from the configurator
 * (use Import / Export → Download Backup to create one).
 *
 * Screenshots are saved directly into controller/software/controller/configuration/.
 *
 * For interactive screenshots (modals, specific UI states), see the INTERACTIVE
 * section at the bottom — those require selector adjustments once you know the
 * Vue component structure.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://configurator.fireflylx.com';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'controller', 'software', 'controller', 'configuration');
const VIEWPORT = { width: 1280, height: 800 };

// Simple page captures — navigate and shoot
const PAGES = [
  { file: 'areas.png',            route: '/#/config/areas' },
  { file: 'bom.png',              route: '/#/reports/bom' },
  { file: 'breakers.png',         route: '/#/breakers' },
  { file: 'certificates.png',     route: '/#/config/certificates' },
  { file: 'circuits.png',         route: '/#/circuits' },
  { file: 'clients.png',          route: '/#/clients' },
  { file: 'colors.png',           route: '/#/config/colors' },
  { file: 'control_circuits.png', route: '/#/reports/control-circuits' },
  { file: 'controllers.png',      route: '/#/controllers' },
  { file: 'icons.png',            route: '/#/config/icons' },
  { file: 'import.png',           route: '/#/config/import' },
  { file: 'inputs.png',           route: '/#/inputs' },
  { file: 'mqtt.png',             route: '/#/config/mqtt' },
  { file: 'ota.png',              route: '/#/config/ota' },
  { file: 'outputs.png',          route: '/#/outputs' },
  { file: 'reset.png',            route: '/#/config/reset' },
  { file: 'tags.png',             route: '/#/config/tags' },
  { file: 'wifi.png',             route: '/#/config/wifi' },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const dbIndex = args.indexOf('--db');
  if (dbIndex === -1 || !args[dbIndex + 1]) {
    console.error('Usage: node capture-screenshots.js --db /path/to/backup.json');
    process.exit(1);
  }
  const dbPath = path.resolve(args[dbIndex + 1]);
  if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found: ${dbPath}`);
    process.exit(1);
  }
  return dbPath;
}

async function importDatabase(page, dbPath) {
  console.log(`Importing database from ${path.basename(dbPath)}...`);
  await page.goto(`${BASE_URL}/#/config/import`, { waitUntil: 'networkidle' });
  await page.setInputFiles('input[type="file"]', dbPath);
  // Open the confirm modal
  await page.locator('button:has-text("Import"):not([disabled])').click();
  // Click Import inside the confirm modal (scoped to the overlay div)
  await page.locator('div.fixed').locator('button:has-text("Import")').click();
  // Wait for the reload that fires ~1.5s after a successful import
  await page.waitForTimeout(2500);
  await page.waitForLoadState('networkidle');
  console.log('Database imported.');
}

async function capture(page, file, route) {
  const url = `${BASE_URL}${route}`;
  console.log(`  ${file} → ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, file), fullPage: false });
}

async function run() {
  const dbPath = parseArgs();

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: VIEWPORT });

  // Suppress the "Data is stored locally" modal — it checks this sessionStorage key
  await context.addInitScript(() => sessionStorage.setItem('cloud_notice_seen', '1'));

  const page = await context.newPage();

  // ── Import backup ─────────────────────────────────────────────────────────
  await importDatabase(page, dbPath);

  // ── Simple pages ──────────────────────────────────────────────────────────
  console.log('\nCapturing simple pages...');
  for (const { file, route } of PAGES) {
    await capture(page, file, route);
  }

  // ── Interactive pages ─────────────────────────────────────────────────────
  // These require specific UI state. Uncomment and adjust selectors as needed.
  console.log('\nCapturing interactive pages...');

  // circuit_new.png — circuits page with the Add New Circuit dialog open
  // await page.goto(`${BASE_URL}/#/circuits`, { waitUntil: 'networkidle' });
  // await page.click('button:has-text("Add")');
  // await page.waitForSelector('[role="dialog"], .modal');
  // await page.screenshot({ path: path.join(OUTPUT_DIR, 'circuit_new.png') });

  // controllers_add.png — controllers page with the Add Controller dialog open
  // await page.goto(`${BASE_URL}/#/controllers`, { waitUntil: 'networkidle' });
  // await page.click('button:has-text("Add")');
  // await page.waitForSelector('[role="dialog"], .modal');
  // await page.screenshot({ path: path.join(OUTPUT_DIR, 'controllers_add.png') });

  // controller_added.png — after a controller has been added (requires data)
  // await page.goto(`${BASE_URL}/#/controllers`, { waitUntil: 'networkidle' });
  // await page.screenshot({ path: path.join(OUTPUT_DIR, 'controller_added.png') });

  // controller_authenticated.png — after authenticating a controller
  // Requires a real controller to authenticate against; capture manually.

  // clients-buttons.png — clients page with a client's buttons list expanded
  // await page.goto(`${BASE_URL}/#/clients`, { waitUntil: 'networkidle' });
  // await page.click('.client-row:first-child');  // adjust selector
  // await page.waitForSelector('.buttons-list');   // adjust selector
  // await page.screenshot({ path: path.join(OUTPUT_DIR, 'clients-buttons.png') });

  await browser.close();
  console.log('\nDone. Screenshots saved to controller/software/controller/configuration/');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
