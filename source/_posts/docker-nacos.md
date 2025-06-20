---
title: Docker 部署 3.0.1 版本的nacos，并使用mysql作为数据库
author: stan
date: 2025-06-20 13:47:37
tags: [nacos, mysql, docker]
index_img: /images/index_img/nacos.png
---

本文讲一下如何在docker中部署3.0.1版本的nacos，并使用mysql作为数据库。mysql是运行在主机中的，而nacos是运行在docker中的。所有操作均基于Mac OS。

## 下载nacos
首先是拉取nocos的Docker镜像，运行 
```shell
docker pull nacos/nacos-server:3.0.1
```

## 启动nacos
nacos 2.x 以上版本需要配置`NACOS_AUTH_TOKEN`，可以使用下面的命令生成`NACOS_AUTH_TOKEN`：
​​生成原始密钥​​（32+ 字符的随机字符串）：
```shell
openssl rand -base64 32 | tr -d '/+=' | cut -c1-32
echo $TOKEN
```
示例输出：OQCiofvklDg15KV4dJxqzxkL9BITbMYB。

​​Base64 编码：
```shell
echo -n "OQCiofvklDg15KV4dJxqzxkL9BITbMYB" | base64 -w 0
```
输出示例：T1FDaW9mdmtsRGcxNUtWNGRIeHF6eGtMOUJJVGJNWUI=。

即可生成我们需要的`NACOS_AUTH_TOKEN`。

因为我们需要获取nacos的mysql脚本，所以我们需要先启动一个nacos的容器，然后从容器中获取脚本。
```shell
docker run --name nacos \
    -e MODE=standalone \
    -e NACOS_AUTH_TOKEN=T1FDaW9mdmtsRGcxNUtWNGRIeHF6eGtMOUJJVGJNWUI= \
    -e NACOS_AUTH_IDENTITY_KEY=nacos \
    -e NACOS_AUTH_IDENTITY_VALUE=nacos \
    -p 8080:8080 \ # 新版本的nacos的控制台地址变成了 127.0.0.1:8080/index.html
    -p 8848:8848 \
    -p 9848:9848 \
    -d nacos/nacos-server:latest
```

## 从nacos容器中获取mysql脚本
```shell
docker cp nacos:/home/nacos/conf/mysql-schema.sql .
```

## 创建nacos数据库
```shell
mysql -h 127.0.0.1 -P 3306 -u root -p
```
输入密码后，回车。
```mysql
CREATE DATABASE IF NOT EXISTS `nacos_test` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
```

## 导入mysql脚本
```shell
mysql -h 127.0.0.1 -P 3306 -u root -p nacos_test < mysql-schema.sql
```
然后将之前启动的nacos docker服务停止并删除
```shell
docker stop nacos
docker rm nacos
```

## 重新启动nacos 并添加mysql参数
修改docker启动命令
```shell
docker run -d \
  --name nacos \
  -p 8080:8080 \
  -p 8848:8848 \
  -p 9848:9848 \
  -e MODE=standalone \
  -e NACOS_AUTH_ENABLE=true \
  -e NACOS_AUTH_TOKEN=T1FDaW9mdmtsRGcxNUtWNGRIeHF6eGtMOUJJVGJNWUI= \
  -e NACOS_AUTH_IDENTITY_KEY=nacos \
  -e NACOS_AUTH_IDENTITY_VALUE=nacos \
-e SPRING_DATASOURCE_PLATFORM=mysql \
-e MYSQL_SERVICE_HOST=host.docker.internal \ # host.docker.internal表示主机的ip地址, 不用修改
-e MYSQL_SERVICE_PORT=3306 \
-e MYSQL_SERVICE_DB_NAME=nacos_test \
-e MYSQL_SERVICE_USER=root \
-e MYSQL_SERVICE_PASSWORD=${MYSQL_PASSWORD} \
-e MYSQL_SERVICE_DB_PARAM="useSSL=false&allowPublicKeyRetrieval=true" \ # 连接mysql的参数，8.0以上不能通过密码直连，所以需要追加参数取消限制
  nacos/nacos-server:latest
```
启动成功之后访问 `127.0.0.1:8080/index.html` 即可访问nacos

参考：
- [Nacos 3.0.1 版本安装部署](https://nacos.io/en/docs/latest/quickstart/quick-start-docker/)
