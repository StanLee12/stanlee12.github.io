---
title: AI模型平台Cherry Studio开启MCP Filesystem服务
author: stan
date: 2025-04-15 10:54:57
tags: [cherry studio, mcp, deepseek, ai, llm]
index_img: /images/index_img/cherry_studio.avif
---

## MCP 服务

MCP全称是Model Context Protocol，是一个基于LLM(大语言模型)的协议，你可以理解为用户结合ai服务的http协议，通过这个协议你可以调用ai服务的接口，获取ai服务的返回结果。
再通俗点讲就是，通过实现该协议，你可以将自己的平台与ai服务进行对接，通过ai调用自己平台的接口，实现自己平台的ai化。

## Cherry Studio

Cherry Studio是一个基于MCP协议的ai服务平台，你可以理解为一个ai服务的后台管理系统，你可以通过该系统来管理你的ai服务。这个是国内开源的一个平台，不需要注册，非常方便。
 
Cherry studio可以通过 <https://cherry-ai.com/> 进行下载

## 配置ai token

![配置Token](/images/cherry-studio-mcp/1.jpg)

Cherry Studio配置ai模型的方式非常方便, 你只需要到设置中找到对应的想要使用的模型，然后点击右侧的获取会自动跳转至该模型平台，获取到token后，粘贴到API密钥输入框内即可。

## 配置MCP服务
![配置MCP](/images/cherry-studio-mcp/2.jpg)

在Cherry Studio中，你可以通过点击左侧的MCP服务，来配置MCP服务。

我们这里以Cherry Studio内置的Filesystem服务为例，点击添加，即可添加一个Filesystem服务。

![配置MCP](/images/cherry-studio-mcp/3.jpg)

还需要将自己想要控制的文件夹作为参数配置给MCP服务，如图所示。
这样，我们就配置好了一个MCP服务。

## 开启MCP服务

当配置完MCP服务以后，我们切换到AI对话窗口，开启需要使用的MCP服务：
![测试](/images/cherry-studio-mcp/4.jpg)

并且我们可以预设一段话，方便AI更能清晰的理解我们的需求，例如:

> 你是一个智能机器人，拥有我的文件夹操作权限，我需要你帮助我操作文件夹

这样，我们就可以通过AI对话窗口来控制我们的文件夹了。

## 示例

![测试](/images/cherry-studio-mcp/5.jpg)

如上所示，ai已经能够访问我们的文件夹了，并且可以执行我们的指令了。当然具体有哪些指令可以操作，就需要我们去 相应的 MCP 服务中去查看了。如果有些特殊的需求，我们可以自己实现一个 MCP 服务。这就是我接下来将要研究的内容了。

## 关于

想要了解更多关于MCP的内容，可以参考以下链接：

- [mcp服务](https://mcp.so)
- [cherry studio](https://github.com/CherryHQ/cherry-studio)
- [mcp协议](https://modelcontextprotocol.io/)
