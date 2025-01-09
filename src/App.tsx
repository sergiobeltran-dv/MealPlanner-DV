import React from 'react';
import { UserPreferencesContext, UserPreferences } from './contexts/UserPreferencesContext';
import { Authenticator } from '@aws-amplify/ui-react';
import { Routes } from './routes';
import { BrowserRouter } from 'react-router-dom';

export default function App() {
  const [preferences, setPreferences] = React.useState<UserPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
  });

  return (
    <BrowserRouter>
      <Authenticator>
        <UserPreferencesContext.Provider value={{ preferences, setPreferences }}>
          <Routes />
        </UserPreferencesContext.Provider>
      </Authenticator>
    </BrowserRouter>
  );
} 