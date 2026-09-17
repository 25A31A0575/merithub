import { chromium } from 'playwright';

async function runAutomatedTests() {
  console.log('🚀 Starting Automated Showcase Testing via Playwright (using Microsoft Edge)...');
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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
    // 1. Load Page
    console.log('\n[1/7] Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
    const title = await page.title();
    if (title.includes('Pragati University')) {
      logPass(`Page title includes Pragati University ("${title}")`);
    } else {
      throw new Error(`Unexpected page title: ${title}`);
    }

    // 2. Check Navbar Brand
    const brandText = await page.locator('header').textContent();
    if (brandText.includes('Pragati University')) {
      logPass('Header displays "Pragati University" branding');
    } else {
      throw new Error('Header does not display Pragati University');
    }

    // 3. Verify Live Stats
    console.log('\n[2/7] Verifying Live Metric Counters...');
    await page.waitForSelector('text=Total Achievements', { timeout: 5000 });
    const statsText = await page.locator('section').nth(1).textContent();
    if (statsText.includes('6') && statsText.includes('3')) {
      logPass('Live statistics cards show Total: 6 and Faculty Verified: 3');
    } else {
      throw new Error(`Stats mismatch. Extracted: ${statsText}`);
    }

    // 4. Verify Only Approved Achievements in Gallery
    console.log('\n[3/7] Verifying Approved Cards in Public Gallery...');
    await page.waitForSelector('#gallery');
    const cards = page.locator('#gallery .cursor-pointer.group');
    const count = await cards.count();
    if (count === 3) {
      logPass(`Gallery shows exactly 3 approved achievement cards (pending/rejected filtered out)`);
    } else {
      throw new Error(`Expected 3 cards, but found ${count}`);
    }

    // 5. Test Live Search
    console.log('\n[4/7] Testing Live Search...');
    const searchInput = page.locator('input[placeholder*="Search by achievement"]');
    await searchInput.fill('Hackathon');
    await page.waitForTimeout(300);
    const searchCount = await page.locator('#gallery .cursor-pointer.group').count();
    if (searchCount === 1) {
      logPass('Searching "Hackathon" correctly filters gallery to 1 card');
    } else {
      throw new Error(`Expected 1 card for "Hackathon", found ${searchCount}`);
    }
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // 6. Test Category Filter
    console.log('\n[5/7] Testing Category Filtering...');
    const researchPill = page.locator('button:has-text("Research")');
    await researchPill.click();
    await page.waitForTimeout(300);
    const researchCount = await page.locator('#gallery .cursor-pointer.group').count();
    if (researchCount === 1) {
      logPass('Clicking "Research" category pill filters to 1 card (IEEE Paper)');
    } else {
      throw new Error(`Expected 1 card for Research, found ${researchCount}`);
    }
    const allPill = page.locator('button:has-text("All")').first();
    await allPill.click();
    await page.waitForTimeout(300);

    // 7. Test Achievement Details Modal
    console.log('\n[6/7] Testing Achievement Modal Dialog...');
    const firstCard = page.locator('#gallery .cursor-pointer.group').first();
    await firstCard.click();
    await page.waitForSelector('text=Institutional Verified Record', { timeout: 5000 });
    logPass('Clicking card opens the Achievement Details Modal');

    const modalText = await page.locator('.fixed.inset-0').first().textContent();
    if (modalText.includes('Faculty Verification Endorsement') && modalText.includes('Prof. Vikram Mehta')) {
      logPass('Modal displays Faculty Verifier Endorsement with Prof. Vikram Mehta');
    } else {
      throw new Error('Modal missing verifier endorsement or verifier name');
    }

    // Close Modal
    const closeBtn = page.locator('button:has-text("Close Details")');
    await closeBtn.click();
    await page.waitForTimeout(300);
    const modalVisible = await page.locator('text=Institutional Verified Record').isVisible();
    if (!modalVisible) {
      logPass('Closing modal successfully dismisses the dialog');
    } else {
      throw new Error('Modal did not close');
    }

    // 8. Capture Full Page Screenshot
    console.log('\n[7/7] Capturing Automated Screenshot...');
    await page.screenshot({ path: 'showcase-verified.png', fullPage: true });
    logPass('Full-page screenshot captured successfully as "client/showcase-verified.png"');

    console.log('\n🎉 ALL 7 AUTOMATED PLAYWRIGHT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    logFail('Test Suite', err);
  } finally {
    await browser.close();
  }
}

runAutomatedTests();
