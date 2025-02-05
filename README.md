# testx

[![Docker](https://img.shields.io/docker/pulls/craftslab/testx)](https://hub.docker.com/r/craftslab/testx)
[![License](https://img.shields.io/github/license/ai-flowx/testx.svg)](https://github.com/ai-flowx/testx/blob/main/LICENSE)
[![Tag](https://img.shields.io/github/tag/ai-flowx/testx.svg)](https://github.com/ai-flowx/testx/tags)



## Introduction

*testx* is the test tools for prompts, llms, and vector databases.



## Build

```bash
docker build -f Dockerfile -t craftslab/testx:latest .
```



## Run

### Default mode

```bash
docker run -v $PWD:/home/craftslab craftslab/testx:latest
```



### Customized mode

```bash
docker run -v $PWD:/tmp craftslab/testx:latest eval --no-progress-bar --no-table -c /tmp/config.yml -o /tmp/output.html
```



## Reference

- [promptfoo](https://github.com/promptfoo/promptfoo)
- [prompttools](https://github.com/hegelai/prompttools)
