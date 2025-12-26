---
title: Java学习记录(11) - SpringBoot
author: stan
date: 2025-12-19 15:51:11
tags: [java, springboot]
index_img: /images/index_img/spring_boot.webp
---

## 前言
`Spring boot` 是在基于 `Spring MVC` 框架的基础上进行封装，简化了 `Spring` 应用的配置过程。它通过自动配置和约定大于配置的原则，减少了开发人员的工作量。
但是想要掌握`Spring boot`, 学习 `Spring MVC` 是必不可少的。能使我们更好地理解 `Spring` 框架的工作原理，同时也能帮助我们更好地配置和管理 `Spring boot` 应用。

## 新建项目
基于`Idea` 我们可以方便快捷的新建一个 `Spring boot` 项目。通过以下步骤进行新建：
1. 打开 `Idea`，点击 `File` -> `New` -> `Project`。
2. 在 `New Project` 对话框中，选择 `Spring Boot`。
3. 填写项目的基本信息，如项目名称、项目路径等。
4. 选择 `Spring Boot` 版本和依赖项。
5. 点击 `Finish` 完成项目的新建。

## 项目结构
新建完成后，项目的目录结构如下：
```
├── HELP.md
├── compose.yaml
├── mvnw
├── mvnw.cmd
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── org
    │   │       └── example
    │   │           └── springbootexample
    │   │               ├── SpringBootExampleApplication.java
    │   │               ├── controller
    │   │               │   └── UserController.java
    │   │               ├── entity
    │   │               │   ├── Result.java
    │   │               │   └── User.java
    │   │               ├── mapper
    │   │               │   └── UserMapper.java
    │   │               └── service
    │   │                   └── UserService.java
    │   └── resources
    │       ├── application.yaml
    │       └── mapper
    │           └── user.xml
    └── test
        └── java
            └── org
                └── example
                    └── springbootexample
                        └── SpringBootExampleApplicationTests.java
```

## 依赖项

```xml

<dependencies>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>4.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-docker-compose</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter-test</artifactId>
            <version>4.0.0</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <scope>annotationProcessor</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <!-- 集成JMS的监控插件，获取服务运行状态的, 仅生产环境可查看到 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <!-- 集成openapi, 可在线查看api文档 -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>3.0.0</version>
        </dependency>
    </dependencies>
```

除了`Spring boot`开发所需的必要依赖项，还添加了`JMS - Actuator`查看运行状态以及`OpenAPI` 在线查看api文档。
可以看到`mybatis-spring-boot-starter` 依赖项，它是`Mybatis` 与 `Spring boot` 集成的依赖项。与普通的`Mybatis` 不同， 它提供了基于`Spring boot` 自动配置的功能，会自动配置项目用到的`Mybatis` 相关的组件，如`SqlSessionFactory`、`MapperScannerConfigurer` 等。其他的`starter` 依赖项，如`spring-boot-starter-webmvc`、`spring-boot-starter-actuator`、`springdoc-openapi-starter-webmvc-ui` 等，都是`Spring boot` 提供的`starter` 依赖项，用于简化`Spring boot` 应用的配置过程。

## 配置文件
```yaml

server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/spring_example?useSSL=false&serverTimezone=UTC
    username: root
    password: 123456
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
mybatis:
  mapper-locations: classpath*:mapper/**/*.xml  ## 配置Mybatis映射器的扫描路径
  type-aliases-package: org.example.springbootexample.entity  ## 配置Mybatis实体类的扫描路径
  configuration: 
    map-underscore-to-camel-case: true  ## 配置Mybatis驼峰命名映射
    cache-enabled: true  ## 配置Mybatis缓存
    use-generated-keys: true  ## 配置Mybatis使用生成的主键
    lazy-loading-enabled: true  ## 配置Mybatis懒加载

```
与之前的`application.properties`不同，`application.yaml` 是基于`YAML` 格式的配置文件，它的语法更加简洁和易读。同时，`YAML` 格式的配置文件还支持注释和多行字符串等特性，使得配置文件的维护更加方便。
同时，这也是`Spring boot`启动的默认配置文件，当项目启动时，`Spring boot` 会自动加载`application.yaml` 配置文件。根据文件内的相关配置，自动创建数据库连接池以及配置`Mybatis` 相关的组件。

## 入口文件
```java
package org.example.springbootexample;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan(basePackages = "org.example.springbootexample.mapper")
public class SpringBootExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootExampleApplication.class, args);
    }

}
```
在项目的根目录下有一个入口文件，该文件就是 `Spring Boot` 应用的入口文件。`@SpringBootApplication` 注解相当于默认的`@Configuration`、`@EnableAutoConfiguration` 和 `@ComponentScan` 注解的组合。
如果要使用到`Mybatis` 相关的组件，需要在入口文件上添加`@MapperScan` 注解，指定`Mybatis` 映射器的扫描路径。

## MyBatis XML 映射器
在`src/main/resources/mapper` 目录下有一个`UserMapper.xml` 文件，它是`Mybatis` 映射器的 XML 配置文件。该文件定义了`UserMapper` 接口的 SQL 映射关系，包括查询、插入、更新、删除等操作。
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.example.springbootexample.mapper.UserMapper">

    <select id="selectAll" resultType="User">
        SELECT * FROM user
    </select>

</mapper>
```
因为在`application.yaml` 配置文件中，已经配置了`Mybatis` 映射器的扫描路径为`classpath*:mapper/**/*.xml`，所以`UserMapper.xml` 文件会被自动扫描到。
以及在`application.yaml` 配置文件中，已经配置了`Mybatis` 实体类的扫描路径为`org.example.springbootexample.entity`，所以`User` 实体类会被自动扫描到。`resultType`指向的`User` 实体类，会自动映射查询结果到`User` 对象中。

## 项目打包
在 `Idea` 中， 在界面右侧选择 `Maven` 项目， 点击 `Lifecycle` 下的 `package` 选项，即可打包项目。
打包完成后，会在项目的`target` 目录下生成一个`jar` 文件，该文件就是可执行的`Spring Boot` 应用。

在终端窗口中运行 `java -jar target/spring-boot-example-0.0.1-SNAPSHOT.jar` 即可启动应用。
