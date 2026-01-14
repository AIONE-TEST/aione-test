import { AIModel } from "@/data/aiModels";

// Priority order for categories - NOUVEL ORDRE: vidéo, image, retouche, adult, audio, llms, code
const categoryPriority: Record<string, number> = {
  videos: 1,
  images: 2,
  retouch: 3,
  adult: 4,
  audio: 5,
  llms: 6,
  "3d": 7,
  code: 8,
};

// Prix de base approximatifs pour le tri (en centimes EUR)
const getApproxPrice = (model: AIModel): number => {
  if (model.isFree) return 0;
  if (!model.price) return 9999; // Prix inconnu = en bas
  
  const priceStr = model.price.toLowerCase();
  
  // Extraire le nombre du prix
  const match = priceStr.match(/[\d.,]+/);
  if (!match) return 9999;
  
  const num = parseFloat(match[0].replace(',', '.'));
  
  // Convertir en centimes pour uniformiser
  if (priceStr.includes('/mois') || priceStr.includes('month')) {
    return num * 100; // Prix mensuel
  } else if (priceStr.includes('/image') || priceStr.includes('/gen')) {
    return num * 10000; // Prix par génération (plus cher = score plus élevé)
  } else {
    return num * 100;
  }
};

/**
 * Sort AI models according to the priority rules:
 * 1. Par catégorie dans l'ordre: vidéo, image, retouche, adulte, audio, chat, code
 * 2. Dans chaque catégorie: illimités/gratuits d'abord
 * 3. Puis par prix croissant (moins cher au plus cher)
 * 4. Apps nécessitant une connexion obligatoire en fin de liste
 */
export function sortAIModels(models: AIModel[]): AIModel[] {
  return [...models].sort((a, b) => {
    // 1. Par catégorie d'abord
    const aPriority = categoryPriority[a.category] || 10;
    const bPriority = categoryPriority[b.category] || 10;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // 2. Dans la même catégorie: illimités et gratuits en premier
    const aIsUnlimitedFree = a.isFree && (
      a.badges?.includes("UNLIMITED") || 
      a.badges?.includes("NO SIGNUP") ||
      a.description?.toLowerCase().includes("illimité")
    );
    const bIsUnlimitedFree = b.isFree && (
      b.badges?.includes("UNLIMITED") || 
      b.badges?.includes("NO SIGNUP") ||
      b.description?.toLowerCase().includes("illimité")
    );
    
    if (aIsUnlimitedFree && !bIsUnlimitedFree) return -1;
    if (!aIsUnlimitedFree && bIsUnlimitedFree) return 1;
    
    // 3. Puis gratuits
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    
    // 4. Puis par prix croissant
    const aPrice = getApproxPrice(a);
    const bPrice = getApproxPrice(b);
    
    if (aPrice !== bPrice) {
      return aPrice - bPrice;
    }
    
    // 5. Apps actives avant inactives
    const aIsActive = a.apiStatus === "active";
    const bIsActive = b.apiStatus === "active";
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    // Alphabétique en dernier recours
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort models within a specific category with the same rules
 */
export function sortModelsInCategory(models: AIModel[]): AIModel[] {
  return [...models].sort((a, b) => {
    // Illimités gratuits d'abord
    const aIsUnlimitedFree = a.isFree && (
      a.badges?.includes("UNLIMITED") || 
      a.badges?.includes("NO SIGNUP")
    );
    const bIsUnlimitedFree = b.isFree && (
      b.badges?.includes("UNLIMITED") || 
      b.badges?.includes("NO SIGNUP")
    );
    
    if (aIsUnlimitedFree && !bIsUnlimitedFree) return -1;
    if (!aIsUnlimitedFree && bIsUnlimitedFree) return 1;
    
    // Puis gratuits
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    
    // Puis par prix croissant
    const aPrice = getApproxPrice(a);
    const bPrice = getApproxPrice(b);
    
    if (aPrice !== bPrice) {
      return aPrice - bPrice;
    }
    
    // Puis actifs
    const aIsActive = a.apiStatus === "active";
    const bIsActive = b.apiStatus === "active";
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    return a.name.localeCompare(b.name);
  });
}
