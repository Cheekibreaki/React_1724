import { Router } from "express";
import { db } from "../database";
import * as middleware from "../middleware";
import type { ValidatedLocals } from "../types";

const router = Router();

// -----------------------
// GET /api/papers
// -----------------------
router.get(
  "/",
  middleware.validatePaperQueryParams,
  async (req, res, next) => {
    try {
      const { paperQuery } = res.locals as ValidatedLocals;
      const year = paperQuery?.year;
      const publishedIn = paperQuery?.publishedIn;
      const limit = paperQuery?.limit ?? 10;
      const offset = paperQuery?.offset ?? 0;
      const result = await db.getAllPapers({ year, publishedIn, limit, offset });
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// GET /api/papers/:id
// -----------------------
router.get(
  "/:id",
  middleware.validateResourceId,
  async (_req, res, next) => {
    try {
      const id = middleware.requireId(res);
      const paper = await db.getPaperById(id);
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      res.json(paper);
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// POST /api/papers
// -----------------------
router.post("/", async (req, res, next) => {
  try {
    const errors = middleware.validatePaperInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", messages: errors });
    }
    const paper = await db.createPaper(req.body);
    return res.status(201).json(paper);
  } catch (e) {
    next(e);
  }
});

// -----------------------
// PUT /api/papers/:id
// -----------------------
router.put(
  "/:id",
  middleware.validateResourceId,
  async (req, res, next) => {
    try {
      const errors = middleware.validatePaperInput(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ error: "Validation Error", messages: errors });
      }
      const id = middleware.requireId(res);
      const updated = await db.updatePaper(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Paper not found" });
      }
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },
);

// -----------------------
// DELETE /api/papers/:id
// -----------------------
router.delete(
  "/:id",
  middleware.validateResourceId,
  async (_req, res, next) => {
    try {
      const id = middleware.requireId(res);
      const paper = await db.getPaperById(id);
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      await db.deletePaper(id);
      return res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
);

export default router;
