import { test, expect } from "@playwright/test";
import { signUp, completeOnboarding } from "./helpers";

test.describe("dashboard", () => {
  test("New Agreement creates a draft and opens the upload-or-skip step", async ({
    page,
  }) => {
    await signUp(page);
    await completeOnboarding(page);

    // The button lives on the dashboard hero AND inside the empty state, so
    // first() avoids the strict-mode duplicate-locator error.
    await page
      .getByRole("button", { name: /new agreement/i })
      .first()
      .click();

    await page.waitForURL(/\/agreement\/[^/]+\/draft$/, {
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: /upload & contact/i }),
    ).toBeVisible();
  });

  test("the dashboard total-agreements stat reflects newly-created drafts", async ({
    page,
  }) => {
    await signUp(page);
    await completeOnboarding(page);

    // We hit the API directly here instead of clicking the button, because we
    // care about the dashboard's reaction, not the navigation side-effect.
    const create = await page.request.post("/api/agreements");
    expect(create.ok()).toBeTruthy();

    await page.goto("/dashboard");
    // The "Total agreements" stat card should now read 1.
    const totalCard = page
      .locator("div")
      .filter({ hasText: /^Total agreements$/ })
      .locator("..");
    await expect(totalCard.getByText("1", { exact: true })).toBeVisible();
  });

  test("user can sign out from the avatar menu", async ({ page }) => {
    await signUp(page);
    await completeOnboarding(page);

    // Open the avatar/user dropdown. Its trigger has no accessible name beyond
    // the user's email (or initial), so target by the email text shown there.
    const dropdownTrigger = page.locator("header").getByRole("button").last();
    await dropdownTrigger.click();

    await page.getByRole("menuitem", { name: /sign out/i }).click();
    // NextAuth signOut redirects to "/" with the callbackUrl set in app-nav.
    await page.waitForURL(/\/$/, { timeout: 15_000 });

    // Going back to /dashboard should now bounce to /sign-in (no session).
    await page.goto("/dashboard");
    await page.waitForURL(/\/sign-in$/, { timeout: 10_000 });
  });
});
