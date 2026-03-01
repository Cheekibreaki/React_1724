import { useState } from "react";
import { useNavigate } from "react-router";
import styles from "../styles/PaperForm.module.css";
import AuthorSelect from "./AuthorSelect";
import type { Paper, PaperFormData } from "../types";

type PaperFormProps = {
  paper?: Paper;
  onSubmit: (data: PaperFormData) => Promise<void> | void;
};

export default function PaperForm({ paper, onSubmit }: PaperFormProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PaperFormData>({
    title: paper?.title ?? "",
    publishedIn: paper?.publishedIn ?? "",
    year: paper?.year ?? new Date().getFullYear(),
    authorIds: paper?.authors?.map((author) => author.id) ?? [],
  });

  const [yearStr, setYearStr] = useState<string>(
    String(paper?.year ?? new Date().getFullYear()),
  );

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || formData.title.trim() === "") {
      setError("Title is required");
      return;
    }
    if (!formData.publishedIn || formData.publishedIn.trim() === "") {
      setError("Publication venue is required");
      return;
    }
    if (yearStr.trim() === "") {
      setError("Publication year is required");
      return;
    }
    const yearNum = Number(yearStr);
    if (!Number.isInteger(yearNum) || yearNum <= 1900) {
      setError("Valid year after 1900 is required");
      return;
    }
    if (!paper && formData.authorIds.length === 0) {
      setError("Please select at least one author");
      return;
    }

    setError(null);
    await onSubmit({ ...formData, year: yearNum });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "year") {
      setYearStr(value);
      setFormData((prev) => ({
        ...prev,
        year: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className="error">{error}</div>}

      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="publishedIn">Published In:</label>
        <input
          type="text"
          id="publishedIn"
          name="publishedIn"
          value={formData.publishedIn}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="year">Year:</label>
        <input
          type="number"
          id="year"
          name="year"
          value={yearStr}
          onChange={handleChange}
        />
      </div>

      <fieldset>
        <legend>Authors:</legend>
        <AuthorSelect
          selectedAuthorIds={formData.authorIds}
          onChange={(authorIds) =>
            setFormData((prev) => ({
              ...prev,
              authorIds,
            }))
          }
        />
      </fieldset>

      <div>
        <button type="submit">{paper ? "Update Paper" : "Create Paper"}</button>
        {paper && (
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
