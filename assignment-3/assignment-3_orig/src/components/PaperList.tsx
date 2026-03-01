// This component displays a list of papers with edit and delete buttons.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "../styles/PaperList.module.css";
import type { Paper, PapersListResponse } from "../types";

export default function PaperList() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Error message to display when fetching papers fails.
   * Required text: "Error loading papers"
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Message area used for deletion success/failure messages.
   * Required texts:
   * - "Paper deleted successfully"
   * - "Error deleting paper"
   */
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // TODO: Fetch papers from the API when the component mounts.
  //
  // Requirements:
  // - Endpoint: GET /api/papers
  // - Loading state: render "Loading papers..."
  // - Error state: render "Error loading papers"
  // - Empty state: render "No papers found"
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        // TODO: fetch("/api/papers")
        // TODO: if response not ok, throw new Error()
        // TODO: parse JSON as PapersListResponse
        // TODO: setPapers(...) with the returned list
      } catch {
        // TODO: set error state to "Error loading papers"
      } finally {
        // TODO: set loading state to false
      }
    };

    fetchPapers();
  }, []);

  // TODO: Implement delete functionality.
  //
  // Requirements:
  // - Clicking "Delete" must show confirm() dialog:
  //   `Are you sure you want to delete [paper title]?`
  // - If user clicks Cancel: do nothing
  // - If OK:
  //   - Send DELETE /api/papers/:id
  //   - On success: show "Paper deleted successfully" and remove it from the list
  //   - On failure: show "Error deleting paper"
  const handleDelete = async (paperId: number, paperTitle: string) => {
    // TODO: clear previous message

    // TODO: confirm(...)

    try {
      // TODO: fetch(`/api/papers/${paperId}`, { method: "DELETE" })
      // TODO: if response not ok, throw new Error()
      // TODO: remove the paper from state
      // TODO: set message "Paper deleted successfully";
    } catch {
      // TODO: set message "Error deleting paper";
    }
  };

  // Required state messages
  if (loading) return <div>/* TODO */</div>;
  if (error) return <div>/* TODO */</div>;
  if (papers.length === 0) return <div>/* TODO */</div>;

  return (
    <div /* TODO: Style with styles.container */>
      {/* TODO: Render deletion success/failure message if present */}
      {message && <div>{/* TODO */}</div>}

      {/* TODO: Render paper list */}
      {papers.map((paper) => (
        <div key={paper.id} /* TODO: Style with styles.paper */>
          {/* TODO: Title */}
          <h3 /* TODO: Style with styles.paperTitle */>{/* TODO */}</h3>

          {/* TODO: Venue + year */}
          <p>
            Published in {/* TODO */}, {/* TODO */}
          </p>

          {/* TODO: Authors (comma-separated names) */}
          <p>Authors: {/* TODO */}</p>

          {/* TODO: Edit button navigates to /edit/:id */}
          <button type="button" onClick={/* TODO */}>
            Edit
          </button>

          {/* TODO: Delete button triggers confirmation + deletion */}
          <button type="button" onClick={/* TODO */}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
