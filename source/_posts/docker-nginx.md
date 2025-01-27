---
title: 服务器安装docker以及启用nginx服务
author: stan
date: 2025-01-26 13:15:11
tags: [docker, nginx, centOS]
---

# centOS7 安装docker以及通过docker启用一个nginx服务

## 安装docker

- 本文所有操作基于centOS7系统

### 安装包管理器

服务器上的包管理器使用的是 `dnf`， 用于替换 `yum` 管理器  
可以使用命令 
```shell
yum install dnf
```

检测 `dnf` 是否安装成功 可以执行 
```shell
dnf --version
```

### 设置`dnf`仓库

安装 dnf-plugins-core 包（提供管理 DNF 仓库的命令），并设置仓库。  

```shell
dnf -y install dnf-plugins-core
```

官方镜像,比较慢 

```shell
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

可以执行以下命令换成清华大学的镜像源：清华大学镜像源 

```shell
sed -i 's+https://download.docker.com+https://mirrors.tuna.tsinghua.edu.cn/docker-ce+' /etc/yum.repos.d/docker-ce.repo
```

### 安装docker以及其他依赖
```shell
dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

启动docker 
```shell
systemctl start docker
```

如果希望 Docker 在系统启动时也启动可以使用以下命令：  

```shell
sudo systemctl enable --now docker
```
  
以上命令会配置 Docker 的 systemd 服务，在系统启动时自动启动 Docker。  

检测是否安装并启动成功:

```shell
docker run hello-world
``` 

以上命令会自动从docker-hub下载一个用于测试的镜像，启动成功之后会自动停止。如果第一次没有成功可以再尝试一次

## 卸载docker  
删除安装包：  

```shell
yum remove docker-ce
```

删除镜像、容器、配置文件等内容：  

```shell
rm -rf /var/lib/docker
```

## 修改docker 默认工作目录

查看默认docker工作目录:  

```shell
docker info
```

可以看到docker默认工作目录是 `/var/lib/docker`,因为是系统盘所以不建议在此目录下存储docker相关内容

可以通过docker 配置文件修改

新建`/data/docker-workspace` 文件夹，并将默认docker目录修改为此目录 

通过修改 `/etc/docker/daemon.json`，没有该文件则新建一个, 并在其中添加

```json
{
  "data-root": "/data/docker-workspace"
}
```

然后重启docker:  

```shell
systemctl stop docker.service
```

```shell
systemctl start docker
```

查看是否已修改:    
```shell
docker info
```

## 其他docker常用命令

查看运行中的服务:  

```shell
docker ps -a
``` 
-a 表示查看运行中以及停止中的服务

查看已安装的docker镜像:

```shell
docker images
``` 

搜索docker hub 上已存在的镜像

```shell
docker search [镜像名称]
```

## 安装docker nginx镜像

搜索可用的镜像:

```shell
docker search nginx
```

会看到第一个是官方的镜像源，这里我们就使用官方的就好

```shell
docker pull nginx
```

查看已安装的镜像:

```shell
docker images
```
可以看到nginx镜像已装

## 启动docker nginx 服务

```shell
docker run --name docker-nginx-test -p 8081:80 -d nginx
```

`docker-nginx-test` 指的是启动的服务的名称

`8081` 指的是宿主机的开放端口,也就是本台服务器的开放端口.
> 注意的是，需要先将防火墙关闭,可以通过以下命令查看防火墙状态

```shell
firewall-cmd --state
```

`80` 指的是启动的docker nginx服务对应的端口号, 也就是将启动的nginx镜像的80端口映射到宿主机的8081端口

`-d` 指的是服务启动后在后台一直运行

`nginx`指的是使用已安装镜像中的 nginx镜像

查看是否已启动成功:

```shell
docker ps
```

可以看到 `docker-nginx-test` 已在列表中

## 访问docker-nginx-test容器内部

```shell
docker exec -it docker-nginx-test /bin/bash
```

> 这条命令将会在当前窗口开启一个 `docker-nginx-test` 容器的命令行输入界面，即可以操作该容器

如果我们需要修改容器内的文件，则还需要单独安装vim

```shell
apt-get update
apt-get install vim -y
```

`-y` 指的是该命令执行中的所有操作默认输入 `y`


> 检测vim是否已安V装
```shell
vim --version
```

## 最后

通过访问 `[ip地址或者域名]:[端口号]` 即可访问到部署的nginx默认页面
