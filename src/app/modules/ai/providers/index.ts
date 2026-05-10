import { GeminiProvider } from "./gemini.provider";
import { IAIProvider } from "./ai.provider.interface";

export * from "./ai.provider.interface";
export * from "./gemini.provider";

export const getAIProvider = (providerName?: string): IAIProvider => {
  return new GeminiProvider();
};
