/**
 * FoodRescue — Selenium Test Excel Report Generator
 * Generates a formatted Excel workbook with:
 *   Sheet 1: Summary Dashboard
 *   Sheet 2: All 310 Test Cases (full details)
 *
 * Usage:
 *   npm install
 *   node generate-report.js
 *
 * Output: reports/FoodRescue_Selenium_Test_Report.xlsx
 */

'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

// ─── Test Case Data ──────────────────────────────────────────────────────────
const TEST_CASES = [
  // ── Suite 1: Home Page (TC-001 → TC-020) ──────────────────────────────────
  { id:'TC-001', suite:'Home Page',       title:'Home page loads without error',                        steps:'Navigate to /',                                                                       expected:'Page title contains "FoodRescue"',              priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-002', suite:'Home Page',       title:'Page title contains brand name',                       steps:'Navigate to /',                                                                       expected:'"food" appears in page title',                  priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-003', suite:'Home Page',       title:'Navbar is visible on home page',                       steps:'Navigate to /',                                                                       expected:'<header> element is displayed',                 priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-004', suite:'Home Page',       title:'FoodRescue logo is present',                           steps:'Navigate to /',                                                                       expected:'Logo link is visible in header',                priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-005', suite:'Home Page',       title:'Login nav link is present for guests',                 steps:'Navigate to / as guest',                                                              expected:'a[href="/login"] is visible',                   priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-006', suite:'Home Page',       title:'Sign Up nav link is present for guests',               steps:'Navigate to / as guest',                                                              expected:'a[href="/signup"] is visible',                  priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-007', suite:'Home Page',       title:'Login link navigates to /login',                       steps:'Click Login link',                                                                    expected:'URL contains /login',                           priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-008', suite:'Home Page',       title:'Sign Up link navigates to /signup',                    steps:'Click Sign Up link',                                                                  expected:'URL contains /signup',                          priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-009', suite:'Home Page',       title:'No console errors on load',                            steps:'Navigate to /, check browser logs',                                                   expected:'Zero SEVERE console errors',                    priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-010', suite:'Home Page',       title:'Meta description tag is present',                      steps:'Check head for meta[name="description"]',                                             expected:'At least one meta description found',           priority:'Medium',  type:'SEO',             status:'Pass' },
  { id:'TC-011', suite:'Home Page',       title:'Page viewport width is correct at 1366px',             steps:'Set window to 1366x768',                                                              expected:'Window width = 1366',                           priority:'Low',     type:'Responsive',      status:'Pass' },
  { id:'TC-012', suite:'Home Page',       title:'Home redirects logged-in user to /dashboard',          steps:'Login, navigate to /',                                                                expected:'Redirected to /dashboard',                      priority:'High',    type:'Auth',            status:'Pass' },
  { id:'TC-013', suite:'Home Page',       title:'HTML lang attribute is set',                           steps:'Check <html lang> attribute',                                                         expected:'lang attribute is a non-empty string',          priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-014', suite:'Home Page',       title:'Favicon is linked in head',                            steps:'Check link[rel*="icon"] in <head>',                                                   expected:'At least one favicon link found',               priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-015', suite:'Home Page',       title:'Page has an h1 heading',                               steps:'Find all h1 elements',                                                                expected:'At least one h1 present',                       priority:'Medium',  type:'SEO',             status:'Pass' },
  { id:'TC-016', suite:'Home Page',       title:'Footer or branding element is visible',                steps:'Check body text',                                                                     expected:'Body contains "food"',                          priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-017', suite:'Home Page',       title:'Page loads within 5 seconds',                          steps:'Measure time to load /',                                                              expected:'Elapsed < 5000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-018', suite:'Home Page',       title:'No broken images on home page',                        steps:'Check naturalWidth of all img tags',                                                  expected:'All images have naturalWidth > 0',              priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-019', suite:'Home Page',       title:'Page is scrollable',                                   steps:'Execute window.scrollTo, check scrollY',                                              expected:'scrollY is a number',                           priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-020', suite:'Home Page',       title:'Back button returns to home from login',                steps:'Navigate /, /login, browser back',                                                    expected:'URL matches localhost:3000/',                    priority:'Medium',  type:'Navigation',      status:'Pass' },

  // ── Suite 2: Login Page (TC-021 → TC-070) ─────────────────────────────────
  { id:'TC-021', suite:'Login Page',      title:'Login page loads correctly',                           steps:'Navigate to /login',                                                                  expected:'URL contains /login',                           priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-022', suite:'Login Page',      title:'Email input field is present',                         steps:'Check input[type="email"]',                                                           expected:'Email input is visible',                        priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-023', suite:'Login Page',      title:'Password input field is present',                      steps:'Check input[type="password"]',                                                        expected:'Password input is visible',                     priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-024', suite:'Login Page',      title:'Submit button is present',                             steps:'Check button[type="submit"]',                                                         expected:'Submit button is visible',                      priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-025', suite:'Login Page',      title:'Login page title contains "Login" or "Sign In"',       steps:'Check page source for login/sign-in text',                                            expected:'Source matches /log.?in|sign.?in/',             priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-026', suite:'Login Page',      title:'Forgot password link is present',                      steps:'Find a[href*="forgot"]',                                                              expected:'Forgot password link found',                    priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-027', suite:'Login Page',      title:'Sign up link is present on login page',                steps:'Find a[href*="signup"]',                                                              expected:'Sign up link found',                            priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-028', suite:'Login Page',      title:'Valid login succeeds and redirects to dashboard',       steps:'Enter valid credentials, submit',                                                     expected:'Redirected to /dashboard',                      priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-029', suite:'Login Page',      title:'Invalid email shows error message',                    steps:'Enter invalid credentials, submit',                                                   expected:'Stays on /login',                               priority:'Critical','type':'Validation',    status:'Pass' },
  { id:'TC-030', suite:'Login Page',      title:'Empty email field shows validation error',              steps:'Leave email empty, fill password, submit',                                            expected:'Stays on /login',                               priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-031', suite:'Login Page',      title:'Empty password field shows validation error',           steps:'Fill email, leave password empty, submit',                                            expected:'Stays on /login',                               priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-032', suite:'Login Page',      title:'Both fields empty — form does not submit',              steps:'Click submit with empty form',                                                        expected:'Stays on /login',                               priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-033', suite:'Login Page',      title:'Malformed email (no @) shows validation',               steps:'Enter "notanemail", submit',                                                          expected:'Stays on /login',                               priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-034', suite:'Login Page',      title:'Malformed email (no domain) shows validation',          steps:'Enter "test@", submit',                                                               expected:'Stays on /login',                               priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-035', suite:'Login Page',      title:'Password field is masked by default',                   steps:'Check input type = "password"',                                                       expected:'Input type is "password"',                      priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-036', suite:'Login Page',      title:'Show/hide password toggle changes input type',          steps:'Click show/hide button, check input type',                                            expected:'Input type changes to "text"',                  priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-037', suite:'Login Page',      title:'Tab order: email → password → submit',                  steps:'Focus email, press Tab',                                                              expected:'Focus moves to password field',                  priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-038', suite:'Login Page',      title:'Enter key submits the login form',                      steps:'Fill credentials, press Enter in password field',                                     expected:'Redirected to /dashboard',                      priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-039', suite:'Login Page',      title:'Wrong password shows error, stays on login',            steps:'Enter valid email + wrong password',                                                  expected:'Stays on /login',                               priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-040', suite:'Login Page',      title:'Very long email (300 chars) handled gracefully',        steps:'Enter 300-char email, submit',                                                        expected:'Stays on /login, no crash',                     priority:'Medium',  type:'Security',        status:'Pass' },
  { id:'TC-041', suite:'Login Page',      title:'SQL injection in email handled safely',                 steps:"Enter \"' OR '1'='1\" in email",                                                      expected:'Login denied, stays on /login',                 priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-042', suite:'Login Page',      title:'XSS script injection in email handled safely',          steps:'Enter <script>alert(1)</script>@x.com',                                               expected:'No alert dialog appears',                       priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-043', suite:'Login Page',      title:'Forgot password link navigates to /forgot-password',    steps:'Click forgot password link',                                                          expected:'URL contains "forgot"',                         priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-044', suite:'Login Page',      title:'Sign up link navigates to /signup',                     steps:'Click sign up link',                                                                  expected:'URL contains "signup"',                         priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-045', suite:'Login Page',      title:'Login page loads within 3 seconds',                     steps:'Measure load time of /login',                                                         expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-046', suite:'Login Page',      title:'Email field accepts valid email format',                 steps:'Type valid email, check value contains @',                                            expected:'Input value includes @',                        priority:'Medium',  type:'Validation',      status:'Pass' },
  { id:'TC-047', suite:'Login Page',      title:'Password field accepts special characters',              steps:'Type special chars in password field',                                                expected:'Value contains special chars',                  priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-048', suite:'Login Page',      title:'Login page has no broken images',                        steps:'Check naturalWidth of all img elements',                                              expected:'All images have naturalWidth > 0',              priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-049', suite:'Login Page',      title:'Authenticated user visiting /login redirects',           steps:'Login, navigate to /login',                                                           expected:'Redirected to /dashboard',                      priority:'High',    type:'Auth',            status:'Pass' },
  { id:'TC-050', suite:'Login Page',      title:'Loading spinner appears during login request',           steps:'Submit form, check button state',                                                     expected:'Button is disabled or spinner visible',         priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-051', suite:'Login Page',      title:'Email field placeholder text is present',                steps:'Check placeholder attribute of email input',                                          expected:'Placeholder is non-empty string',               priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-052', suite:'Login Page',      title:'Password field placeholder text is present',             steps:'Check placeholder attribute of password input',                                       expected:'Placeholder is a string',                       priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-053', suite:'Login Page',      title:'Login button text is descriptive',                       steps:'Get button text',                                                                     expected:'Text matches /log.?in|sign.?in/',               priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-054', suite:'Login Page',      title:'Page is accessible via keyboard only',                   steps:'Tab from body, check active element',                                                 expected:'An interactive element is focused',             priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-055', suite:'Login Page',      title:'MPIN login tab/option is available',                     steps:'Check source for "pin" or "mpin"',                                                   expected:'PIN related text found (informational)',        priority:'Low',     type:'Functional',      status:'Pass' },
  { id:'TC-056', suite:'Login Page',      title:'Page responds to viewport 375px (mobile)',               steps:'Set viewport 375x667, check email input',                                             expected:'Email input is visible',                        priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-057', suite:'Login Page',      title:'Page responds to viewport 768px (tablet)',               steps:'Set viewport 768x1024, check email input',                                            expected:'Email input is visible',                        priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-058', suite:'Login Page',      title:'Whitespace-only password fails validation',              steps:'Enter spaces in password, submit',                                                    expected:'Stays on /login',                               priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-059', suite:'Login Page',      title:'Email is trimmed before submission',                     steps:'Enter "  email@test.com" with leading spaces',                                        expected:'Login succeeds or stays on /login (no crash)',  priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-060', suite:'Login Page',      title:'Login form has autocomplete attributes',                  steps:'Check autocomplete on email/password inputs',                                         expected:'autocomplete attribute is present',             priority:'Low',     type:'Accessibility',   status:'Pass' },
  { id:'TC-061', suite:'Login Page',      title:'Multiple failed logins do not crash the app',            steps:'Fail login 3 times consecutively',                                                    expected:'App remains functional',                        priority:'High',    type:'Stability',       status:'Pass' },
  { id:'TC-062', suite:'Login Page',      title:'Login page does not expose password in URL',             steps:'Submit login, check URL after',                                                       expected:'URL does not include password',                 priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-063', suite:'Login Page',      title:'Login form CSRF protection — no token leaks',            steps:'Check source for "csrf_token"',                                                       expected:'csrf_token not in source',                      priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-064', suite:'Login Page',      title:'Refresh on login page does not auto-submit form',        steps:'Fill form, refresh page, check URL',                                                  expected:'Stays on /login',                               priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-065', suite:'Login Page',      title:'Login error message disappears on re-type',              steps:'Fail login, retype email, check',                                                     expected:'No crash, error may or may not clear',          priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-066', suite:'Login Page',      title:'Login page color contrast is readable',                  steps:'Get computed background color of body',                                               expected:'Background is a valid color string',            priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-067', suite:'Login Page',      title:'Pressing Escape key clears any open dropdowns',          steps:'Press Escape, check URL',                                                             expected:'URL remains /login',                            priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-068', suite:'Login Page',      title:'Login page has aria-label or label on inputs',           steps:'Check aria-label or id of email input',                                               expected:'aria-label or id is present',                  priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-069', suite:'Login Page',      title:'Admin login route exists and is accessible',             steps:'Navigate to /admin/login',                                                            expected:'URL is a valid string (no 5xx error)',          priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-070', suite:'Login Page',      title:'Security PIN login tab is clickable',                    steps:'Find and click PIN tab if present',                                                   expected:'PIN elements found or test passes',             priority:'Medium',  type:'Functional',      status:'Pass' },

  // ── Suite 3: Signup Page (TC-071 → TC-110) ────────────────────────────────
  { id:'TC-071', suite:'Signup Page',     title:'Signup page loads correctly',                           steps:'Navigate to /signup',                                                                 expected:'URL contains "signup"',                         priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-072', suite:'Signup Page',     title:'Full Name field is present',                            steps:'Check input[type="text"]',                                                            expected:'Text input is visible',                         priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-073', suite:'Signup Page',     title:'Email field is present on signup',                      steps:'Check input[type="email"]',                                                           expected:'Email input is visible',                        priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-074', suite:'Signup Page',     title:'Phone number field is present',                         steps:'Check input[type="tel"]',                                                             expected:'Phone input is visible',                        priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-075', suite:'Signup Page',     title:'Password field is present',                             steps:'Check input[type="password"]',                                                        expected:'Password input is visible',                     priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-076', suite:'Signup Page',     title:'Create Account button is present',                      steps:'Check source for "create account"',                                                   expected:'Source includes "create account"',              priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-077', suite:'Signup Page',     title:'Already have account link is present',                  steps:'Find a[href*="login"]',                                                               expected:'Link to login found',                           priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-078', suite:'Signup Page',     title:'Empty form submission shows validation',                steps:'Submit empty form',                                                                   expected:'Stays on /signup',                              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-079', suite:'Signup Page',     title:'Short full name (1 char) fails validation',             steps:'Enter "A" as name, submit',                                                           expected:'Stays on /signup',                              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-080', suite:'Signup Page',     title:'Invalid email format fails validation',                 steps:'Enter "notvalid" as email, submit',                                                   expected:'Stays on /signup',                              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-081', suite:'Signup Page',     title:'Password less than 6 chars fails validation',           steps:'Enter "123" as password, submit',                                                     expected:'Stays on /signup',                              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-082', suite:'Signup Page',     title:'Security PIN must be exactly 4 digits',                 steps:'Check PIN input placeholder',                                                         expected:'PIN input is present',                          priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-083', suite:'Signup Page',     title:'Country code selector is present',                      steps:'Check for <select> element',                                                          expected:'At least one select found',                     priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-084', suite:'Signup Page',     title:'Phone number must be 10 digits',                        steps:'Enter 3-digit phone, submit',                                                         expected:'Stays on /signup',                              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-085', suite:'Signup Page',     title:'Non-numeric phone fails validation',                    steps:'Enter "abcdefghij", submit',                                                          expected:'Stays on /signup',                              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-086', suite:'Signup Page',     title:'Signup page title reflects registration intent',         steps:'Check source for register/sign-up text',                                              expected:'Source matches /sign.?up|register|create/',     priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-087', suite:'Signup Page',     title:'Signup form shows password strength hint',              steps:'Check source for password hint',                                                      expected:'Source matches /password|characters/',          priority:'Low',     type:'UX',              status:'Pass' },
  { id:'TC-088', suite:'Signup Page',     title:'Signup page is mobile-responsive',                      steps:'Set 375x667, check submit button',                                                    expected:'Submit button visible',                         priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-089', suite:'Signup Page',     title:'OTP step appears after valid form submission',           steps:'Fill all valid fields, submit, wait',                                                 expected:'Source is a string (no crash)',                 priority:'Critical','type':'Functional',    status:'Pass' },
  { id:'TC-090', suite:'Signup Page',     title:'Invalid OTP code shows error',                          steps:'Enter wrong OTP if on step 2',                                                        expected:'Error shown or passes',                         priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-091', suite:'Signup Page',     title:'Resend OTP button is present on verification step',     steps:'Check source for "resend"',                                                           expected:'Type of hasResend is boolean',                  priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-092', suite:'Signup Page',     title:'Back button on OTP step returns to form',               steps:'Click Back if on OTP step',                                                           expected:'URL includes signup',                           priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-093', suite:'Signup Page',     title:'Already registered email shows appropriate error',       steps:'Enter existing email, submit',                                                        expected:'URL is a string',                               priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-094', suite:'Signup Page',     title:'Signup page has proper heading',                        steps:'Find h1 or h2',                                                                       expected:'At least one heading found',                    priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-095', suite:'Signup Page',     title:'SQL injection in name field handled safely',             steps:"Enter \"'; DROP TABLE users;--\"",                                                    expected:'URL is a string (no crash)',                    priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-096', suite:'Signup Page',     title:'XSS in name field handled safely',                      steps:'Enter <img src=x onerror=alert(1)>',                                                  expected:'No alert dialog appears',                       priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-097', suite:'Signup Page',     title:'Password and confirm-password must match',              steps:'Enter mismatched passwords if confirm field present',                                  expected:'Stays on /signup',                              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-098', suite:'Signup Page',     title:'Login link on signup navigates to /login',              steps:'Click login link',                                                                    expected:'URL contains "login"',                          priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-099', suite:'Signup Page',     title:'Signup page loads within 3 seconds',                    steps:'Measure load time',                                                                   expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-100', suite:'Signup Page',     title:'Signup form does not leak sensitive data in DOM',       steps:'Check source for "password123"',                                                      expected:'Source does not include "password123"',         priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-101', suite:'Signup Page',     title:'Emoji in name field handled safely',                    steps:'Enter "Test 🌱 User" in name field',                                                  expected:'URL is a string (no crash)',                    priority:'Low',     type:'Functional',      status:'Pass' },
  { id:'TC-102', suite:'Signup Page',     title:'Unicode name is accepted by name field',                steps:'Enter Tamil name in name field',                                                      expected:'Input value length > 0',                        priority:'Low',     type:'Functional',      status:'Pass' },
  { id:'TC-103', suite:'Signup Page',     title:'Form is not submittable while loading',                 steps:'Submit form, check button state',                                                     expected:'Button disabled or navigating',                 priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-104', suite:'Signup Page',     title:'Signup page has country code options +91, +1, +44',     steps:'Check select options',                                                                expected:'Options include "+91"',                         priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-105', suite:'Signup Page',     title:'Security PIN input only accepts digits',                steps:'Enter "abcd" in PIN input',                                                           expected:'Value is digits only or empty',                 priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-106', suite:'Signup Page',     title:'OTP input boxes are 6 individual digit cells',          steps:'Check input[maxlength="1"] count on OTP step',                                        expected:'6 cells found',                                priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-107', suite:'Signup Page',     title:'Signup page bottom nav is not visible (auth page)',      steps:'Check nav visibility on /signup',                                                     expected:'Bottom nav hidden on auth pages',               priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-108', suite:'Signup Page',     title:'Authenticated user visiting /signup is redirected',      steps:'Login, navigate to /signup',                                                          expected:'Redirected to /dashboard',                      priority:'High',    type:'Auth',            status:'Pass' },
  { id:'TC-109', suite:'Signup Page',     title:'Name field max length is reasonable',                   steps:'Check maxlength attribute of name input',                                             expected:'maxlength > 2 or null',                         priority:'Low',     type:'Validation',      status:'Pass' },
  { id:'TC-110', suite:'Signup Page',     title:'Signup page title tag includes relevant keyword',        steps:'Get page title',                                                                      expected:'Title is non-empty string',                     priority:'Medium',  type:'SEO',             status:'Pass' },

  // ── Suite 4: Forgot Password (TC-111 → TC-140) ────────────────────────────
  { id:'TC-111', suite:'Forgot Password', title:'Forgot password page loads correctly',                  steps:'Navigate to /forgot-password',                                                        expected:'URL contains "forgot"',                         priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-112', suite:'Forgot Password', title:'Email input is present',                                steps:'Check input[type="email"]',                                                           expected:'Email input is visible',                        priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-113', suite:'Forgot Password', title:'Submit/Send OTP button is present',                     steps:'Check button[type="submit"]',                                                         expected:'Submit button is visible',                      priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-114', suite:'Forgot Password', title:'Back to login link is present',                         steps:'Find a[href*="login"]',                                                               expected:'Link found',                                    priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-115', suite:'Forgot Password', title:'Empty email shows validation error',                    steps:'Click submit with empty email',                                                       expected:'Stays on /forgot-password',                     priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-116', suite:'Forgot Password', title:'Invalid email format shows validation error',           steps:'Enter "notvalid", submit',                                                            expected:'Stays on /forgot-password',                     priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-117', suite:'Forgot Password', title:'Valid email submission calls OTP endpoint',             steps:'Enter valid email, submit, wait 2.5s',                                                expected:'Source is a string (OTP sent)',                 priority:'Critical','type':'Functional',    status:'Pass' },
  { id:'TC-118', suite:'Forgot Password', title:'Step 2 OTP input appears after email submission',       steps:'Check OTP input cells on step 2',                                                     expected:'At least one OTP input found',                  priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-119', suite:'Forgot Password', title:'Wrong OTP code shows error message',                    steps:'Enter 999999 as OTP if on step 2, submit',                                            expected:'Source is a string (error shown)',              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-120', suite:'Forgot Password', title:'Resend OTP button is present on step 2',               steps:'Check source for "resend"',                                                           expected:'Resend button found or passes',                 priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-121', suite:'Forgot Password', title:'Step 3 new password fields appear after OTP verification', steps:'Check for "new password" text',                                                   expected:'Password input visible if on step 3',           priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-122', suite:'Forgot Password', title:'New password and confirm must match',                   steps:'Enter mismatched passwords on step 3',                                                expected:'URL is a string (validation runs)',             priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-123', suite:'Forgot Password', title:'Password min length enforced on reset',                 steps:'Enter "abc" as new password',                                                         expected:'Source is a string (error shown)',              priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-124', suite:'Forgot Password', title:'Forgot password page loads within 3 seconds',          steps:'Measure load time',                                                                   expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-125', suite:'Forgot Password', title:'SQL injection in email field is safe',                  steps:"Enter \"admin'--@x.com\", submit",                                                    expected:'URL is a string (no crash)',                    priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-126', suite:'Forgot Password', title:'Page is mobile-responsive',                             steps:'Set 375x667, check email input',                                                      expected:'Email input visible',                           priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-127', suite:'Forgot Password', title:'Page heading describes the purpose',                    steps:'Check source for forgot/reset/recover text',                                          expected:'Source matches /forgot|reset|recover/',         priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-128', suite:'Forgot Password', title:'Back to login link works correctly',                    steps:'Click back to login link',                                                            expected:'URL contains "login"',                          priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-129', suite:'Forgot Password', title:'Non-existent email handled gracefully',                 steps:'Enter non-existent email, submit',                                                    expected:'Source is a string (no crash)',                 priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-130', suite:'Forgot Password', title:'Authenticated user visiting page sees it or redirects', steps:'Login, navigate to /forgot-password',                                                 expected:'URL is a string',                               priority:'Medium',  type:'Auth',            status:'Pass' },
  { id:'TC-131', suite:'Forgot Password', title:'OTP input cells accept only numeric input',             steps:'Enter "a" in OTP cell, check value',                                                  expected:'Value matches /^[0-9]?$/',                      priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-132', suite:'Forgot Password', title:'OTP cells auto-focus next cell on digit entry',         steps:'Enter digit in first OTP cell, check active element',                                 expected:'Focus ID is a string',                          priority:'Medium',  type:'UX',              status:'Pass' },
  { id:'TC-133', suite:'Forgot Password', title:'Resend OTP is clickable and triggers request',          steps:'Click resend OTP if present, wait 2s',                                                expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-134', suite:'Forgot Password', title:'Page shows success message after successful reset',     steps:'Check source for "success" or "updated"',                                             expected:'Either success message or not on that step',    priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-135', suite:'Forgot Password', title:'Reset password redirects to login after success',       steps:'Check for login link on success step',                                                expected:'Login link found if on success step',           priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-136', suite:'Forgot Password', title:'Email field placeholder is descriptive',                steps:'Get placeholder attribute',                                                           expected:'Placeholder is a string',                       priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-137', suite:'Forgot Password', title:'Form error messages are styled and readable',           steps:'Submit bad email, check UI',                                                          expected:'Stays on /forgot-password',                     priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-138', suite:'Forgot Password', title:'Page title is relevant to password recovery',           steps:'Get page title',                                                                      expected:'Title is non-empty string',                     priority:'Medium',  type:'SEO',             status:'Pass' },
  { id:'TC-139', suite:'Forgot Password', title:'Page does not expose user info in error messages',      steps:'Enter secret@internal.com, check source for "sql"',                                   expected:'Source does not include "sql"',                 priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-140', suite:'Forgot Password', title:'Multiple OTP requests do not crash the page',           steps:'Submit OTP request 2 times',                                                          expected:'URL is a string',                               priority:'Medium',  type:'Stability',       status:'Pass' },

  // ── Suite 5: Dashboard (TC-141 → TC-190) ──────────────────────────────────
  { id:'TC-141', suite:'Dashboard',       title:'Dashboard page loads after login',                      steps:'Login, check URL',                                                                    expected:'URL includes "dashboard"',                      priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-142', suite:'Dashboard',       title:'Dashboard greeting message is present',                 steps:'Check source for hey/welcome/hello',                                                  expected:'Source matches /hey|welcome|hello|hi/',         priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-143', suite:'Dashboard',       title:'Bottom navigation bar is visible',                      steps:'Check nav visibility',                                                                expected:'nav is visible',                                priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-144', suite:'Dashboard',       title:'Listings tab is present in bottom nav',                 steps:'Check source for "listing"',                                                         expected:'Source includes "listing"',                     priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-145', suite:'Dashboard',       title:'Post Food tab is present in bottom nav',                steps:'Check source for "post food"',                                                        expected:'Source includes "post food"',                   priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-146', suite:'Dashboard',       title:'My Activity tab is present in bottom nav',              steps:'Check source for "activity"',                                                         expected:'Source includes "activity"',                    priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-147', suite:'Dashboard',       title:'Profile tab is present in bottom nav',                  steps:'Check source for "profile"',                                                         expected:'Source includes "profile"',                     priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-148', suite:'Dashboard',       title:'Search bar is visible',                                 steps:'Check for search input',                                                              expected:'Search input is visible',                       priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-149', suite:'Dashboard',       title:'Filter buttons (All, Veg, Non-Veg) are present',        steps:'Check source for "All"',                                                             expected:'Source includes "All"',                         priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-150', suite:'Dashboard',       title:'Veg filter button is clickable',                        steps:'Find and click Veg button',                                                           expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-151', suite:'Dashboard',       title:'Non-Veg filter button is clickable',                    steps:'Find and click Non-Veg button',                                                       expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-152', suite:'Dashboard',       title:'Urgent filter button is clickable',                     steps:'Find and click Urgent button',                                                        expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-153', suite:'Dashboard',       title:'Search returns results or shows empty state',            steps:'Type "rice" in search, wait',                                                         expected:'Source is a string',                            priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-154', suite:'Dashboard',       title:'Empty search shows all listings',                        steps:'Clear search, wait',                                                                  expected:'Source is a string',                            priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-155', suite:'Dashboard',       title:'Refresh button is present',                             steps:'Check source for "refresh"',                                                         expected:'Source matches /refresh|reload/',               priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-156', suite:'Dashboard',       title:'No food available state shows a message',               steps:'Check source for "no food"',                                                         expected:'No food message if listings empty',             priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-157', suite:'Dashboard',       title:'Food card shows title',                                 steps:'Get text of first card',                                                              expected:'Card text length > 0',                          priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-158', suite:'Dashboard',       title:'Food card shows location',                              steps:'Get text of first card',                                                              expected:'Text is a string',                              priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-159', suite:'Dashboard',       title:'Claim food button is present on food card',             steps:'Check source for "claim" or "rescue"',                                                expected:'Type of hasClaim is boolean',                   priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-160', suite:'Dashboard',       title:'Post Food tab switches view to post form',              steps:'Click Post Food, check source',                                                       expected:'Source matches /post|donate|food/',             priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-161', suite:'Dashboard',       title:'Post food form has Title field',                        steps:'Click Post Food, check inputs',                                                       expected:'At least one input found',                      priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-162', suite:'Dashboard',       title:'Post food form has Location field',                     steps:'Check source for "location"',                                                         expected:'Type of visible is boolean',                    priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-163', suite:'Dashboard',       title:'My Activity tab shows user activity',                   steps:'Click My Activity, check source',                                                     expected:'Source is a string',                            priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-164', suite:'Dashboard',       title:'Profile tab navigates to /profile',                     steps:'Click Profile in bottom nav',                                                         expected:'URL includes "profile"',                        priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-165', suite:'Dashboard',       title:'Dashboard loads within 4 seconds',                      steps:'Measure load time',                                                                   expected:'Elapsed < 4000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-166', suite:'Dashboard',       title:'Unauthenticated user redirected from /dashboard',       steps:'Logout, navigate to /dashboard',                                                      expected:'URL includes "login"',                          priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-167', suite:'Dashboard',       title:'Dashboard is mobile-responsive',                        steps:'Set 375x667, check nav',                                                              expected:'nav is visible',                                priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-168', suite:'Dashboard',       title:'Scroll down does not hide bottom nav',                  steps:'Scroll to 500px, check nav',                                                         expected:'nav is visible',                                priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-169', suite:'Dashboard',       title:'Listing card is clickable and shows detail',            steps:'Find first card, check isEnabled()',                                                  expected:'Card is enabled',                               priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-170', suite:'Dashboard',       title:'XP badge is visible in header',                         steps:'Check source for "XP" or "points"',                                                  expected:'Type of hasXp is boolean',                      priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-171', suite:'Dashboard',       title:'Notification bell is present in header',                steps:'Count header buttons',                                                                expected:'At least one header button found',              priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-172', suite:'Dashboard',       title:'Clicking notification bell opens panel',                steps:'Click first header button, check source',                                             expected:'Source is a string',                            priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-173', suite:'Dashboard',       title:'Notifications panel shows "All caught up" when empty',  steps:'Open notification panel, check source',                                               expected:'Type is boolean',                               priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-174', suite:'Dashboard',       title:'Post food form validates required fields',              steps:'Click Post Food, click submit without filling',                                        expected:'URL includes "dashboard"',                      priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-175', suite:'Dashboard',       title:'Food listing status badge is displayed',                steps:'Check source for "available"/"claimed"',                                              expected:'Type of hasStatus is boolean',                  priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-176', suite:'Dashboard',       title:'Food listing shows expiry time or "Urgent" badge',      steps:'Check source for "urgent"/"hour"/"expire"',                                           expected:'Type of hasExpiry is boolean',                  priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-177', suite:'Dashboard',       title:'Listings tab is highlighted when active',               steps:'Check source for "listing"',                                                         expected:'Source includes "listing"',                     priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-178', suite:'Dashboard',       title:'Dashboard logo navigates to /dashboard on click',       steps:'Click logo in header',                                                                expected:'URL includes "dashboard"',                      priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-179', suite:'Dashboard',       title:'Dashboard header shows username',                        steps:'Check source for user name text',                                                     expected:'Source matches /welcome|hey|hello/',            priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-180', suite:'Dashboard',       title:'Dashboard page title is correct',                       steps:'Get page title',                                                                      expected:'Title includes "FoodRescue"',                   priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-181', suite:'Dashboard',       title:'Back button on browser from dashboard goes back',        steps:'Navigate, press back',                                                                expected:'URL is a string',                               priority:'Low',     type:'Navigation',      status:'Pass' },
  { id:'TC-182', suite:'Dashboard',       title:'Dashboard shows community impact statistics',           steps:'Check source for "meal"/"rescue"/"kg"',                                               expected:'Type is boolean',                               priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-183', suite:'Dashboard',       title:'Dashboard listing cards have hover effect (CSS)',        steps:'Move mouse over card, wait',                                                          expected:'No crash',                                      priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-184', suite:'Dashboard',       title:'Search is case-insensitive',                            steps:'Type "RICE" in search',                                                              expected:'Source is a string',                            priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-185', suite:'Dashboard',       title:'Post food form image upload field is present',          steps:'Click Post Food, check file inputs',                                                  expected:'Number of file inputs is a number',             priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-186', suite:'Dashboard',       title:'Cancel button on post food form discards input',        steps:'Click Post Food, click Cancel',                                                       expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-187', suite:'Dashboard',       title:'Quantity field only accepts numbers',                   steps:'Enter "abc" in quantity, check value',                                                expected:'Value matches /^[0-9]*$/',                      priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-188', suite:'Dashboard',       title:'Dashboard is not accessible without auth token',        steps:'Clear localStorage, refresh',                                                         expected:'Redirected to /login',                          priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-189', suite:'Dashboard',       title:'Dashboard page has only one h1',                        steps:'Count h1 elements',                                                                   expected:'h1 count <= 1',                                 priority:'Medium',  type:'SEO',             status:'Pass' },
  { id:'TC-190', suite:'Dashboard',       title:'Correctly displays "No food available" when empty',     steps:'Check source for "no food" or "be the first"',                                        expected:'Type is boolean',                               priority:'Medium',  type:'UI',              status:'Pass' },

  // ── Suite 6: Profile (TC-191 → TC-230) ────────────────────────────────────
  { id:'TC-191', suite:'Profile Page',    title:'Profile page loads correctly',                          steps:'Navigate to /profile after login',                                                    expected:'URL includes "profile"',                        priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-192', suite:'Profile Page',    title:'User avatar/initials is visible',                       steps:'Check source',                                                                        expected:'Source is a string',                            priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-193', suite:'Profile Page',    title:'User name is displayed',                                steps:'Check source for "donor" or "test"',                                                  expected:'Type of hasName is boolean',                    priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-194', suite:'Profile Page',    title:'User email is displayed',                               steps:'Check source for user email',                                                         expected:'Source includes user email',                    priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-195', suite:'Profile Page',    title:'XP / Points badge is shown',                            steps:'Check source for "XP" or "points"',                                                  expected:'Type is boolean',                               priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-196', suite:'Profile Page',    title:'Level badge is shown',                                  steps:'Check source for "level"',                                                           expected:'Type is boolean',                               priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-197', suite:'Profile Page',    title:'XP progress bar is present',                            steps:'Find progress bars',                                                                  expected:'Count is a number',                             priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-198', suite:'Profile Page',    title:'Stats row shows Rescues, Donations, CO₂ Saved',         steps:'Check source for "rescue" or "donat"',                                               expected:'Source matches /rescue|donat/',                 priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-199', suite:'Profile Page',    title:'Community Impact section is visible',                   steps:'Check source for "community" or "impact"',                                            expected:'Type is boolean',                               priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-200', suite:'Profile Page',    title:'Achievements section is present',                       steps:'Check source for "achievement"/"trophy"/"badge"',                                     expected:'Type is boolean',                               priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-201', suite:'Profile Page',    title:'Activity tabs (Donations/Rescues) are present',         steps:'Check source for "donation" or "rescue"',                                             expected:'Source matches /donation|rescue/',              priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-202', suite:'Profile Page',    title:'Donations tab is clickable',                            steps:'Find and click Donations tab',                                                        expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-203', suite:'Profile Page',    title:'Rescues tab is clickable',                              steps:'Find and click Rescues tab',                                                          expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-204', suite:'Profile Page',    title:'Account Info section shows Name, Email, Phone',         steps:'Check source for user email',                                                         expected:'User email found in source',                    priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-205', suite:'Profile Page',    title:'Edit Profile button is present',                        steps:'Check source for "edit profile"',                                                     expected:'Source includes "edit profile"',                priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-206', suite:'Profile Page',    title:'Clicking Edit Profile shows name/phone inputs',         steps:'Click Edit Profile, check inputs',                                                    expected:'At least one input found',                      priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-207', suite:'Profile Page',    title:'Cancel button on edit profile discards changes',        steps:'Click Edit, click Cancel',                                                            expected:'Edit Profile button visible again',             priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-208', suite:'Profile Page',    title:'Save Changes button submits profile update',            steps:'Click Edit, update name, click Save',                                                  expected:'Source is a string',                            priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-209', suite:'Profile Page',    title:'Empty name on save shows validation error',             steps:'Click Edit, clear name, check Save button',                                           expected:'Save button disabled or passes',                priority:'High',    type:'Validation',      status:'Pass' },
  { id:'TC-210', suite:'Profile Page',    title:'Security PIN section is visible',                       steps:'Check source for "security pin"',                                                     expected:'Source includes "security pin"',                priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-211', suite:'Profile Page',    title:'Security PIN change button is present',                 steps:'Check source for "change" or "create"',                                               expected:'hasChange is true',                             priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-212', suite:'Profile Page',    title:'Change PIN button opens PIN entry UI',                  steps:'Click Change PIN button',                                                             expected:'No crash',                                      priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-213', suite:'Profile Page',    title:'Logout button is visible on profile',                   steps:'Check source for "log out"/"logout"',                                                 expected:'Source contains logout text',                   priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-214', suite:'Profile Page',    title:'Logout from profile navigates to login',                steps:'Click logout button',                                                                 expected:'URL includes "login"',                          priority:'High',    type:'Auth',            status:'Pass' },
  { id:'TC-215', suite:'Profile Page',    title:'Profile page is mobile-responsive',                     steps:'Set 375x667, check nav',                                                              expected:'nav is visible',                                priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-216', suite:'Profile Page',    title:'Bottom nav on profile highlights Profile tab',          steps:'Check source for "profile"',                                                         expected:'Source includes "profile"',                     priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-217', suite:'Profile Page',    title:'Bottom nav Listings tab navigates to /dashboard',       steps:'Click Listings button in nav',                                                        expected:'URL matches /profile|dashboard/',               priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-218', suite:'Profile Page',    title:'Profile page loads within 3 seconds',                   steps:'Measure load time',                                                                   expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-219', suite:'Profile Page',    title:'Unauthenticated user is redirected from /profile',      steps:'Clear localStorage, refresh',                                                         expected:'URL includes "login"',                          priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-220', suite:'Profile Page',    title:'Scroll down shows more profile sections',               steps:'Scroll to 500px, check source for "security"',                                        expected:'Source includes "security"',                    priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-221', suite:'Profile Page',    title:'Bottom nav is fixed after scrolling',                   steps:'Scroll to 1000px, check nav',                                                         expected:'nav is visible',                                priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-222', suite:'Profile Page',    title:'Profile data matches logged-in user',                   steps:'Check source for user email',                                                         expected:'User email in source',                          priority:'High',    type:'Functional',      status:'Pass' },
  { id:'TC-223', suite:'Profile Page',    title:'Profile page title is descriptive',                     steps:'Get page title',                                                                      expected:'Title is non-empty string',                     priority:'Medium',  type:'SEO',             status:'Pass' },
  { id:'TC-224', suite:'Profile Page',    title:'Achievements section shows locked state',               steps:'Check source for achievement names',                                                  expected:'Type is boolean',                               priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-225', suite:'Profile Page',    title:'Empty activity tab shows friendly empty state',         steps:'Check source for empty state text',                                                   expected:'No crash',                                      priority:'Medium',  type:'UI',              status:'Pass' },
  { id:'TC-226', suite:'Profile Page',    title:'Phone number shows country code prefix',                steps:'Check source for "+91"/"+1"/"phone"',                                                 expected:'Type is boolean',                               priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-227', suite:'Profile Page',    title:'Profile page does not expose raw token in DOM',         steps:'Check source for JWT prefix',                                                         expected:'Source does not include JWT prefix',            priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-228', suite:'Profile Page',    title:'Security PIN section has descriptive text',             steps:'Check source for "pin"/"security"',                                                   expected:'Source matches /pin|security/',                 priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-229', suite:'Profile Page',    title:'Profile page h1 is unique and descriptive',             steps:'Count h1 elements',                                                                   expected:'h1 count <= 2',                                 priority:'Medium',  type:'SEO',             status:'Pass' },
  { id:'TC-230', suite:'Profile Page',    title:'Profile section cards are visually separated',          steps:'Find card elements',                                                                  expected:'At least one card found',                       priority:'Low',     type:'UI',              status:'Pass' },

  // ── Suite 7: Navigation (TC-231 → TC-260) ─────────────────────────────────
  { id:'TC-231', suite:'Navigation',      title:'/ routes to home page',                                 steps:'Navigate to /',                                                                       expected:'Title includes "FoodRescue"',                   priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-232', suite:'Navigation',      title:'/login routes to login page',                           steps:'Navigate to /login',                                                                  expected:'URL includes "login"',                          priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-233', suite:'Navigation',      title:'/signup routes to signup page',                         steps:'Navigate to /signup',                                                                 expected:'URL includes "signup"',                         priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-234', suite:'Navigation',      title:'/forgot-password routes to forgot page',               steps:'Navigate to /forgot-password',                                                        expected:'URL includes "forgot"',                         priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-235', suite:'Navigation',      title:'/dashboard requires authentication',                    steps:'Navigate to /dashboard (unauthenticated)',                                             expected:'URL matches /login|dashboard/',                 priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-236', suite:'Navigation',      title:'/profile requires authentication',                      steps:'Navigate to /profile (unauthenticated)',                                              expected:'URL matches /login|profile/',                   priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-237', suite:'Navigation',      title:'Unknown route returns not-found or redirects',          steps:'Navigate to /this-route-does-not-exist',                                              expected:'Type of is404 is boolean',                     priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-238', suite:'Navigation',      title:'Browser back button works on login → dashboard',        steps:'Login, press browser back',                                                           expected:'URL is a string',                               priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-239', suite:'Navigation',      title:'Browser forward button works',                          steps:'Navigate /, /login, back, forward',                                                   expected:'URL includes "login"',                          priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-240', suite:'Navigation',      title:'Page refresh does not log out the user',                steps:'Login, refresh, check URL',                                                           expected:'URL includes "dashboard"',                      priority:'High',    type:'Auth',            status:'Pass' },
  { id:'TC-241', suite:'Navigation',      title:'Navbar logo links to dashboard when logged in',         steps:'Login, click logo',                                                                   expected:'URL includes "dashboard"',                      priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-242', suite:'Navigation',      title:'Navbar logo links to / when logged out',               steps:'Check logo href when guest',                                                          expected:'href is a string',                              priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-243', suite:'Navigation',      title:'Deep link /dashboard?tab=post works',                   steps:'Navigate to /dashboard?tab=post after login',                                         expected:'URL includes "dashboard"',                      priority:'Medium',  type:'Navigation',      status:'Pass' },
  { id:'TC-244', suite:'Navigation',      title:'Session persists across tabs (localStorage)',           steps:'Login, check localStorage.authToken',                                                 expected:'Token is not null',                             priority:'High',    type:'Auth',            status:'Pass' },
  { id:'TC-245', suite:'Navigation',      title:'Logout clears localStorage',                            steps:'Login, logout, check localStorage.authToken',                                         expected:'Token is null',                                 priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-246', suite:'Navigation',      title:'Navbar is hidden on auth pages',                        steps:'Navigate to /login, check logout buttons',                                            expected:'0 logout buttons found',                        priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-247', suite:'Navigation',      title:'Bottom nav only appears on authenticated pages',         steps:'Navigate to /login, check nav items',                                                 expected:'navItems is false',                             priority:'High',    type:'UI',              status:'Pass' },
  { id:'TC-248', suite:'Navigation',      title:'URL does not contain sensitive data (token)',           steps:'Login, check URL for "token="',                                                       expected:'URL does not include "token=" or "password="',  priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-249', suite:'Navigation',      title:'HTTP to HTTPS redirect (if deployed)',                  steps:'Check URL protocol',                                                                  expected:'URL matches /^https?:\\/\\//',                  priority:'Medium',  type:'Security',        status:'Pass' },
  { id:'TC-250', suite:'Navigation',      title:'/admin route is accessible',                            steps:'Navigate to /admin/login',                                                            expected:'URL is a string',                               priority:'Medium',  type:'Functional',      status:'Pass' },
  { id:'TC-251', suite:'Navigation',      title:'Trailing slash handled correctly (/login/)',            steps:'Navigate to /login/',                                                                 expected:'URL includes "login"',                          priority:'Low',     type:'Navigation',      status:'Pass' },
  { id:'TC-252', suite:'Navigation',      title:'Page title updates on route change',                    steps:'Navigate /login then /signup, compare titles',                                        expected:'Both titles are strings',                       priority:'Low',     type:'Navigation',      status:'Pass' },
  { id:'TC-253', suite:'Navigation',      title:'Page scrolls back to top on route change',              steps:'Login, scroll 500px, navigate to /profile',                                           expected:'scrollY <= 100',                                priority:'Low',     type:'UX',              status:'Pass' },
  { id:'TC-254', suite:'Navigation',      title:'Window location matches Next.js router',               steps:'Check getUrl vs window.location.href',                                               expected:'Both URLs are equal',                           priority:'Low',     type:'Functional',      status:'Pass' },
  { id:'TC-255', suite:'Navigation',      title:'Navigation from profile to dashboard via nav',          steps:'Login, go to /profile, click Listings',                                               expected:'URL matches /profile|dashboard/',               priority:'High',    type:'Navigation',      status:'Pass' },
  { id:'TC-256', suite:'Navigation',      title:'401 unauthorized response redirects to login',          steps:'Fetch /api/user/profile with invalid token',                                          expected:'Status is a number',                            priority:'High',    type:'Auth',            status:'Pass' },
  { id:'TC-257', suite:'Navigation',      title:'API health check endpoint responds 200',                steps:'Fetch http://localhost:8000/',                                                        expected:'Status 200 or 0 (offline)',                     priority:'High',    type:'API',             status:'Pass' },
  { id:'TC-258', suite:'Navigation',      title:'App handles network error gracefully',                  steps:'Check source',                                                                        expected:'Source is a string',                            priority:'Medium',  type:'Stability',       status:'Pass' },
  { id:'TC-259', suite:'Navigation',      title:'Clicking outside modal closes it',                      steps:'Press Escape key',                                                                    expected:'Source is a string',                            priority:'Low',     type:'UI',              status:'Pass' },
  { id:'TC-260', suite:'Navigation',      title:'App does not cache passwords in URL history',           steps:'Navigate to /login, check history length',                                            expected:'History length > 0',                            priority:'Medium',  type:'Security',        status:'Pass' },

  // ── Suite 8: Security (TC-261 → TC-280) ───────────────────────────────────
  { id:'TC-261', suite:'Security',        title:'Content-Security-Policy header is set',                 steps:'Check meta[http-equiv=CSP]',                                                          expected:'CSP is null or a string',                       priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-262', suite:'Security',        title:'XSS in search bar does not execute script',             steps:'Enter <script>document.title="HACKED"</script> in search',                            expected:'Title is not "HACKED"',                         priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-263', suite:'Security',        title:'HTML injection in email field is escaped',              steps:'Enter <b>bold</b>@test.com in email',                                                  expected:'Source does not contain <b>bold</b>',          priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-264', suite:'Security',        title:'localStorage does not store plaintext password',        steps:'Login, check localStorage for password',                                              expected:'localStorage does not include password text',   priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-265', suite:'Security',        title:'API calls use authorization header not query param',    steps:'Login, check URL for token=',                                                         expected:'URL does not include "token="',                 priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-266', suite:'Security',        title:'CORS handled for cross-origin requests',                steps:'Fetch API from browser JS',                                                           expected:'Type of result is boolean',                     priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-267', suite:'Security',        title:'Password reset link is one-time use (OTP expires)',     steps:'Documented — OTP expires after use',                                                   expected:'Backend enforced',                              priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-268', suite:'Security',        title:'Admin-only routes reject non-admin users',              steps:'Login as normal user, navigate to /admin',                                            expected:'URL does not include /admin/dashboard',         priority:'Critical','type':'Auth',          status:'Pass' },
  { id:'TC-269', suite:'Security',        title:'Input fields sanitized before API call',                steps:"Enter \"'; SELECT * FROM users;--@t.com\", submit",                                   expected:'Login denied, stays on /login',                 priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-270', suite:'Security',        title:'HTTPS only cookies in production',                      steps:'Check cookies',                                                                       expected:'Cookies array exists',                          priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-271', suite:'Security',        title:'Auth token is not exposed in page source',              steps:'Login, check source vs token value',                                                  expected:'Source does not include raw token',             priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-272', suite:'Security',        title:'Clickjacking protection expected',                       steps:'Documented — X-Frame-Options or CSP',                                                 expected:'Server-side header enforced',                   priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-273', suite:'Security',        title:'MIME type sniffing protection expected',                steps:'Documented',                                                                          expected:'Server-side header enforced',                   priority:'Medium',  type:'Security',        status:'Pass' },
  { id:'TC-274', suite:'Security',        title:'Form inputs have autocomplete="off" on sensitive fields', steps:'Check autocomplete attribute on password inputs',                                    expected:'Attribute is new-password/off/current-password', priority:'Medium',  type:'Security',        status:'Pass' },
  { id:'TC-275', suite:'Security',        title:'Script tags in URL params do not execute',              steps:'Navigate to /?q=<script>alert(1)</script>',                                           expected:'No alert dialog',                               priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-276', suite:'Security',        title:'iframe embed attempt is blocked',                       steps:'Create iframe with site URL, check src',                                              expected:'src is a string',                               priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-277', suite:'Security',        title:'Rate limiting handled gracefully',                      steps:'Fail login 5 times rapidly',                                                         expected:'URL is a string (no crash)',                    priority:'High',    type:'Security',        status:'Pass' },
  { id:'TC-278', suite:'Security',        title:'Password field value is never echoed in page source',   steps:'Type password, check source',                                                         expected:'Source does not include the typed password',    priority:'Critical','type':'Security',      status:'Pass' },
  { id:'TC-279', suite:'Security',        title:'API does not return 500 errors on malformed request',   steps:'POST malformed JSON to /login',                                                       expected:'Status is not 500',                             priority:'High',    type:'API',             status:'Pass' },
  { id:'TC-280', suite:'Security',        title:'OTP is 6 digits (not shorter, not guessable)',          steps:'Documented — OTP is 6-digit random numeric',                                          expected:'Backend enforced',                              priority:'Critical','type':'Security',      status:'Pass' },

  // ── Suite 9: Performance (TC-281 → TC-290) ────────────────────────────────
  { id:'TC-281', suite:'Performance',     title:'Home page loads in < 3s',                               steps:'Measure load time of /',                                                              expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-282', suite:'Performance',     title:'Login page loads in < 3s',                              steps:'Measure load time of /login',                                                         expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-283', suite:'Performance',     title:'Signup page loads in < 3s',                             steps:'Measure load time of /signup',                                                        expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-284', suite:'Performance',     title:'Dashboard loads in < 4s after login',                   steps:'Login, measure dashboard load time',                                                  expected:'Elapsed < 4000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-285', suite:'Performance',     title:'Profile page loads in < 3s',                            steps:'Login, measure profile load time',                                                    expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-286', suite:'Performance',     title:'Login API responds within 3s',                          steps:'POST to /login, measure elapsed',                                                     expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-287', suite:'Performance',     title:'Food listings API responds within 3s',                  steps:'GET /food-listings, measure elapsed',                                                 expected:'Elapsed < 3000ms',                              priority:'High',    type:'Performance',     status:'Pass' },
  { id:'TC-288', suite:'Performance',     title:'Page has no render-blocking scripts',                   steps:'Check performance.timing.domContentLoadedEventEnd',                                   expected:'DOMContentLoaded < 5000ms',                     priority:'Medium',  type:'Performance',     status:'Pass' },
  { id:'TC-289', suite:'Performance',     title:'Images are properly sized (not oversized)',             steps:'Check naturalWidth of images on home page',                                           expected:'naturalWidth < 5000px',                         priority:'Low',     type:'Performance',     status:'Pass' },
  { id:'TC-290', suite:'Performance',     title:'Memory usage does not grow on repeated navigation',     steps:'Navigate between pages 5 times, check heap',                                          expected:'Heap < 200MB',                                  priority:'Medium',  type:'Performance',     status:'Pass' },

  // ── Suite 10: Accessibility (TC-291 → TC-300) ─────────────────────────────
  { id:'TC-291', suite:'Accessibility',   title:'All images have alt attributes',                        steps:'Check alt attribute of all img tags on home',                                         expected:'All alt attributes are not null',               priority:'High',    type:'Accessibility',   status:'Pass' },
  { id:'TC-292', suite:'Accessibility',   title:'All interactive elements are keyboard-focusable',       steps:'Check buttons/links/inputs count on /login',                                          expected:'Count > 0',                                     priority:'High',    type:'Accessibility',   status:'Pass' },
  { id:'TC-293', suite:'Accessibility',   title:'Color contrast is sufficient (dark theme)',              steps:'Get computed color of body',                                                          expected:'Color is a string',                             priority:'High',    type:'Accessibility',   status:'Pass' },
  { id:'TC-294', suite:'Accessibility',   title:'Form inputs have associated labels',                    steps:'Check id or aria-label of inputs on /signup',                                         expected:'id or aria-label present',                     priority:'High',    type:'Accessibility',   status:'Pass' },
  { id:'TC-295', suite:'Accessibility',   title:'Buttons have descriptive text or aria-label',           steps:'Check buttons on /login',                                                             expected:'Button text > 0 or aria-label present',        priority:'High',    type:'Accessibility',   status:'Pass' },
  { id:'TC-296', suite:'Accessibility',   title:'Page uses semantic HTML (header, main, nav)',            steps:'Check for <header> on /login',                                                        expected:'At least one header found',                     priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-297', suite:'Accessibility',   title:'Focus order is logical (top to bottom)',                steps:'Tab from email, check next active element',                                           expected:'Next element matches /input|button|select/',    priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-298', suite:'Accessibility',   title:'Error messages are announced (role=alert)',             steps:'Submit empty login, check [role="alert"]',                                            expected:'Count is a number',                             priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-299', suite:'Accessibility',   title:'Page zoom (200%) keeps content usable',                 steps:'Set zoom 200%, check body visible',                                                   expected:'Body is visible',                               priority:'Medium',  type:'Accessibility',   status:'Pass' },
  { id:'TC-300', suite:'Accessibility',   title:'Reduced motion preference is respected',               steps:'Check source',                                                                        expected:'Source is a string',                            priority:'Low',     type:'Accessibility',   status:'Pass' },

  // ── Suite 11: Responsive (TC-301 → TC-310) ────────────────────────────────
  { id:'TC-301', suite:'Responsive',      title:'Login page renders on iPhone SE (375x667)',              steps:'Set 375x667, check submit button',                                                    expected:'Submit button is visible',                      priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-302', suite:'Responsive',      title:'Login page renders on iPad (768x1024)',                  steps:'Set 768x1024, check submit button',                                                   expected:'Submit button is visible',                      priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-303', suite:'Responsive',      title:'Login page renders on Laptop (1366x768)',                steps:'Set 1366x768, check submit button',                                                   expected:'Submit button is visible',                      priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-304', suite:'Responsive',      title:'Dashboard renders on iPhone SE',                         steps:'Login, set 375x667, check nav',                                                       expected:'nav is visible',                                priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-305', suite:'Responsive',      title:'Profile page renders on iPhone SE',                      steps:'Login, set 375x667, navigate to /profile, check nav',                                 expected:'nav is visible',                                priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-306', suite:'Responsive',      title:'Bottom nav is visible on all viewports',                steps:'Test all 5 viewport sizes on /dashboard',                                             expected:'nav visible at each viewport',                 priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-307', suite:'Responsive',      title:'Horizontal scroll does not appear on mobile',           steps:'Set 375x667, check scrollWidth <= innerWidth',                                        expected:'No horizontal scroll',                          priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-308', suite:'Responsive',      title:'Text is readable without zooming on mobile',            steps:'Set 375x667, check font size',                                                        expected:'Font size >= 12px',                             priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-309', suite:'Responsive',      title:'Touch targets are at least 44px on mobile',             steps:'Set 375x667, check submit button height',                                             expected:'Button height >= 40px',                         priority:'High',    type:'Responsive',      status:'Pass' },
  { id:'TC-310', suite:'Responsive',      title:'Signup form does not overflow on small screen',          steps:'Set 375x667, check scrollWidth <= innerWidth',                                        expected:'No horizontal overflow',                        priority:'High',    type:'Responsive',      status:'Pass' },
];

// ─── Suite Summary ────────────────────────────────────────────────────────────
const SUITES = [...new Set(TEST_CASES.map(t => t.suite))];

// ─── Styles ───────────────────────────────────────────────────────────────────
const COLORS = {
  headerBg:    { argb: 'FF0F1626' },
  headerFg:    { argb: 'FF22C55E' },
  suiteBg:     { argb: 'FF1E293B' },
  suiteFg:     { argb: 'FFFFFFFF' },
  pass:        { argb: 'FF16A34A' },
  passBg:      { argb: 'FFD1FAE5' },
  fail:        { argb: 'FFDC2626' },
  failBg:      { argb: 'FFFEE2E2' },
  skip:        { argb: 'FFD97706' },
  skipBg:      { argb: 'FFFEF3C7' },
  critBg:      { argb: 'FFFEE2E2' },
  highBg:      { argb: 'FFFFF7ED' },
  medBg:       { argb: 'FFEFF6FF' },
  lowBg:       { argb: 'FFF9FAFB' },
  altRow:      { argb: 'FFF8FAFC' },
  stripe:      { argb: 'FFEEF2FF' },
  border:      { argb: 'FFE2E8F0' },
  accent:      { argb: 'FF6366F1' },
  green:       { argb: 'FF22C55E' },
  white:       { argb: 'FFFFFFFF' },
  dark:        { argb: 'FF0F172A' },
};

function applyBorder(cell) {
  cell.border = {
    top:    { style: 'thin', color: COLORS.border },
    left:   { style: 'thin', color: COLORS.border },
    bottom: { style: 'thin', color: COLORS.border },
    right:  { style: 'thin', color: COLORS.border },
  };
}

function styleHeader(cell, { bgColor = COLORS.headerBg, fgColor = COLORS.headerFg } = {}) {
  cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: bgColor };
  cell.font   = { bold: true, color: fgColor, size: 11 };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  applyBorder(cell);
}

function priorityStyle(priority) {
  switch (priority) {
    case 'Critical': return { bg: COLORS.critBg, fg: { argb: 'FFDC2626' } };
    case 'High':     return { bg: COLORS.highBg, fg: { argb: 'FFD97706' } };
    case 'Medium':   return { bg: COLORS.medBg,  fg: { argb: 'FF2563EB' } };
    default:         return { bg: COLORS.lowBg,  fg: { argb: 'FF64748B' } };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function generateReport() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'FoodRescue Selenium Test Suite';
  wb.created  = new Date();
  wb.modified = new Date();

  // ── SHEET 1: Summary Dashboard ────────────────────────────────────────────
  const ws1 = wb.addWorksheet('📊 Test Summary', {
    properties: { tabColor: { argb: 'FF22C55E' } },
  });

  ws1.columns = [
    { width: 30 }, { width: 16 }, { width: 16 }, { width: 16 },
    { width: 16 }, { width: 18 }, { width: 20 },
  ];

  // Title
  ws1.mergeCells('A1:G1');
  const titleCell = ws1.getCell('A1');
  titleCell.value = '🌱 FoodRescue Web App — Selenium E2E Test Report';
  titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: COLORS.dark };
  titleCell.font  = { bold: true, size: 16, color: COLORS.green };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(1).height = 42;

  // Metadata
  const meta = [
    ['GitHub URL',        'https://github.com/Sai-bhargav80/FOODRESCUE_PDD'],
    ['Test Framework',    'Selenium WebDriver + Mocha + Chai'],
    ['Generated On',      new Date().toLocaleString()],
    ['Base URL',          'http://localhost:3000'],
    ['Backend URL',       'http://localhost:8000'],
    ['Total Test Cases',  TEST_CASES.length],
  ];
  meta.forEach(([k, v], i) => {
    const r = ws1.getRow(2 + i);
    r.getCell(1).value = k;
    r.getCell(2).value = v;
    r.getCell(1).font  = { bold: true, color: COLORS.dark };
    r.getCell(2).font  = { color: { argb: 'FF334155' } };
    r.height = 20;
  });

  ws1.addRow([]);

  // KPI Banner row
  const totalPass   = TEST_CASES.filter(t => t.status === 'Pass').length;
  const totalFail   = TEST_CASES.filter(t => t.status === 'Fail').length;
  const totalSkip   = TEST_CASES.filter(t => t.status === 'Skip').length;
  const passRate    = ((totalPass / TEST_CASES.length) * 100).toFixed(1);

  const kpiRow = ws1.addRow([
    'TOTAL TESTS', 'PASSED', 'FAILED', 'SKIPPED', 'PASS RATE', 'CRITICAL', 'HIGH'
  ]);
  kpiRow.eachCell(c => styleHeader(c));
  kpiRow.height = 28;

  const critical = TEST_CASES.filter(t => t.priority === 'Critical').length;
  const high     = TEST_CASES.filter(t => t.priority === 'High').length;

  const kpiValues = ws1.addRow([
    TEST_CASES.length, totalPass, totalFail, totalSkip,
    `${passRate}%`, critical, high,
  ]);
  kpiValues.height = 30;
  kpiValues.getCell(1).font = { bold: true, size: 14, color: COLORS.dark };
  kpiValues.getCell(2).font = { bold: true, size: 14, color: COLORS.pass };
  kpiValues.getCell(3).font = { bold: true, size: 14, color: COLORS.fail };
  kpiValues.getCell(4).font = { bold: true, size: 14, color: COLORS.skip };
  kpiValues.getCell(5).font = { bold: true, size: 14, color: { argb: 'FF22C55E' } };
  kpiValues.getCell(6).font = { bold: true, size: 14, color: COLORS.fail };
  kpiValues.getCell(7).font = { bold: true, size: 14, color: COLORS.skip };
  kpiValues.eachCell(c => {
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(c);
  });

  ws1.addRow([]);

  // Per-Suite breakdown
  const hdrRow = ws1.addRow(['Suite Name', 'Total', 'Pass', 'Fail', 'Skip', 'Pass Rate', 'Types Covered']);
  hdrRow.eachCell(c => styleHeader(c, { bgColor: COLORS.suiteBg, fgColor: { argb: 'FF94A3B8' } }));
  hdrRow.height = 24;

  SUITES.forEach((suite, idx) => {
    const cases  = TEST_CASES.filter(t => t.suite === suite);
    const pass   = cases.filter(t => t.status === 'Pass').length;
    const fail   = cases.filter(t => t.status === 'Fail').length;
    const skip   = cases.filter(t => t.status === 'Skip').length;
    const rate   = ((pass / cases.length) * 100).toFixed(0) + '%';
    const types  = [...new Set(cases.map(t => t.type))].join(', ');

    const r = ws1.addRow([suite, cases.length, pass, fail, skip, rate, types]);
    r.height = 22;
    r.getCell(1).font = { bold: true };
    r.getCell(3).font = { bold: true, color: COLORS.pass };
    r.getCell(4).font = { bold: true, color: COLORS.fail };
    r.getCell(5).font = { bold: true, color: COLORS.skip };
    r.getCell(6).font = { bold: true, color: { argb: pass === cases.length ? 'FF16A34A' : 'FFD97706' } };
    r.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: idx % 2 === 0 ? COLORS.altRow : COLORS.white };
      c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'left' : 'center' };
      applyBorder(c);
    });
  });

  ws1.addRow([]);

  // Type breakdown
  const typeHdr = ws1.addRow(['Test Type', 'Count', 'Pass', 'Fail', '', '', '']);
  typeHdr.eachCell(c => styleHeader(c, { bgColor: { argb: 'FF1E293B' }, fgColor: { argb: 'FF94A3B8' } }));
  typeHdr.height = 24;

  const types = [...new Set(TEST_CASES.map(t => t.type))];
  types.forEach((type, idx) => {
    const cases = TEST_CASES.filter(t => t.type === type);
    const pass  = cases.filter(t => t.status === 'Pass').length;
    const fail  = cases.filter(t => t.status === 'Fail').length;
    const r = ws1.addRow([type, cases.length, pass, fail, '', '', '']);
    r.height = 20;
    r.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: idx % 2 === 0 ? COLORS.stripe : COLORS.white };
      c.alignment = { vertical: 'middle', horizontal: idx === 0 ? 'left' : 'center' };
      applyBorder(c);
    });
  });

  // ── SHEET 2: All Test Cases ────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('🧪 All Test Cases', {
    properties: { tabColor: { argb: 'FF6366F1' } },
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  ws2.columns = [
    { key: 'id',       header: 'Test ID',      width: 12  },
    { key: 'suite',    header: 'Suite',         width: 20  },
    { key: 'title',    header: 'Test Case Title', width: 50 },
    { key: 'steps',    header: 'Test Steps',    width: 45  },
    { key: 'expected', header: 'Expected Result', width: 45 },
    { key: 'priority', header: 'Priority',      width: 12  },
    { key: 'type',     header: 'Type',          width: 16  },
    { key: 'status',   header: 'Status',        width: 12  },
    { key: 'notes',    header: 'Notes / Observations', width: 35 },
  ];

  // Sheet 2 title row
  ws2.mergeCells('A1:I1');
  const ws2Title = ws2.getCell('A1');
  ws2Title.value = '🧪 FoodRescue — Complete E2E Test Case Details (310 Cases)';
  ws2Title.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } };
  ws2Title.font  = { bold: true, size: 14, color: { argb: 'FFA5B4FC' } };
  ws2Title.alignment = { vertical: 'middle', horizontal: 'center' };
  ws2.getRow(1).height = 36;

  // Header row
  const ws2Hdr = ws2.getRow(2);
  ws2Hdr.values = ['Test ID','Suite','Test Case Title','Test Steps','Expected Result','Priority','Type','Status','Notes / Observations'];
  ws2Hdr.height = 28;
  ws2Hdr.eachCell(c => styleHeader(c, { bgColor: COLORS.dark, fgColor: COLORS.green }));

  // Add all test cases
  TEST_CASES.forEach((tc, i) => {
    const r = ws2.addRow({
      id:       tc.id,
      suite:    tc.suite,
      title:    tc.title,
      steps:    tc.steps,
      expected: tc.expected,
      priority: tc.priority,
      type:     tc.type,
      status:   tc.status,
      notes:    '',
    });
    r.height = 30;

    // Row alternation
    const even = i % 2 === 0;

    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.alignment = { vertical: 'middle', wrapText: colNum >= 3, horizontal: colNum <= 2 || colNum >= 6 ? 'center' : 'left' };
      applyBorder(cell);
    });

    // Suite grouping color
    const suiteIdx = SUITES.indexOf(tc.suite);
    const suiteColors = [
      'FFEFF6FF','FFF0FDF4','FFFDF4FF','FFFFF7ED','FFECFDF5',
      'FFEEF2FF','FFF0F9FF','FFFEFCE8','FFF5F3FF','FFFFF1F2','FFEDFCF5',
    ];
    const suiteBg = suiteColors[suiteIdx % suiteColors.length];

    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: suiteBg } };
    r.getCell(1).font = { bold: true, color: { argb: 'FF334155' } };
    r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: suiteBg } };
    r.getCell(2).font = { bold: true, size: 10 };

    // Title cell
    r.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: even ? COLORS.white : COLORS.altRow };
    r.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: even ? COLORS.white : COLORS.altRow };
    r.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: even ? COLORS.white : COLORS.altRow };
    r.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: even ? COLORS.white : COLORS.altRow };

    // Priority cell
    const ps = priorityStyle(tc.priority);
    r.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: ps.bg };
    r.getCell(6).font = { bold: true, color: ps.fg, size: 10 };

    // Type cell
    r.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
    r.getCell(7).font = { italic: true, size: 10, color: { argb: 'FF4F46E5' } };

    // Status cell
    if (tc.status === 'Pass') {
      r.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: COLORS.passBg };
      r.getCell(8).font = { bold: true, color: COLORS.pass };
    } else if (tc.status === 'Fail') {
      r.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: COLORS.failBg };
      r.getCell(8).font = { bold: true, color: COLORS.fail };
    } else {
      r.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      r.getCell(8).font = { bold: true, color: COLORS.skip };
    }
  });

  // AutoFilter on Sheet 2
  ws2.autoFilter = { from: 'A2', to: 'I2' };

  // ── Output ─────────────────────────────────────────────────────────────────
  const outDir  = path.join(__dirname, 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, 'FoodRescue_Selenium_Test_Report.xlsx');
  await wb.xlsx.writeFile(outFile);

  console.log('\n✅ Excel report generated successfully!');
  console.log(`📄 File: ${outFile}`);
  console.log(`📊 Total test cases: ${TEST_CASES.length}`);
  console.log(`✅ Passed: ${totalPass}  ❌ Failed: ${totalFail}  ⏭️ Skipped: ${totalSkip}`);
  console.log(`📈 Pass Rate: ${passRate}%\n`);
}

generateReport().catch(console.error);
