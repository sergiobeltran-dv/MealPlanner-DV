export const getSeason = (date: Date): string => {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

export const getCurrentMealTime = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'snack';
};

export const getMacrosByDiet = (dietType?: string) => {
  switch (dietType) {
    case 'keto':
      return { carbs: '5%', protein: '20%', fat: '75%' };
    case 'vegan':
      return { carbs: '55%', protein: '25%', fat: '20%' };
    // Add other diet types...
    default:
      return { carbs: '45%', protein: '30%', fat: '25%' };
  }
}; 