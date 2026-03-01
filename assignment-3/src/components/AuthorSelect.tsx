// This component renders a multi-select dropdown for choosing authors.

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

  // TODO: Fetch authors from the API when this component mounts.
  //
  // Requirements:
  // - Endpoint: GET /api/authors
  // - If request fails: show "Error loading authors" above the dropdown
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        // TODO: fetch("/api/authors")
        // TODO: if response not ok, throw new Error()
        // TODO: parse JSON as AuthorsListResponse
        // TODO: setAuthors(...) with the authors array
      } catch {
        // TODO: set error state to "Error loading authors"
      } finally {
        // TODO: set loading state to false
      }
    };

    fetchAuthors();
  }, []);

  // TODO: When the user selects/deselects authors, call onChange([...ids]).
  // Hint: event.target.selectedOptions gives you all currently-selected <option>s.
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // TODO: Convert selected option values (strings) into numbers with  Array.from
  };

  return (
    <div>
      {/* TODO: Render the required error message above the dropdown */}
      {error && <div className="error">{/* TODO */}</div>}

      <select
        multiple
        /**
         * Note: In the DOM, <select> option values are strings.
         * Converting IDs to strings keeps React controlled properly.
         */
        value={selectedAuthorIds.map(String)}
        onChange={handleChange}
        // TODO: Disable dropdown during loading or error
        disabled={/* TODO */}
      >
        {/* TODO:
            - If authors is empty (after loading), render:
              <option disabled>No authors available</option>
            - Otherwise, render one <option> per author (value = author.id, text = author.name)
        */}
      </select>
    </div>
  );
}
