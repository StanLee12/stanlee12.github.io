---
title: 开发一个查询IP信息的MCP服务, 并通过Docker部署
author: stan
date: 2025-04-24 18:07:43
tags: [mcp, docker]
index_img: /images/index_img/mcp.jpg
---

自从`MCP`的出现, 全球各个大厂争先恐后的出了很多自家的MCP服务，让开发者可以进行调用，并且`MCP`的`SDK`也越来越完善，也支持大部分的开发语言。

我就来研究一下使用 `TypeScript` 来写一个 `MCP` 服务，并且使用 `Docker` 来部署。(顺便了解一下docker的自动部署)

## MCP脚手架

有一天在搜 `MCP` 服务的时候，看到了一个  `mcp-framework` 的项目，这个项目是一个 `MCP` 服务的脚手架，它提供了一个 `MCP` 服务的基本框架，支持`MCP`项目的创建以及类文件的生成。这是一个基于 `TypeScript` 的项目，所以我就来研究一下它怎么使用。

## 安装
首先这是一个脚手架 `cli` 命令, 我们需要将它安装在全局，通过 `npm` 安装

```bash
npm install -g mcp-framework

# 创建你的新项目
mcp create my-mcp-server

# 进入到项目根目录下
cd my-mcp-server

# 安装依赖
npm install
```

```bash
my-mcp-server/
├── src/
│   ├── tools/         # Tools文件夹
│   │   └── ExampleTool.ts
│   └── index.ts       # 文件主入口
├── package.json
└── tsconfig.json
```

## 编码

通过命令行可以新建一个新的 `MCP Tool`, 顺便说一下，`MCP` 主要功能分为三个部分，`Tools`、 `Prompts`、 `Resources`。
`Tools` 是提供可供`AI`调用的方法, `Prompts` 是给予 `AI` 对于自己系统的提示, `Resources` 是可以提供给`AI`的系统内部的一些资源。如果想要更深入的了解，可以到 `MCP` 的 `Github`仓库进行了解

我们就先开发一个最能直观体现`MCP`作用的`Tools`来进行举例吧。

### 创建Tool文件

```bash
mcp add tool get-ip 
```

> 我们来实现一个通过`AI` 结合 `MCP` 查询 `IP`信息的功能

通过上面的命令，可以看到`/src/tools`文件下新新生成了一个名为`GetIpTool.ts`的文件，我们具体的功能要在该文件内进行编写。

```typescript
import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";

interface GetIpInput {
  ip: string;
}

class GetIpTool extends MCPTool<GetIpInput> {
  name = "get-ip";
  description = "get ip information";

  schema = {
    ip: {
      type: z.string(),
      description: "ip address",
      required: true,
    }
  };

  async execute(input: GetIpInput) {
    try {
      logger.info("Starting execution");
      const response: any = await this.fetch(`https://api.vore.top/api/IPdata?ip=${input.ip}`);
      return response;
    } catch (error) {
      return error; 
    }
  }
}

export default GetIpTool;
```

> 这是基于生成的模板进行修改后的，`schema`里的属性是需要调用ai时传递的参数, `execute`方法是执行该`tool`时执行的操作, 返回的结果`AI`会自己解析，所以直接返回就好。
> 需要注意的是，`description`的内容一定要准确和完善，这样子`AI`才能更好的理解`tool`的用法和字段的含义

## 设置服务

```typescript
import { MCPServer } from "mcp-framework";

const server = new MCPServer({
    transport: {
      type: "http-stream", // 设置连接方式为http stream
      options: {
        port: 1337, // 端口号为1337
        cors: {
          allowOrigin: "*"
        }
      }
    }
});

server.start().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});

```

简单配置一下`MCP`服务的启动方式, 分为`stdio`、`sse`、`http-stream`，其中`sse`将要过期了。`stdio`主要是针对本地的服务，而`http-stream` `sse` 针对的是部署在云服务器上的服务

## 运行

```bash
npm run build

```

执行`build`命令，会在`dist`目录下生成对应的`js`文件, 然后执行:

```bash
node dist/index.js 
```

这样，我们的`MCP`服务就运行在本机的<http://localhostr:1337/mcp>地址上

## 测试

> 需要用到`mcp-debug`, 这个是 `MCP`团队开发的本地`web`应用，专用来测试`MCP`服务的

```bash
npx mcp-debug
```

如果没安装过会提示先安装该插件, 执行成功后打开<http://127.0.0.1:5173>, 调试工具的默认地址

![1](/images/mcp/1.jpg)

将自己本地的`MCP`服务地址输入到URL中，点击`Connect`,即可看到`MCP`服务中拥有的`Tools`，也就是可以进行调试了。

## 部署

创建`Dockerfile`

```Dockerfile
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 1337
CMD ["node", "dist/index.js"]
```

> `MCP`基于`nodejs 18+`， 所以先检查自己的`node`版本是否符合

创建`docker-compose.yml`

```yml
version: '3'
services:
  app:
    container_name: get-ip-mcp-server
    build: .
    ports:
      - "1337:1337"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
```

创建完`Docker`配置文件之后将代码上传至自己的服务器存放项目的文件夹下

> 注意 `dist` `node_module` 文件不要上传,`docker`部署的时候会重新安装构建的

## 运行

到服务器的项目根目录下执行:
```bash
docker-compose up -d
```

## 验证

这里我们使用`cherry-studio`进行连接我们的`mcp`服务查看是否可用

![2](/images/mcp/2.jpg)

新建`MCP`连接，并连接到我们自己的服务,这里我是做了`nginx`域名转发了，所以是通过域名访问的，如果没有配置`nginx`,则需要通过你的服务器地址加端口号进行访问了

> 例如 <http://192.168.0.3:1337/mcp>

配置好之后，即可在`cherry-studio`对话框内选定我们刚配置的`MCP`服务, 输入`ip`地址，就会发现`AI`调用了我们的`MCP`服务，并返回了相应的结果

![3](/images/mcp/3.jpg)

## 参考

- [mcp-framework](https://mcp-framework.com/)
- [mcp协议](https://modelcontextprotocol.io/)
- [cherry studio](https://github.com/CherryHQ/cherry-studio)
