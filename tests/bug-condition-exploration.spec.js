/**
 * Bug Condition Exploration Tests for UI/UX Fixes
 * 
 * **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms bugs exist
 * **DO NOT** fix tests or code when they fail
 * **PURPOSE**: Surface counterexamples demonstrating bug existence
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13**
 */

const { test, expect } = require('@playwright/test');
const fc = require('fast-check');

test.describe('Bug Condition Exploration - UI/UX Issues', () => {
  
  /**
   * 1.1 Auto-scroll Test
   * **Validates: Requirements 1.1, 2.1**
   * Expected on unfixed code: Page does NOT scroll to top when clicking warnings section
   */
  test('1.1 Auto-scroll: Clicking "Снятие выговоров" should scroll to top', async ({ page }) => {
    await page.goto('/rules.html');
    
    // Scroll down first to verify scroll behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    // Click on warnings section
    await page.click('[data-section="warnings"]');
    await page.waitForTimeout(1000);
    
    // Check if page scrolled to top
    const scrollY = await page.evaluate(() => window.scrollY);
    
    // EXPECTED TO FAIL: On unfixed code, scrollY will NOT be 0
    expect(scrollY).toBe(0);
  });

  /**
   * 1.2 Header Text Color Test
   * **Validates: Requirements 1.2, 2.2**
   * Expected on unfixed code: Text displays with gradient instead of white color
   */
  test('1.2 Header Text Color: "Fear Protection" should be white, not gradient', async ({ page }) => {
    await page.goto('/rules.html');
    
    const logoText = page.locator('.logo-text');
    const textFillColor = await logoText.evaluate(el => 
      window.getComputedStyle(el).webkitTextFillColor
    );
    const backgroundClip = await logoText.evaluate(el => 
      window.getComputedStyle(el).webkitBackgroundClip
    );
    
    // EXPECTED TO FAIL: On unfixed code, text will have gradient (transparent fill + text background-clip)
    expect(backgroundClip).not.toBe('text');
    expect(textFillColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  /**
   * 1.3 Header Alignment Test
   * **Validates: Requirements 1.3, 2.3**
   * Expected on unfixed code: Logo and text centered instead of left-aligned
   */
  test('1.3 Header Alignment: Logo should be left-aligned, not centered', async ({ page }) => {
    await page.goto('/rules.html');
    
    const headerContent = page.locator('.header-content');
    const justifyContent = await headerContent.evaluate(el => 
      window.getComputedStyle(el).justifyContent
    );
    
    // EXPECTED TO FAIL: On unfixed code, justifyContent will be 'center'
    expect(justifyContent).toBe('flex-start');
  });

  /**
   * 1.4 Section Text Color Test
   * **Validates: Requirements 1.4, 2.4**
   * Expected on unfixed code: Section text is not white
   */
  test('1.4 Section Text Color: Section text should be white', async ({ page }) => {
    await page.goto('/rules.html');
    
    const sectionTitle = page.locator('.section-title').first();
    const color = await sectionTitle.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Convert to RGB for comparison
    const isWhiteOrNearWhite = color === 'rgb(255, 255, 255)' || 
                                color.startsWith('rgba(255, 255, 255');
    
    // EXPECTED TO FAIL: On unfixed code, text will not be white
    expect(isWhiteOrNearWhite).toBe(true);
  });

  /**
   * 1.5 Section Border Color Test
   * **Validates: Requirements 1.5, 2.5**
   * Expected on unfixed code: Section borders are not white
   */
  test('1.5 Section Border Color: Section borders should be white', async ({ page }) => {
    await page.goto('/rules.html');
    
    const sectionTitle = page.locator('.section-title').first();
    const borderColor = await sectionTitle.evaluate(el => 
      window.getComputedStyle(el).borderBottomColor
    );
    
    // Check if border is white or near-white
    const isWhiteOrNearWhite = borderColor === 'rgb(255, 255, 255)' || 
                                borderColor.startsWith('rgba(255, 255, 255');
    
    // EXPECTED TO FAIL: On unfixed code, borders will not be white
    expect(isWhiteOrNearWhite).toBe(true);
  });

  /**
   * 1.6 Category Border Color Test
   * **Validates: Requirements 1.6, 2.6**
   * Expected on unfixed code: All categories have same border color
   */
  test('1.6 Category Border Color: Punishment rules should have yellow borders', async ({ page }) => {
    await page.goto('/rules.html');
    
    // Get all rule items
    const ruleItems = page.locator('.rule-item');
    const count = await ruleItems.count();
    
    // Check if any rule item has yellow border (for punishment category)
    let hasYellowBorder = false;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const borderColor = await ruleItems.nth(i).evaluate(el => 
        window.getComputedStyle(el).borderLeftColor
      );
      
      // Check for yellow-ish color (#fbbf24 = rgb(251, 191, 36))
      if (borderColor.includes('251') || borderColor.includes('yellow')) {
        hasYellowBorder = true;
        break;
      }
    }
    
    // EXPECTED TO FAIL: On unfixed code, no yellow borders will exist
    expect(hasYellowBorder).toBe(true);
  });

  /**
   * 1.7 Horizontal Overflow Test
   * **Validates: Requirements 1.7, 2.7**
   * Expected on unfixed code: Horizontal scrollbar appears
   */
  test('1.7 Horizontal Overflow: Body should not have horizontal scroll', async ({ page }) => {
    await page.goto('/rules.html');
    
    const bodyOverflowX = await page.evaluate(() => 
      window.getComputedStyle(document.body).overflowX
    );
    
    // EXPECTED TO FAIL: On unfixed code, overflowX will not be 'hidden'
    expect(bodyOverflowX).toBe('hidden');
  });

  /**
   * 1.8 Content Overflow Test
   * **Validates: Requirements 1.8, 2.8**
   * Expected on unfixed code: Content extends outside container
   */
  test('1.8 Content Overflow: Container should constrain content width', async ({ page }) => {
    await page.goto('/rules.html');
    
    const container = page.locator('.container').first();
    const maxWidth = await container.evaluate(el => 
      window.getComputedStyle(el).maxWidth
    );
    
    // Check if max-width is set to viewport width
    const hasMaxWidth = maxWidth === '100vw' || maxWidth.includes('px');
    
    // EXPECTED TO FAIL: On unfixed code, max-width may not be properly constrained
    expect(hasMaxWidth).toBe(true);
  });

  /**
   * 1.9 Punishment Text Weight Test
   * **Validates: Requirements 1.9, 2.9**
   * Expected on unfixed code: Punishment text is bold
   */
  test('1.9 Punishment Text Weight: Punishment text should be normal weight', async ({ page }) => {
    await page.goto('/rules.html');
    
    const rulePunishment = page.locator('.rule-punishment').first();
    
    // Check if element exists
    const exists = await rulePunishment.count() > 0;
    if (!exists) {
      // If no punishment text exists, skip this test
      test.skip();
      return;
    }
    
    const fontWeight = await rulePunishment.evaluate(el => 
      window.getComputedStyle(el).fontWeight
    );
    
    // Normal weight is 400, bold is 700
    const isNormalWeight = fontWeight === '400' || fontWeight === 'normal';
    
    // EXPECTED TO FAIL: On unfixed code, font-weight will be bold (600 or 700)
    expect(isNormalWeight).toBe(true);
  });

  /**
   * 1.10 Custom Scrollbar Test
   * **Validates: Requirements 1.10, 2.10**
   * Expected on unfixed code: Default browser scrollbar appears
   */
  test('1.10 Custom Scrollbar: Body should have custom scrollbar styles', async ({ page }) => {
    await page.goto('/rules.html');
    
    // Check if custom scrollbar styles are applied
    const hasCustomScrollbar = await page.evaluate(() => {
      const styles = document.styleSheets;
      let hasScrollbarRule = false;
      
      for (let i = 0; i < styles.length; i++) {
        try {
          const rules = styles[i].cssRules || styles[i].rules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule.selectorText && 
                (rule.selectorText.includes('::-webkit-scrollbar') && 
                 (rule.selectorText.includes('body') || rule.selectorText.includes('html')))) {
              hasScrollbarRule = true;
              break;
            }
          }
        } catch (e) {
          // Skip CORS-protected stylesheets
        }
      }
      
      return hasScrollbarRule;
    });
    
    // EXPECTED TO FAIL: On unfixed code, custom scrollbar styles will not exist
    expect(hasCustomScrollbar).toBe(true);
  });

  /**
   * 1.11 Easter Egg Text Position Test
   * **Validates: Requirements 1.11, 2.11**
   * Expected on unfixed code: Text overlays image
   */
  test('1.11 Easter Egg Text Position: Text should be below image, not overlaying', async ({ page }) => {
    await page.goto('/rules.html');
    
    // Trigger easter egg by evaluating the modal display
    await page.evaluate(() => {
      const modal = document.getElementById('easterEggModal');
      if (modal) {
        modal.classList.add('active');
      }
    });
    
    await page.waitForTimeout(500);
    
    const easterEggText = page.locator('.easter-egg-text');
    const easterEggGif = page.locator('.easter-egg-gif');
    
    // Get positions
    const textBox = await easterEggText.boundingBox();
    const gifBox = await easterEggGif.boundingBox();
    
    if (!textBox || !gifBox) {
      test.skip();
      return;
    }
    
    // Text should be below image (text.top > gif.bottom)
    const textBelowImage = textBox.y > (gifBox.y + gifBox.height);
    
    // EXPECTED TO FAIL: On unfixed code, text will overlay image
    expect(textBelowImage).toBe(true);
  });

  /**
   * 1.12 Easter Egg Modal Display Test
   * **Validates: Requirements 1.12, 2.12**
   * Expected on unfixed code: Modal may not display correctly
   */
  test('1.12 Easter Egg Modal Display: Modal should display correctly with high z-index', async ({ page }) => {
    await page.goto('/rules.html');
    
    const modal = page.locator('#easterEggModal');
    const zIndex = await modal.evaluate(el => 
      window.getComputedStyle(el).zIndex
    );
    
    // Z-index should be very high (10000)
    const zIndexNum = parseInt(zIndex);
    const hasHighZIndex = zIndexNum >= 10000;
    
    // EXPECTED TO FAIL: On unfixed code, z-index may be lower or modal may have display issues
    expect(hasHighZIndex).toBe(true);
  });

  /**
   * 1.13 Tracking Card Design Test
   * **Validates: Requirements 1.13, 2.13**
   * Expected on unfixed code: Cards have suboptimal design
   */
  test('1.13 Tracking Card Design: Cards should have improved visual design', async ({ page }) => {
    await page.goto('/tracking.html');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Check if tracking cards exist
    const cards = page.locator('.tracking-card, .player-card, [class*="card"]');
    const count = await cards.count();
    
    if (count === 0) {
      // If no cards exist, check for card container styles
      const container = page.locator('.tracking-container, .cards-container, main');
      const exists = await container.count() > 0;
      
      if (!exists) {
        test.skip();
        return;
      }
    }
    
    // Check for improved design features (box-shadow, hover effects, etc.)
    let hasImprovedDesign = false;
    
    if (count > 0) {
      const firstCard = cards.first();
      const boxShadow = await firstCard.evaluate(el => 
        window.getComputedStyle(el).boxShadow
      );
      
      // Check if box-shadow exists (improved design should have shadow)
      hasImprovedDesign = boxShadow !== 'none' && boxShadow.length > 10;
    }
    
    // EXPECTED TO FAIL: On unfixed code, cards will lack improved design features
    expect(hasImprovedDesign).toBe(true);
  });

});

/**
 * Property-Based Test: Scoped PBT for Bug Conditions
 * 
 * This test uses property-based testing to verify bug conditions across multiple scenarios
 */
test.describe('Property-Based Bug Condition Tests', () => {
  
  test('Property 1: Bug Condition - UI/UX Issues exist on unfixed code', async ({ page }) => {
    // Generate test cases for different pages
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('rules.html', 'tracking.html', 'anticheat.html', 'check.html'),
        async (pagePath) => {
          await page.goto(`/${pagePath}`);
          await page.waitForTimeout(500);
          
          // Verify page loaded
          const title = await page.title();
          expect(title).toContain('Fear Protection');
          
          // Check header exists
          const header = page.locator('.header');
          await expect(header).toBeVisible();
          
          // This property just verifies pages load correctly
          // Individual bug tests above verify specific issues
          return true;
        }
      ),
      { numRuns: 4 } // Test all 4 pages
    );
  });
  
});
