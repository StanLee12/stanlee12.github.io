---
title: 连接远程服务器上部署的Docker服务
author: stan
date: 2026-10-14 10:50:57
tags: [docker, linux, idea, firewall-cmd]
index_img: /images/index_img/docker.webp
---

## 前言
通常我们需要连接到远程服务器上的`Docker`服务，以管理远程服务器上的容器。并且`Idea`也支持连接远程的`Docker`服务，方便我们通过`Docker`管理和部署应用。
需要注意的是服务器上我们可以还通过开放`2375`端口，来连接远程的`Docker`服务, 但是这个端口是开放式的，没有任何加密可言，黑客通常会利用这个端口来攻击我们的服务器。
所以，在连接远程服务器上的`Docker`服务时，我们应当使用带`TLS`的连接，也就是配置`https`连接，通过证书访问`Docker`服务,确保我们的服务器安全。

## 开放端口
首先我们需要服务器开放`2376`端口，来连接远程的`Docker`服务。
```bash
# 添加端口
firewall-cmd --zone=public --add-port=2376/tcp --permanent
# 重启防火墙
firewall-cmd --reload
# 查看端口
firewall-cmd --list-ports
```
## 创建证书文件
然后是我们需要创建`TLS`证书文件

### 创建证书存放目录
```bash
mkdir -p /etc/docker/tls
cd /etc/docker/tls
```

### 一键生成证书脚本
```bash
# 设置变量
export SERVER_PUBLIC_IP="你的服务器公网IP"

# CA根证书
openssl genrsa -out ca-key.pem 4096
openssl req -new -x509 -days 3650 -key ca-key.pem -sha256 -out ca.pem -subj "/CN=docker-ca"

# 服务端证书
openssl genrsa -out server-key.pem 4096
openssl req -subj "/CN=$SERVER_PUBLIC_IP" -sha256 -new -key server-key.pem -out server.csr
echo subjectAltName = IP:$SERVER_PUBLIC_IP,IP:127.0.0.1 > extfile.cnf
openssl x509 -req -days 3650 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile extfile.cnf

# 客户端证书（本地电脑使用）
openssl genrsa -out key.pem 4096
openssl req -subj '/CN=client' -new -key key.pem -out client.csr
echo extendedKeyUsage = clientAuth > extfile-client.cnf
openssl x509 -req -days 3650 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out cert.pem -extfile extfile-client.cnf

# 权限收紧，必须600，否则docker拒绝启动
chmod 600 ca-key.pem server-key.pem key.pem
chmod 644 ca.pem server-cert.pem cert.pem
```

### 修改 docker daemon.json
```bash
vi /etc/docker/daemon.json
```
`写入配置：`

```json
{
  "hosts": [
    "unix:///var/run/docker.sock",
    "tcp://0.0.0.0:2376"
  ],
  "tls": true,
  "tlsverify": true,
  "tlscacert": "/etc/docker/tls/ca.pem",
  "tlscert": "/etc/docker/tls/server-cert.pem",
  "tlskey": "/etc/docker/tls/server-key.pem",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m"
  }
}

```

## 修改docker.service

`Docker 官方文档明确说明：**systemd 模式下，如果 docker.service 启动命令带 `-H` 参数，daemon.json 不能写 `hosts` 字段，两者冲突，dockerd 直接启动失败**`
`所以我们需要修改 docker.service 启动命令，不带 `-H` 参数`

```bash
vi /etc/systemd/system/docker.service
```

找到`ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock`
将其修改为`ExecStart=/usr/bin/dockerd --containerd=/run/containerd/containerd.sock`

```ini
ExecStart=/usr/bin/dockerd --containerd=/run/containerd/containerd.sock
```

## 重启docker服务
```bash
systemctl restart docker
```
显示`Docker`重启成功就说明服务端配置已完成

## 下载证书
我们需要在本地电脑上下载证书，才能连接远程的`Docker`服务
新建一个文件夹用于存放你的证书文件，并进入该文件夹，将服务端生成的证书`ca.pem,cert.pem,key.pem`下载到本地
```bash
# 下载证书
scp root@你的服务器公网IP:/etc/docker/tls/{ca.pem,cert.pem,key.pem} ./
```

## Idea 连接远程Docker服务
`Idea`左下角点击 `服务` -> `Docker`
点击 `添加` 按钮，填写连接信息,选择`TCP`连接

![示例](/images/remote-docker/remote-docker-1.png)

`TCP`处填写`https://你的服务器公网IP:2376`
`证书文件夹`处选择你存放下载的证书的目录即可,MAC上选择可能有bug，选完文件夹还会让你选这时候点取消即可。
填写完以及证书配置好以后底下显示`连接成功`即表明你已经成功了。
