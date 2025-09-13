import { useState, useEffect } from "react";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]",
    );
    setFavorites(storedFavorites);
  }, []);

  const addFavorite = (id: number) => {
    setFavorites((prev) => {
      const updated = [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (id: number) => {
    setFavorites((prev) => {
      const updated = prev.filter((favId) => favId !== id);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  const isFavorite = (id: number) => favorites.includes(id);

  return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
};
