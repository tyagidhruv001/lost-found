from playwright.sync_api import Page, expect, sync_playwright

def test_landing_page(page: Page):
    # Navigate to landing page
    page.goto("http://localhost:5173/")

    # Check for "Latest Activity" text (it's in the component)
    expect(page.get_by_text("Latest Activity")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/landing_page.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_landing_page(page)
            print("Verification successful")
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
