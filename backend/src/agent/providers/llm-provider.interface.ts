import { ToolCallExecution } from '../../domain/entities/chat.entity.js';
import { IAgentTool } from '../tools/base.tool.js';

export interface AgentMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentGenerationResult {
  content: string;
  toolExecutions: ToolCallExecution[];
  suggestedQuestions?: string[];
  providerUsed: 'openai' | 'simulation';
  latencyMs: number;
}

export interface ILlmProvider {
  generateResponse(
    messages: AgentMessageInput[],
    tools: IAgentTool[],
    language: 'en' | 'ar'
  ): Promise<AgentGenerationResult>;
}
