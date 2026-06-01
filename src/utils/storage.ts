const STORAGE_KEY = 'personal-learning-app-state';

export interface PersistedState {
  courses: any[];
  chapters: any[];
  notes: any[];
  studyRecords?: any[];
  todayGoals?: any[];
  studyTasks?: any[];
}

export const loadState = (): PersistedState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return null;
  }
};

export const saveState = (state: PersistedState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing state from localStorage:', err);
  }
};
