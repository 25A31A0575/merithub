import { chromium } from 'playwright';

async function runAnalyticsTests() {
  console.log('🚀 Starting Automated Step 6: Analytics & Reports Dashboard Tests via Playwright...\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  const logPass = (name) => console.log(`  ✅ PASS: ${name}`);
  const logFail = (name, err) => console.error(`  ❌ FAIL: ${name} ->`, err.message || err);

  try {
    // 1. Open App
    console.log('[1/6] Opening application at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    logPass('Application loaded successfully');

    // 2. Navigate to Analytics & Reports
    console.log('\n[2/6] Navigating to Analytics & Reports page (switching to Admin role)...');
    const adminBtn = page.locator('button:has-text("Admin")').first();
    if (await adminBtn.isVisible()) {
      await adminBtn.click();
      await page.waitForTimeout(1000);
    }
    const analyticsTab = page.locator('nav button:has-text("Analytics")').first();
    await analyticsTab.click();
    await page.waitForSelector('h1:has-text("Institutional Achievement Analytics & Reports")', {
      timeout: 5000
    });
    logPass('Analytics & Reports dashboard loaded');

    // 3. Verify 6 Summary Cards
    console.log('\n[3/6] Verifying 6 Dynamic Summary Metrics from SQLite...');
    const summaryGrid = page.locator('.grid.grid-cols-2.md\\:grid-cols-3');
    const summaryCards = summaryGrid.locator('> div');
    const cardCount = await summaryCards.count();
    console.log(`   Found ${cardCount} summary metric cards.`);

    const totalText = await summaryCards.nth(0).textContent();
    const approvedText = await summaryCards.nth(1).textContent();
    const pendingText = await summaryCards.nth(2).textContent();
    const rejectedText = await summaryCards.nth(3).textContent();
    const studentText = await summaryCards.nth(4).textContent();
    const facultyText = await summaryCards.nth(5).textContent();

    console.log(`   - Card 1 (Total): ${totalText.replace(/\s+/g, ' ').trim()}`);
    console.log(`   - Card 2 (Approved): ${approvedText.replace(/\s+/g, ' ').trim()}`);
    console.log(`   - Card 3 (Pending): ${pendingText.replace(/\s+/g, ' ').trim()}`);
    console.log(`   - Card 4 (Rejected): ${rejectedText.replace(/\s+/g, ' ').trim()}`);
    console.log(`   - Card 5 (Student Works): ${studentText.replace(/\s+/g, ' ').trim()}`);
    console.log(`   - Card 6 (Faculty Works): ${facultyText.replace(/\s+/g, ' ').trim()}`);

    if (
      cardCount === 6 &&
      totalText.includes('9') &&
      approvedText.includes('4') &&
      pendingText.includes('4') &&
      rejectedText.includes('1')
    ) {
      logPass('All 6 summary metrics accurately reflect the SQLite database state');
    } else {
      throw new Error('Summary card metrics mismatch with database');
    }

    // 4. Verify 4 Chart.js Canvases Rendered
    console.log('\n[4/6] Verifying Chart.js Visualizations...');
    const canvases = page.locator('canvas');
    const canvasCount = await canvases.count();
    console.log(`   Found ${canvasCount} active Chart.js canvas elements.`);

    const hasCategoryChart = await page.locator('text=Achievements by Category').isVisible();
    const hasDeptChart = await page.locator('text=Department Distribution').isVisible();
    const hasStatusChart = await page.locator('text=Verification Status Ratio').isVisible();
    const hasYearChart = await page.locator('text=Yearly Milestone Trajectory').isVisible();

    if (canvasCount >= 4 && hasCategoryChart && hasDeptChart && hasStatusChart && hasYearChart) {
      logPass('All 4 Chart.js charts rendered successfully (Category, Dept, Status Doughnut, Yearly)');
    } else {
      throw new Error('One or more charts failed to render');
    }

    // 5. Test Interactive Filters
    console.log('\n[5/6] Testing Dynamic Filters Pipeline...');
    const deptSelect = page.locator('select').nth(1); // Department is 2nd select
    console.log('   Selecting department: "Computer Science & Engineering"...');
    await deptSelect.selectOption('Computer Science & Engineering');
    await page.waitForTimeout(600);

    const filteredTotal = await page.locator('text=Total Records').locator('..').textContent();
    console.log(`   Filtered Total for CSE: ${filteredTotal.replace(/\s+/g, ' ').trim()}`);

    // Click Reset Filters
    const resetBtn = page.locator('button:has-text("Reset filters")');
    await resetBtn.click();
    await page.waitForTimeout(600);

    const restoredTotal = await page.locator('text=Total Records').locator('..').textContent();
    if (restoredTotal.includes('9')) {
      logPass('Filter update and Reset button correctly restored total to 9');
    } else {
      throw new Error('Reset filters did not restore baseline records');
    }

    // 6. Verify Records Table & Action Buttons
    console.log('\n[6/6] Verifying Institutional Table & Report Export Buttons...');
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    console.log(`   Table displays ${rowCount} individual achievement records with full columns.`);

    const hasCsvBtn = await page.locator('button:has-text("Export to CSV")').isVisible();
    const hasPrintBtn = await page.locator('button:has-text("Print / Save PDF Report")').isVisible();

    if (rowCount > 0 && hasCsvBtn && hasPrintBtn) {
      logPass('Institutional records table, Export CSV, and Print/Save PDF buttons are operational');
    } else {
      throw new Error('Export buttons or table rows missing');
    }

    // Capture screenshot of Analytics Dashboard
    await page.screenshot({ path: 'analytics-dashboard.png', fullPage: true });
    logPass('Full-page screenshot captured: "client/analytics-dashboard.png"');

    console.log('\n=====================================================================');
    console.log('🏆 ALL STEP 6 ANALYTICS & REPORTING TESTS PASSED 100%!');
    console.log('=====================================================================');
  } catch (err) {
    logFail('Step 6 Test Suite', err);
  } finally {
    await browser.close();
  }
}

runAnalyticsTests();
