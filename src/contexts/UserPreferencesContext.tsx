import React from 'react';

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  cuisinePreferences: string[];
  calorieTarget?: number;
  mealPlanType?: string;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

export const UserPreferencesContext = React.createContext<UserPreferencesContextType>({
  preferences: {
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
  },
  setPreferences: () => {},
}); 