import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Audits', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
  })

  test('should pass axe-core accessibility audit on dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="dashboard-title"]')

    // Run axe-core accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    // Assert that there are no accessibility violations
    expect(accessibilityScanResults.violations).toHaveLength(0)

    // Log any incomplete tests for manual review
    if (accessibilityScanResults.incomplete.length > 0) {
      console.log('Incomplete accessibility tests:', accessibilityScanResults.incomplete)
    }
  })

  test('should pass axe-core accessibility audit on inventory page', async ({ page }) => {
    // Navigate to inventory
    await page.click('a[href="/inventory"]')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="inventory-title"]')

    // Run axe-core accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    // Assert that there are no accessibility violations
    expect(accessibilityScanResults.violations).toHaveLength(0)
  })

  test('should pass axe-core accessibility audit on sales page', async ({ page }) => {
    // Navigate to sales
    await page.click('a[href="/sales"]')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="sales-title"]')

    // Run axe-core accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    // Assert that there are no accessibility violations
    expect(accessibilityScanResults.violations).toHaveLength(0)
  })

  test('should pass axe-core accessibility audit on activities page', async ({ page }) => {
    // Navigate to activities
    await page.click('a[href="/activities"]')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="activities-title"]')

    // Run axe-core accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    // Assert that there are no accessibility violations
    expect(accessibilityScanResults.violations).toHaveLength(0)
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.click('a[href="/inventory"]')

    // Check that the page has a proper h1 heading
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)

    // Check that headings are in proper order (h1, then h2, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    const headingLevels = headings.map(h => parseInt(h.match(/h(\d)/)?.[1] || '1'))

    // Check that heading levels are sequential
    for (let i = 1; i < headingLevels.length; i++) {
      expect(headingLevels[i]).toBeLessThanOrEqual(headingLevels[i - 1] + 1)
    }
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.click('a[href="/inventory"]')

    // Check that buttons have proper aria-labels
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const textContent = await button.textContent()

      // Button should have either aria-label or accessible text content
      expect(ariaLabel || textContent?.trim()).toBeTruthy()
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.click('a[href="/inventory"]')

    // Tab through the page and ensure focus is visible
    await page.keyboard.press('Tab')

    // Check that focus is visible on the first focusable element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Continue tabbing and ensure focus moves properly
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to navigate back with Shift+Tab
    await page.keyboard.press('Shift+Tab')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.click('a[href="/inventory"]')

    // Run axe-core color contrast audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    // Should have no color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    )

    expect(colorContrastViolations).toHaveLength(0)
  })

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.click('a[href="/inventory"]')

    // Check that animations are disabled or reduced
    // This is a basic check - in a real implementation, you'd check specific animation properties
    const hasAnimations = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body)
      return style.animationDuration !== '0s' || style.transitionDuration !== '0.01ms'
    })

    // In reduced motion mode, animations should be minimal or disabled
    expect(hasAnimations).toBe(false)
  })

  test('should have proper form labels and error handling', async ({ page }) => {
    await page.click('a[href="/inventory"]')
    await page.click('button:has-text("Add New Item")')

    // Check that form fields have proper labels
    const nameInput = page.locator('[data-testid="item-name"]')
    const nameLabel = page.locator('label[for="name"]')

    await expect(nameLabel).toBeVisible()
    await expect(nameInput).toHaveAttribute('aria-describedby')

    // Try submitting invalid form
    await page.click('[data-testid="submit-button"]')

    // Should show validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
  })
})
