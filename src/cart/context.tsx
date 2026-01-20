import React from "react";

export type Ingredient = {
  name: string;
  quantity?: number;
  unit?: string;
};
export type Dish = {
  id: string;
  name: string;
  description?: string;
  ingredients: Ingredient[];
  image?: string;
  recipe?: {
    timeMinutes?: number;
    servings?: number;
    steps: string[];
  };
};

type CartItem = {
  dish: Dish;
  quantity: number;
  servings: number;
  adjustedIngredients: Ingredient[];
  adjustedTime: number;
  adjustedPrice: number;
};

type CartContextValue = {
  items: CartItem[];
  addDish: (
    dish: Dish,
    servings: number,
    adjustedIngredients: Ingredient[],
    adjustedTime: number,
    adjustedPrice: number,
  ) => void;
  removeDish: (dishId: string, servings?: number) => void;
  clear: () => void;
  weeklyPrice: number;
  totalPrice: number;
  totalTime: number;
  cookingPrice: number;
  grandTotal: number;
  shoppingList: Ingredient[];
};

const CartContext = React.createContext<CartContextValue | undefined>(
  undefined,
);

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const weeklyPrice = 100; // fixed price per week

  const addDish = (
    dish: Dish,
    servings: number,
    adjustedIngredients: Ingredient[],
    adjustedTime: number,
    adjustedPrice: number,
  ) => {
    setItems((prev) => {
      const found = prev.find(
        (p) => p.dish.id === dish.id && p.servings === servings,
      );
      if (found) {
        return prev.map((p) =>
          p.dish.id === dish.id && p.servings === servings
            ? { ...p, quantity: p.quantity + 1 }
            : p,
        );
      }
      return [
        ...prev,
        {
          dish,
          quantity: 1,
          servings,
          adjustedIngredients,
          adjustedTime,
          adjustedPrice,
        },
      ];
    });
  };

  const removeDish = (dishId: string, servings?: number) => {
    setItems((prev) =>
      prev.filter(
        (p) =>
          !(
            p.dish.id === dishId &&
            (servings === undefined || p.servings === servings)
          ),
      ),
    );
  };

  const clear = () => setItems([]);

  // Calcul dynamique du prix total
  const totalPrice = React.useMemo(() => {
    return items.reduce((total, item) => {
      return total + item.adjustedPrice * item.quantity;
    }, 0);
  }, [items]);

  // Calcul du temps total de préparation
  const totalTime = React.useMemo(() => {
    return items.reduce((total, item) => {
      return total + item.adjustedTime * item.quantity;
    }, 0);
  }, [items]);

  // Calcul du prix de cuisine (14€/heure)
  const cookingPrice = React.useMemo(() => {
    const hourlyRate = 14; // 14€ par heure
    const totalHours = totalTime / 60; // Convertir minutes en heures
    return Math.round(totalHours * hourlyRate * 100) / 100; // Arrondi à 2 décimales
  }, [totalTime]);

  // Prix total final (ingrédients + cuisine)
  const grandTotal = React.useMemo(() => {
    return totalPrice + cookingPrice;
  }, [totalPrice, cookingPrice]);

  const shoppingList = React.useMemo(() => {
    const map = new Map<string, Ingredient>();
    for (const item of items) {
      for (const ing of item.adjustedIngredients) {
        const key = ing.name.toLowerCase();
        const existing = map.get(key);
        if (
          existing &&
          existing.quantity &&
          ing.quantity &&
          existing.unit === ing.unit
        ) {
          // Additionner les quantités pour les mêmes ingrédients
          existing.quantity += ing.quantity * item.quantity;
        } else if (!existing) {
          map.set(key, {
            ...ing,
            quantity: ing.quantity ? ing.quantity * item.quantity : undefined,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addDish,
        removeDish,
        clear,
        weeklyPrice,
        totalPrice,
        totalTime,
        cookingPrice,
        grandTotal,
        shoppingList,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
