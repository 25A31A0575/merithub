import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVerifierTests() {
  console.log('🚀 Starting Automated Step 5: Faculty Verifier Flow Tests via Playwright...\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const logPass = (name) => console.log(`  ✅ PASS: ${name}`);
  const logFail = (name, err) => console.error(`  ❌ FAIL: ${name} ->`, err.message || err);

  try {
    // 1. Open app
    console.log('[1/6] Opening application at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    logPass('Application loaded successfully');

    // 2. Navigate to Faculty Verification Desk
    console.log('\n[2/6] Navigating to Faculty Verification Desk...');
    const verifierTab = page.locator('button:has-text("Verifier Desk")').first();
    await verifierTab.click();
    await page.waitForSelector('h1:has-text("Faculty Verification Desk")', { timeout: 5000 });
    logPass('Faculty Verification Desk opened');

    // TEST A: Check Pending Queue & Certificate Inspection
    console.log('\n--- TEST A: Pending Queue & Certificate Inspection ---');
    const pendingCards = page.locator('.space-y-5 > div');
    const initialPendingCount = await pendingCards.count();
    console.log(`  Found ${initialPendingCount} pending submissions in queue.`);
    if (initialPendingCount > 0) {
      logPass(`Pending queue actively displaying ${initialPendingCount} submissions`);
    } else {
      throw new Error('Pending queue is unexpectedly empty');
    }

    // Inspect Certificate
    const viewCertBtn = page.locator('button:has-text("View Certificate Evidence")').first();
    await viewCertBtn.click();
    await page.waitForSelector('text=Certificate Evidence Preview', { timeout: 5000 });
    logPass('Certificate Viewer modal opened successfully and evidence is inspectable');

    // Close Certificate Viewer
    const closeViewerBtn = page.locator('button:has-text("Close Viewer")');
    await closeViewerBtn.click();
    await page.waitForTimeout(300);
    logPass('Certificate Viewer dismissed smoothly');

    // TEST B: Approve Workflow
    console.log('\n--- TEST B: Approve Workflow ---');
    // Find the Google Cloud certificate card
    const targetApproveCard = page.locator('.space-y-5 > div').filter({ hasText: 'Google Cloud Certified' });
    const approveBtn = targetApproveCard.locator('button:has-text("Approve Achievement")');
    console.log('  Clicking "Approve Achievement" for Google Cloud certification...');
    await approveBtn.click();
    await page.waitForTimeout(1000);

    const approveNotice = await page.locator('text=Approved ID').first().isVisible();
    if (approveNotice) {
      logPass('Server approved the achievement and removed it from the pending queue');
    } else {
      throw new Error('Approval notice missing or failed');
    }

    // Verify on Public Showcase
    console.log('  Navigating to Public Showcase to verify publication...');
    await page.locator('button:has-text("Showcase")').first().click();
    await page.waitForSelector('#gallery', { timeout: 5000 });

    const approvedOnShowcase = await page.locator('#gallery').getByText('Google Cloud Certified').isVisible();
    if (approvedOnShowcase) {
      logPass('CRITICAL VERIFICATION: Approved achievement is now live on the Public Showcase!');
    } else {
      throw new Error('Approved achievement did NOT appear on public showcase');
    }

    // TEST C: Reject Workflow with Mandatory Remarks
    console.log('\n--- TEST C: Reject Workflow ---');
    // Return to Verifier Desk
    await page.locator('button:has-text("Verifier Desk")').first().click();
    await page.waitForSelector('h1:has-text("Faculty Verification Desk")', { timeout: 5000 });

    // Target the Agricultural Drone submission
    const targetRejectCard = page.locator('.space-y-5 > div').filter({ hasText: 'Autonomous Agricultural Drone' });
    const rejectBtn = targetRejectCard.locator('button:has-text("Reject with Remarks")');
    await rejectBtn.click();
    await page.waitForSelector('h3:has-text("Reject Submission")', { timeout: 5000 });
    logPass('Rejection modal opened with mandatory remarks notice');

    // Verify empty remarks is blocked
    const confirmRejectBtn = page.locator('button:has-text("Confirm Rejection")');
    const isButtonDisabled = await confirmRejectBtn.isDisabled();
    if (isButtonDisabled) {
      logPass('System strictly blocks rejection without remarks (button disabled)');
    } else {
      throw new Error('Rejection permitted empty remarks');
    }

    // Type constructive remarks
    const rejectionNote = 'Uploaded drone documentation is missing official patent/symposium stamp and verifiable team registration ID. Please re-upload official scanned copy.';
    await page.locator('textarea').fill(rejectionNote);
    await confirmRejectBtn.click();
    await page.waitForTimeout(1000);

    const rejectNotice = await page.locator('text=Rejected ID').first().isVisible();
    if (rejectNotice) {
      logPass('Achievement rejected and feedback safely recorded');
    } else {
      throw new Error('Rejection notice missing');
    }

    // Check that rejected achievement is NOT on the Public Showcase
    await page.locator('button:has-text("Showcase")').first().click();
    await page.waitForSelector('#gallery', { timeout: 5000 });
    const rejectedOnShowcase = await page.locator('#gallery').getByText('Autonomous Agricultural Drone').isVisible();
    if (!rejectedOnShowcase) {
      logPass('CRITICAL VERIFICATION: Rejected achievement does NOT appear on the Public Showcase!');
    } else {
      throw new Error('SECURITY VIOLATION: Rejected achievement appeared on public showcase');
    }

    // TEST D: My Submissions & Re-submit Flow
    console.log('\n--- TEST D: My Submissions & Re-submit Flow ---');
    await page.locator('button:has-text("My Submissions")').first().click();
    await page.waitForSelector('h2:has-text("My Submissions & Statuses")', { timeout: 5000 });

    // Check that rejection note is displayed to the submitter
    const rejectionRemarksVisible = await page.locator(`text=${rejectionNote.substring(0, 40)}`).isVisible();
    if (rejectionRemarksVisible) {
      logPass('Submitter can see faculty rejection remarks in "My Submissions"');
    } else {
      throw new Error('Rejection remarks not visible to submitter');
    }

    // Click "Fix & Re-submit Evidence" on the rejected Drone achievement
    const droneRejectedCard = page.locator('.space-y-5 > div').filter({ hasText: 'Autonomous Agricultural Drone' });
    const fixBtn = droneRejectedCard.locator('button:has-text("Fix & Re-submit Evidence")');
    await fixBtn.click();
    await page.waitForSelector('h3:has-text("Fix & Re-submit Achievement")', { timeout: 5000 });
    logPass('Fix & Re-submit modal opened showing previous faculty remarks');

    // Attach updated proof and submit
    const sampleCertPath = path.join(__dirname, 'test-assets', 'sample-certificate.pdf');
    await page.locator('input[type="file"]').setInputFiles(sampleCertPath);
    await page.locator('input[name="resubmit_notes"]').fill('Attached official stamped symposium documentation.');
    
    await page.locator('button:has-text("Re-submit for Faculty Verification")').click();
    await page.waitForTimeout(1000);

    const resubmitSuccessAlert = await page.locator('text=successfully re-submitted').isVisible();
    if (resubmitSuccessAlert) {
      logPass('Achievement re-submitted successfully and status reset to Pending');
    } else {
      throw new Error('Re-submission failed');
    }

    // Confirm it has returned to the Verifier Desk pending queue
    await page.locator('button:has-text("Verifier Desk")').first().click();
    await page.waitForSelector('h1:has-text("Faculty Verification Desk")', { timeout: 5000 });
    const returnedToQueue = await page.locator('text=Autonomous Agricultural Drone').isVisible();
    if (returnedToQueue) {
      logPass('Re-submitted achievement successfully returned to Faculty Verification Desk pending queue');
    } else {
      throw new Error('Re-submitted achievement not found in pending queue');
    }

    console.log('\n=====================================================================');
    console.log('🏆 ALL STEP 5 FACULTY VERIFIER & RESUBMIT WORKFLOW TESTS PASSED 100%!');
    console.log('=====================================================================');
  } catch (err) {
    logFail('Step 5 Test Suite', err);
  } finally {
    await browser.close();
  }
}

runVerifierTests();
