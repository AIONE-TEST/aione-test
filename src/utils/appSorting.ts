import { AIModel } from "@/data/aiModels";

// Priority order for categories
const categoryPriority: Record<string, number> = {
  videos: 1,
  images: 2,
  retouch: 3,
  audio: 4,
  llms: 5,
  "3d": 6,
  code: 7,
  uncensored: 8,
};

/**
 * Sort AI models according to the priority rules:
 * 1. By category priority: vidéo, image, retouche, audio, chat (llms)
 * 2. Unlimited and free apps first within each category
 * 3. Retouch + uncensored apps
 * 4. Audio at the end
 * 5. Coding apps last
 */
export function sortAIModels(models: AIModel[]): AIModel[] {
  return [...models].sort((a, b) => {
    // First: Active/Free status
    const aIsActive = a.apiStatus === "active" || a.isFree;
    const bIsActive = b.apiStatus === "active" || b.isFree;
    
    // Unlimited free apps get highest priority
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
    
    // Then free apps
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    
    // Then by category priority
    const aPriority = categoryPriority[a.category] || 10;
    const bPriority = categoryPriority[b.category] || 10;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Within same category: active first
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    // Then uncensored retouch apps
    const aIsUncensoredRetouch = a.category === "uncensored" && 
      (a.features?.some(f => f.toLowerCase().includes("retouch") || f.toLowerCase().includes("edit")));
    const bIsUncensoredRetouch = b.category === "uncensored" && 
      (b.features?.some(f => f.toLowerCase().includes("retouch") || f.toLowerCase().includes("edit")));
    
    if (aIsUncensoredRetouch && !bIsUncensoredRetouch) return -1;
    if (!aIsUncensoredRetouch && bIsUncensoredRetouch) return 1;
    
    // Alphabetical as tiebreaker
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort models within a specific category with the same rules
 */
export function sortModelsInCategory(models: AIModel[]): AIModel[] {
  return [...models].sort((a, b) => {
    // Unlimited free first
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
    
    // Then free
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    
    // Then active
    const aIsActive = a.apiStatus === "active";
    const bIsActive = b.apiStatus === "active";
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    return a.name.localeCompare(b.name);
  });
}
