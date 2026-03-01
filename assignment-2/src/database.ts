import type { Prisma } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";
import type { AuthorCreateData, PaperCreateData } from "./types";

// -------------------------
// Helper: Prisma "record not found" detection (provided)
// -------------------------
function isPrismaRecordNotFound(e: unknown): boolean {
  // Prisma throws a known request error with code "P2025" when an update/delete
  // targets a record that does not exist.
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2025"
  );
}

// -------------------------
// Filter types (provided)
// -------------------------
export type GetPapersFilters = {
  year?: number;
  publishedIn?: string;
  limit?: number;
  offset?: number;
};

export type GetAuthorsFilters = {
  name?: string;
  affiliation?: string;
  limit?: number;
  offset?: number;
};

// -------------------------
// TODO: helper to find-or-create an author, returning { id }
// -------------------------
/**
 * Given a validated author object, return an existing author id if an identical
 * author already exists; otherwise create a new author and return its id.
 *
 * Notes:
 * - Be careful about `undefined` vs `null` for optional fields: Prisma expects nulls for missing values.
 * - If multiple identical authors exist, pick the one with the lowest id.
 */
async function findOrCreateAuthorId(
  author: AuthorCreateData,
): Promise<{ id: number }> {
  const existing = await prisma.author.findFirst({
    where: {
      name: author.name,
      email: author.email ?? null,
      affiliation: author.affiliation ?? null,
    },
    orderBy: { id: "asc" },
  });

  if (existing) {
    return { id: existing.id };
  }

  const created = await prisma.author.create({
    data: {
      name: author.name,
      email: author.email ?? null,
      affiliation: author.affiliation ?? null,
    },
  });

  return { id: created.id };
}

// -------------------------
// Database API (students implement TODO parts)
// -------------------------
export const db = {
  // -------------------------
  // Papers
  // -------------------------

  /**
   * Create a paper with its authors (many-to-many).
   *
   * Requirements:
   * - For each author in paperData.authors:
   *   - find an existing author or create a new author
   * - Create the paper
   * - Connect the authors to the paper
   * - Include authors in the returned object, ordered by id ascending
   */
  async createPaper(paperData: PaperCreateData) {
    const authorIds = await Promise.all(
      paperData.authors.map((author) => findOrCreateAuthorId(author))
    );

    const paper = await prisma.paper.create({
      data: {
        title: paperData.title,
        publishedIn: paperData.publishedIn,
        year: paperData.year,
        authors: {
          connect: authorIds,
        },
      },
      include: {
        authors: {
          orderBy: { id: "asc" },
        },
      },
    });

    return paper;
  },

  /**
   * Get papers with optional filters and pagination.
   *
   * Requirements:
   * - Support filtering by:
   *   - year (exact match)
   *   - publishedIn (case-insensitive partial match)
   * - Support pagination:
   *   - limit (default 10)
   *   - offset (default 0)
   */
  async getAllPapers(filters: GetPapersFilters) {
    const { year, publishedIn, limit = 10, offset = 0 } = filters;

    const where: Prisma.PaperWhereInput = {};

    // If `year` is provided, filter by exact year
    if (year !== undefined) {
      where.year = year;
    }

    // If `publishedIn` is provided, perform a case-insensitive partial match
    if (publishedIn !== undefined) {
      where.publishedIn = {
        contains: publishedIn,
        mode: "insensitive",
      };
    }

    // Query the database using transaction for consistency
    const [papers, total] = await prisma.$transaction([
      prisma.paper.findMany({
        where,
        include: {
          authors: {
            orderBy: { id: "asc" },
          },
        },
        orderBy: { id: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.paper.count({ where }),
    ]);

    return { papers, total, limit, offset };
  },


  /**
   * Get a single paper by id.
   *
   * Requirements:
   * - Return the paper (or null if not found) including authors ordered by id ascending
   */
  async getPaperById(id: number) {
    return await prisma.paper.findUnique({
      where: { id },
      include: {
        authors: {
          orderBy: { id: "asc" },
        },
      },
    });
  },

  /**
   * Update a paper by id.
   *
   * Requirements:
   * - Re-connect authors based on the provided paperData.authors
   * - If the paper does not exist, return null (normalize Prisma P2025),
   *   so routes can do `if (!paper) return 404`
   * - Include authors ordered by id ascending
   *
   * Hint:
   * - When updating many-to-many authors:
   *   - clear existing links (set: [])
   *   - connect new ones (connect: authorIds)
   */
  async updatePaper(id: number, paperData: PaperCreateData) {
    const authorIds = await Promise.all(
      paperData.authors.map((author) => findOrCreateAuthorId(author))
    );

    try {
      const paper = await prisma.paper.update({
        where: { id },
        data: {
          title: paperData.title,
          publishedIn: paperData.publishedIn,
          year: paperData.year,
          authors: {
            set: [],
            connect: authorIds,
          },
        },
        include: {
          authors: {
            orderBy: { id: "asc" },
          },
        },
      });

      return paper;
    } catch (e) {
      if (isPrismaRecordNotFound(e)) {
        return null;
      }
      throw e;
    }
  },

  /**
   * Delete a paper by id.
   *
   * Requirements:
   * - If the paper existed and was deleted, return true
   * - If the paper did not exist, return false (normalize Prisma P2025)
   */
  async deletePaper(id: number) {
    try {
      await prisma.paper.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      if (isPrismaRecordNotFound(e)) {
        return false;
      }
      throw e;
    }
  },

  // -------------------------
  // Authors
  // -------------------------

  /**
   * Create an author.
   *
   * Requirements:
   * - Create the author with optional nullable fields
   * - Include papers ordered by id ascending in the returned object
   */
  async createAuthor(authorData: AuthorCreateData) {
    return await prisma.author.create({
      data: {
        name: authorData.name,
        email: authorData.email ?? null,
        affiliation: authorData.affiliation ?? null,
      },
      include: {
        papers: {
          orderBy: { id: "asc" },
        },
      },
    });
  },

  /**
   * Get authors with optional filters and pagination.
   *
   * Requirements:
   * - Support filtering by:
   *   - name (case-insensitive partial)
   *   - affiliation (case-insensitive partial)
   * - Support pagination (limit default 10, offset default 0)
   * - Return authors ordered by id ascending
   * - Also return total count matching filters
   */
  async getAllAuthors(filters: GetAuthorsFilters) {
    const { name, affiliation, limit = 10, offset = 0 } = filters;

    const where: Prisma.AuthorWhereInput = {};

    if (name !== undefined) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (affiliation !== undefined) {
      where.affiliation = {
        contains: affiliation,
        mode: "insensitive",
      };
    }

    const [authors, total] = await prisma.$transaction([
      prisma.author.findMany({
        where,
        include: {
          papers: {
            orderBy: { id: "asc" },
          },
        },
        orderBy: { id: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.author.count({ where }),
    ]);

    return { authors, total, limit, offset };
  },

  /**
   * Get a single author by id.
   *
   * Requirements:
   * - Return the author (or null) including papers ordered by id ascending
   */
  async getAuthorById(id: number) {
    return await prisma.author.findUnique({
      where: { id },
      include: {
        papers: {
          orderBy: { id: "asc" },
        },
      },
    });
  },

  /**
   * Update an author by id.
   *
   * Requirements:
   * - If the author does not exist, return null (normalize Prisma P2025)
   * - Include papers ordered by id ascending
   */
  async updateAuthor(id: number, authorData: AuthorCreateData) {
    try {
      return await prisma.author.update({
        where: { id },
        data: {
          name: authorData.name,
          email: authorData.email ?? null,
          affiliation: authorData.affiliation ?? null,
        },
        include: {
          papers: {
            orderBy: { id: "asc" },
          },
        },
      });
    } catch (e) {
      if (isPrismaRecordNotFound(e)) {
        return null;
      }
      throw e;
    }
  },

  /**
   * Delete an author by id.
   *
   * Requirements:
   * - If author does not exist: do nothing
   * - Enforce the "only author" constraint:
   *   - If the author is the only author of one or more papers, throw an Error
   * - Otherwise, delete the author
   *
   * Hint:
   * - First fetch the author including their papers and each paper's authors
   * - Then check if any paper has only one author
   */
  async deleteAuthor(id: number) {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        papers: {
          include: {
            authors: true,
          },
        },
      },
    });

    if (!author) {
      return;
    }

    for (const paper of author.papers) {
      if (paper.authors.length === 1) {
        throw new Error("Cannot delete the only author of a paper");
      }
    }
    await prisma.author.delete({
      where: { id },
    });
  },
};
