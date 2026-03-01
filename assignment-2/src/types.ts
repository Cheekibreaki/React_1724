// Centralized custom types used across routes, middleware, and database layer.

/**
 * Provided: Raw author data coming from request bodies.
 * Fields are optional because user input may be incomplete.
 */
export type AuthorBody = {
  name?: string;
  email?: string | null;
  affiliation?: string | null;
};

/**
 * TODO: Raw paper data coming from request bodies.
 *
 * Notes:
 * - Request body fields may be missing, so properties should be optional.
 * - A paper may include an array of authors in the request body.
 */
export type PaperBody = {
  title?: string;
  publishedIn?: string;
  year?: number;
  authors?: AuthorBody[];
};

/**
 * TODO: Validated author data passed into the database layer.
 *
 * Notes:
 * - Middleware should ensure required fields exist and have correct types.
 * - Optional fields may still be omitted or explicitly null depending on your design.
 */
export type AuthorCreateData = {
  name: string;
  email?: string | null;
  affiliation?: string | null;
};

/**
 * TODO: Validated paper data passed into the database layer.
 *
 * Notes:
 * - Middleware should ensure title/publishedIn/year exist and are valid.
 * - Authors should be validated author objects (not raw request body objects).
 */
export type PaperCreateData = {
  title: string;
  publishedIn: string;
  year: number;
  authors: AuthorCreateData[];
};

/**
 * Provided: validated query params for GET /api/papers
 *
 * - Used in middleware
 * - Prevents repeated "as any" casting on req.query and keeps code readable
 */
export type ValidatedPaperQuery = {
  year?: number;
  publishedIn?: string;
  limit?: number;
  offset?: number;
};

/**
 * Provided: validated query params for GET /api/authors
 */
export type ValidatedAuthorQuery = {
  name?: string;
  affiliation?: string;
  limit?: number;
  offset?: number;
};

/**
 * Provided: values stored in res.locals by validation middleware.
 *
 * - res.locals is the "contract" between middleware and route handlers
 * - Having a shared type avoids duplicated shapes and unsafe casts
 */
export type ValidatedLocals = {
  id?: number;
  paperQuery?: ValidatedPaperQuery;
  authorQuery?: ValidatedAuthorQuery;
};
