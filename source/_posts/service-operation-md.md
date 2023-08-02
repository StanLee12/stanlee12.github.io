---
title: 服务器操作常用命令
author: stan
date: 2023-08-02 15:52:04
tags:
---

 `ssh -p {port} {name}@{ip_address}` 回车之后输入服务器密码

 安装nginx 可以使用 linux系统自带的yum包管理器

 `find / -name {package_name}` 可以查看包所在位置

 `firewall-cmd —list-ports`  查看所有开放端口

 `firewall-cmd —permanent —zone=public —add-port={port}/tcp` 命令含义：
    	`--zone #作用域`
    	`--add-port=1935/tcp  #添加端口，格式为：端口/通讯协议`
    	`--permanent  #永久生效，没有此参数重启后失效`

 `firewall-cmd —reload` 重启防火墙，添加新的端口后必须需要重启

 netstat 该工具需要通过yum安装，可以查看机器的网络连接状态

 `netstat -anp` 查看所有网络连接 `netstat -lnp` 查看端口连接

 `nginx -s stop` 停止nginx所有服务

 `nginx -s reload` 重新加载nginx服务

 `nginx -c /etc/nginx/nginx.conf`  使用指定配置文件启动nginx

 nginx.conf文件有修改，需要先stop nginx服务，然后重新启动

 `scp -r -P {port} {dir} {name}@{ip_address}:{dir}`  该命令可以将本机上的文件夹上传至服务器

 `ps aux |grep nginx` 该命令查看所有包含有nginx字样的运行服务