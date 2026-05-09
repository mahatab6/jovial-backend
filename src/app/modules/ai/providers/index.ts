import { GeminiProvider } from "./gemini.provider";
import { OpenAIProvider } from "./openai.provider";
import { IAIProvider } from "./ai.provider.interface";

export * from "./ai.provider.interface";
export * from "./openai.provider";
export * from "./gemini.provider";

export const getAIProvider = (providerName: string): IAIProvider => {
  switch (providerName.toLowerCase()) {
    case "openai":
      return new OpenAIProvider();
    case "gemini":
      return new GeminiProvider();
    default:
      return new OpenAIProvider();
  }
};
