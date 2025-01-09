import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import { ChatIdPage } from './ChatId';
import { RecipeGenerator } from './RecipeGenerator';

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/chat/:chatId" element={<ChatIdPage />} />
      <Route path="/recipe" element={<RecipeGenerator />} />
      {/* Add other routes as needed */}
    </RouterRoutes>
  );
} 