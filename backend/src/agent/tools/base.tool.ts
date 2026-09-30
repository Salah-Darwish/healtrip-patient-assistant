export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface IAgentTool {
  readonly definition: ToolDefinition;
  execute(args: any): Promise<any>;
}
