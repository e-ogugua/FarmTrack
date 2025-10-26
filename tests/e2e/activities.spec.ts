import { test, expect } from '@playwright/test'

test.describe('Activities Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear()
    })

    // Navigate to the application
    await page.goto('/')
  })

  test('should navigate to activities page and display empty state', async ({ page }) => {
    // Navigate to activities
    await page.click('a[href="/activities"]')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="activities-title"]')

    // Check that the activities title is visible
    await expect(page.locator('[data-testid="activities-title"]')).toContainText('Activity Tracking')

    // Check that the add activity button is visible
    await expect(page.locator('button:has-text("Add New Activity")')).toBeVisible()

    // Check that the stats cards are visible
    await expect(page.locator('[data-testid="total-activities"]')).toBeVisible()
  })

  test('should create a new activity record', async ({ page }) => {
    // Navigate to activities
    await page.click('a[href="/activities"]')

    // Click add activity button
    await page.click('button:has-text("Add New Activity")')

    // Wait for the modal to appear
    await page.waitForSelector('[data-testid="activity-form"]')

    // Fill out the form
    await page.fill('[data-testid="activity-type"]', 'Planting')
    await page.fill('[data-testid="activity-crop"]', 'Tomatoes')
    await page.fill('[data-testid="activity-date"]', '2024-01-15')
    await page.fill('[data-testid="activity-notes"]', 'Planted 50 tomato seedlings in field A')

    // Submit the form
    await page.click('[data-testid="submit-activity"]')

    // Wait for the activity to appear in the list
    await page.waitForSelector('[data-testid="activity-record"]:has-text("Planting")')

    // Verify the activity was added
    await expect(page.locator('[data-testid="activity-record"]:has-text("Planting")')).toBeVisible()
    await expect(page.locator('[data-testid="activity-record"]:has-text("Tomatoes")')).toBeVisible()
  })

  test('should edit an existing activity record', async ({ page }) => {
    // First create an activity
    await page.click('a[href="/activities"]')
    await page.click('button:has-text("Add New Activity")')
    await page.fill('[data-testid="activity-type"]', 'Original Activity')
    await page.fill('[data-testid="activity-crop"]', 'Corn')
    await page.fill('[data-testid="activity-notes"]', 'Original notes')
    await page.click('[data-testid="submit-activity"]')

    // Now edit the activity
    await page.click('[data-testid="edit-activity"]:first-of-type')

    // Update the notes
    await page.fill('[data-testid="activity-notes"]', 'Updated activity notes')
    await page.click('[data-testid="submit-activity"]')

    // Verify the activity was updated
    await expect(page.locator('[data-testid="activity-record"]:has-text("Updated activity notes")')).toBeVisible()
  })

  test('should delete an activity record', async ({ page }) => {
    // First create an activity
    await page.click('a[href="/activities"]')
    await page.click('button:has-text("Add New Activity")')
    await page.fill('[data-testid="activity-type"]', 'Delete Test Activity')
    await page.fill('[data-testid="activity-crop"]', 'Test Crop')
    await page.click('[data-testid="submit-activity"]')

    // Delete the activity
    await page.click('[data-testid="delete-activity"]:first-of-type')

    // Verify the activity was removed
    await expect(page.locator('[data-testid="activity-record"]:has-text("Delete Test Activity")')).not.toBeVisible()
  })

  test('should filter activities by crop type', async ({ page }) => {
    // Create multiple activities
    await page.click('a[href="/activities"]')

    // Add first activity
    await page.click('button:has-text("Add New Activity")')
    await page.fill('[data-testid="activity-type"]', 'Planting')
    await page.fill('[data-testid="activity-crop"]', 'Tomatoes')
    await page.click('[data-testid="submit-activity"]')

    // Add second activity
    await page.click('button:has-text("Add New Activity")')
    await page.fill('[data-testid="activity-type"]', 'Harvesting')
    await page.fill('[data-testid="activity-crop"]', 'Corn')
    await page.click('[data-testid="submit-activity"]')

    // Search for tomatoes
    await page.fill('[data-testid="search-activities"]', 'tomato')

    // Should only show tomato activities
    await expect(page.locator('[data-testid="activity-record"]:has-text("Tomatoes")')).toBeVisible()
    await expect(page.locator('[data-testid="activity-record"]:has-text("Corn")')).not.toBeVisible()
  })
})
