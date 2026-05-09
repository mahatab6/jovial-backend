import OpenAI from "openai";
import { IAIProvider } from "./ai.provider.interface";

export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateContent(systemPrompt: string, userPrompt: string, model: string): Promise<any> {
    const completion = await this.openai.chat.completions.create({
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
}
