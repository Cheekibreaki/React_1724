import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PaperForm from "../components/PaperForm";
import type { Paper, PaperFormData, PaperUpdatePayload } from "../types";

export default function EditPaper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPaper(null);
      setLoading(false);
      return;
    }

    const fetchPaper = async () => {
      try {
        const res = await fetch(`/api/papers/${id}`);
        if (res.status === 404) {
          setPaper(null);
          return;
        }
        if (!res.ok) throw new Error();
        const data = (await res.json()) as Paper;
        setPaper(data);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  const handleUpdatePaper = async (paperData: PaperFormData) => {
    if (!id || !paper) return;

    try {
      setMessage(null);

      const updatePayload: PaperUpdatePayload = {
        title: paperData.title,
        publishedIn: paperData.publishedIn,
        year: paperData.year,
        authors: paper.authors.map((a) => ({
          name: a.name,
          email: a.email,
          affiliation: a.affiliation,
        })),
      };

      const res = await fetch(`/api/papers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) throw new Error();

      setMessage("Paper updated successfully");
      setTimeout(() => navigate("/"), 3000);
    } catch {
      setMessage("Error updating paper");
    }
  };

  if (loading) return <div>Loading paper details...</div>;
  if (loadError) return <div>Error loading paper</div>;
  if (!paper) return <div>Paper not found</div>;

  return (
    <div>
      <h1>Edit Paper</h1>

      <PaperForm paper={paper} onSubmit={handleUpdatePaper} />

      {message && <div>{message}</div>}
    </div>
  );
}
