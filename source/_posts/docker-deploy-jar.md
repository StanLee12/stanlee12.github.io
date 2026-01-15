---
title: 使用Docker Compose部署Java应用
author: stan
date: 2026-01-15 13:59:35
tags: [docker, java, mysql, redis, nginx]
index_img: /images/index_img/docker-java.jpg
---

## MySql
项目依赖于mysql数据库，因此需要先部署mysql容器。

### 创建目录
新建目录以及`yml`文件:
```shell
mkdir -p mysql/{conf,data,logs,init}
touch mysql/docker-compose.yml
```

给予目录操作权限:
```shell
chmod -R 777 mysql
```
### 编写docker-compose.yml文件
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mysql8
    hostname: mysql8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: {your_password}
      MYSQL_ROOT_HOST: "%"
      MYSQL_INITDB_CHARSET: utf8mb4
      MYSQL_INITDB_COLLATION: utf8mb4_unicode_ci
      TZ: Asia/Shanghai
      MYSQL_INITDB_SKIP_TZINFO: 1
    volumes:
      - ./data:/var/lib/mysql
      - ./conf:/etc/mysql/conf.d
      - ./logs:/var/log/mysql
      - ./init:/docker-entrypoint-initdb.d
    command:
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --lower_case_table_names=1
      --max_allowed_packet=128M
      --default-time_zone='+8:00'
      --sql_mode=STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
    networks:
      - mysql-network

networks:
  mysql-network:
    driver: bridge
```

- 其中`init`文件下存放需要mysql启动时执行的`sql`文件，也就是导入数据库

### 启动mysql容器
在`docker-compose.yml`文件所在目录执行以下命令:
```shell
docker-compose up -d
```

### 测试mysql连接
```shell
docker-compose exec mysql -uroot -p{your_password}
```
如果连接成功，会显示以下信息:
```shell
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.33 MySQL Community Server - GPL

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

## Redis
项目依赖于redis数据库，因此需要先部署redis容器。

### 创建目录
新建目录以及`yml`文件:
```shell
mkdir -p redis/{conf,data,logs}
touch redis/docker-compose.yml
```
给予目录操作权限:
```shell
chmod -R 777 redis
```
### 编写docker-compose.yml文件
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: redis-server
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - ./data:/data
      - ./logs:/var/log/redis
      - ./conf/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - redis-network

networks:
  redis-network:
    driver: bridge
```

### Redis配置文件
redis启动还需要一个`redis.conf`文件, 在`conf`目录下新建文件:
```shell
touch redis/redis.conf
```
编写redis.conf文件:

```conf
bind 0.0.0.0
# 端口
port 6379
# 密码认证
requirepass {your_password}
# 持久化
save 900 1
save 300 10
save 60 10000

# 数据目录
dir /data

# 最大内存
maxmemory 256mb
maxmemory-policy allkeys-lru

# 启用AOF持久化
appendonly yes
appendfilename "appendonly.aof"
```
### 启动redis容器
在`docker-compose.yml`文件所在目录执行以下命令:
```shell
docker-compose up -d
```

### 测试redis连接
```shell
docker-compose exec redis redis-cli -a {your_password}
```
如果连接成功，会显示以下信息:
```shell
127.0.0.1:6379> ping
PONG
```

## 打包
打包前我们需要新增一个`application-docker.yml`文件，用于配置docker环境下的数据库连接信息。
```yaml
# 服务配置
server:
  port: 18084

# 框架配置
spring:
  mvc:
    static-path-pattern: /api/static/**
    throw-exception-if-no-handler-found: true
    pathmatch:
      matching-strategy: ant_path_matcher
  # 数据源配置
  datasource:
    url: jdbc:mysql://mysql8:3306/like_admin?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&useSSL=false
    type: com.zaxxer.hikari.HikariDataSource # 数据源类型
    driver-class-name: com.mysql.jdbc.Driver # MySql的驱动
    username: root # 数据库账号
    password: {your_password} # 数据库密码
    hikari:
      connection-timeout: 30000     # 等待连接分配连接的最大时长(毫秒),超出时长还没可用连接则发送SQLException,默认30秒
      minimum-idle: 5               # 最小连接数
      maximum-pool-size: 20         # 最大连接数
      auto-commit: true             # 自动提交
      idle-timeout: 600000          # 连接超时的最大时长(毫秒),超时则被释放(retired),默认10分钟
      pool-name: DateSourceHikariCP # 连接池名称
      max-lifetime: 1800000         # 连接的生命时长(毫秒),超时而且没被使用则被释放,默认30分钟(1800000ms)
      connection-init-sql: SELECT 1 # 连接时发起SQL测试脚本
  # 限制配置
  servlet:
    multipart:
      max-file-size: 100MB    # 文件上传大小限制
      max-request-size: 100MB # 文件最大请求限制
      enabled: true
  # Redis配置
  redis:
    host: redis-server   # Redis服务地址
    port: 6379        # Redis端口
    password: {your_password} # Redis密码
    database: 0       # 数据库索引
    timeout: 5000     # 连接超时
    lettuce:
      pool:
        max-wait: 30000 # 连接池最大阻塞等待时间(使用负数表示没有限制,默认-1)
        max-active: 100 # 连接池最大连接数(使用负数表示没有限制,默认8)
        max-idle: 20    # 连接池中的最大空闲连接(默认8)
        min-idle: 0     # 连接池中的最小空闲连接(默认0)

# Mybatis-plus配置
mybatis-plus:
  mapper-locations: classpath*:/mapper/**Mapper.xml
  typeAliasesPackage: com.mdd.**.mapper
  global-config:
    banner: false
    db-config:
      table-prefix: la_
  configuration-properties:
    prefix: la_

```

`2.0`版本以上的`spring-boot` 通过`application-docker.yml`找到对应`active`的配置文件。不需要再文件中再指定`spring.profiles.active=docker`。

### 上传jar
将打包好的jar文件上传到服务器上:
```shell
scp {your_project_version}.jar root@{your_ip}:{path/to/your/file}
```
### Dockerfile
在`jar`包同级目录下新建`Dockerfile`文件:
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY {your_project_version}.jar app.jar
EXPOSE 18084
ENTRYPOINT ["java", "-jar", "app.jar"]
```
其中`ENTRYPOINT`没有指定运行的环境变量，是因为在`docker-compose.yml` 文件中进行了指定。`spring-boot`会优先使用系统环境变量。

### docker-compose.yml
在`jar`包同级目录下新建`docker-compose.yml`文件:
```yaml
version: '3.8'

services:
  java-app:
    build:
      context: .
      dockerfile: Dockerfile
    image: {your_project_name}-java-app:1.0
    container_name: {your_project_name}_java_app
    ports:
      - "18084:18084"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql8:3306/like_admin?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: {your_password}
      SPRING_REDIS_HOST: redis-server
      SPRING_REDIS_PORT: 6379
      SPRING_REDIS_PASSWORD: {your_password}
      SPRING_PROFILES_ACTIVE: docker
      SERVER_PORT: 18084
    networks:
      - mysql_mysql-network
      - redis_redis-network
    restart: always

networks:
  mysql_mysql-network:
    external: true # 表明使用已存在的网络，不新建
  redis_redis-network:
    external: true
```
- `build` 表明该服务需要根据`Dockerfile`进行构建。
- `environment` 表明该服务需要的环境变量。`spring-boot`会根据环境变量进行配置，`SPRING_DATASOURCE_URL`对应了`application-docker.yml`中的`spring.datasource.url`。其他配置同理。`spring-boot`会优先使用环境变量。
- `networks` 表明该服务需要连接的网络。`mysql_mysql-network`和`redis_redis-network`是已存在的网络，与之对应的是之前创建的`mysql`和`redis`容器。设置了对应的网络，才使得该容器可以通过`mysql8`和`redis-server`这两个容器的主机名进行通信。
   获取已存在的网络名称:
   ```shell
   docker network ls
   ```
   可以看到`mysql_mysql-network`和`redis_redis-network`这两个网络。与在`docker-compose.yml`中指定的网络有些许不同，以从`docker network ls`中获取的`NAME`为准。

### 启动服务
在`jar`包同级目录下执行:
```shell
docker-compose up -d
```
- `up` 表明启动服务。
- `-d` 表明在后台运行。

## Nginx
### 配置反向代理
找到`nginx`的配置文件:
```shell
nginx -t
```
进入到配置目录，新建`api.conf`文件:
```nginx
server {
    if ($host = api.stanlee.top) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name api.stanlee.top;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
	proxy_pass http://127.0.0.1:18084;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
   	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	root   /usr/share/nginx/html;
	index index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}

server {
    listen 443 ssl;
    server_name api.stanlee.top;
    ssl_certificate /etc/letsencrypt/live/api.stanlee.top/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.stanlee.top/privkey.pem; # managed by Certbot

    ssl_protocols TLSv1.2 TLSv1.3;  # 支持的协议版本
    ssl_ciphers HIGH:!aNULL:!MD5;  # 加密套件
    ssl_prefer_server_ciphers on;  # 优先使用服务器的加密套件

    location / {
        proxy_pass http://127.0.0.1:18084;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

}
```

### Certbot生成对应的证书
在终端执行:
```shell
certbot --nginx -d api.stanlee.top
```
- `--nginx` 表明使用`nginx`插件。
- `-d api.stanlee.top` 表明申请的域名是`api.stanlee.top`。

证书生成之后，需要重启`nginx`服务:
```shell
nginx -s reload
```

### 测试
在浏览器中访问`https://api.stanlee.top`，如果能正常访问，说明配置成功。

## 总结
使用`docker-compose`我们可以便捷的部署`MySql`、`Redis`、`Nginx`、`Java`服务。如果需要迁移到其他服务器，只需要将`docker-compose.yml`和`Dockerfile`文件复制到目标服务器上，执行`docker-compose up -d`即可。











