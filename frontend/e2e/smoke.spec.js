// @ts-check
// Run: npx playwright test e2e/smoke.spec.js
const { test, expect } = require('@playwright/test')

test.describe('Facarbon Smoke Test', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await expect(page.locator('h1')).toHaveText('FACARBON')
    await expect(page.locator('button')).toHaveText('Masuk')
  })

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="email"]', 'admin@facarbon.com')
    await page.fill('input[name="password"]', 'facarbon123')
    await page.click('button:has-text("Masuk")')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('dashboard shows stat cards', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="email"]', 'admin@facarbon.com')
    await page.fill('input[name="password"]', 'facarbon123')
    await page.click('button:has-text("Masuk")')
    await page.waitForURL(/\/dashboard/)
    await expect(page.locator('text=Total Produk')).toBeVisible()
    await expect(page.locator('text=Stok Masuk')).toBeVisible()
  })

  test('products page loads and shows table', async ({ page }) => {
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="email"]', 'admin@facarbon.com')
    await page.fill('input[name="password"]', 'facarbon123')
    await page.click('button:has-text("Masuk")')
    await page.waitForURL(/\/dashboard/)
    await page.goto('http://localhost:5173/products')
    await expect(page.locator('text=Produk')).toBeVisible()
  })
})
