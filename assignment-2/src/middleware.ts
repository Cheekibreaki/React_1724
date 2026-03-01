// This file contains Express middleware functions.
//
// You DO NOT need to modify requestLogger or errorHandler.
// Your task is to implement:
//   - validatePaperInput
//   - validateAuthorInput
//   - validateResourceId
//   - validatePaperQueryParams
//   - validateAuthorQueryParams

import type { NextFunction, Request, Response } from "express";
import type {
  AuthorBody,
  PaperBody,
  ValidatedAuthorQuery,
  ValidatedLocals,
  ValidatedPaperQuery,
} from "./types";

// -----------------------
// Request logger middleware
// -----------------------
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// -----------------------
// Error handler middleware
// -----------------------
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  // If a response has already been sent, let Express handle it
  if (res.headersSent) return next(err);

  return res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
};

// -----------------------
// validatePaperInput
// -----------------------
/**
 * Middleware: Validate a paper object from the request body.
 *
 * Return value:
 * - Return an array of error messages (strings).
 * - Return [] if there are no validation errors.
 *
 * See handout for requirements to validate:
 * - title: required, must be a non-empty string
 * - publishedIn: required, must be a non-empty string
 * - year: required, must be an integer > 1900
 * - authors: required, must be a non-empty array
 *   - each author must have a valid name
 */
export const validatePaperInput = (paper: PaperBody): string[] => {
  const errors: string[] = [];

  if (!paper.title || typeof paper.title !== "string" || paper.title.trim() === "") {
    errors.push("Title is required");
  }

  if (!paper.publishedIn || typeof paper.publishedIn !== "string" || paper.publishedIn.trim() === "") {
    errors.push("Published venue is required");
  }

  if (paper.year === undefined || paper.year === null) {
    errors.push("Published year is required");
  } else if (typeof paper.year !== "number" || !Number.isInteger(paper.year) || paper.year <= 1900) {
    errors.push("Valid year after 1900 is required");
  }
  if (!paper.authors || !Array.isArray(paper.authors) || paper.authors.length === 0) {
    errors.push("At least one author is required");
  } else {

    for (const author of paper.authors) {
      if (!author.name || typeof author.name !== "string" || author.name.trim() === "") {
        errors.push("Author name is required");
        break;
      }
    }
  }

  return errors;
};

// -----------------------
// validateAuthorInput
// -----------------------
/**
 * Middleware: validate an author object from the request body.
 *
 * Return value:
 * - Return an array of error messages (strings).
 * - Return [] if there are no validation errors.
 *
 * Requirements to validate (see handout):
 * - name: required, must be a non-empty string
 */
export const validateAuthorInput = (author: AuthorBody): string[] => {
  const errors: string[] = [];

  if (!author.name || typeof author.name !== "string" || author.name.trim() === "") {
    errors.push("Name is required");
  }

  return errors;
};

// -----------------------
// validateResourceId
// -----------------------
/**
 * Middleware: validate `:id` route parameter.
 *
 * Requirements:
 * - ID must be a positive integer
 * - On invalid ID: respond with HTTP 400 and a JSON validation error
 * - On valid ID:
 *   - parse it as a number
 *   - store it into res.locals.id
 *   - call next()
 */
export const validateResourceId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  const rawId = req.params.id;

  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid ID format",
    });
  }


  (res.locals as ValidatedLocals).id = parsed;

  next();
};

// -----------------------
// Helper: requireId (provided)
// -----------------------
/**
 * Extracts a validated numeric `id` from `res.locals`.
 *
 * This function assumes that the `validateResourceId` middleware
 * has already run and stored a parsed number in `res.locals.id`.
 *
 * This function can be used in `src/routes/papers.ts` and
 * `src/routes/authors.ts`
 *
 * Why do we need this helper?
 * - It avoids using the non-null assertion operator (`!`),
 *   which is forbidden by strict ESLint rules.
 * - It centralizes the runtime check in one place instead of
 *   repeating it in every route handler.
 *
 * If this function throws, it indicates a programming error
 * (the route forgot to attach `validateResourceId` middleware),
 * not a client error.
 */
export function requireId(res: Response): number {
  const { id } = res.locals as ValidatedLocals;
  if (typeof id !== "number") {
    throw new Error("validateResourceId middleware was not applied");
  }
  return id;
}

// -----------------------
// validatePaperQueryParams
// -----------------------
/**
 * Middleware: validate and parse query params for GET /api/papers
 *
 * Requirements (see handout):
 * - year (optional): must be an integer > 1900
 * - publishedIn (optional): string
 * - limit (optional): positive integer within range [1..100]
 * - offset (optional): non-negative integer
 *
 * On success:
 * - store the parsed result object in res.locals.paperQuery
 * - call next()
 *
 * On invalid query format:
 * - respond with HTTP 400 and a JSON validation error
 */
export const validatePaperQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: ValidatedPaperQuery = {};

    // Validate year (if provided)
    if (req.query.year !== undefined) {
      const year = Number(req.query.year);
      if (!Number.isInteger(year) || year <= 1900) {
        throw new Error("Invalid year");
      }
      parsed.year = year;
    }

    if (req.query.publishedIn !== undefined) {
      parsed.publishedIn = String(req.query.publishedIn);
    }

    if (req.query.limit !== undefined) {
      const limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new Error("Invalid limit");
      }
      parsed.limit = limit;
    }

    if (req.query.offset !== undefined) {
      const offset = Number(req.query.offset);
      if (!Number.isInteger(offset) || offset < 0) {
        throw new Error("Invalid offset");
      }
      parsed.offset = offset;
    }

    (res.locals as ValidatedLocals).paperQuery = parsed;

    next();
  } catch {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format",
    });
  }
};

// -----------------------
// validateAuthorQueryParams
// -----------------------
/**
 * Middleware: validate and parse query params for GET /api/authors
 *
 * Requirements (see handout):
 * - name (optional): string
 * - affiliation (optional): string
 * - limit (optional): positive integer within range [1..100]
 * - offset (optional): non-negative integer
 *
 * On success:
 * - store the parsed result object in res.locals.authorQuery
 * - call next()
 *
 * On invalid query format:
 * - respond with HTTP 400 and a JSON validation error
 */
export const validateAuthorQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed: ValidatedAuthorQuery = {};

    
    if (req.query.name !== undefined) {
      parsed.name = String(req.query.name);
    }
    if (req.query.affiliation !== undefined) {
      parsed.affiliation = String(req.query.affiliation);
    }
    if (req.query.limit !== undefined) {
      const limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new Error("Invalid limit");
      }
      parsed.limit = limit;
    }
    if (req.query.offset !== undefined) {
      const offset = Number(req.query.offset);
      if (!Number.isInteger(offset) || offset < 0) {
        throw new Error("Invalid offset");
      }
      parsed.offset = offset;
    }
    (res.locals as ValidatedLocals).authorQuery = parsed;

    next();
  } catch {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format",
    });
  }
};
