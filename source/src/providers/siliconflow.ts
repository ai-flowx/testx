import { fetchWithCache } from '../cache';
import { getEnvString } from '../envars';
import logger from '../logger';
import type { ApiProvider, ProviderResponse } from '../types';
import { REQUEST_TIMEOUT_MS, parseChatPrompt } from './shared';

interface SiliconflowChatOptions {
  // TBD: FIXME
}

const SiliconflowChatOptionKeys = new Set<keyof SiliconflowChatOptions>([
  // TBD: FIXME
]);

interface SiliconflowChatJsonL {
  // TBD: FIXME
}

export class SiliconflowChatProvider implements ApiProvider {
  modelName: string;
  config: SiliconflowChatOptions;

  constructor(modelName: string, options: { id?: string; config?: SiliconflowChatOptions } = {}) {
    const { id, config } = options;
    this.modelName = modelName;
    this.id = id ? () => id : this.id;
    this.config = config || {};
  }

  id(): string {
    return `siliconflow:chat:${this.modelName}`;
  }

  toString(): string {
    return `[Siliconflow Chat Provider ${this.modelName}]`;
  }

  async callApi(prompt: string): Promise<ProviderResponse> {
    const messages = parseChatPrompt(prompt, [{ role: 'user', content: prompt }]);

    const params = {
      model: this.modelName,
      messages,
      options: Object.keys(this.config).reduce(
        (options, key) => {
          const optionName = key as keyof SiliconflowChatOptions;
          if (SiliconflowChatOptionKeys.has(optionName)) {
            options[optionName] = this.config[optionName];
          }
          return options;
        },
        {} as Partial<
          Record<keyof SiliconflowChatOptions, number | boolean | string[] | undefined>
        >,
      ),
    };

    logger.debug(`Calling Siliconflow API: ${JSON.stringify(params)}`);
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
    logger.debug(`\tSiliconflow generate API response: ${response.data}`);
    if (response.data.error) {
      return {
        error: `Siliconflow error: ${response.data.error}`,
      };
    }

    try {
      const output = response.data
        .split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string) => {
          const parsed = JSON.parse(line) as SiliconflowChatJsonL;
          if (parsed.message?.content) {
            return parsed.message.content;
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
        error: `Siliconflow API response error: ${String(err)}: ${JSON.stringify(response.data)}`,
      };
    }
  }
}
