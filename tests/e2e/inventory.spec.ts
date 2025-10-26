import { test, expect } from '@playwright/test'

test.describe('FarmTrack E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear()
    })

    // Navigate to the application
    await page.goto('/')
  })

  test('should navigate to dashboard and display key metrics', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="dashboard-title"]')

    // Check that the dashboard title is visible
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Farm Dashboard')

    // Check that the metrics cards are visible
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-expenses"]')).toBeVisible()
    await expect(page.locator('[data-testid="net-profit"]')).toBeVisible()
    await expect(page.locator('[data-testid="inventory-items"]')).toBeVisible()
  })

  test('should navigate to inventory page and display empty state', async ({ page }) => {
    // Navigate to inventory
    await page.click('a[href="/inventory"]')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="inventory-title"]')

    // Check that the inventory title is visible
    await expect(page.locator('[data-testid="inventory-title"]')).toContainText('Inventory Management')

    // Check that the add item button is visible
    await expect(page.locator('button:has-text("Add New Item")')).toBeVisible()

    // Check that the stats cards are visible
    await expect(page.locator('[data-testid="total-items"]')).toBeVisible()
    await expect(page.locator('[data-testid="inventory-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="low-stock-items"]')).toBeVisible()
  })

  test('should create a new inventory item', async ({ page }) => {
    // Navigate to inventory
    await page.click('a[href="/inventory"]')

    // Click add item button
    await page.click('button:has-text("Add New Item")')

    // Wait for the modal to appear
    await page.waitForSelector('[data-testid="inventory-form"]')

    // Fill out the form
    await page.fill('[data-testid="item-name"]', 'Test Seeds')
    await page.selectOption('[data-testid="item-category"]', 'seeds')
    await page.fill('[data-testid="item-quantity"]', '100')
    await page.selectOption('[data-testid="item-unit"]', 'kg')
    await page.fill('[data-testid="item-price"]', '25.50')

    // Submit the form
    await page.click('[data-testid="submit-button"]')

    // Wait for the item to appear in the list
    await page.waitForSelector('[data-testid="inventory-item"]:has-text("Test Seeds")')

    // Verify the item was added
    await expect(page.locator('[data-testid="inventory-item"]:has-text("Test Seeds")')).toBeVisible()
    await expect(page.locator('[data-testid="inventory-item"]:has-text("100 kg")')).toBeVisible()
  })

  test('should edit an existing inventory item', async ({ page }) => {
    // First create an item
    await page.click('a[href="/inventory"]')
    await page.click('button:has-text("Add New Item")')
    await page.waitForSelector('[data-testid="inventory-form"]')
    await page.fill('[data-testid="item-name"]', 'Original Seeds')
    await page.selectOption('[data-testid="item-category"]', 'seeds')
    await page.fill('[data-testid="item-quantity"]', '50')
    await page.selectOption('[data-testid="item-unit"]', 'kg')
    await page.fill('[data-testid="item-price"]', '20.00')
    await page.click('[data-testid="submit-button"]')

    // Now edit the item
    await page.click('[data-testid="edit-button"]:first-of-type')

    // Update the quantity
    await page.fill('[data-testid="item-quantity"]', '75')
    await page.click('[data-testid="submit-button"]')

    // Verify the item was updated
    await expect(page.locator('[data-testid="inventory-item"]:has-text("75 kg")')).toBeVisible()
  })

  test('should delete an inventory item', async ({ page }) => {
    // First create an item
    await page.click('a[href="/inventory"]')
    await page.click('button:has-text("Add New Item")')
    await page.waitForSelector('[data-testid="inventory-form"]')
    await page.fill('[data-testid="item-name"]', 'Delete Test Item')
    await page.selectOption('[data-testid="item-category"]', 'tools')
    await page.fill('[data-testid="item-quantity"]', '1')
    await page.selectOption('[data-testid="item-unit"]', 'units')
    await page.fill('[data-testid="item-price"]', '100.00')
    await page.click('[data-testid="submit-button"]')

    // Delete the item
    await page.click('[data-testid="delete-button"]:first-of-type')

    // Verify the item was removed
    await expect(page.locator('[data-testid="inventory-item"]:has-text("Delete Test Item")')).not.toBeVisible()
  })

  test('should filter inventory items by search', async ({ page }) => {
    // Create multiple items
    await page.click('a[href="/inventory"]')

    // Add first item
    await page.click('button:has-text("Add New Item")')
    await page.fill('[data-testid="item-name"]', 'Tomato Seeds')
    await page.selectOption('[data-testid="item-category"]', 'seeds')
    await page.fill('[data-testid="item-quantity"]', '100')
    await page.selectOption('[data-testid="item-unit"]', 'kg')
    await page.fill('[data-testid="item-price"]', '25.00')
    await page.click('[data-testid="submit-button"]')

    // Add second item
    await page.click('button:has-text("Add New Item")')
    await page.fill('[data-testid="item-name"]', 'Fertilizer')
    await page.selectOption('[data-testid="item-category"]', 'fertilizers')
    await page.fill('[data-testid="item-quantity"]', '50')
    await page.selectOption('[data-testid="item-unit"]', 'kg')
    await page.fill('[data-testid="item-price"]', '15.00')
    await page.click('[data-testid="submit-button"]')

    // Search for tomato
    await page.fill('[data-testid="search-input"]', 'tomato')

    // Should only show tomato seeds
    await expect(page.locator('[data-testid="inventory-item"]:has-text("Tomato Seeds")')).toBeVisible()
    await expect(page.locator('[data-testid="inventory-item"]:has-text("Fertilizer")')).not.toBeVisible()

    // Clear search
    await page.fill('[data-testid="search-input"]', '')

    // Should show both items
    await expect(page.locator('[data-testid="inventory-item"]:has-text("Tomato Seeds")')).toBeVisible()
    await expect(page.locator('[data-testid="inventory-item"]:has-text("Fertilizer")')).toBeVisible()
  })

  test('should display low stock warnings', async ({ page }) => {
    // Create an item with low stock
    await page.click('a[href="/inventory"]')
    await page.click('button:has-text("Add New Item")')
    await page.fill('[data-testid="item-name"]', 'Low Stock Item')
    await page.selectOption('[data-testid="item-category"]', 'seeds')
    await page.fill('[data-testid="item-quantity"]', '5') // Low quantity
    await page.fill('[data-testid="item-min-stock"]', '10') // Higher minimum
    await page.selectOption('[data-testid="item-unit"]', 'kg')
    await page.fill('[data-testid="item-price"]', '30.00')
    await page.click('[data-testid="submit-button"]')

    // Check for low stock indicator
    await expect(page.locator('[data-testid="low-stock-indicator"]')).toBeVisible()
  })

  test('should calculate total inventory value correctly', async ({ page }) => {
    // Create items with known values
    await page.click('a[href="/inventory"]')

    // Add first item: 100 kg * $25 = $2500
    await page.click('button:has-text("Add New Item")')
    await page.fill('[data-testid="item-name"]', 'Expensive Seeds')
    await page.selectOption('[data-testid="item-category"]', 'seeds')
    await page.fill('[data-testid="item-quantity"]', '100')
    await page.selectOption('[data-testid="item-unit"]', 'kg')
    await page.fill('[data-testid="item-price"]', '25.00')
    await page.click('[data-testid="submit-button"]')

    // Add second item: 50 kg * $15 = $750
    await page.click('button:has-text("Add New Item")')
    await page.fill('[data-testid="item-name"]', 'Cheap Fertilizer')
    await page.selectOption('[data-testid="item-category"]', 'fertilizers')
    await page.fill('[data-testid="item-quantity"]', '50')
    await page.selectOption('[data-testid="item-unit"]', 'kg')
    await page.fill('[data-testid="item-price"]', '15.00')
    await page.click('[data-testid="submit-button"]')

    // Check total value: $2500 + $750 = $3250
    await expect(page.locator('[data-testid="inventory-value"]')).toContainText('$3,250.00')
  })

  test('should handle form validation', async ({ page }) => {
    // Navigate to inventory
    await page.click('a[href="/inventory"]')

    // Try to submit empty form
    await page.click('button:has-text("Add New Item")')
    await page.click('[data-testid="submit-button"]')

    // Should show validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="quantity-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="price-error"]')).toBeVisible()
  })

  test('should maintain responsive design across breakpoints', async ({ page, isMobile }) => {
    await page.setViewportSize({ width: isMobile ? 375 : 1200, height: 667 })

    // Navigate to inventory
    await page.click('a[href="/inventory"]')

    // Check that the layout adapts correctly
    if (isMobile) {
      // Mobile layout should stack elements vertically
      await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible()
    } else {
      // Desktop layout should use horizontal layouts
      await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible()
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Navigate to inventory using keyboard
    await page.keyboard.press('Tab') // Focus on navigation
    await page.keyboard.press('Enter') // Navigate to inventory

    // Should be on inventory page
    await expect(page.locator('[data-testid="inventory-title"]')).toBeVisible()

    // Tab through form elements
    await page.keyboard.press('Tab') // Focus on add button
    await page.keyboard.press('Enter') // Open form

    // Form should be accessible via keyboard
    await expect(page.locator('[data-testid="inventory-form"]')).toBeVisible()
  })
})
