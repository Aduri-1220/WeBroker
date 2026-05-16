import { test, expect } from "@playwright/test";
import { signUp, completeOnboarding } from "./helpers";

test.describe("onboarding", () => {
  test("Continue button is disabled until role and state are both chosen", async ({
    page,
  }) => {
    await signUp(page);

    const cont = page.getByRole("button", { name: /continue/i });
    await expect(cont).toBeDisabled();

    await page.getByRole("button", { name: /i'?m the tenant/i }).click();
    // Still disabled with only the role picked.
    await expect(cont).toBeDisabled();

    await page.locator("#state").click();
    await page.getByRole("option", { name: /^Maharashtra$/i }).click();

    await expect(cont).toBeEnabled();
  });

  test("submitting onboarding lands the user on the dashboard", async ({
    page,
  }) => {
    await signUp(page);
    await completeOnboarding(page);

    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    // Brand-new user: zero agreements → empty state copy is rendered.
    await expect(page.getByText(/no agreements yet/i)).toBeVisible();
  });

  test("a user who already finished onboarding can still re-visit /onboarding", async ({
    page,
  }) => {
    // This guards against regressing the "Profile preferences" link in the nav,
    // which deep-links back into /onboarding.
    await signUp(page);
    await completeOnboarding(page);

    await page.goto("/onboarding");
    await expect(
      page.getByRole("heading", { name: /tell us about you/i }),
    ).toBeVisible();
  });
});
