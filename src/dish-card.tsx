import React from "react";
import { Dish } from "./cart/context";
import { useCart } from "./cart/context";
import { useToast } from "./toast/context";
import { useServings } from "./servings/context";

// Helper function to get price category (1-4 based on estimated cost)
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

// Helper function to create progress bar
function ProgressBar({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{ marginBottom: "8px" }}>
      <div
        style={{
          fontSize: "0.8rem",
          fontWeight: "600",
          color: "#718096",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          height: "8px",
          background: "#edf2f7",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: color,
            transition: "width 0.3s ease",
            minWidth: percentage > 0 ? "2px" : "0",
          }}
        />
      </div>
    </div>
  );
}

export default function DishCard({ dish }: { dish: Dish }) {
  const { addDish } = useCart();
  const { addToast } = useToast();
  const { servings, calculateQuantity, calculatePrice, calculateTime } =
    useServings();
  const [showIngredients, setShowIngredients] = React.useState(false);

  const baseServings = dish.servings || 4; // Nombre de personnes pour lequel la recette est prévue
  const adjustedTimeMinutes = calculateTime(
    dish.recipe?.timeMinutes || 30,
    baseServings,
  );
  const priceCategory = getPriceCategory(dish.ingredients);

  // Calcul du prix estimé (basé sur la catégorie de prix)
  const basePriceEstimate = priceCategory * 3; // Prix de base par personne
  const adjustedPrice = calculatePrice(
    basePriceEstimate * baseServings,
    baseServings,
  );

  const handleAddDish = () => {
    // Calculer les ingrédients ajustés avec quantités numériques
    const adjustedIngredients = dish.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity
        ? calculateQuantity(ing.quantity, baseServings)
        : undefined,
      unit: ing.unit,
    }));

    addDish(
      dish,
      servings,
      adjustedIngredients,
      adjustedTimeMinutes,
      adjustedPrice,
    );
    addToast(
      `${dish.name} ajouté au panier pour ${servings} personne${servings > 1 ? "s" : ""} !`,
      "success",
      2500,
    );
  };

  return (
    <div className="card dish-card fade-in">
      {dish.image ? (
        <div
          style={{
            height: 260,
            overflow: "hidden",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--spacing-md)",
            position: "relative",
          }}
        >
          <img
            src={dish.image}
            alt={dish.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
          />

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Servings badge */}
          <div
            style={{
              position: "absolute",
              top: "var(--spacing-md)",
              right: "var(--spacing-md)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-sm) var(--spacing-md)",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {servings} pers.
          </div>

          {/* Title and description overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "var(--spacing-md)",
              left: "var(--spacing-md)",
              right: "var(--spacing-md)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(15px)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-sm)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "2px",
                lineHeight: "1.1",
              }}
            >
              {dish.name}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                lineHeight: "1.2",
                color: "var(--text-secondary)",
                fontWeight: "500",
              }}
            >
              {dish.description}
            </p>
          </div>

          {/* Add button overlay */}
          <button
            onClick={handleAddDish}
            style={{
              position: "absolute",
              top: "var(--spacing-md)",
              left: "var(--spacing-md)",
              fontSize: "0.85rem",
              padding: "var(--spacing-sm) var(--spacing-md)",
              background: "rgba(255, 107, 53, 0.9)",
              backdropFilter: "blur(10px)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 107, 53, 1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 107, 53, 0.9)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            + Ajouter
          </button>
        </div>
      ) : (
        // Fallback for dishes without images
        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "var(--spacing-sm)",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>
                {dish.name}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  margin: "var(--spacing-xs) 0",
                  lineHeight: "1.4",
                }}
              >
                {dish.description}
              </p>
            </div>
            <button
              onClick={handleAddDish}
              style={{
                marginLeft: "var(--spacing-md)",
                minWidth: "80px",
                fontSize: "0.85rem",
                padding: "var(--spacing-sm) var(--spacing-md)",
              }}
            >
              + Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Time and Price Bars */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <ProgressBar
          value={adjustedTimeMinutes}
          max={180}
          color={
            adjustedTimeMinutes <= 30
              ? "var(--success)"
              : adjustedTimeMinutes <= 60
                ? "var(--warning)"
                : "var(--error)"
          }
          label={`⏱️ ${adjustedTimeMinutes} min (${servings} pers.)`}
        />
        <ProgressBar
          value={adjustedPrice}
          max={50}
          color={
            adjustedPrice <= 15
              ? "var(--success)"
              : adjustedPrice <= 30
                ? "var(--warning)"
                : "var(--error)"
          }
          label={`💰 ${adjustedPrice.toFixed(2)}€ (${servings} pers.)`}
        />
      </div>

      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--spacing-md)",
          border: "1px solid var(--border-light)",
          overflow: "hidden",
        }}
      >
        <div
          onClick={() => setShowIngredients(!showIngredients)}
          style={{
            padding: "var(--spacing-md)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: showIngredients ? "var(--bg-tertiary)" : "transparent",
            transition: "background 0.2s ease",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)",
            }}
          >
            🥘 Ingrédients principaux ({dish.ingredients.length})
          </div>
          <div
            style={{
              transform: showIngredients ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              color: "var(--text-muted)",
            }}
          >
            ▼
          </div>
        </div>

        {showIngredients && (
          <div
            style={{
              padding: "var(--spacing-md)",
              paddingTop: 0,
              animation: "fadeIn 0.3s ease-out",
            }}
          >
            <ul style={{ margin: 0 }}>
              {dish.ingredients.map((i) => {
                const adjustedQuantity = i.quantity
                  ? calculateQuantity(i.quantity, baseServings)
                  : null;
                return (
                  <li
                    key={i.name}
                    style={{
                      padding: "var(--spacing-xs) 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{i.name}</span>
                    {adjustedQuantity && i.unit && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          background: "var(--bg-card)",
                          padding: "2px 6px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {adjustedQuantity} {i.unit}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {dish.recipe ? <RecipePanel recipe={dish.recipe} /> : null}
    </div>
  );
}
type Recipe = { timeMinutes?: number; servings?: number; steps: string[] };

function RecipePanel({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-light)",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "var(--spacing-md)",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: open ? "var(--bg-tertiary)" : "transparent",
          transition: "background 0.2s ease",
        }}
      >
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-xs)",
          }}
        >
          👨‍🍳 Voir la recette
        </div>
        <div
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            color: "var(--text-muted)",
          }}
        >
          ▼
        </div>
      </div>

      {open && (
        <div
          style={{
            padding: "var(--spacing-md)",
            paddingTop: 0,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "var(--spacing-md)",
              display: "flex",
              gap: "var(--spacing-lg)",
            }}
          >
            {recipe.timeMinutes && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-xs)",
                }}
              >
                ⏱️ {recipe.timeMinutes} min
              </span>
            )}
            {recipe.servings && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-xs)",
                }}
              >
                👥 {recipe.servings} portions
              </span>
            )}
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: "var(--spacing-lg)",
              color: "var(--text-secondary)",
            }}
          >
            {recipe.steps.map((step: string, i: number) => (
              <li
                key={i}
                style={{
                  marginBottom: "var(--spacing-sm)",
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                }}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
