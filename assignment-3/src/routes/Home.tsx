// src/routes/Home.tsx
// This component serves as the home page, displaying the paper list and create form.

import { useState } from "react";
import type {
  Author,
  AuthorsListResponse,
  PaperFormData,
  PaperCreatePayload,
} from "../types";
import PaperForm from "../components/PaperForm";
import PaperList from "../components/PaperList";
import styles from "../styles/Home.module.css";

export default function Home() {
  /**
   * Message displayed after create success/failure.
   * Required messages:
   * - "Paper created successfully"
   * - "Error creating paper"
   */
  const [message, setMessage] = useState<string | null>(null);

  /**
   * TODO:
   * Implement paper creation logic.
   *
   * Steps required:
   * 1. Clear any previous message.
   * 2. Fetch all authors from GET /api/authors.
   * 3. Map selected authorIds (from PaperFormData)
   *    to full author objects required by backend.
   * 4. Construct PaperCreatePayload.
   * 5. Send POST /api/papers with JSON body.
   * 6. On success:
   *      - Set message "Paper created successfully"
   *      - Reload page after 3 seconds
   *        (No need to refresh paper list manually)
   * 7. On failure:
   *      - Set error "Error creating paper"
   *
   * Important:
   * Backend expects authors as objects (not just IDs).
   */
  const handleCreatePaper = async (paperData: PaperFormData) => {
    try {
      // TODO: clear message

      // TODO: fetch("/api/authors")
      // TODO: if response not ok, throw new Error()
      // TODO: parse as AuthorsListResponse

      // TODO:
      // Map paperData.authorIds -> full author objects
      // Then transform into minimal AuthorInput objects
      // (name, email, affiliation)

      const createPayload: PaperCreatePayload = {
        title: paperData.title,
        publishedIn: paperData.publishedIn,
        year: paperData.year,
        authors: [], // TODO: replace with mapped authors
      };

      // TODO: POST /api/papers with JSON body

      // TODO: if response not ok, throw new Error()

      // TODO: set message "Paper created successfully"

      // TODO: Reload page after 3 seconds
      // setTimeout(() => window.location.reload(), 3000);
    } catch {
      // TODO: set message "Error creating paper"
    }
  };

  return (
    <div /* TODO: Style with styles.container */>
      <h1 /* TODO: Style with styles.title */>Paper Management System</h1>

      {/* TODO: Render success/error message if present */}
      {message && <div>{/* TODO */}</div>}

      <h2 /* TODO: Style with styles.sectionTitle */>Create New Paper</h2>
      <PaperForm onSubmit={handleCreatePaper} />

      <h2 /* TODO: Style with styles.sectionTitle */>Papers</h2>
      <PaperList />
    </div>
  );
}
