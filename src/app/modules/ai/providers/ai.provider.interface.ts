export interface IAIProvider {
  generateContent(systemPrompt: string, userPrompt: string, model: string): Promise<any>;
}
