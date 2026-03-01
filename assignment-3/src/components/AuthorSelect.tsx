import { useEffect, useState } from "react";
import type { Author, AuthorsListResponse } from "../types";

type AuthorSelectProps = {
  selectedAuthorIds: number[];
  onChange: (authorIds: number[]) => void;
};

export default function AuthorSelect({
  selectedAuthorIds,
  onChange,
}: AuthorSelectProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch("/api/authors");
        if (!res.ok) throw new Error();
        const data = (await res.json()) as AuthorsListResponse;
        setAuthors(data.authors);
      } catch {
        setError("Error loading authors");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(event.target.selectedOptions, (opt) =>
      Number(opt.value),
    );
    onChange(ids);
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}

      <select
        multiple
        value={selectedAuthorIds.map(String)}
        onChange={handleChange}
        disabled={loading || !!error}
      >
        {!loading && authors.length === 0 ? (
          <option disabled>No authors available</option>
        ) : (
          authors.map((author) => (
            <option key={author.id} value={String(author.id)}>
              {author.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
