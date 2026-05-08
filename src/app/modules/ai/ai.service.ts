import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../../lib/prisma";
import AppErrors from "../../errorHandler/AppErrors";
import { ContentType } from "../../generated/prisma/enums";
import status from "http-status";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type GenerateContentInput = {
  prompt: string;
  type: ContentType;
  tone?: string;
  length?: "short" | "medium" | "long";
  keywords?: string[];
  model?: string;
};

class AIService {
  private static getProvider() {
    return process.env.AI_PROVIDER?.toLowerCase() || "openai";
  }

  private static async callOpenAI(systemPrompt: string, userPrompt: string, model: string) {
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    return JSON.parse(content);
  }

  private static async callGemini(systemPrompt: string, userPrompt: string, model: string) {
    const geminiModel = genAI.getGenerativeModel({
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

  static async generateContent(userId: string, input: GenerateContentInput) {
    const {
      prompt,
      type,
      tone = "professional",
      length = "medium",
      keywords = [],
      model,
    } = input;

    let provider = this.getProvider();
    if (model) {
      if (model.startsWith("gpt") || model.startsWith("o1")) provider = "openai";
      if (model.startsWith("gemini")) provider = "gemini";
    }

    const defaultModel = provider === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash";

    const systemPrompt = `You are a professional content writer. Respond ONLY with valid JSON using these exact keys:
{
  "title": string,
  "content": string,
  "seoScore": number (70-98),
  "keywords": string[],
  "readingTime": number,
  "summary": string
}`;

    const userPrompt = `
Type: ${type}
Tone: ${tone}
Length: ${length}
Keywords: ${keywords.join(", ") || "N/A"}
Prompt: ${prompt}
`;

    let aiResponse: any;

    try {
      if (provider === "gemini") {
        aiResponse = await this.callGemini(systemPrompt, userPrompt, model || defaultModel);
      } else {
        aiResponse = await this.callOpenAI(systemPrompt, userPrompt, model || defaultModel);
      }
    } catch (error: any) {
      console.error(`[${provider.toUpperCase()}] Error:`, error.message);
      throw new AppErrors(
        status.BAD_GATEWAY,
        `${provider.toUpperCase()} Error: ${error.message}`
      );
    }

    // Database Save
    const [content, history] = await prisma.$transaction([
      prisma.content.create({
        data: {
          title: aiResponse.title,
          content: aiResponse.content,
          type,
          prompt,
          metadata: {
            seoScore: aiResponse.seoScore,
            keywords: aiResponse.keywords,
            readingTime: aiResponse.readingTime,
            summary: aiResponse.summary,
            modelUsed: model || defaultModel,
            provider: provider,
          },
          userId,
        },
      }),

      prisma.generationHistory.create({
        data: {
          userId,
          prompt,
          response: aiResponse.content,
          modelUsed: model || defaultModel,
        },
      }),
    ]);

    return {
      content,
      history,
      aiResponse,

    };
  }
}

export default AIService;