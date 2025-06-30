---
title: Let's Encrypt Certbot 自动申请免费 SSL 证书，并自动续费
author: stan
date: 2025-06-30 10:08:17
tags: [ssl, certbot, https, centOS7]
index_img: images/index_img/certbot.webp
---

## 1. 环境以及版本

| 配置 | -版本- |
| --- | --- |
| CentOS | 7.9.2009 |
| certbot | 4.1.1 |
| nginx | 1.26.1 |
| python | 2.7.5 |

## 2. 安装snap

Let's Encrypt 官方推荐的是使用snap进行安装，所以我们需要先安装snap

### 2.1 先安装 `EPEL`

```bash
yum install -y epel-release
```

### 2.2 安装snap

```bash
yum install snapd
```

### 2.3 启动snap服务

```bash
systemctl enable --now snapd.socket
ln -s /var/lib/snapd/snap /snap
```

### 2.4 安装certbot snap包

```bash
snap install core; snap refresh core
snap install --classic certbot
```
### 2.5 软链接certbot命令

设置`certbot`命令软连接，确保`certbot`命令能够执行
```bash
ln -s /snap/bin/certbot /usr/bin/certbot
```

## 3. 申请证书

certbot的自动化非常方便，只需要一行命令即可完成证书的申请和续签，非常的方便。
我们这里只考虑使用`nginx`作为web代理的情况

```bash
certbot --nginx
```

执行上述命令之后，会提示输入邮箱，邮箱用于接收证书过期的通知。
然后`certbot`会自动扫描你的`nginx`配置文件，找到所有的`server`配置块，然后判断是否有`listen 80`或者`listen 443`的配置，如果有，就会自动申请证书。
同时，还会自动配置`nginx`的`ssl`证书，重启`nginx`服务即可生效。

等配置完成之后，可以打开`nginx`的配置文件查看`server`配置块内被certbot修改的内容,即已配置好`ssl`

`注意事项: 最开始我是使用的移动云服务器，certbot的自动化配置一直失败，卡在了请求本地部署的web服务的域名时一直超时，然后我在服务器上ping了一下本地部署的服务域名，发现并不能ping通，而通过其他的外部服务器是可以访问的`
`查询了下移动云的服务器因为一些默认配置导致本机是无法访问自己的你公网ip的，需要在云服务器控制台进行配置修改`
`之后我在自己的另外一台服务器上重试，是完全可行的，一套命令下来畅通无阻，顺利完成https配置`

## 4. 自动续签

`certbot`默认有效期是三个月, 如果你想要啥它能自动续签，可以用到`linux`上的一个定时服务

### 4.1 设置定时任务

在`crontab`中添加定时任务，每天凌晨2点执行一次`certbot`的续签命令

执行`crontab`的编辑命令
```bash
crontab -e
```

在打开的编辑器中添加定时任务, 如下:
```bash
0 2 * * * certbot renew --quiet --nginx
```

这段代码的意思是 每天凌晨2点执行一次`certbot renew`命令, 对`nginx`的配置进行续签, `--quiet`参数表示静默模式, 不会有任何输出, `--nginx`参数表示对`nginx`的配置进行操作
