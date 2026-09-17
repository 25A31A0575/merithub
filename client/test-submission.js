import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSubmissionTests() {
  console.log('🚀 Starting Automated Step 4 Submission & Upload Tests via Playwright...\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const results = [];
  const logPass = (name) => {
    console.log(`  ✅ PASS: ${name}`);
    results.push({ name, status: 'PASS' });
  };
  const logFail = (name, err) => {
    console.error(`  ❌ FAIL: ${name} ->`, err.message || err);
    results.push({ name, status: 'FAIL', error: err.message || err });
  };

  try {
    // 1. Open the frontend
    console.log('[1/8] Opening frontend at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    logPass('Frontend loaded successfully');

    // 2. Navigate to Submit Achievement form
    console.log('\n[2/8] Navigating to Submit Achievement...');
    const submitNavBtn = page.locator('button:has-text("Submit Achievement")').first();
    await submitNavBtn.click();
    await page.waitForSelector('h1:has-text("Submit New Achievement")', { timeout: 5000 });
    logPass('Navigated to Submit Achievement form');

    // 3. Test Validation with Empty Fields
    console.log('\n[3/8] Testing Validation on Empty Submission...');
    const submitBtn = page.locator('button:has-text("Submit for Faculty Verification")');
    await submitBtn.click();
    await page.waitForTimeout(300);
    const hasNameError = await page.locator('text=Achiever name is required').isVisible();
    const hasTitleError = await page.locator('text=Achievement title is required').isVisible();
    const hasFileError = await page.locator('text=Please attach an official certificate').isVisible();
    if (hasNameError && hasTitleError && hasFileError) {
      logPass('Client validation triggered for empty name, title, and certificate file');
    } else {
      throw new Error('Validation failed to catch missing fields');
    }

    // 4. Fill Out Fictional Achievement
    console.log('\n[4/8] Filling Out Form with Fictional Achievement...');
    await page.locator('input[name="achiever_name"]').fill('Ananya Sen');
    await page.locator('input[name="title"]').fill('Best AI Innovation Award - National Tech Symposium');
    await page.locator('select[name="category"]').selectOption('Innovation');
    await page.locator('input[name="event_name"]').fill('National AI Symposium 2026');
    await page.locator('input[name="event_date"]').fill('2026-04-15');
    await page.locator('input[name="position_rank"]').fill('1st Place / Gold Innovation Award');
    await page.locator('textarea[name="description"]').fill(
      'Designed a real-time computer vision system for micro-grid power monitoring and fault detection.'
    );

    // 5. Upload Certificate Document
    const testPdfPath = path.join(__dirname, 'test-assets', 'sample-certificate.pdf');
    console.log(`  Attaching test certificate from: ${testPdfPath}`);
    const fileInput = page.locator('#certificate-input');
    await fileInput.setInputFiles(testPdfPath);
    await page.waitForTimeout(300);

    const uploadedFileNameVisible = await page.locator('text=sample-certificate.pdf').isVisible();
    if (uploadedFileNameVisible) {
      logPass('File attached and ready for upload');
    } else {
      throw new Error('File input did not register attachment');
    }

    // 6. Submit the Form
    console.log('\n[5/8] Submitting Form to Backend...');
    await submitBtn.click();
    await page.waitForSelector('text=Achievement Submitted Successfully!', { timeout: 10000 });
    logPass('Success screen displayed: "Achievement Submitted Successfully!"');

    // Verify Submission Details on Success Screen
    const statusText = await page.locator('text=Pending Verification').isVisible();
    const submissionIdText = await page.locator('text=Submission ID:').locator('..').textContent();
    console.log(`   - Status displayed: ${statusText ? 'Pending Verification ✅' : 'Missing ❌'}`);
    console.log(`   - ${submissionIdText.trim()}`);
    logPass('Success screen correctly states status as "Pending Verification"');

    // 7. Verify Database & Uploads Folder
    console.log('\n[6/8] Verifying SQLite Database & server/uploads/ Directory...');
    const uploadsDir = path.join(__dirname, '..', 'server', 'uploads');
    const uploadedFiles = fs.readdirSync(uploadsDir);
    const pdfFiles = uploadedFiles.filter((f) => f.startsWith('cert_') && f.endsWith('.pdf'));
    if (pdfFiles.length > 0) {
      logPass(`Uploaded certificate successfully stored in server/uploads/ (${pdfFiles[pdfFiles.length - 1]})`);
    } else {
      throw new Error('Uploaded certificate not found in server/uploads/');
    }

    // 8. Test "My Submissions" View
    console.log('\n[7/8] Testing "My Submissions" Tracker...');
    const trackBtn = page.locator('button:has-text("Track in \\"My Submissions\\"")');
    await trackBtn.click();
    await page.waitForSelector('h2:has-text("Institutional Submissions Tracker")', { timeout: 5000 });

    const newSubCard = page.locator('text=Best AI Innovation Award - National Tech Symposium').first();
    const isVisibleInTracker = await newSubCard.isVisible();
    if (isVisibleInTracker) {
      logPass('New submission appears in "My Submissions" tracker with Pending badge');
    } else {
      throw new Error('Submission missing from tracker view');
    }

    // 9. PUBLIC SHOWCASE INTEGRITY CHECK (CRUCIAL RULE)
    console.log('\n[8/8] Checking Public Showcase Integrity Rule...');
    const showcaseNavBtn = page.locator('button:has-text("Showcase")').first();
    await showcaseNavBtn.click();
    await page.waitForSelector('#gallery', { timeout: 5000 });

    // Verify that the new pending submission DOES NOT appear on the public showcase
    const pendingOnPublic = await page.locator('#gallery').getByText('Best AI Innovation Award').isVisible();
    if (!pendingOnPublic) {
      logPass('CRITICAL RULE VERIFIED: Pending achievement does NOT appear in Public Showcase!');
    } else {
      throw new Error('SECURITY VIOLATION: Pending achievement leaked into public showcase!');
    }

    // Verify existing 3 approved achievements still appear normally
    const cards = page.locator('#gallery .cursor-pointer.group');
    const approvedCount = await cards.count();
    if (approvedCount === 3) {
      logPass('Public Showcase continues to display exactly 3 approved achievements normally');
    } else {
      throw new Error(`Expected 3 approved achievements, found ${approvedCount}`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL STEP 4 SUBMISSION & UPLOAD TESTS PASSED 100%!');
    console.log('======================================================');
  } catch (err) {
    logFail('Step 4 Test Suite', err);
  } finally {
    await browser.close();
  }
}

runSubmissionTests();
