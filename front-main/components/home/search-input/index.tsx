import React, { useState } from "react";
import style from "./input.module.scss";
import { FilterIcon, SearchIconInput } from "../../../public/icons/profile";
import { useRouter } from "next/router";

interface SearchInputProps {
  onFilterClick: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onFilterClick }) => {
  const router = useRouter();
  const [query, setQuery] = useState(
    () => router.query.search?.toString() || ""
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value ?? "";

    setQuery(newValue);

    if (!newValue.trim()) {
      doSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      doSearch(query);
    }
  };

  const handleSearchClick = () => {
    doSearch(query);
  };

  const doSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    const newQuery = { ...router.query };

    if (trimmed) {
      newQuery.search = trimmed;
    } else {
      delete newQuery.search;
    }

    delete newQuery.page;

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  return (
    <div className={style.home_input_wrapper}>
      <div className={style.input_search}>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <SearchIconInput />
      </div>
      <div className={style.action_icon}>
        <div className={style.filter} onClick={onFilterClick}>
          <FilterIcon />
        </div>
        <div className={style.search} onClick={handleSearchClick}>
          Search
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
