---
title: 使用docker-compose 搭建nginx服务
author: stan
date: 2025-01-27 11:23:23
tags: [docker-compose, nginx, docker]
index_img: /images/index_img/docker.webp
---

## 安装docker-compose

Linux 上我们可以从 Github 上下载它的二进制包来使用，最新发行的版本地址：https://github.com/docker/compose/releases。

运行以下命令以下载 Docker Compose 的当前稳定版本：

```shell
curl -L "https://github.com/docker/compose/releases/download/v2.2.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

Docker Compose 存放在 GitHub，不太稳定。

你可以也通过执行下面的命令，高速安装 Docker Compose:

```shell
curl -L https://get.daocloud.io/docker/compose/releases/download/v2.4.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

将可执行权限应用于二进制文件：

```shell
chmod +x /usr/local/bin/docker-compose
```

创建软链：

```shell
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

测试是否安装成功：

```shell
docker-compose version
```

## 创建项目文件夹

```shell
mkdir /data/blog
```

在`/data` 目录下创建blog文件夹，用于存放nginx项目以及docker-compose配置文件

## 创建docker-compose.yaml 配置文件

```shell
tee docker-compose.yaml <<EOF
```

`tee` 指令是将输入内容写入到文件中

`<<EOF` 文件开头，是 `end of file` 的缩写，加`<<`表示文件开头, 输入内容结尾加  `EOF` 表示文件内容到此结束

上面的命令执行完之后会进入输入模式，输入以下内容即可:
```yaml
version: '3' #指定版本
services:    #服务根节点
  nginx:   #jenkins服务/其他服务（web服务/nginx服务等）
    image: nginx:1.22  #nginx镜像，如果镜像容器没有会去自动拉取
    container_name: nginx       #容器的名称
    restart: always             #跟随docker的启动而启动
    volumes:                    #挂载卷命令
      - ./conf/nginx.conf:/etc/nginx/nginx.conf              #映射配置文件入口文件
      - ./html:/usr/share/nginx/html                         #静态资源根目录挂载
      - ./logs:/var/log/nginx                                #日志文件挂载
      - ./conf.d:/etc/nginx/conf.d #映射配置文件
    ports:
      - 80:80    #宿主主机端口80 映射到 容器端口80
EOF
```

## 创建 nginx 相关的配置文件夹

```shell
mkdir -p ./{conf,logs,html,conf.d}
```

`conf` 文件夹用于存放nginx web服务的基础配置

`logs` 文件夹用于存放日志

`html` 文件夹用于存放web项目打包后的文件

`conf.d` 文件夹用于存放web项目对应的nginx配置文件

## 创建基础配置文件

```shell
tee ./conf/nginx.conf <<'EOF'
```

输入以下内容：

```conf
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```

## 创建项目入口文件

```shell
tee ./html/index.html <<'EOF'
```

输入以下内容:

```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
EOF
```

## 创建`./html/50x.html` 文件

```shell
tee ./html/50x.html <<'EOF'
```

输入以下内容:

```html
<!DOCTYPE html>
<html>
<head>
<title>Error</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>An error occurred.</h1>
<p>Sorry, the page you are looking for is currently unavailable.<br/>
Please try again later.</p>
<p>If you are the system administrator of this resource then you should check
the error log for details.</p>
<p><em>Faithfully yours, nginx.</em></p>
</body>
</html>
EOF
```

## 创建默认项目配置文件

```shell
tee ./conf.d/default.conf <<'EOF'
```

输入以下内容:

```conf
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOF
```

## 启动容器

```shell
docker-compose up -d
```

查看服务是否启动:
```shell
docker ps
```
