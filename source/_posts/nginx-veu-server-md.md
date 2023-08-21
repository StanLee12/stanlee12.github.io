---
title: nginx 部署 vue应用 server基本配置
author: stan
date: 2023-08-04 12:35:45
tags: [nginx, vue]
---

```nginx
server {
  listen   18080; # 监听的端口号,需要在防火墙中开启
  server_name  _; # server_name指令配置为_，则表示该虚拟主机将接受所有域名和主机名的请求。

  location / { # 用于匹配对根目录的请求
    root /usr/share/nginx/dist; # 项目build之后存放的文件夹
    try_files $uri $uri/ /index.html; # 指令用于尝试请求的文件或目录，如果找不到，则返回 index.html
  }
}
```
