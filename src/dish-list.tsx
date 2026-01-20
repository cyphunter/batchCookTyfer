import React, { useState, useMemo } from "react";
import dishes from "./data/dishes";
import DishCard from "./dish-card";
import { useServings } from "./servings/context";

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "time-asc"
  | "time-desc";
type PriceFilter = "all" | "economique" | "abordable" | "modere" | "premium";
type TimeFilter = "all" | "rapide" | "moyen" | "long";

// Helper function to get price category (same as in dish-card)
function getPriceCategory(ingredients: any[]): number {
  const expensiveIngredients = [
    "Poulet entier",
    "Boeuf à braiser",
    "Filet de saumon",
    "Feta",
    "Parmesan",
    "Pancetta",
  ];
  const mediumIngredients = ["Vin rouge", "Lait de coco", "Quinoa", "Avocat"];

  let score = 1;
  ingredients.forEach((ing) => {
    if (expensiveIngredients.some((exp) => ing.name.includes(exp)))
      score += 1.5;
    else if (mediumIngredients.some((med) => ing.name.includes(med)))
      score += 0.5;
    else score += 0.2;
  });

  return Math.min(4, Math.max(1, Math.round(score)));
}

export default function DishList() {
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const { servings, setServings } = useServings();

  const filteredAndSortedDishes = useMemo(() => {
    let result = dishes.filter((dish) => {
      // Price filter
      if (priceFilter !== "all") {
        const priceCategory = getPriceCategory(dish.ingredients);
        const priceMatch = {
          economique: priceCategory === 1,
          abordable: priceCategory === 2,
          modere: priceCategory === 3,
          premium: priceCategory === 4,
        };
        if (!priceMatch[priceFilter]) return false;
      }

      // Time filter
      if (timeFilter !== "all") {
        const timeMinutes = dish.recipe?.timeMinutes || 30;
        const timeMatch = {
          rapide: timeMinutes <= 30,
          moyen: timeMinutes > 30 && timeMinutes <= 60,
          long: timeMinutes > 60,
        };
        if (!timeMatch[timeFilter]) return false;
      }

      return true;
    });

    // Sort
    if (sortBy !== "default") {
      result.sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return (
              getPriceCategory(a.ingredients) - getPriceCategory(b.ingredients)
            );
          case "price-desc":
            return (
              getPriceCategory(b.ingredients) - getPriceCategory(a.ingredients)
            );
          case "time-asc":
            return (
              (a.recipe?.timeMinutes || 30) - (b.recipe?.timeMinutes || 30)
            );
          case "time-desc":
            return (
              (b.recipe?.timeMinutes || 30) - (a.recipe?.timeMinutes || 30)
            );
          default:
            return 0;
        }
      });
    }

    return result;
  }, [sortBy, priceFilter, timeFilter]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Notre menu</h2>
        <div className="price-badge">100€ / semaine</div>
      </div>
      <p className="muted">
        Choisissez vos plats pour la semaine — chaque plat ajouté génère la
        liste de courses.
      </p>

      {/* Filter and Sort Controls */}
      <div className="filter-section">
        <h3
          style={{
            margin: "0 0 var(--spacing-lg) 0",
            color: "var(--text-primary)",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          🔍 Filtres et tri
        </h3>

        <div className="filter-grid">
          {/* Servings Selector */}
          <div>
            <label className="filter-label">👥 Nombre de personnes</label>
            <select
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-light) 0%, var(--accent-light) 100%)",
                border: "2px solid var(--primary)",
                fontWeight: "600",
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <option key={num} value={num}>
                  {num} personne{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="filter-label">📊 Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="default">Par défaut</option>
              <option value="time-asc">⏱️ Temps croissant</option>
              <option value="time-desc">⏱️ Temps décroissant</option>
              <option value="price-asc">💰 Prix croissant</option>
              <option value="price-desc">💰 Prix décroissant</option>
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <label className="filter-label">💰 Filtrer par prix</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
            >
              <option value="all">Tous les prix</option>
              <option value="economique">€ Économique</option>
              <option value="abordable">€€ Abordable</option>
              <option value="modere">€€€ Modéré</option>
              <option value="premium">€€€€ Premium</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label className="filter-label">⏱️ Filtrer par temps</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            >
              <option value="all">Tous les temps</option>
              <option value="rapide">🚀 Rapide (≤30 min)</option>
              <option value="moyen">🕐 Moyen (31-60 min)</option>
              <option value="long">🕒 Long (&gt;60 min)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div
          style={{
            marginTop: "var(--spacing-md)",
            padding: "var(--spacing-md)",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)",
          }}
        >
          📋 <strong>{filteredAndSortedDishes.length}</strong> plat(s) trouvé(s)
        </div>
      </div>

      <div className="dish-list">
        {filteredAndSortedDishes.map((d) => (
          <DishCard key={d.id} dish={d} />
        ))}
      </div>
    </div>
  );
}
