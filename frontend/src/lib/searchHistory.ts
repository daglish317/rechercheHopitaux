const STORAGE_KEY = "search_history";
const MAX_HISTORY = 5;

export interface SearchHistoryItem {
  text: string;
  timestamp: number;
}

export const searchHistory = {
  // Récupérer l'historique
  get: (): SearchHistoryItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Ajouter une recherche
  add: (query: string): void => {
    if (typeof window === "undefined" || !query.trim()) return;
    
    const history = searchHistory.get();
    
    // Retirer l'élément s'il existe déjà
    const filtered = history.filter((item) => item.text !== query.trim());
    
    // Ajouter au début
    const newHistory = [
      { text: query.trim(), timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_HISTORY);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  },

  // Supprimer un élément
  remove: (query: string): void => {
    if (typeof window === "undefined") return;
    
    const history = searchHistory.get();
    const filtered = history.filter((item) => item.text !== query);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to remove from search history:", error);
    }
  },

  // Vider l'historique
  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  },
};
