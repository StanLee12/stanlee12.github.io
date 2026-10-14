---
title: Idea通过远程连接的Docker服务一键部署应用
author: stan
date: 2026-10-14 11:44:59
tags: [Idea, Docker, Deploy]
index_img: /images/index_img/idea-docker.png
---

## 前言
`Idea`默认带了运行`Docker`容器的功能，但是我们需要连接到远程的`Docker`服务，才能部署应用。这篇文章的基础是在上一篇中我们完成了`Idea`连接远程的`Docker`服务。

## 新建运行配置

![示例](/images/idea-docker/idea-docker-1.png)

在`Idea`右上角点击 `运行配置 -> 新建` 即可新建一个运行配置。

## 选择`Docker`运行文件

![示例](/images/idea-docker/idea-docker-2.png)

因为我这里运行牵扯到了`Docker`的`networks`, 所以是使用`Docker Compose`文件。

## 配置`Docker Compose`

![示例](/images/idea-docker/idea-docker-3.png)

首先我们`Docker`服务当然要选服务器上的，而不是选本地的，注意不要选错了。
到这一步骤，你点击运行该配置，也就是完成了部署，应用就会在服务器上运行了。跟你在服务器上通过``docker-compose up -d``是一样的。

## 打包命令
如果还想简化操作，需要在部署前执行打包，则可以：

![示例](/images/idea-docker/idea-docker-4.png)

![示例](/images/idea-docker/idea-docker-5.png)

添加`执行前`的一些操作，运行`mvn`的打包指令即可，这样就实现了在`Idea`中一键打包部署应用。
