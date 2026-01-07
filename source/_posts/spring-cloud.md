---
title: Spring Cloud 学习笔记
author: stan
date: 2026-01-07 12:06:24
tags: [Spring Cloud, Java, 微服务, Nacos]
index_img: /images/index_img/spring_cloud.png
---

## 前言
Spring Cloud 是一个基于 Spring Boot 的微服务框架，它提供了一整套的解决方案，帮助开发者快速构建和部署微服务。国内的阿里巴巴也提供了自己的微服务框架，即 Spring Cloud Alibaba。
所以我们在学习的时候可以使用Spring Cloud Alibaba，它提供了一整套的解决方案，帮助开发者快速构建和部署微服务，包括服务注册与发现、配置中心、负载均衡、断路器等。本章节的主要内容主要是介绍Spring Cloud Alibaba的主要组件，以及如何使用它们来构建和部署微服务。

- Spring-cloud-alibaba：基于 Spring Cloud 的微服务框架，提供了一整套的解决方案，帮助开发者快速构建和部署微服务。
- Nacos：服务注册与发现、配置中心
- Gateway：API 网关，用于路由、过滤、负载均衡等

## 项目结构
```shell
├── cloud-common
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src
│   └── target
├── cloud-gateway
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src
│   └── target
├── order-service
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── src
│   └── target
├── pom.xml
└── user-service
    ├── HELP.md
    ├── mvnw
    ├── mvnw.cmd
    ├── pom.xml
    ├── src
    └── target
```

- cloud-common：公共模块，包含一些公共的类、接口、枚举等
- cloud-gateway：API 网关模块，用于路由、过滤、负载均衡等
- order-service：订单服务模块，用于处理订单相关的业务逻辑
- user-service：用户服务模块，用于处理用户相关的业务逻辑

 其中项目的根目录有一个`pom.xml`文件，它是项目的父工程，用于管理子工程的依赖和插件。相当于是一个项目的总配置文件，进行依赖以及项目配置的总管理。
 文件内容如下：
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.demo</groupId>
    <artifactId>spring-cloud-demo</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <properties>
        <java.version>17</java.version>
        <spring.boot.version>3.4.5</spring.boot.version>
        <spring.cloud.version>2024.0.1</spring.cloud.version>
        <spring.cloud.alibaba.version>2023.0.3.2</spring.cloud.alibaba.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!-- Spring Cloud -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring.cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!-- Spring-cloud-alibaba -->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring.cloud.alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

</project>

 ```

 其中 `packaging` 标签指定了项目的打包方式，这里是 `pom`，表示这是一个父工程，不包含可执行的代码，只是用于管理子工程的依赖和插件。
 其中的 `dependencyManagement` 标签用于管理子工程的依赖，这里指定了 Spring Boot、Spring Cloud、Spring Cloud Alibaba 等依赖的版本，以及它们的打包方式。
 在子模块中使用时，只需要在 `pom.xml` 文件中添加对应的依赖即可，不需要再指定版本号。
 例如，在 `order-service` 模块中使用 Nacos 作为服务注册与发现组件，只需要添加如下依赖即可：
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```
其中`spring-cloud-alibaba-dependencies` 其中已内置了 Nacos 相关的依赖，所以我们只需要添加 `spring-cloud-starter-alibaba-nacos-discovery` 依赖即可。

## 子模块配置
在子模块的 `pom.xml` 文件中，需要添加如下配置：
```xml
<parent>
    <groupId>com.demo</groupId>
    <artifactId>spring-cloud-demo</artifactId>
    <version>1.0.0</version>
    <relativePath />
</parent>
```
其中 `parent` 标签指定了父工程的坐标，这里是 `spring-cloud-demo` 项目的根目录下的 `pom.xml` 文件。
通过添加这个配置，子模块就可以继承父工程的依赖和插件，避免重复配置。
子模块`pom.xml`内容如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.demo</groupId>
        <artifactId>spring-cloud-demo</artifactId>
        <version>1.0.0</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <artifactId>user-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>user-service</name>
    <description>user-service</description>
    <url/>
    <licenses>
        <license/>
    </licenses>
    <developers>
        <developer/>
    </developers>
    <scm>
        <connection/>
        <developerConnection/>
        <tag/>
        <url/>
    </scm>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

其中我们需要使用到spring-boot-starter-web依赖，用于提供RESTful API。
然后就是添加`spring-cloud-starter-alibaba-nacos-discovery`用于服务注册与发现。
同时，我们也需要添加`spring-cloud-starter-alibaba-nacos-config`用于配置中心。可以通过nacos中心进行项目配置的动态获取与更新。

## Nacos
我是基于`Docker`部署的Nacos服务，所以仅需要一行命令即可启动Nacos服务。我是创建的3.0版本的Nacos服务。与以往的版本使用方式不太一致。
1. 拉取镜像:
```shell
docker pull nacos/nacos-server:3.0.1
```

2. 生成密钥(启动Nacos服务时需要):
```shell
openssl rand -base64 32 | tr -d '/+=' | cut -c1-32
echo $TOKEN
```
示例输出：OQCiofvklDg15KV4dJxqzxkL9BITbMYB。

将其进行base64编码
```shell
echo -n "OQCiofvklDg15KV4dJxqzxkL9BITbMYB" | base64 -w 0
```
输出示例：T1FDaW9mdmtsRGcxNUtWNGRIeHF6eGtMOUJJVGJNWUI=。

即可生成我们需要的NACOS_AUTH_TOKEN。

3. 启动Nacos服务:
```shell
docker run --name nacos \
    -e MODE=standalone \
    -e NACOS_AUTH_TOKEN=T1FDaW9mdmtsRGcxNUtWNGRIeHF6eGtMOUJJVGJNWUI= \
    -e NACOS_AUTH_IDENTITY_KEY=nacos \
    -e NACOS_AUTH_IDENTITY_VALUE=nacos \
    -p 8080:8080 \ # 新版本的nacos的控制台地址变成了 127.0.0.1:8080/index.html
    -p 8848:8848 \
    -p 9848:9848 \
    -d nacos/nacos-server:3.0.1
```

注: 启动完成后，即可通过 `http://localhost:8080/index.html` 访问 Nacos 控制台，默认账号密码均为 `nacos`。访问web控制台的端口是`8080`, 服务连接端口是`8848`。

## UserService
### 项目依赖
在`UserService`模块的 `pom.xml` 文件中，需要添加如下依赖：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.demo</groupId>
        <artifactId>spring-cloud-demo</artifactId>
        <version>1.0.0</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <artifactId>user-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>user-service</name>
    <description>user-service</description>
    <url/>
    <licenses>
        <license/>
    </licenses>
    <developers>
        <developer/>
    </developers>
    <scm>
        <connection/>
        <developerConnection/>
        <tag/>
        <url/>
    </scm>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

### 配置文件
在`UserService`模块的 `application.yaml` 文件中，需要添加如下配置：
```yaml
server:
  port: 18080

spring:
  application:
    name: user-service
  profiles:
    active: dev
  config:
    import:
      - optional:classpath:application.yaml
      - optional:nacos:${spring.application.name}.yaml
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: ec9ee84f-9e35-400b-8c31-8ed8cca22316
logging:
  level:
    com.demo.userservice: debug


```
- 其中`server.port`配置了服务的端口号为`18080`。
- `spring.application.name`配置了服务的名称为`user-service`。
- `spring.profiles.active`配置了当前环境为`dev`。
- `spring.config.import`配置了从本地的配置文件`classpath:application.yaml`和远程的`Nacos`服务中心`nacos:${spring.application.name}.yaml`中导入配置。其中有先后顺序，后面的相同配置项会覆盖前面的配置。
- `spring.cloud.nacos.discovery.server-addr`配置了Nacos服务的连接地址为`127.0.0.1:8848`。
- `spring.cloud.nacos.discovery.namespace`配置了Nacos服务的命名空间为`ec9ee84f-9e35-400b-8c31-8ed8cca22316`。需要登录Nacos控制台，在命名空间列表中进行新建命名空间，即可获取到命名空间ID。
- `logging.level.com.demo.userservice`配置了`com.demo.userservice`包的日志级别为`debug`。

### Controller
```java
package com.demo.userservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/hello")
    public String index() {
        return "Hello World";
    }

    @GetMapping("/getUser")
    public String getUser() {
        return "Stan";
    }
}
```

因为是一个示例项目，所以就简单的创建一个`UserController`类，用于提供`/api/users/hello`和`/api/users/getUser`两个接口。通过访问这两个接口，即可验证服务是否正常运行。

- `/api/users/hello`接口返回`Hello World`字符串。
- `/api/users/getUser`接口返回`Stan`字符串。

## 网关
### 项目依赖
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.demo</groupId>
        <artifactId>spring-cloud-demo</artifactId>
        <version>1.0.0</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.demo</groupId>
    <artifactId>cloud-gateway</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>cloud-gateway</name>
    <description>cloud-gateway</description>
    <url/>
    <licenses>
        <license/>
    </licenses>
    <developers>
        <developer/>
    </developers>
    <scm>
        <connection/>
        <developerConnection/>
        <tag/>
        <url/>
    </scm>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <!-- Gateway 网关核心依赖 -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <!-- Nacos 服务发现 -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <!-- 负载均衡 (Spring Cloud 2020 及以后版本需要显式引入) -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

### 配置文件
在`Gateway`模块的 `application.yaml` 文件中，需要添加如下配置：
```yaml
server:
  port: 9090
spring:
  application:
    name: cloud-gateway
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: ec9ee84f-9e35-400b-8c31-8ed8cca22316
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
```

- `server.port`配置了网关的端口号为`9090`。
- `spring.application.name`配置了网关的名称为`cloud-gateway`。
- `spring.cloud.nacos.discovery.server-addr`配置了Nacos服务的连接地址为`localhost:8848`。
- `spring.cloud.nacos.discovery.namespace`配置了Nacos服务的命名空间为`ec9ee84f-9e35-400b-8c31-8ed8cca22316`。
- `spring.cloud.gateway.discovery.locator.enabled`配置了开启网关的服务发现功能。
- `spring.cloud.gateway.discovery.locator.lower-case-service-id`配置了将服务ID转换为小写。
- `routes`配置了网关的路由规则。
  - `id`配置了路由的ID为`user-service`。
  - `uri`配置了路由的目标服务为`lb://user-service`，其中`lb`表示负载均衡。
- `predicates`配置了路由的断言规则。
  - `Path=/api/users/**`配置了路由的路径为`/api/users/**`，表示所有以`/api/users/`开头的请求都将被路由到`user-service`服务。

### 网关说明
网关是微服务架构中的一个重要组件，它负责接收外部请求并将其路由到相应的微服务。网管模块中不应该编写业务逻辑，而应该专注于路由、过滤、负载均衡等功能。

## 总结
通过以上配置，我们成功地创建了一个基于Spring Cloud的微服务架构，包括服务注册与发现、配置中心、API网关等组件。每个微服务模块都有自己的业务逻辑，而网关模块则负责将外部请求路由到相应的微服务。
1. 启动`UserService`模块。
2. 启动`Gateway`模块。

访问`Nacos`控制台, 即可发现服务列表中会有两个服务: `user-service`和`cloud-gateway`。状态为运行时。

通过访问`http://localhost:9090/api/users/hello`，即可返回`Hello World`字符串。这首先是访问到的`cloud-gateway`网关，网关再将请求路由到`user-service`服务。
至此，我们成功地实现了基于Spring Cloud的微服务架构，包括服务注册与发现、配置中心、API网关等组件。
