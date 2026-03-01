import { Router } from "express";
import { db } from "../database";
import * as middleware from "../middleware";
import type { ValidatedLocals } from "../types";

const router = Router();

// -----------------------
// Helper (provided)
// -----------------------
function isErrorWithMessage(e: unknown): e is { message: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message?: unknown }).message === "string"
  );
}

// -----------------------
// GET /api/authors
// -----------------------
/**
 * List authors with optional query parameters.
 *
 * Requirements:
 * - Apply validateAuthorQueryParams middleware
 * - Support optional query params:
 *   - name
 *   - affiliation
 *   - limit (default 10)
 *   - offset (default 0)
 * - Call db.getAllAuthors(...) with parsed values
 * - Return the result as JSON
 */
router.get(
  "/",
  middleware.validateAuthorQueryParams,
  async (req, res, next) => {
    try {
      // TODO: read validated query params from res.locals
      // const { authorQuery } = res.locals as ValidatedLocals;
      // TODO: apply defaults for limit and offset
      // TODO: call db.getAllAuthors({ name, affiliation, limit, offset })
      // TODO: res.json(result);
      const { authorQuery } = res.locals as ValidatedLocals;
      const name = authorQuery?.name;
      const affiliation = authorQuery?.affiliation;
      const limit = authorQuery?.limit ?? 10;
      const offset = authorQuery?.offset ?? 0;
      const result = await db.getAllAuthors({ name, affiliation, limit, offset });
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// GET /api/authors/:id
// -----------------------
/**
 * Get a single author by id.
 *
 * Requirements:
 * - Apply validateResourceId middleware
 * - Extract the validated id using middleware.requireId
 * - If author not found: return 404
 * - Otherwise: return author as JSON
 */
router.get(
  "/:id",
  // TODO: attach validateResourceId middleware
  middleware.validateResourceId,
  async (_req, res, next) => {
    try {
      const id = middleware.requireId(res);
      const author = await db.getAuthorById(id);
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }
      res.json(author);
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// POST /api/authors
// -----------------------
router.post("/", async (req, res, next) => {
  try {
    const errors = middleware.validateAuthorInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", messages: errors });
    }
    const author = await db.createAuthor(req.body);
    return res.status(201).json(author);
  } catch (e) {
    next(e);
  }
});

// -----------------------
// PUT /api/authors/:id
// -----------------------
router.put(
  "/:id",
  middleware.validateResourceId,
  async (req, res, next) => {
    try {
      const errors = middleware.validateAuthorInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: "Validation Error", messages: errors });
      }
      const id = middleware.requireId(res);
      const updated = await db.updateAuthor(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Author not found" });
      }
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// DELETE /api/authors/:id
// -----------------------
router.delete(
  "/:id",
  middleware.validateResourceId,
  async (_req, res, next) => {
    try {
      const authorId = middleware.requireId(res);

      const author = await db.getAuthorById(authorId);
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }

      try {
        await db.deleteAuthor(authorId);
        return res.status(204).send();
      } catch (e: unknown) {
        if (isErrorWithMessage(e) && e.message.includes("only author")) {
          return res.status(400).json({
            error: "Constraint Error",
            message: e.message,
          });
        }
        throw e;
      }
    } catch (e) {
      next(e);
    }
  },
);

export default router;
