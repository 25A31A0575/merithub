import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAuthRoleTests() {
  console.log('🚀 Starting Automated Step 7: Unified Login & Role-Based Access Tests via Playwright...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  try {
    // [1/8] Test App Boot and Demo Switcher
    console.log('\n[1/8] Opening application at http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const bannerText = await page.locator('text=Judge Demo Switcher').first();
    if (!(await bannerText.isVisible())) {
      throw new Error('Judge Demo Switcher banner is not visible.');
    }
    console.log('  ✅ PASS: Application loaded with active Judge Demo Switcher');

    // [2/8] Test Logout & Login Page
    console.log('\n[2/8] Testing Logout and Institutional Login Page...');
    const logoutBtn = page.locator('button:has-text("Logout")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
    }

    // Verify Login page components
    const loginHeader = await page.locator('text=Institutional Login').first();
    if (!(await loginHeader.isVisible())) {
      throw new Error('Institutional Login page did not render upon logout.');
    }
    console.log('  ✅ PASS: Logged out successfully and redirected to Institutional Login page');

    // Take screenshot of Login Page
    const loginScreenshot = path.join(__dirname, 'auth-login-page.png');
    await page.screenshot({ path: loginScreenshot, fullPage: true });
    console.log(`  ✅ PASS: Saved login page screenshot: "${loginScreenshot}"`);

    // [3/8] Test Invalid Login Validation
    console.log('\n[3/8] Testing Invalid Credential Handling...');
    await page.locator('input[type="email"]').fill('student@pragati.edu');
    await page.locator('input[type="password"]').fill('WrongPassword123');
    await page.locator('button:has-text("Sign In to Portal")').click();
    await page.waitForTimeout(1000);

    const errorNotice = await page.locator('text=Invalid institutional email or password').first();
    if (!(await errorNotice.isVisible())) {
      throw new Error('Invalid credential error alert was not displayed.');
    }
    console.log('  ✅ PASS: Invalid credentials correctly rejected by backend');

    // [4/8] Test 1-Click Demo Login as Student
    console.log('\n[4/8] Testing Quick 1-Click Demo Login as Student (Aarav Patel)...');
    const studentCard = page.locator('button:has-text("Aarav Patel")').first();
    await studentCard.click();
    await page.waitForTimeout(1500);

    // Verify student authenticated
    const userBadge = await page.locator('text=Aarav Patel').first();
    if (!(await userBadge.isVisible())) {
      throw new Error('User badge does not show Aarav Patel after login.');
    }
    console.log('  ✅ PASS: Logged in successfully as Aarav Patel (STUDENT)');

    // [5/8] Test Role Guard on Verifier Desk (Student should see Access Denied)
    console.log('\n[5/8] Testing Route Guard: Student visiting Verifier Desk...');
    const verifierDeskTab = page.locator('nav button:has-text("Verifier Desk"), nav button:has-text("Verifier")').first();
    await verifierDeskTab.click();
    await page.waitForTimeout(1000);

    const accessDeniedNotice = await page.locator('text=Faculty Verifier Permission Required').first();
    if (!(await accessDeniedNotice.isVisible())) {
      throw new Error('Access Denied screen did not appear for student on Verifier Desk.');
    }
    console.log('  ✅ PASS: Route guard blocked Student from Verifier Desk with Access Denied screen');

    const deniedScreenshot = path.join(__dirname, 'auth-access-denied.png');
    await page.screenshot({ path: deniedScreenshot, fullPage: true });
    console.log(`  ✅ PASS: Saved Access Denied screenshot: "${deniedScreenshot}"`);

    // [6/8] Test Judge Demo Switcher to Verifier (Prof. Vikram Mehta)
    console.log('\n[6/8] Testing Judge Demo Switcher: Switching to Verifier role...');
    const switchVerifierBtn = page.locator('button:has-text("Verifier")').first();
    await switchVerifierBtn.click();
    await page.waitForTimeout(1500);

    const verifierTitle = await page.locator('text=Faculty Verification Desk').first();
    if (!(await verifierTitle.isVisible())) {
      throw new Error('Faculty Verification Desk failed to open after switching to Verifier role.');
    }
    console.log('  ✅ PASS: Switched instantly to Verifier role; desk is accessible');

    const verifierScreenshot = path.join(__dirname, 'auth-verifier-desk.png');
    await page.screenshot({ path: verifierScreenshot, fullPage: true });
    console.log(`  ✅ PASS: Saved Verifier Desk screenshot: "${verifierScreenshot}"`);

    // [7/8] Test Judge Demo Switcher to Admin (Dr. Anita Desai) and Analytics
    console.log('\n[7/8] Testing Judge Demo Switcher: Switching to Admin role and viewing Analytics...');
    const switchAdminBtn = page.locator('button:has-text("Admin")').first();
    await switchAdminBtn.click();
    await page.waitForTimeout(1500);

    const analyticsTab = page.locator('nav button:has-text("Analytics")').first();
    await analyticsTab.click();
    await page.waitForTimeout(1500);

    const analyticsTitle = await page.locator('text=Institutional Achievement Analytics & Reports').first();
    if (!(await analyticsTitle.isVisible())) {
      throw new Error('Analytics dashboard failed to open for Admin.');
    }
    console.log('  ✅ PASS: Admin successfully accessed Analytics & Reports dashboard');

    // [8/8] Verify Backend API Role Rejection (Student calling /api/achievements/1/approve directly)
    console.log('\n[8/8] Testing Direct Backend API Protection via Unauthorized Token...');
    const loginRes = await page.evaluate(async () => {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@pragati.edu', password: 'Pragati@2026' })
      });
      return await res.json();
    });

    const studentToken = loginRes.token;

    const directApiAttempt = await page.evaluate(async (token) => {
      const res = await fetch('http://localhost:5000/api/achievements/1/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ remarks: 'Hacked directly by API call' })
      });
      return { status: res.status, body: await res.json() };
    }, studentToken);

    if (directApiAttempt.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for student approve attempt, but got ${directApiAttempt.status}`);
    }
    console.log(`  ✅ PASS: Backend returned HTTP ${directApiAttempt.status} Forbidden: "${directApiAttempt.body.error}"`);

    console.log('\n=====================================================================');
    console.log('🏆 ALL STEP 7 AUTHENTICATION & ROLE-BASED ACCESS TESTS PASSED 100%!');
    console.log('=====================================================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runAuthRoleTests();
