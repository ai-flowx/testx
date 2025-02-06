# SiliconFlow

The `siliconflow` provider is compatible with [SiliconFlow](https://docs.siliconflow.cn/api-reference/), which enables access to DeepSeek, Qwen, and more.

You can use its `/chat/completions` endpoint by specifying any of the following providers from the [SiliconFlow models](https://siliconflow.cn/models):

- `siliconflow:chat:deepseek-ai/DeepSeek-R1`
- `siliconflow:chat:deepseek-ai/DeepSeek-V3`
- `siliconflow:chat:deepseek-ai/DeepSeek-R1-Distill-Llama-70B`
- `siliconflow:chat:deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`
- `siliconflow:chat:deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`
- `siliconflow:chat:deepseek-ai/DeepSeek-R1-Distill-Llama-8B`
- `siliconflow:chat:deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`
- `siliconflow:chat:deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`
- `siliconflow:chat:deepseek-ai/DeepSeek-V2.5`
- ...

Supported environment variables:

- `SILICONFLOW_BASE_URL` - protocol, host name, and port (defaults to `http://localhost:8080`)
- `SILICONFLOW_API_KEY` - (optional) api key that is passed as the Bearer token in the Authorization Header when calling the API
- `REQUEST_TIMEOUT_MS` - request timeout in milliseconds

To pass configuration options to SiliconFlow, use the `config` key like so:

```yaml title=promptfooconfig.yaml
providers:
  - id: siliconflow:deepseek-ai/DeepSeek-R1
    config:
      max_tokens: 128
      temperature: 0
```

## Evaluating models serially

By default, promptfoo evaluates all providers concurrently for each prompt. However, you can run evaluations serially using the `-j 1` option:

```bash
promptfoo eval -j 1
```

This sets concurrency to 1, which means:

1. Evaluations happen one provider at a time, then one prompt at a time.
2. Only one model is loaded into memory, conserving system resources.
3. You can easily swap models between evaluations without conflicts.

This approach is particularly useful for:

- Local setups with limited RAM
- Testing multiple resource-intensive models
- Debugging provider-specific issues
