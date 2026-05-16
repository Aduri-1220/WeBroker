import { test, expect } from "@playwright/test";
import {
  signUp,
  completeOnboarding,
  TEST_PASSWORD,
  uniqueEmail,
} from "./helpers";

/**
 * API-only contracts. These are cheap (no Chromium needed for most of them)
 * and cover the auth / validation surface of every server route.
 *
 * `request` is the per-test request fixture - it inherits `use.baseURL` from
 * playwright.config and has no cookies, so it doubles as an "unauthenticated
 * client" for the 401 cases below.
 */
test.describe("api: auth + validation", () => {
  test("POST /api/sign-up rejects an invalid email", async ({ request }) => {
    const res = await request.post("/api/sign-up", {
      data: {
        name: "QA",
        email: "not-an-email",
        phone: "9876543210",
        password: TEST_PASSWORD,
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error?.email).toBeTruthy();
  });

  test("POST /api/sign-up rejects a short password", async ({ request }) => {
    const res = await request.post("/api/sign-up", {
      data: {
        name: "QA",
        email: uniqueEmail(),
        phone: "9876543210",
        password: "abc",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error?.password).toBeTruthy();
  });

  test("POST /api/sign-up returns 409 on duplicate email", async ({
    request,
  }) => {
    const email = uniqueEmail();

    const first = await request.post("/api/sign-up", {
      data: {
        name: "QA",
        email,
        phone: "9876543210",
        password: TEST_PASSWORD,
      },
    });
    expect(first.status()).toBe(201);

    const second = await request.post("/api/sign-up", {
      data: {
        name: "QA",
        email,
        phone: "9876543210",
        password: TEST_PASSWORD,
      },
    });
    expect(second.status()).toBe(409);
    const body = await second.json();
    expect(body.error?.email?.[0]).toMatch(/already exists/i);
  });

  test("unauthenticated calls to protected routes return 401", async ({
    request,
  }) => {
    for (const path of ["/api/agreements", "/api/onboarding"] as const) {
      const res = await request.post(path, {
        data:
          path === "/api/onboarding"
            ? { role: "OWNER", state: "karnataka" }
            : {},
      });
      expect(res.status(), `${path} should require auth`).toBe(401);
    }

    const listRes = await request.get("/api/agreements");
    expect(listRes.status()).toBe(401);
  });

  test("POST /api/onboarding rejects unknown role", async ({ page }) => {
    await signUp(page);
    // Don't complete onboarding via UI - hit the API directly with bad data.
    const res = await page.request.post("/api/onboarding", {
      data: { role: "LANDLORD", state: "karnataka" },
    });
    expect(res.status()).toBe(400);
  });

  test("PATCH /api/agreements/[id] rejects an unknown step", async ({
    page,
  }) => {
    await signUp(page);
    await completeOnboarding(page);

    // Use in-page fetch (same as components/wizard/persist.ts) so the session
    // cookie is always attached. Some environments differ slightly between
    // page.request and the browser cookie jar for PATCH bodies.
    const { createStatus, id } = await page.evaluate(async () => {
      const r = await fetch("/api/agreements", {
        method: "POST",
        credentials: "include",
      });
      const json = (await r.json()) as { id?: string };
      return { createStatus: r.status, id: json.id ?? "" };
    });
    expect(createStatus, "POST /api/agreements should succeed").toBe(200);
    expect(id).toBeTruthy();

    const patchStatus = await page.evaluate(async (agreementId: string) => {
      const r = await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "not-a-step", data: {} }),
      });
      return r.status;
    }, id);
    expect(patchStatus).toBe(400);
  });

  test("ownership: a user cannot read another user's agreement", async ({
    browser,
  }) => {
    // Create user A in one context, create an agreement, then attempt to read
    // it as user B in a fresh context.
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await signUp(pageA);
    await completeOnboarding(pageA);
    const create = await pageA.request.post("/api/agreements");
    const { id } = (await create.json()) as { id: string };
    expect(id).toBeTruthy();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await signUp(pageB);
    await completeOnboarding(pageB);

    const stealAttempt = await pageB.request.get(`/api/agreements/${id}`);
    expect(stealAttempt.status()).toBe(404);

    await ctxA.close();
    await ctxB.close();
  });

  test("agreement lifecycle: create → patch property → status → list", async ({
    page,
  }) => {
    await signUp(page);
    await completeOnboarding(page);

    const result = await page.evaluate(async () => {
      const create = await fetch("/api/agreements", {
        method: "POST",
        credentials: "include",
      });
      if (!create.ok) {
        return {
          error: "create",
          createStatus: create.status,
          id: "",
          patchStatus: 0,
          statusPost: 0,
          listStatus: 0,
          agreements: [],
        };
      }
      const { id } = (await create.json()) as { id: string };

      const markDraft = await fetch(`/api/agreements/${id}/draft`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skip: true }),
      });
      if (!markDraft.ok) {
        return {
          error: "draft",
          createStatus: create.status,
          id,
          draftStatus: markDraft.status,
          patchStatus: 0,
          statusPost: 0,
          listStatus: 0,
          agreements: [],
        };
      }

      const patch = await fetch(`/api/agreements/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "property",
          data: { city: "Bengaluru", locality: "Indiranagar" },
        }),
      });

      const addons = await fetch(`/api/agreements/${id}/addons`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          esignSignatories: 0,
          notary: false,
          extraCopies: 0,
          delivery: "DIGITAL",
          stampValue: 500,
        }),
      });
      if (!addons.ok) {
        return {
          error: "addons",
          createStatus: create.status,
          id,
          patchStatus: patch.status,
          addonsStatus: addons.status,
          statusPost: 0,
          listStatus: 0,
          agreements: [],
        };
      }

      const paymentRes = await fetch(`/api/agreements/${id}/payment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate: "success" }),
      });

      const list = await fetch("/api/agreements", {
        method: "GET",
        credentials: "include",
      });
      const listJson = list.ok ? await list.json() : { agreements: [] };

      return {
        error: null,
        createStatus: create.status,
        id,
        patchStatus: patch.status,
        statusPost: paymentRes.status,
        listStatus: list.status,
        agreements: listJson.agreements,
      };
    });

    expect(
      result.error,
      `create failed with ${result.createStatus}`,
    ).toBeNull();
    expect(result.createStatus).toBe(200);
    expect(result.patchStatus).toBe(200);
    expect(result.statusPost).toBe(200);
    expect(result.listStatus).toBe(200);
    const mine = result.agreements.find(
      (a: { id: string }) => a.id === result.id,
    );
    expect(mine?.status).toBe("PAID");
  });

  test("POST /api/agreements/[id]/draft rejects skip when upload-draft flow", async ({
    page,
  }) => {
    await signUp(page);
    await completeOnboarding(page);

    const draftSkipStatus = await page.evaluate(async () => {
      const create = await fetch("/api/agreements", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wizardEntry: "UPLOAD_DRAFT" }),
      });
      const { id } = (await create.json()) as { id: string };
      const skip = await fetch(`/api/agreements/${id}/draft`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skip: true }),
      });
      return skip.status;
    });

    expect(draftSkipStatus).toBe(400);
  });

  test("cannot set PAID via status API without payment", async ({ page }) => {
    await signUp(page);
    await completeOnboarding(page);

    const forgeStatus = await page.evaluate(async () => {
      const create = await fetch("/api/agreements", {
        method: "POST",
        credentials: "include",
      });
      if (!create.ok) return { createStatus: create.status, forgeStatus: 0 };
      const { id } = (await create.json()) as { id: string };
      const forge = await fetch(`/api/agreements/${id}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      return { createStatus: create.status, forgeStatus: forge.status };
    });

    expect(forgeStatus.createStatus).toBe(200);
    expect(forgeStatus.forgeStatus).toBe(409);
  });
});
