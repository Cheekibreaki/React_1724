/**
 * Assignment 3 Types
 *
 * Keep your types practical:
 * - Use these types to describe the JSON returned by your backend.
 * - Use separate types for frontend-only form state (e.g., selected author IDs).
 *
 * You may add additional types if needed, but avoid over-engineering.
 */

// =====================
// Core DB-backed entities
// =====================

export type Author = {
  id: number;
  name: string;
  email: string | null;
  affiliation: string | null;
  createdAt: string;
  updatedAt: string;

  /**
   * The backend includes related papers for each author.
   * We do not need this for the dropdown in this assignment.
   *
   * Keeping it optional ensures type correctness without
   * requiring you to fully model nested relationships.
   */
  papers?: Array<{
    id: number;
    title: string;
    publishedIn: string;
    year: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type Paper = {
  /**
   * TODO:
   * Define the Paper type based on the JSON returned
   * from GET /api/papers and GET /api/papers/:id.
   */
};

// =====================
// List responses (GET /api/papers, GET /api/authors)
// =====================

export type PapersListResponse = {
  papers: Paper[];
  total: number;
  limit: number;
  offset: number;
};

export type AuthorsListResponse = {
  /**
   * TODO:
   * Define the shape of the response returned by
   * GET /api/authors.
   */
};

// =====================
// Frontend-only form state (provided)
// =====================

export type PaperFormData = {
  title: string;
  publishedIn: string;
  year: number;

  /**
   * Used only in create mode.
   * In edit mode, authors must remain unchanged
   * and should be preserved from the fetched paper.
   */
  authorIds: number[];
};

// =====================
// API payloads (what frontend sends) (provided)
// =====================

export type AuthorInput = {
  name: string;
  email: string | null;
  affiliation: string | null;
};

export type PaperCreatePayload = {
  title: string;
  publishedIn: string;
  year: number;
  authors: AuthorInput[];

  /**
   * Important:
   * The backend expects an array of full author objects,
   * not just author IDs.
   *
   * You will map selected authorIds -> corresponding
   * AuthorInput objects before sending the POST request.
   */
};

export type PaperUpdatePayload = PaperCreatePayload;
