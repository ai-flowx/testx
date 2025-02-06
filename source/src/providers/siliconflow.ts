import { fetchWithCache } from '../cache';
import { getEnvString } from '../envars';
import logger from '../logger';
import type { ApiProvider, ProviderResponse } from '../types';
import { REQUEST_TIMEOUT_MS, parseChatPrompt } from './shared';

interface SiliconFlowChatOptions {
  frequency_penalty?: number;
  max_tokens?: number;
  n?: number;
  response_format?: ResponseFormat;
  stop?: string[];
  stream?: boolean;
  temperature?: number;
  tools?: RequestTool[];
}

interface ResponseFormat {
  type: string;
}

interface RequestTool {
  function: RequestFunction;
  type: string;
  top_k?: number;
  top_p?: number;
}

interface RequestFunction {
  name: string;
  description: string;
  parameters?: object;
  strict?: boolean;
}

const SiliconFlowChatOptionKeys = new Set<keyof SiliconFlowChatOptions>([
  'frequency_penalty',
  'max_tokens',
  'n',
  'response_format',
  'stop',
  'stream',
  'temperature',
  'tools',
]);

interface SiliconFlowChatJsonL {
  choices?: ResponseChoice[];
  created?: number;
  id?: string;
  model?: string;
  object?: string;
  tool_calls?: ResponseToolCall[];
  usage?: ResponseUsage;
}

interface ResponseChoice {
  finish_reason?: string;
  message?: ResponseMessage;
}

interface ResponseMessage {
  content?: string;
  reasoning_content?: string;
  role?: string;
}

interface ResponseToolCall {
  function: ResponseFunction;
  id: string;
  type: string;
}

interface ResponseFunction {
  arguments: string;
  name: string;
}

interface ResponseUsage {
  completion_token?: number;
  prompt_token?: number;
  total_tokens?: number;
}

export class SiliconFlowChatProvider implements ApiProvider {
  modelName: string;
  config: SiliconFlowChatOptions;

  constructor(modelName: string, options: { id?: string; config?: SiliconFlowChatOptions } = {}) {
    const { id, config } = options;
    this.modelName = modelName;
    this.id = id ? () => id : this.id;
    this.config = config || {};
  }

  id(): string {
    return `siliconflow:chat:${this.modelName}`;
  }

  toString(): string {
    return `[SiliconFlow Chat Provider ${this.modelName}]`;
  }

  async callApi(prompt: string): Promise<ProviderResponse> {
    const messages = parseChatPrompt(prompt, [{ role: 'user', content: prompt }]);

    const params = {
      model: this.modelName,
      messages,
      options: Object.keys(this.config).reduce(
        (options, key) => {
          const optionName = key as keyof SiliconFlowChatOptions;
          if (SiliconFlowChatOptionKeys.has(optionName)) {
            options[optionName] = this.config[optionName];
          }
          return options;
        },
        {} as Partial<
          Record<
            keyof SiliconFlowChatOptions,
            number | boolean | string[] | ResponseFormat | RequestTool[] | undefined
          >
        >,
      ),
    };

    logger.debug(`Calling SiliconFlow API: ${JSON.stringify(params)}`);
    let response;
    try {
      response = await fetchWithCache(
        `${getEnvString('SILICONFLOW_BASE_URL') || 'http://localhost:8080'}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getEnvString('SILICONFLOW_API_KEY')
              ? { Authorization: `Bearer ${getEnvString('SILICONFLOW_API_KEY')}` }
              : {}),
          },
          body: JSON.stringify(params),
        },
        REQUEST_TIMEOUT_MS,
        'text',
      );
    } catch (err) {
      return {
        error: `API call error: ${String(err)}. Output:\n${response?.data}`,
      };
    }
    logger.debug(`\tSiliconFlow generate API response: ${response.data}`);
    if (response.data.error) {
      return {
        error: `SiliconFlow error: ${response.data.error}`,
      };
    }

    try {
      const output = response.data
        .split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string) => {
          const parsed = JSON.parse(line) as SiliconFlowChatJsonL;
          if (!parsed.choices || !Array.isArray(parsed.choices)) {
            logger.debug(`\tSiliconFlow API response error: invalid parsed.choices`);
            return null;
          }
          if (parsed.choices.length !== 1) {
            logger.debug(`\tSiliconFlow API response error: parsed.choices length !== 1`);
            return null;
          }
          if (parsed.choices[0].message?.content) {
            return parsed.choices[0].message.content;
          }
          return null;
        })
        .filter((s: string | null) => s !== null)
        .join('');

      return {
        output,
      };
    } catch (err) {
      return {
        error: `SiliconFlow API response error: ${String(err)}: ${JSON.stringify(response.data)}`,
      };
    }
  }
}
