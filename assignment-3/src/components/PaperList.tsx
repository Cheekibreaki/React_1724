import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "../styles/PaperList.module.css";
import type { Paper, PapersListResponse } from "../types";

export default function PaperList() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch("/api/papers");
        if (!res.ok) throw new Error();
        const data = (await res.json()) as PapersListResponse;
        setPapers(data.papers);
      } catch {
        setError("Error loading papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const handleDelete = async (paperId: number, paperTitle: string) => {
    setMessage(null);

    if (!confirm(`Are you sure you want to delete ${paperTitle}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/papers/${paperId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
      setMessage("Paper deleted successfully");
    } catch {
      setMessage("Error deleting paper");
    }
  };

  if (loading) return <div>Loading papers...</div>;
  if (error) return <div>Error loading papers</div>;
  if (papers.length === 0) return <div>No papers found</div>;

  return (
    <div className={styles.container}>
      {message && <div>{message}</div>}

      {papers.map((paper) => (
        <div key={paper.id} className={styles.paper}>
          <h3 className={styles.paperTitle}>{paper.title}</h3>

          <p>
            Published in {paper.publishedIn}, {paper.year}
          </p>

          <p>Authors: {paper.authors.map((a) => a.name).join(", ")}</p>

          <button type="button" onClick={() => navigate(`/edit/${paper.id}`)}>
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDelete(paper.id, paper.title)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
