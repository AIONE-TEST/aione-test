// Définition des capacités détaillées des modèles AI

export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '3:4' | '21:9';
export type GenerationMode = 'txt-to-image' | 'txt-to-video' | 'image-to-image' | 'image-to-video';
export type Quality = '480p' | '720p' | '1080p' | '4K' | '8K';
export type InputType = 'text' | 'image' | 'video' | 'audio';
export type OutputType = 'image' | 'video' | 'audio' | 'text' | '3d';

export interface ModelCapabilities {
  // Modes de génération supportés
  supportedModes: GenerationMode[];
  
  // Formats d'aspect supportés
  supportedAspectRatios: AspectRatio[];
  
  // Qualités de sortie supportées
  supportedQualities: Quality[];
  
  // Types d'entrée acceptés
  inputTypes: InputType[];
  
  // Type de sortie
  outputType: OutputType;
  
  // Durée max pour vidéos (en secondes)
  maxDuration?: number;
  
  // Résolution max
  maxResolution?: string;
  
  // Quota gratuit restant simulé (pour démo)
  freeQuota?: number;
  
  // Quota par qualité
  quotaByQuality?: Partial<Record<Quality, number>>;
}

// Capacités par modèle ID
export const modelCapabilities: Record<string, ModelCapabilities> = {
  // === IMAGES ===
  'flux-schnell': {
    supportedModes: ['txt-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedQualities: ['1080p'],
    inputTypes: ['text'],
    outputType: 'image',
    maxResolution: '1024x1024',
    freeQuota: 50,
    quotaByQuality: { '1080p': 50 }
  },
  'sdxl-lightning': {
    supportedModes: ['txt-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3'],
    supportedQualities: ['1080p'],
    inputTypes: ['text'],
    outputType: 'image',
    maxResolution: '1024x1024',
    freeQuota: 100,
    quotaByQuality: { '1080p': 100 }
  },
  'dall-e-3': {
    supportedModes: ['txt-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedQualities: ['1080p', '4K'],
    inputTypes: ['text'],
    outputType: 'image',
    maxResolution: '1792x1024',
    freeQuota: 0,
    quotaByQuality: { '1080p': 0, '4K': 0 }
  },
  'midjourney-v6': {
    supportedModes: ['txt-to-image', 'image-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'],
    supportedQualities: ['1080p', '4K'],
    inputTypes: ['text', 'image'],
    outputType: 'image',
    maxResolution: '2048x2048',
    freeQuota: 0,
    quotaByQuality: { '1080p': 0, '4K': 0 }
  },
  'stable-diffusion-3': {
    supportedModes: ['txt-to-image', 'image-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    supportedQualities: ['1080p', '4K'],
    inputTypes: ['text', 'image'],
    outputType: 'image',
    maxResolution: '2048x2048',
    freeQuota: 25,
    quotaByQuality: { '1080p': 25, '4K': 10 }
  },
  'perchance-ai': {
    supportedModes: ['txt-to-image'],
    supportedAspectRatios: ['1:1', '16:9'],
    supportedQualities: ['720p', '1080p'],
    inputTypes: ['text'],
    outputType: 'image',
    maxResolution: '1024x1024',
    freeQuota: 999,
    quotaByQuality: { '720p': 999, '1080p': 999 }
  },
  'ideogram-free': {
    supportedModes: ['txt-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3'],
    supportedQualities: ['1080p'],
    inputTypes: ['text'],
    outputType: 'image',
    maxResolution: '1024x1024',
    freeQuota: 25,
    quotaByQuality: { '1080p': 25 }
  },
  
  // === VIDEOS ===
  'runway-gen3': {
    supportedModes: ['txt-to-video', 'image-to-video'],
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedQualities: ['720p', '1080p'],
    inputTypes: ['text', 'image'],
    outputType: 'video',
    maxDuration: 10,
    maxResolution: '1920x1080',
    freeQuota: 0,
    quotaByQuality: { '720p': 0, '1080p': 0 }
  },
  'sora': {
    supportedModes: ['txt-to-video', 'image-to-video'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '21:9'],
    supportedQualities: ['720p', '1080p', '4K'],
    inputTypes: ['text', 'image'],
    outputType: 'video',
    maxDuration: 60,
    maxResolution: '3840x2160',
    freeQuota: 0,
    quotaByQuality: { '720p': 0, '1080p': 0, '4K': 0 }
  },
  'google-veo2': {
    supportedModes: ['txt-to-video', 'image-to-video'],
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedQualities: ['1080p', '4K'],
    inputTypes: ['text', 'image'],
    outputType: 'video',
    maxDuration: 120,
    maxResolution: '3840x2160',
    freeQuota: 0,
    quotaByQuality: { '1080p': 0, '4K': 0 }
  },
  'kling-ai': {
    supportedModes: ['txt-to-video', 'image-to-video'],
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedQualities: ['720p', '1080p'],
    inputTypes: ['text', 'image'],
    outputType: 'video',
    maxDuration: 10,
    maxResolution: '1920x1080',
    freeQuota: 66,
    quotaByQuality: { '720p': 100, '1080p': 66 }
  },
  'pika-labs': {
    supportedModes: ['txt-to-video', 'image-to-video'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
    supportedQualities: ['720p', '1080p'],
    inputTypes: ['text', 'image'],
    outputType: 'video',
    maxDuration: 4,
    maxResolution: '1920x1080',
    freeQuota: 0,
    quotaByQuality: { '720p': 0, '1080p': 0 }
  },
  'luma-dream-machine-free': {
    supportedModes: ['txt-to-video', 'image-to-video'],
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedQualities: ['720p'],
    inputTypes: ['text', 'image'],
    outputType: 'video',
    maxDuration: 5,
    maxResolution: '1280x720',
    freeQuota: 5,
    quotaByQuality: { '720p': 5 }
  },
  'minimax-video': {
    supportedModes: ['txt-to-video', 'image-to-video'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedQualities: ['720p', '1080p'],
    inputTypes: ['text', 'image'],
    outputType: 'video',
    maxDuration: 6,
    maxResolution: '1920x1080',
    freeQuota: 0,
    quotaByQuality: { '720p': 0, '1080p': 0 }
  },
  'animatediff': {
    supportedModes: ['image-to-video'],
    supportedAspectRatios: ['1:1', '16:9'],
    supportedQualities: ['480p', '720p'],
    inputTypes: ['image'],
    outputType: 'video',
    maxDuration: 3,
    maxResolution: '512x512',
    freeQuota: 20,
    quotaByQuality: { '480p': 30, '720p': 20 }
  },
  'stable-video': {
    supportedModes: ['image-to-video'],
    supportedAspectRatios: ['1:1'],
    supportedQualities: ['720p'],
    inputTypes: ['image'],
    outputType: 'video',
    maxDuration: 4,
    maxResolution: '1024x1024',
    freeQuota: 10,
    quotaByQuality: { '720p': 10 }
  },
  'grok-aurora': {
    supportedModes: ['txt-to-video'],
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedQualities: ['720p', '1080p'],
    inputTypes: ['text'],
    outputType: 'video',
    maxDuration: 10,
    maxResolution: '1920x1080',
    freeQuota: 0,
    quotaByQuality: { '720p': 0, '1080p': 0 }
  },
  
  // === RETOUCH ===
  'real-esrgan': {
    supportedModes: ['image-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    supportedQualities: ['4K', '8K'],
    inputTypes: ['image'],
    outputType: 'image',
    maxResolution: '8192x8192',
    freeQuota: 50,
    quotaByQuality: { '4K': 50, '8K': 25 }
  },
  'topaz-gigapixel': {
    supportedModes: ['image-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'],
    supportedQualities: ['4K', '8K'],
    inputTypes: ['image'],
    outputType: 'image',
    maxResolution: '16384x16384',
    freeQuota: 0,
    quotaByQuality: { '4K': 0, '8K': 0 }
  },
  'rembg': {
    supportedModes: ['image-to-image'],
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    supportedQualities: ['1080p', '4K'],
    inputTypes: ['image'],
    outputType: 'image',
    maxResolution: '4096x4096',
    freeQuota: 100,
    quotaByQuality: { '1080p': 100, '4K': 50 }
  },
  
  // === AUDIO ===
  'elevenlabs': {
    supportedModes: ['txt-to-image'], // Utilisé comme txt-to-audio conceptuellement
    supportedAspectRatios: [],
    supportedQualities: ['1080p'], // Représente la qualité audio haute
    inputTypes: ['text'],
    outputType: 'audio',
    freeQuota: 10000, // Caractères
    quotaByQuality: { '1080p': 10000 }
  },
  'suno-ai': {
    supportedModes: ['txt-to-image'],
    supportedAspectRatios: [],
    supportedQualities: ['1080p'],
    inputTypes: ['text'],
    outputType: 'audio',
    freeQuota: 50,
    quotaByQuality: { '1080p': 50 }
  },
  
  // === 3D ===
  'meshy-ai': {
    supportedModes: ['txt-to-image', 'image-to-image'],
    supportedAspectRatios: [],
    supportedQualities: ['1080p', '4K'],
    inputTypes: ['text', 'image'],
    outputType: '3d',
    freeQuota: 5,
    quotaByQuality: { '1080p': 5, '4K': 2 }
  },
  'tripo-3d': {
    supportedModes: ['txt-to-image', 'image-to-image'],
    supportedAspectRatios: [],
    supportedQualities: ['1080p'],
    inputTypes: ['text', 'image'],
    outputType: '3d',
    freeQuota: 3,
    quotaByQuality: { '1080p': 3 }
  }
};

// Obtenir les capacités d'un modèle (avec fallback)
export function getModelCapabilities(modelId: string): ModelCapabilities {
  return modelCapabilities[modelId] || {
    supportedModes: ['txt-to-image'],
    supportedAspectRatios: ['1:1', '16:9'],
    supportedQualities: ['1080p'],
    inputTypes: ['text'],
    outputType: 'image',
    freeQuota: 0
  };
}

// Labels des modes en français
export const modeLabels: Record<GenerationMode, string> = {
  'txt-to-image': 'Texte → Image',
  'txt-to-video': 'Texte → Vidéo',
  'image-to-image': 'Image → Image',
  'image-to-video': 'Image → Vidéo'
};

// Icônes des formats avec composants SVG
export const aspectRatioIcons: Record<AspectRatio, string> = {
  '16:9': '🖥️',
  '4:3': '📺',
  '1:1': '⬜',
  '9:16': '📱',
  '3:4': '📷',
  '21:9': '🎬'
};

// Labels des formats
export const aspectRatioLabels: Record<AspectRatio, string> = {
  '16:9': 'Paysage HD',
  '4:3': 'Standard',
  '1:1': 'Carré',
  '9:16': 'Portrait',
  '3:4': 'Photo',
  '21:9': 'Cinéma'
};

// Option Extension Vidéo - modèles compatibles
export const videoExtensionCapable: string[] = [
  'runway-gen3',
  'kling-ai',
  'luma-dream-machine-free',
  'pika-labs',
  'google-veo2',
  'sora',
  'minimax-video',
  'grok-aurora'
];

// Vérifier si un modèle supporte l'extension vidéo
export function supportsVideoExtension(modelId: string): boolean {
  return videoExtensionCapable.includes(modelId);
}
