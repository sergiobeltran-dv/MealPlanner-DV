import React from 'react';

interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  cuisinePreferences: string[];
  calorieTarget?: number;
  mealPlanType?: 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'regular';
}

export const UserPreferencesContext = React.createContext<{
  preferences: UserPreferences;
  setPreferences: (value: React.SetStateAction<UserPreferences>) => void;
}>({
  preferences: {
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
  },
  setPreferences: () => {},
}); 