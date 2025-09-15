import React, { useState } from "react";
import style from "./input.module.scss";
import { FilterIcon, SearchIconInput } from "../../../public/icons/profile";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface SearchInputProps {
  onFilterClick: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onFilterClick }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(
    () => searchParams.get('search') || ""
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
    const params = new URLSearchParams(searchParams.toString());

    if (trimmed) {
      params.set('search', trimmed);
    } else {
      params.delete('search');
    }

    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
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
