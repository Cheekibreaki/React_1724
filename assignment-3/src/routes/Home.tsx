import { useState } from "react";
import type {
  AuthorsListResponse,
  PaperFormData,
  PaperCreatePayload,
} from "../types";
import PaperForm from "../components/PaperForm";
import PaperList from "../components/PaperList";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);

  const handleCreatePaper = async (paperData: PaperFormData) => {
    try {
      setMessage(null);

      const authorsRes = await fetch("/api/authors");
      if (!authorsRes.ok) throw new Error();
      const authorsData = (await authorsRes.json()) as AuthorsListResponse;

      const selectedAuthors = authorsData.authors
        .filter((a) => paperData.authorIds.includes(a.id))
        .map((a) => ({
          name: a.name,
          email: a.email,
          affiliation: a.affiliation,
        }));

      const createPayload: PaperCreatePayload = {
        title: paperData.title,
        publishedIn: paperData.publishedIn,
        year: paperData.year,
        authors: selectedAuthors,
      };

      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      if (!res.ok) throw new Error();

      setMessage("Paper created successfully");
      setTimeout(() => window.location.reload(), 3000);
    } catch {
      setMessage("Error creating paper");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Paper Management System</h1>

      {message && <div>{message}</div>}

      <h2 className={styles.sectionTitle}>Create New Paper</h2>
      <PaperForm onSubmit={handleCreatePaper} />

      <h2 className={styles.sectionTitle}>Papers</h2>
      <PaperList />
    </div>
  );
}
