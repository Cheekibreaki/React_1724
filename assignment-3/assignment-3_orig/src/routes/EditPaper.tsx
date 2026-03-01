// This component handles editing an existing paper.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PaperForm from "../components/PaperForm";
import type { Paper, PaperFormData, PaperUpdatePayload } from "../types";

export default function EditPaper() {
  const { id } = useParams(); // string | undefined
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  /**
   * Message displayed after update success/failure.
   * Required:
   * - "Paper updated successfully"
   * - "Error updating paper"
   */
  const [message, setMessage] = useState<string | null>(null);

  // TODO: Fetch paper details on mount and when id changes.
  //
  // Requirements:
  // - Endpoint: GET /api/papers/:id
  // - If 404: show "Paper not found"
  // - If other failure: show "Error loading paper"
  useEffect(() => {
    if (!id) {
      // Route should always provide it, but this keeps TS + runtime safe.
      setPaper(null);
      setLoading(false);
      return;
    }

    const fetchPaper = async () => {
      try {
        // TODO: fetch(`/api/papers/${id}`)
        // TODO: if status === 404 -> setPaper(null) and return
        // TODO: if not ok -> throw new Error()
        // TODO: parse JSON as Paper and setPaper(...)
      } catch {
        // TODO: set loadError state to true so UI shows "Error loading paper"
      } finally {
        // TODO: set loading state to false
      }
    };

    fetchPaper();
  }, [id]);

  // TODO: Implement update behavior.
  //
  // Requirements:
  // - Authors are NOT editable:
  //   - The dropdown is still rendered and selectable in the UI
  //   - BUT the PUT request must preserve the original authors from the fetched paper
  //
  // - Endpoint: PUT /api/papers/:id
  // - On success:
  //   - Render "Paper updated successfully" in the DOM
  //   - Navigate to "/" after 3 seconds
  //   - Any edits during the 3-second delay should not be recorded
  // - On failure:
  //   - Render "Error updating paper"
  const handleUpdatePaper = async (paperData: PaperFormData) => {
    if (!id || !paper) return;

    try {
      // TODO: clear previous message (set to null)

      // TODO:
      // Build the update payload (PaperUpdatePayload):
      // - title, publishedIn, year come from paperData
      // - authors must come from the ORIGINAL fetched paper (paper.authors)
      const updatePayload: PaperUpdatePayload = {
        title: // TODO,
        publishedIn: // TODO,
        year: // TODO,
        authors: [
          // TODO: map paper.authors -> minimal author objects expected by backend
        ],
      };

      // TODO: send PUT request with JSON body
      // const res = await fetch(`/api/papers/${id}`, { method: "PUT", headers: ..., body: ... })
      // TODO: if not ok, throw new Error()

      // TODO: set message to "Paper updated successfully"

      // TODO: after 3 seconds, navigate("/")
    } catch {
      // TODO: set message to "Error updating paper"
    }
  };

  if (loading) return <div>/* TODO */</div>;
  if (loadError) return <div>/* TODO */</div>;
  if (!paper) return <div>/* TODO */</div>;

  return (
    <div>
      <h1>Edit Paper</h1>

      <PaperForm paper={paper} onSubmit={handleUpdatePaper} />

      {/* TODO: Show message in DOM */}
      {message && <div>{/* TODO */}</div>}
    </div>
  );
}
