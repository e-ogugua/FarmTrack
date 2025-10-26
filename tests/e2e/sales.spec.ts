import { test, expect } from '@playwright/test'

test.describe('Sales Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear()
    })

    // Navigate to the application
    await page.goto('/')
  })

  test('should navigate to sales page and display empty state', async ({ page }) => {
    // Navigate to sales
    await page.click('a[href="/sales"]')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="sales-title"]')

    // Check that the sales title is visible
    await expect(page.locator('[data-testid="sales-title"]')).toContainText('Sales Management')

    // Check that the add sale button is visible
    await expect(page.locator('button:has-text("Add New Sale")')).toBeVisible()

    // Check that the stats cards are visible
    await expect(page.locator('[data-testid="total-sales"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-transactions"]')).toBeVisible()
  })

  test('should create a new sales record', async ({ page }) => {
    // Navigate to sales
    await page.click('a[href="/sales"]')

    // Click add sale button
    await page.click('button:has-text("Add New Sale")')

    // Wait for the modal to appear
    await page.waitForSelector('[data-testid="sales-form"]')

    // Fill out the form
    await page.fill('[data-testid="sale-product"]', 'Tomatoes')
    await page.fill('[data-testid="sale-quantity"]', '50')
    await page.fill('[data-testid="sale-price"]', '2.50')
    await page.fill('[data-testid="sale-customer"]', 'Local Market')
    await page.fill('[data-testid="sale-date"]', '2024-01-15')

    // Submit the form
    await page.click('[data-testid="submit-sale"]')

    // Wait for the sale to appear in the list
    await page.waitForSelector('[data-testid="sales-record"]:has-text("Tomatoes")')

    // Verify the sale was added
    await expect(page.locator('[data-testid="sales-record"]:has-text("Tomatoes")')).toBeVisible()
    await expect(page.locator('[data-testid="sales-record"]:has-text("$125.00")')).toBeVisible()
  })

  test('should edit an existing sales record', async ({ page }) => {
    // First create a sale
    await page.click('a[href="/sales"]')
    await page.click('button:has-text("Add New Sale")')
    await page.fill('[data-testid="sale-product"]', 'Original Product')
    await page.fill('[data-testid="sale-quantity"]', '25')
    await page.fill('[data-testid="sale-price"]', '3.00')
    await page.fill('[data-testid="sale-customer"]', 'Customer A')
    await page.click('[data-testid="submit-sale"]')

    // Now edit the sale
    await page.click('[data-testid="edit-sale"]:first-of-type')

    // Update the quantity
    await page.fill('[data-testid="sale-quantity"]', '30')
    await page.click('[data-testid="submit-sale"]')

    // Verify the sale was updated
    await expect(page.locator('[data-testid="sales-record"]:has-text("$90.00")')).toBeVisible()
  })

  test('should delete a sales record', async ({ page }) => {
    // First create a sale
    await page.click('a[href="/sales"]')
    await page.click('button:has-text("Add New Sale")')
    await page.fill('[data-testid="sale-product"]', 'Delete Test Sale')
    await page.fill('[data-testid="sale-quantity"]', '10')
    await page.fill('[data-testid="sale-price"]', '5.00')
    await page.fill('[data-testid="sale-customer"]', 'Test Customer')
    await page.click('[data-testid="submit-sale"]')

    // Delete the sale
    await page.click('[data-testid="delete-sale"]:first-of-type')

    // Verify the sale was removed
    await expect(page.locator('[data-testid="sales-record"]:has-text("Delete Test Sale")')).not.toBeVisible()
  })

  test('should calculate total sales correctly', async ({ page }) => {
    // Create multiple sales
    await page.click('a[href="/sales"]')

    // Add first sale: 50 * $2.50 = $125
    await page.click('button:has-text("Add New Sale")')
    await page.fill('[data-testid="sale-product"]', 'Product A')
    await page.fill('[data-testid="sale-quantity"]', '50')
    await page.fill('[data-testid="sale-price"]', '2.50')
    await page.fill('[data-testid="sale-customer"]', 'Customer A')
    await page.click('[data-testid="submit-sale"]')

    // Add second sale: 30 * $3.00 = $90
    await page.click('button:has-text("Add New Sale")')
    await page.fill('[data-testid="sale-product"]', 'Product B')
    await page.fill('[data-testid="sale-quantity"]', '30')
    await page.fill('[data-testid="sale-price"]', '3.00')
    await page.fill('[data-testid="sale-customer"]', 'Customer B')
    await page.click('[data-testid="submit-sale"]')

    // Check total sales: $125 + $90 = $215
    await expect(page.locator('[data-testid="total-sales"]')).toContainText('$215.00')
  })
})
