// Define what generators/features are included in each app package

export interface PackageInfo {
  generators: string[];
  capabilities: string[];
}

export const modelPackages: Record<string, PackageInfo> = {
  // OpenRouter - Multiple LLMs
  "openrouter": {
    generators: ["GPT-4", "Claude", "Llama", "Mistral", "Gemini"],
    capabilities: ["text", "code", "image"]
  },
  
  // Replicate - Multiple models
  "replicate": {
    generators: ["FLUX", "SDXL", "Whisper", "LLaMA"],
    capabilities: ["image", "video", "audio", "text"]
  },
  
  // Stability AI
  "stable-diffusion-3": {
    generators: ["SD 3.5", "SDXL", "SD Turbo"],
    capabilities: ["image", "retouch"]
  },
  "stability-core": {
    generators: ["Stable Image Core", "SDXL"],
    capabilities: ["image"]
  },
  
  // Together AI
  "together-ai": {
    generators: ["Llama 3", "Mistral", "FLUX", "SDXL"],
    capabilities: ["text", "image", "code"]
  },
  
  // FAL.ai
  "fal-ai": {
    generators: ["FLUX Pro", "FLUX Dev", "Fast SDXL"],
    capabilities: ["image", "video"]
  },
  
  // Leonardo AI
  "leonardo-ai": {
    generators: ["Phoenix", "Kino XL", "Anime XL"],
    capabilities: ["image", "retouch"]
  },
  
  // Runway
  "runway-gen3": {
    generators: ["Gen-3 Alpha", "Gen-2", "Motion Brush"],
    capabilities: ["video", "image", "retouch"]
  },
  
  // Kling
  "kling-ai": {
    generators: ["Kling 1.5", "Image Gen"],
    capabilities: ["video", "image"]
  },
  
  // Luma
  "luma-dream": {
    generators: ["Dream Machine", "Ray"],
    capabilities: ["video", "3d"]
  },
  
  // Pika
  "pika-labs": {
    generators: ["Pika 1.0", "Pika 2.0"],
    capabilities: ["video", "image"]
  },
  
  // MiniMax/Hailuo
  "hailuo-minimax": {
    generators: ["Hailuo Video", "MiniMax"],
    capabilities: ["video"]
  },
  
  // ElevenLabs
  "elevenlabs": {
    generators: ["Multilingual v2", "Voice Clone", "SFX"],
    capabilities: ["audio", "text"]
  },
  
  // Suno
  "suno-ai": {
    generators: ["Suno v4", "v3.5"],
    capabilities: ["audio"]
  },
  
  // Udio
  "udio": {
    generators: ["Udio v1.5"],
    capabilities: ["audio"]
  },
  
  // OpenAI
  "dall-e-3": {
    generators: ["DALL-E 3", "DALL-E 2"],
    capabilities: ["image"]
  },
  "gpt-4o": {
    generators: ["GPT-4o", "GPT-4 Turbo", "GPT-3.5"],
    capabilities: ["text", "code", "image"]
  },
  "gpt-4o-mini": {
    generators: ["GPT-4o Mini"],
    capabilities: ["text", "code"]
  },
  
  // Anthropic
  "claude-3-5-sonnet": {
    generators: ["Claude 3.5 Sonnet", "Claude 3 Opus"],
    capabilities: ["text", "code"]
  },
  
  // Midjourney
  "midjourney-v6": {
    generators: ["MJ v6.1", "MJ v5", "Niji"],
    capabilities: ["image"]
  },
  
  // Google
  "gemini-2-flash": {
    generators: ["Gemini 2.0 Flash", "Gemini Pro"],
    capabilities: ["text", "code", "image"]
  },
  "imagen-3": {
    generators: ["Imagen 3", "Imagen 2"],
    capabilities: ["image"]
  },
  
  // FLUX
  "flux-schnell": {
    generators: ["FLUX.1 Schnell"],
    capabilities: ["image"]
  },
  "flux-pro": {
    generators: ["FLUX.1 Pro", "FLUX.1 Dev"],
    capabilities: ["image"]
  },
  "flux-dev": {
    generators: ["FLUX.1 Dev"],
    capabilities: ["image"]
  },
  
  // Perchance
  "perchance-ai": {
    generators: ["Perchance Image"],
    capabilities: ["image"]
  },
  
  // Ideogram
  "ideogram-free": {
    generators: ["Ideogram 2.0"],
    capabilities: ["image"]
  },
  "ideogram-pro": {
    generators: ["Ideogram 2.0 Pro", "Canvas"],
    capabilities: ["image", "retouch"]
  },
  
  // Tensor Art
  "tensor-art": {
    generators: ["SDXL", "SD 1.5", "Custom LoRAs"],
    capabilities: ["image"]
  },
  
  // Playground
  "playground-v2": {
    generators: ["Playground v2.5", "v2"],
    capabilities: ["image"]
  },
  
  // Pollinations
  "pollinations": {
    generators: ["Pollinations Image"],
    capabilities: ["image"]
  },
  
  // PixArt
  "pixart-alpha": {
    generators: ["PixArt-α", "PixArt-Σ"],
    capabilities: ["image"]
  },
  
  // Groq
  "groq-llama": {
    generators: ["Llama 3.3 70B", "Mixtral"],
    capabilities: ["text", "code"]
  },
  
  // Mistral
  "mistral-large": {
    generators: ["Mistral Large", "Mistral Medium"],
    capabilities: ["text", "code"]
  },
  
  // DeepSeek
  "deepseek-v3": {
    generators: ["DeepSeek V3", "DeepSeek Coder"],
    capabilities: ["text", "code"]
  },
  
  // xAI
  "grok-2": {
    generators: ["Grok 2", "Grok Vision"],
    capabilities: ["text", "code", "image"]
  },
  
  // HeyGen
  "heygen": {
    generators: ["Avatar Video", "Voice Clone"],
    capabilities: ["video", "audio"]
  },
  
  // Synthesia
  "synthesia": {
    generators: ["AI Avatar", "Voice"],
    capabilities: ["video", "audio"]
  },
  
  // D-ID
  "d-id": {
    generators: ["Talking Avatar", "Voice"],
    capabilities: ["video", "audio"]
  },
  
  // NVIDIA
  "nvidia-cosmos": {
    generators: ["Cosmos 7B", "14B"],
    capabilities: ["video"]
  },
  
  // Adobe
  "adobe-firefly": {
    generators: ["Firefly 3", "Generative Fill"],
    capabilities: ["image", "retouch"]
  },
  
  // Recraft
  "recraft-v3": {
    generators: ["Recraft V3"],
    capabilities: ["image"]
  },
  
  // Freepik
  "freepik-mystic": {
    generators: ["Mystic V2"],
    capabilities: ["image"]
  },
  
  // Uncensored models
  "seaart-uncensored": {
    generators: ["SeaArt NSFW"],
    capabilities: ["image"]
  },
  "civitai-nsfw": {
    generators: ["Custom NSFW", "LoRAs"],
    capabilities: ["image"]
  },
  "unstability-nsfw": {
    generators: ["Unstability NSFW"],
    capabilities: ["image"]
  },
};

export function getPackageInfo(modelId: string): PackageInfo | null {
  return modelPackages[modelId] || null;
}
