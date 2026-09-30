import OpenAI from 'openai';
import { ILlmProvider, AgentMessageInput, AgentGenerationResult } from './llm-provider.interface.js';
import { IAgentTool } from '../tools/base.tool.js';
import { ToolCallExecution } from '../../domain/entities/chat.entity.js';
import { HEALTRIP_SYSTEM_PROMPT } from '../system-prompts.js';

export class OpenAiProvider implements ILlmProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  public async generateResponse(
    messages: AgentMessageInput[],
    tools: IAgentTool[],
    language: 'en' | 'ar'
  ): Promise<AgentGenerationResult> {
    const startTime = Date.now();
    const toolExecutions: ToolCallExecution[] = [];

    const openAiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = tools.map(t => ({
      type: 'function',
      function: {
        name: t.definition.function.name,
        description: t.definition.function.description,
        parameters: t.definition.function.parameters as any,
      },
    }));

    const toolMap = new Map<string, IAgentTool>();
    for (const tool of tools) {
      toolMap.set(tool.definition.function.name, tool);
    }

    const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'system',
      content: `${HEALTRIP_SYSTEM_PROMPT}\n\nCURRENT LANGUAGE CONTEXT: ${language.toUpperCase()}`,
    };

    const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      systemMessage,
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    let currentResponse = await this.client.chat.completions.create({
      model: this.model,
      messages: conversationHistory,
      tools: openAiTools.length > 0 ? openAiTools : undefined,
      tool_choice: 'auto',
      temperature: 0.2, // Low temperature for clinical precision & consistency
    });

    let message = currentResponse.choices[0]?.message;
    let iterations = 0;
    const MAX_TOOL_ITERATIONS = 3;

    while (message?.tool_calls && message.tool_calls.length > 0 && iterations < MAX_TOOL_ITERATIONS) {
      iterations++;
      conversationHistory.push(message);

      for (const call of message.tool_calls) {
        const toolName = call.function.name;
        const toolInstance = toolMap.get(toolName);
        let parsedArgs: any = {};
        try {
          parsedArgs = JSON.parse(call.function.arguments);
        } catch {
          parsedArgs = {};
        }

        const toolStart = Date.now();
        let toolOutput: any;

        if (toolInstance) {
          try {
            toolOutput = await toolInstance.execute(parsedArgs);
          } catch (err: any) {
            toolOutput = { error: `Failed to execute tool ${toolName}: ${err.message}` };
          }
        } else {
          toolOutput = { error: `Tool ${toolName} not registered` };
        }

        const durationMs = Date.now() - toolStart;
        toolExecutions.push({
          tool: toolName,
          input: parsedArgs,
          output: toolOutput,
          durationMs,
        });

        conversationHistory.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(toolOutput),
        });
      }

      currentResponse = await this.client.chat.completions.create({
        model: this.model,
        messages: conversationHistory,
        tools: openAiTools,
        tool_choice: 'auto',
        temperature: 0.2,
      });

      message = currentResponse.choices[0]?.message;
    }

    const finalContent = message?.content || 'I have evaluated your request against our clinical protocols.';
    const latencyMs = Date.now() - startTime;

    return {
      content: finalContent,
      toolExecutions,
      providerUsed: 'openai',
      latencyMs,
    };
  }
}
