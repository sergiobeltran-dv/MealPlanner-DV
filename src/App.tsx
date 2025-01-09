import React from 'react';
import { UserPreferencesContext, UserPreferences } from './contexts/UserPreferencesContext';
import { Authenticator } from '@aws-amplify/ui-react';
import { Routes } from './routes';  // Assuming you have your routes component

export default function App() {
  const [preferences, setPreferences] = React.useState<UserPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
  });

  return (
    <Authenticator>
      <UserPreferencesContext.Provider value={{ preferences, setPreferences }}>
        <Routes />
      </UserPreferencesContext.Provider>
    </Authenticator>
  );
} 