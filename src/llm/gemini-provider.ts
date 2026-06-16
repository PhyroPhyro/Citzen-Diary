import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  LLMProvider,
  LLMResponse,
  MilestoneLLMResponse,
  SpecializationLLMResponse,
  NPCProfileLLMResponse,
  BioLLMResponse,
  QuestBranchResponse,
} from './provider';

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = 'gemini-2.0-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  private async callLLM(prompt: string): Promise<string> {
    const genModel = this.genAI.getGenerativeModel({ model: this.model });
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();
    return text;
  }

  private parseJSON<T>(text: string): T {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned) as T;
  }

  async generateDiaryEntry(context: string): Promise<LLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<LLMResponse>(response);
  }

  async generateMilestone(context: string): Promise<MilestoneLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<MilestoneLLMResponse>(response);
  }

  async generateSpecialization(context: string): Promise<SpecializationLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<SpecializationLLMResponse>(response);
  }

  async generateNPCProfile(context: string): Promise<NPCProfileLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<NPCProfileLLMResponse>(response);
  }

  async generateBio(context: string): Promise<BioLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<BioLLMResponse>(response);
  }

  async generateQuestBranch(context: string): Promise<QuestBranchResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<QuestBranchResponse>(response);
  }
}
