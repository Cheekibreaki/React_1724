import { test, expect } from "@playwright/test";
import type {
  Paper,
  Author,
  PapersListResponse,
  AuthorsListResponse,
} from "../src/types";
const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:3000";

// --------------------
// Backend API helpers
// --------------------
async function apiGetJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed with status ${res.status}`);
  return (await res.json()) as T;
}

async function apiPostJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${path} failed with status ${res.status}. ${text}`);
  }
  return (await res.json()) as T;
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}${path}`, { method: "DELETE" });
  if (!res.ok)
    throw new Error(`DELETE ${path} failed with status ${res.status}`);
}

async function deleteAllPapers(): Promise<void> {
  const limit = 100;
  while (true) {
    const data = await apiGetJSON<PapersListResponse>(
      `/api/papers?limit=${limit}&offset=0`,
    );
    if (!data.papers || data.papers.length === 0) break;
    for (const p of data.papers) await apiDelete(`/api/papers/${p.id}`);
  }
}

async function deleteAllAuthors(): Promise<void> {
  const limit = 100;
  while (true) {
    const data = await apiGetJSON<AuthorsListResponse>(
      `/api/authors?limit=${limit}&offset=0`,
    );
    if (!data.authors || data.authors.length === 0) break;
    for (const a of data.authors) await apiDelete(`/api/authors/${a.id}`);
  }
}

async function waitForExactText(
  page: import("@playwright/test").Page,
  msg: string,
) {
  await expect(page.getByText(msg, { exact: true })).toBeVisible({
    timeout: 10_000,
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test.describe("Assignment 3", () => {
  test.beforeAll(async () => {
    // Ensure backend reachable
    await apiGetJSON<PapersListResponse>("/api/papers?limit=1&offset=0");
  });

  // Make every test independent/deterministic
  test.beforeEach(async () => {
    await deleteAllPapers();
    await deleteAllAuthors();
  });

  // ============================================================
  // Home Route (/): Paper List Display
  // ============================================================

  test("Paper List: Loading State shows 'Loading papers...' initially", async ({
    page,
  }) => {
    // Create delay on papers request so UI must show loading
    await page.route("**/api/papers**", async (route) => {
      await sleep(1500);
      await route.continue();
    });

    await page.goto(FRONTEND_URL);

    // Must appear during the delayed fetch
    await expect(
      page.getByText("Loading papers...", { exact: true }),
    ).toBeVisible({
      timeout: 2000,
    });

    // Eventually settles (DB empty => No papers found)
    await expect(
      page.getByText("No papers found", { exact: true }),
    ).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Paper List: Error State shows 'Error loading papers' if GET /api/papers fails", async ({
    page,
  }) => {
    await page.route("**/api/papers**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "boom" }),
      });
    });

    await page.goto(FRONTEND_URL);
    await waitForExactText(page, "Error loading papers");
  });

  test("Paper List: Paper Rendering for 2 papers", async ({ page }) => {
    const unique = `${Date.now()}`;

    // Create authors
    const a1 = await apiPostJSON<Author>("/api/authors", {
      name: `A1 ${unique}`,
      email: null,
      affiliation: null,
    });
    const a2 = await apiPostJSON<Author>("/api/authors", {
      name: `A2 ${unique}`,
      email: null,
      affiliation: null,
    });
    const a3 = await apiPostJSON<Author>("/api/authors", {
      name: `A3 ${unique}`,
      email: null,
      affiliation: null,
    });
    const a4 = await apiPostJSON<Author>("/api/authors", {
      name: `A4 ${unique}`,
      email: null,
      affiliation: null,
    });

    // Create 2 papers, each with 2 authors (backend expects objects)
    await apiPostJSON<Paper>("/api/papers", {
      title: `P1 ${unique}`,
      publishedIn: "ICSE",
      year: 2024,
      authors: [
        {
          id: a1.id,
          name: a1.name,
          email: a1.email,
          affiliation: a1.affiliation,
        },
        {
          id: a2.id,
          name: a2.name,
          email: a2.email,
          affiliation: a2.affiliation,
        },
      ],
    });

    await apiPostJSON<Paper>("/api/papers", {
      title: `P2 ${unique}`,
      publishedIn: "NeurIPS",
      year: 2023,
      authors: [
        {
          id: a3.id,
          name: a3.name,
          email: a3.email,
          affiliation: a3.affiliation,
        },
        {
          id: a4.id,
          name: a4.name,
          email: a4.email,
          affiliation: a4.affiliation,
        },
      ],
    });

    await page.goto(FRONTEND_URL);

    // First paper: title, venue+year, authors (2 names), comma-separated
    await expect(page.locator("h3", { hasText: `P1 ${unique}` })).toBeVisible();
    await expect(
      page.getByText("Published in ICSE, 2024", { exact: true }),
    ).toBeVisible();

    const p1AuthorsLine = page.locator("p", { hasText: "Authors:" }).filter({
      hasText: `A1 ${unique}`,
    });
    await expect(p1AuthorsLine).toContainText(`A1 ${unique}`);
    await expect(p1AuthorsLine).toContainText(`A2 ${unique}`);
    // Comma-separated (at least one comma+space between names)
    await expect(p1AuthorsLine).toContainText(`A1 ${unique},`);
    await expect(p1AuthorsLine).toContainText(`, A2 ${unique}`);

    // Second paper: title, venue+year, authors
    await expect(page.locator("h3", { hasText: `P2 ${unique}` })).toBeVisible();
    await expect(
      page.getByText("Published in NeurIPS, 2023", { exact: true }),
    ).toBeVisible();

    const p2AuthorsLine = page.locator("p", { hasText: "Authors:" }).filter({
      hasText: `A3 ${unique}`,
    });
    await expect(p2AuthorsLine).toContainText(`A3 ${unique}`);
    await expect(p2AuthorsLine).toContainText(`A4 ${unique}`);
  });

  // ============================================================
  // Home Route (/): Paper Creation Form
  // ============================================================

  test("Create Form: Rendering (inputs + multi-select) and dropdown contains all authors in DB", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;
    await apiPostJSON<Author>("/api/authors", {
      name: `Auth1 ${unique}`,
      email: null,
      affiliation: null,
    });
    await apiPostJSON<Author>("/api/authors", {
      name: `Auth2 ${unique}`,
      email: null,
      affiliation: null,
    });
    await apiPostJSON<Author>("/api/authors", {
      name: `Auth3 ${unique}`,
      email: null,
      affiliation: null,
    });

    const authorsData = await apiGetJSON<AuthorsListResponse>(
      "/api/authors?limit=100&offset=0",
    );
    const allNames = authorsData.authors.map((a) => a.name);

    await page.goto(FRONTEND_URL);

    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('input[name="publishedIn"]')).toBeVisible();
    await expect(page.locator('input[name="year"]')).toBeVisible();

    const select = page.locator("select[multiple]");
    await expect(select).toBeVisible();
    await expect(select).toBeEnabled();

    const optionTexts = await select.locator("option").allTextContents();
    for (const name of allNames) expect(optionTexts).toContain(name);
  });

  test("Author Dropdown: Error state shows 'Error loading authors' and dropdown disabled", async ({
    page,
  }) => {
    await page.route("**/api/authors**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "authors failed" }),
      });
    });

    await page.goto(FRONTEND_URL);

    await waitForExactText(page, "Error loading authors");

    const select = page.locator("select[multiple]");
    await expect(select).toBeVisible();
    await expect(select).toBeDisabled();
  });

  test("Author Dropdown: Disabled during loading, enabled after load", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;
    await apiPostJSON<Author>("/api/authors", {
      name: `Auth ${unique}`,
      email: null,
      affiliation: null,
    });

    await page.route("**/api/authors**", async (route) => {
      // Delay the authors response to force a visible loading window
      await sleep(1500);
      await route.continue();
    });

    await page.goto(FRONTEND_URL);

    const select = page.locator("select[multiple]");
    await expect(select).toBeVisible();

    // During loading: disabled
    await expect(select).toBeDisabled({ timeout: 2000 });

    // After load: enabled
    await expect(select).toBeEnabled({ timeout: 10_000 });
  });

  test("Create Form Validation: 'Title is required' if empty string", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;
    const a = await apiPostJSON<Author>("/api/authors", {
      name: `Auth ${unique}`,
      email: null,
      affiliation: null,
    });

    await page.goto(FRONTEND_URL);

    await page.fill('input[name="title"]', "");
    await page.fill('input[name="publishedIn"]', "IEEE");
    await page.fill('input[name="year"]', "2024");

    // even if authors exist, first error must be title
    await page.locator("select[multiple]").selectOption([String(a.id)]);
    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toHaveText("Title is required");
  });

  test("Create Form Validation: 'Publication venue is required' if empty string", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;
    const a = await apiPostJSON<Author>("/api/authors", {
      name: `Auth ${unique}`,
      email: null,
      affiliation: null,
    });

    await page.goto(FRONTEND_URL);

    await page.fill('input[name="title"]', "Some Title");
    await page.fill('input[name="publishedIn"]', "");
    await page.fill('input[name="year"]', "2024");
    await page.locator("select[multiple]").selectOption([String(a.id)]);
    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toHaveText(
      "Publication venue is required",
    );
  });

  test("Create Form Validation: 'Publication year is required' if empty", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;
    const a = await apiPostJSON<Author>("/api/authors", {
      name: `Auth ${unique}`,
      email: null,
      affiliation: null,
    });

    await page.goto(FRONTEND_URL);

    await page.fill('input[name="title"]', "Some Title");
    await page.fill('input[name="publishedIn"]', "IEEE");
    await page.fill('input[name="year"]', "");
    await page.locator("select[multiple]").selectOption([String(a.id)]);
    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toHaveText(
      "Publication year is required",
    );
  });

  test("Create Form Validation: 'Valid year after 1900 is required' if year=1900", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;
    const a = await apiPostJSON<Author>("/api/authors", {
      name: `Auth ${unique}`,
      email: null,
      affiliation: null,
    });

    await page.goto(FRONTEND_URL);

    await page.fill('input[name="title"]', "Some Title");
    await page.fill('input[name="publishedIn"]', "IEEE");
    await page.fill('input[name="year"]', "1900");
    await page.locator("select[multiple]").selectOption([String(a.id)]);
    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toHaveText(
      "Valid year after 1900 is required",
    );
  });

  test("Create Form Validation: 'Please select at least one author' if none selected", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;
    await apiPostJSON<Author>("/api/authors", {
      name: `Auth ${unique}`,
      email: null,
      affiliation: null,
    });

    await page.goto(FRONTEND_URL);

    await page.fill('input[name="title"]', "Some Title");
    await page.fill('input[name="publishedIn"]', "IEEE");
    await page.fill('input[name="year"]', "2024");
    // no selectOption
    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toHaveText(
      "Please select at least one author",
    );
  });

  test("Successful Creation: message + reload after 3s + paper in DOM + DB correct", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;

    const a1 = await apiPostJSON<Author>("/api/authors", {
      name: `John ${unique}`,
      email: "john@example.com",
      affiliation: "UofT",
    });

    await page.goto(FRONTEND_URL);

    const select = page.locator("select[multiple]");
    await expect(select).toBeVisible();
    await expect(select).toBeEnabled();

    await page.fill('input[name="title"]', `Created ${unique}`);
    await page.fill('input[name="publishedIn"]', "IEEE");
    await page.fill('input[name="year"]', "2023");
    await select.selectOption([String(a1.id)]);

    await page.click('button[type="submit"]');

    await waitForExactText(page, "Paper created successfully");

    // Reload after 3s
    await page.waitForTimeout(3500);

    // DOM check (after reload)
    await expect(
      page.locator("h3", { hasText: `Created ${unique}` }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText("Published in IEEE, 2023", { exact: true }),
    ).toBeVisible();

    const authorsLine = page.locator("p", { hasText: "Authors:" });
    await expect(authorsLine).toContainText(`John ${unique}`);

    // DB check
    const papersData = await apiGetJSON<PapersListResponse>(
      "/api/papers?limit=100&offset=0",
    );
    const created = papersData.papers.find(
      (p) => p.title === `Created ${unique}`,
    );
    expect(created).toBeTruthy();
    expect(created?.publishedIn).toBe("IEEE");
    expect(created?.year).toBe(2023);
    expect(created?.authors.some((a) => a.id === a1.id)).toBe(true);
  });

  // ============================================================
  // Home Route (/): Delete Functionality
  // ============================================================

  test("Delete: Confirm message + success (2 papers in DB, delete 1)", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;

    // Create 2 papers so deleting one does NOT trigger the empty-state.
    const p1 = await apiPostJSON<Paper>("/api/papers", {
      title: `Delete Target ${unique}`,
      publishedIn: "ICSE",
      year: 2025,
      authors: [{ name: `Author T ${unique}`, email: null, affiliation: null }],
    });

    const p2 = await apiPostJSON<Paper>("/api/papers", {
      title: `Delete Keep ${unique}`,
      publishedIn: "NeurIPS",
      year: 2024,
      authors: [{ name: `Author K ${unique}`, email: null, affiliation: null }],
    });

    await page.goto(FRONTEND_URL);

    // Both appear in DOM
    await expect(
      page.locator("h3", { hasText: `Delete Target ${unique}` }),
    ).toBeVisible();
    await expect(
      page.locator("h3", { hasText: `Delete Keep ${unique}` }),
    ).toBeVisible();

    // Assert confirm dialog message AND accept
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toBe(
        `Are you sure you want to delete Delete Target ${unique}?`,
      );
      await dialog.accept();
    });

    // Click Delete for target paper
    const heading = page.getByRole("heading", {
      name: `Delete Target ${unique}`,
    });
    const card = heading.locator("..");
    await card.getByRole("button", { name: "Delete" }).click();

    // Success message
    await waitForExactText(page, "Paper deleted successfully");

    // Target removed from DOM, keep remains
    await expect(
      page.locator("h3", { hasText: `Delete Target ${unique}` }),
    ).toHaveCount(0);
    await expect(
      page.locator("h3", { hasText: `Delete Keep ${unique}` }),
    ).toBeVisible();

    // DB: target is gone (404), keep still exists
    const res1 = await fetch(`${BACKEND_URL}/api/papers/${p1.id}`);
    expect(res1.status).toBe(404);

    const keep = await apiGetJSON<Paper>(`/api/papers/${p2.id}`);
    expect(keep.title).toBe(`Delete Keep ${unique}`);
  });

  // ============================================================
  // Edit Route (/edit/:id): Page Rendering
  // ============================================================

  test("Edit: Loading State shows 'Loading paper details...' initially", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;

    const createdPaper = await apiPostJSON<Paper>("/api/papers", {
      title: `Edit Loading ${unique}`,
      publishedIn: "ACM",
      year: 2022,
      authors: [{ name: `Author ${unique}`, email: null, affiliation: null }],
    });

    await page.route(`**/api/papers/${createdPaper.id}`, async (route) => {
      await sleep(1500);
      await route.continue();
    });

    await page.goto(`${FRONTEND_URL}/edit/${createdPaper.id}`);

    await expect(
      page.getByText("Loading paper details...", { exact: true }),
    ).toBeVisible({
      timeout: 2000,
    });

    // Eventually form shows
    await expect(page.getByRole("heading", { name: "Edit Paper" })).toBeVisible(
      {
        timeout: 10_000,
      },
    );
  });

  test("Edit: Error State shows 'Error loading paper' if GET /api/papers/:id fails", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;

    const createdPaper = await apiPostJSON<Paper>("/api/papers", {
      title: `Edit Error ${unique}`,
      publishedIn: "ACM",
      year: 2022,
      authors: [{ name: `Author ${unique}`, email: null, affiliation: null }],
    });

    await page.route(`**/api/papers/${createdPaper.id}`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "boom" }),
      });
    });

    await page.goto(`${FRONTEND_URL}/edit/${createdPaper.id}`);
    await waitForExactText(page, "Error loading paper");
  });

  test("Edit: Not Found State shows 'Paper not found' on /edit/999", async ({
    page,
  }) => {
    await page.goto(`${FRONTEND_URL}/edit/999`);
    await expect(
      page.getByText("Paper not found", { exact: true }),
    ).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Edit: Form pre-population matches DB (title/venue/year + authors displayed)", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;

    // Create authors explicitly so we can check exact names
    const a1 = await apiPostJSON<Author>("/api/authors", {
      name: `Au1 ${unique}`,
      email: null,
      affiliation: null,
    });
    const a2 = await apiPostJSON<Author>("/api/authors", {
      name: `Au2 ${unique}`,
      email: null,
      affiliation: null,
    });

    // Create paper with these authors (backend expects objects)
    const createdPaper = await apiPostJSON<Paper>("/api/papers", {
      title: `Prepop ${unique}`,
      publishedIn: "ICSE",
      year: 2024,
      authors: [
        {
          id: a1.id,
          name: a1.name,
          email: a1.email,
          affiliation: a1.affiliation,
        },
        {
          id: a2.id,
          name: a2.name,
          email: a2.email,
          affiliation: a2.affiliation,
        },
      ],
    });

    const dbPaper = await apiGetJSON<Paper>(`/api/papers/${createdPaper.id}`);

    await page.goto(`${FRONTEND_URL}/edit/${createdPaper.id}`);

    await expect(page.getByRole("heading", { name: "Edit Paper" })).toBeVisible(
      { timeout: 10_000 },
    );

    // Inputs match DB
    await expect(page.locator('input[name="title"]')).toHaveValue(
      dbPaper.title,
    );
    await expect(page.locator('input[name="publishedIn"]')).toHaveValue(
      dbPaper.publishedIn,
    );
    await expect(page.locator('input[name="year"]')).toHaveValue(
      String(dbPaper.year),
    );

    // Authors displayed and match DB (by names)
    const authorsFieldset = page.locator("fieldset", {
      has: page.getByText("Authors:", { exact: true }),
    });
    await expect(authorsFieldset).toBeVisible();

    for (const a of dbPaper.authors) {
      await expect(authorsFieldset).toContainText(a.name);
    }
  });

  // ============================================================
  // Edit Route (/edit/:id): Paper Update
  // ============================================================

  test("Edit Validation: 'Title is required' if title is whitespace only", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;

    const createdPaper = await apiPostJSON<Paper>("/api/papers", {
      title: `Valid ${unique}`,
      publishedIn: "ICSE",
      year: 2024,
      authors: [{ name: `Author ${unique}`, email: null, affiliation: null }],
    });

    await page.goto(`${FRONTEND_URL}/edit/${createdPaper.id}`);

    await page.fill('input[name="title"]', "   ");
    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toHaveText("Title is required");
  });

  test("Successful Update: 'Paper updated successfully' message", async ({
    page,
  }) => {
    const unique = `${Date.now()}`;

    const createdPaper = await apiPostJSON<Paper>("/api/papers", {
      title: `Original ${unique}`,
      publishedIn: "ACM",
      year: 2022,
      authors: [
        { name: `Au1 ${unique}`, email: null, affiliation: null },
        { name: `Au2 ${unique}`, email: null, affiliation: null },
      ],
    });

    await page.goto(`${FRONTEND_URL}/edit/${createdPaper.id}`);

    await page.fill('input[name="title"]', `Updated1 ${unique}`);
    await page.fill('input[name="publishedIn"]', "IEEE");
    await page.fill('input[name="year"]', "2025");

    await page.click('button[type="submit"]');

    await waitForExactText(page, "Paper updated successfully");
  });
});
