---
title: AI模型平台Cherry Studio 使用Github MCP服务
author: stan
date: 2025-04-15 16:52:03
tags: [github, mcp, cherry studio, llm, ai]
index_img: /images/index_img/github.webp
---

## Github MCP服务

除了 `Cherry Studio`内置的MCP服务外，<https://mcp.so/> 上还提供了很多官方平台提供的mcp服务

![示例](/images/github-mcp/1.jpg)

因为平时github使用的挺多的，所以就选择Github MCP服务进行一个对接

## 获取Github token

首先我们需要获取一个Github token，用于通过mcp服务访问我们的仓库

在 `Settings` -> `Developer settings` -> `Personal access tokens` -> `Tokens(classic)` 中创建一个token

为了安全起见我们新建一个 `Fine-grained personal access tokens`
![示例](/images/github-mcp/2.jpg)

注意，需要将你想要通过`ai`操作你仓库的权限勾选中，否则该`Token`也无法执行相应的操作
![示例](/images/github-mcp/4.jpg)

这个 `Token` 我们需要保存下来，因为后面我们需要使用, 页面刷新就再也看不到了，所以记得找个记事本保存一下

## 配置Github MCP服务
具体配置可以参考GitHub MCP服务的文档: <https://github.com/github/github-mcp-server>

其中有一段`Usage with Claude Desktop`的配置，我们可以参考一下:
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```
根据`Cherry Studio`开启MCP服务的配置项，我们不难发现是参考的`Claude`的配置，所以我们可以直接复制过来，然后将`GITHUB_PERSONAL_ACCESS_TOKEN`替换为我们自己的`Token`


然后在 `Cherry Studio` 中点击 `MCP` 服务，点击 `+` 号添加一个服务
点击计入该空白服务，并进行如下配置:
![示例](/images/github-mcp/3.jpg)

1. 名称, 我们就起一个方便我们识别的名称就好

2. 类型, 选择 stdio 就好，因为我们的 `Github MCP`服务是启动在本地`docker`中的

3. 命令, `Cherry Studio`默认推荐的命令是`uvx` 和 `npx`, 但是`Github MCP`是通过`docker`来启动的，所以我们事先需要安装`docker`, 然后此处手动输入 `docker` 即可

4. 参数, 我们将 `json` 中的 `args` 部分复制过来即可, 注意要将引号以及逗号删除

5. 环境变量, 配置的形式是`key=value`, 所以需要我们将 `GITHUB_PERSONAL_ACCESS_TOKEN=<your token>` 粘贴进去, `<your token>` 替换为Github账号中获取的Token

配置完毕之后，我们点击保存并启用该服务

## 测试
切换到对话窗口, 首先我们需要告知`ai` 模型一个基本信息，我们需要操作的是哪个仓库
例如:
```
# 角色设定
你是一个智能机器人，拥有GitHub API操作权限，你的工作是帮我管理我的GitHub代码仓库，检查是否有我未处理的issue/pr，并给出合理的解决建议。

# 基本信息
我github的id是：StanLee12  
我自己的代码仓库是：https://github.com/StanLee12/stanlee12.github.io
```

将这段话发给`模型`，然后我们就可以开始通过`Cherry Studio`来操作我们的`Github`仓库了

![示例](/images/github-mcp/5.jpg)

可以看到`ai`通过`mcp`服务调用了 `list_pull_requests` 和 `list_code_scanning_alerts`方法， 但是第二个失败了，是因为我的`Token`没有给到相关的权限
