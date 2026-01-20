import React, { createContext, useContext, useState } from "react";

interface ServingsContextType {
  servings: number;
  setServings: (servings: number) => void;
  calculateQuantity: (baseQuantity: number, baseServings: number) => number;
  calculatePrice: (basePrice: number, baseServings: number) => number;
  calculateTime: (baseTime: number, baseServings: number) => number;
}

const ServingsContext = createContext<ServingsContextType | undefined>(
  undefined,
);

export const useServings = () => {
  const context = useContext(ServingsContext);
  if (context === undefined) {
    throw new Error("useServings must be used within a ServingsProvider");
  }
  return context;
};

export const ServingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [servings, setServings] = useState(4); // Default 4 personnes

  // Calcule la quantité ajustée selon le nombre de personnes
  const calculateQuantity = (
    baseQuantity: number,
    baseServings: number,
  ): number => {
    return Math.round(((baseQuantity * servings) / baseServings) * 10) / 10; // Arrondi à 1 décimale
  };

  // Calcule le prix ajusté (linéaire)
  const calculatePrice = (basePrice: number, baseServings: number): number => {
    return Math.round(((basePrice * servings) / baseServings) * 100) / 100; // Arrondi à 2 décimales
  };

  // Calcule le temps ajusté (avec facteur de complexité)
  const calculateTime = (baseTime: number, baseServings: number): number => {
    const ratio = servings / baseServings;
    // Le temps augmente moins vite que les portions (facteur logarithmique)
    const timeMultiplier = ratio <= 1 ? ratio : 1 + Math.log(ratio) * 0.3;
    return Math.round(baseTime * timeMultiplier);
  };

  return (
    <ServingsContext.Provider
      value={{
        servings,
        setServings,
        calculateQuantity,
        calculatePrice,
        calculateTime,
      }}
    >
      {children}
    </ServingsContext.Provider>
  );
};
