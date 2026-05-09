import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAIProvider } from "./ai.provider.interface";
import { envVariable } from "../../../../config/env";


export class GeminiProvider implements IAIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(envVariable.GEMINI_API_KEY);
  }

  async generateContent(systemPrompt: string, userPrompt: string, model: string): Promise<any> {
    const geminiModel = this.genAI.getGenerativeModel({
      model: model || "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      },
    });

    const result = await geminiModel.generateContent(userPrompt);

    const text = result.response.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        title: "Generated Content",
        content: text,
        seoScore: 75,
        keywords: [],
        readingTime: 5,
        summary: userPrompt.substring(0, 150),
      };
    }
  }
}
