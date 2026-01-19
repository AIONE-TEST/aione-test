// Input validation utilities for edge functions

// Maximum limits
export const MAX_MESSAGE_LENGTH = 10000;
export const MAX_MESSAGES_COUNT = 50;
export const MAX_PROMPT_LENGTH = 5000;
export const MAX_TEXT_LENGTH = 5000;

// Allowed AI models whitelist
export const ALLOWED_CHAT_MODELS: Record<string, string[]> = {
  openai: [
    'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-4-turbo-preview',
    'gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'o1', 'o1-mini', 'o1-preview'
  ],
  anthropic: [
    'claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307',
    'claude-2.1', 'claude-2.0'
  ],
  groq: [
    'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant',
    'llama3-groq-70b-8192-tool-use-preview', 'llama3-groq-8b-8192-tool-use-preview',
    'gemma2-9b-it', 'mixtral-8x7b-32768'
  ],
  mistral: [
    'mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest',
    'open-mistral-7b', 'open-mixtral-8x7b', 'open-mixtral-8x22b',
    'codestral-latest', 'mistral-embed'
  ],
  grok: ['grok-beta', 'grok-2-beta', 'grok-2-mini-beta'],
};

export interface ValidationError {
  field: string;
  message: string;
}

export interface ChatValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitizedMessages?: Array<{ role: string; content: string }>;
  sanitizedModel?: string;
}

// Validate chat messages
export function validateChatInput(
  messages: unknown,
  model: unknown,
  provider: keyof typeof ALLOWED_CHAT_MODELS
): ChatValidationResult {
  const errors: ValidationError[] = [];

  // Validate messages is array
  if (!messages || !Array.isArray(messages)) {
    errors.push({ field: 'messages', message: 'Messages array is required' });
    return { valid: false, errors };
  }

  // Validate array length
  if (messages.length > MAX_MESSAGES_COUNT) {
    errors.push({ 
      field: 'messages', 
      message: `Too many messages. Maximum is ${MAX_MESSAGES_COUNT}` 
    });
    return { valid: false, errors };
  }

  if (messages.length === 0) {
    errors.push({ field: 'messages', message: 'At least one message is required' });
    return { valid: false, errors };
  }

  // Validate each message
  const sanitizedMessages: Array<{ role: string; content: string }> = [];
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== 'object') {
      errors.push({ field: `messages[${i}]`, message: 'Invalid message object' });
      continue;
    }

    const role = msg.role;
    const content = msg.content;

    // Validate role
    if (!role || !['system', 'user', 'assistant'].includes(role)) {
      errors.push({ 
        field: `messages[${i}].role`, 
        message: 'Role must be system, user, or assistant' 
      });
      continue;
    }

    // Validate content
    if (typeof content !== 'string') {
      errors.push({ field: `messages[${i}].content`, message: 'Content must be a string' });
      continue;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      errors.push({ 
        field: `messages[${i}].content`, 
        message: `Content exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` 
      });
      continue;
    }

    sanitizedMessages.push({ role, content: content.trim() });
  }

  // Validate model
  let sanitizedModel: string | undefined;
  
  if (model !== undefined && model !== null) {
    if (typeof model !== 'string') {
      errors.push({ field: 'model', message: 'Model must be a string' });
    } else {
      const allowedModels = ALLOWED_CHAT_MODELS[provider];
      if (!allowedModels?.includes(model)) {
        errors.push({ 
          field: 'model', 
          message: `Invalid model. Allowed models: ${allowedModels?.join(', ') || 'none'}` 
        });
      } else {
        sanitizedModel = model;
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { 
    valid: true, 
    errors: [], 
    sanitizedMessages,
    sanitizedModel 
  };
}

// Validate image generation input
export function validateImageInput(prompt: unknown): { valid: boolean; error?: string; sanitizedPrompt?: string } {
  if (!prompt) {
    return { valid: false, error: 'Prompt is required' };
  }

  if (typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt must be a string' };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` };
  }

  if (prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  return { valid: true, sanitizedPrompt: prompt.trim() };
}

// Validate text-to-speech input
export function validateTTSInput(text: unknown): { valid: boolean; error?: string; sanitizedText?: string } {
  if (!text) {
    return { valid: false, error: 'Text is required' };
  }

  if (typeof text !== 'string') {
    return { valid: false, error: 'Text must be a string' };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` };
  }

  if (text.trim().length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }

  return { valid: true, sanitizedText: text.trim() };
}

// Validate numeric range
export function validateNumericRange(
  value: unknown, 
  min: number, 
  max: number, 
  fieldName: string
): { valid: boolean; error?: string; sanitizedValue?: number } {
  if (value === undefined || value === null) {
    return { valid: true, sanitizedValue: undefined };
  }

  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (num < min || num > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { valid: true, sanitizedValue: num };
}
