---
title: Java学习记录(10) - SpringMVC(实现api接口请求)
author: stan
date: 2025-12-18 13:39:48
tags: [java, Spring, MVC, Servlet]
index_img: /images/index_img/java.gif
---

## 前言
- 通过学习`Spring` 以及 `Servlet` 相关知识, 我们已经可以进行开发 `api` 接口了。通过`Spring`实现`IoC` 以及 `AOP` 可以帮助我们更好的管理`Bean`以及创建实例、连接数据库等操作。
- 通过`HikariCP` 可以更方便的管理数据库连接池, 避免了手动创建连接池的繁琐过程。
- 通过`MyBatis` 可以更轻易的实现数据库的增删改查操作, 我们只需要定义好`Mapper` 接口, 并在`xml` 文件中实现对应的`sql` 语句即可。
- 通过`lombok` 可以减少我们的代码量, 避免了手动编写`getter` 、 `setter` 等方法， 通过注解的形式可以自动生成相应的方法。
- 通过 `jackson-databind` 可以更方便的实现`json` 与 `java` 对象的转换, 我们只需要在`Controller` 中添加`@RequestBody` 注解即可将`json` 字符串转换为`java` 对象。


## 项目结构
```sh
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── org
    │   │       └── example
    │   │           ├── AppConfig.java
    │   │           ├── entity
    │   │           │   └── User.java
    │   │           ├── mapper
    │   │           │   └── UserMapper.java
    │   │           ├── service
    │   │           │   └── UserService.java
    │   │           ├── util
    │   │           │   └── Result.java
    │   │           └── controller
    │   │               ├── TestController.java
    │   │               └── UserController.java
    │   ├── resources
    │   │   ├── jdbc.properties
    │   │   └── logback.xml
    │   └── webapp
    │       ├── WEB-INF
    │       │   ├── templates
    │       │   └── web.xml
    │       └── static
    ├── mian
    │   └── webapp
    │       └── WEB-INF
    └── test
        └── java

```

## 项目依赖
```xml
<dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>6.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>6.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>6.0.0</version>
        </dependency>
        <!-- aop 相关依赖 -->
        <dependency>
            <groupId>jakarta.annotation</groupId>
            <artifactId>jakarta.annotation-api</artifactId>
            <version>2.1.1</version>
        </dependency>
        <!-- 日志系统 -->
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-core</artifactId>
            <version>1.4.4</version>
        </dependency>
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.4.4</version>
        </dependency>
        <!-- 数据库连接池 -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>5.0.1</version>
        </dependency>
        <!-- 数据库驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.27</version> <!-- MySQL 驱动 -->
        </dependency>
        <!-- lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version> <!-- 建议使用最新稳定版本 -->
            <scope>provided</scope>
        </dependency>
        <!-- MyBatis -->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.11</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>3.0.0</version>
        </dependency>
        <!-- jackson-databind -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.14.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aspects</artifactId>
            <version>6.0.0</version>
        </dependency>
    </dependencies>
```

## 项目配置
`web-xml` 配置文件
```xml
<?xml version="1.0"?>
<web-app>
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextClass</param-name>
            <param-value>org.springframework.web.context.support.AnnotationConfigWebApplicationContext</param-value>
        </init-param>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>org.example.AppConfig</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>

```

该配置文件的作用是将`Spring`的`AnnotationConfigWebApplicationContext`与`DispatcherServlet`关联起来，
并指定`AppConfig`类作为配置类。也就是在`Servlet`初始化时实现`Spring`的`ApplicationContext`的初始化。

`jdbc.properties` 配置文件
```properties
jdbc.driverClassName=com.mysql.cj.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=UTC
jdbc.username=root
jdbc.password=123456
```
数据库的连接配置

`logback.xml` 配置文件
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT"
              class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n</Pattern>
        </layout>
    </appender>

    <logger name="org.example" level="info" additivity="false">
        <appender-ref ref="STDOUT" />
    </logger>

    <root level="info">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```
日志配置

## IDEA配置

如果项目不是基于`JavaEE`项目创建的，则需要手动配置项目结构。在`IDEA`中，点击`File` -> `Project Structure`，选择`Facet`与`Artifact(工件)`。

![Facet](/images/java/spring-mvc-01.png)

![Artifact](/images/java/spring-mvc-02.png)

配置好了以后，才可以配置`Tomcat`服务器进行启动。

## AppConfig Spring 配置类
```java
package org.example;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import javax.sql.DataSource;

@ComponentScan
@Configuration
@PropertySource("classpath:/jdbc.properties")
@EnableAspectJAutoProxy
@EnableWebMvc
@EnableTransactionManagement
@MapperScan("org.example.mapper")
public class AppConfig {
    private static final Logger log = LoggerFactory.getLogger(AppConfig.class);

    @Value("${jdbc.url}")
    private String url;

    @Value("${jdbc.username}")
    private String username;

    @Value("${jdbc.password}")
    private String password;

    @Bean
    public DataSource getDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setMaximumPoolSize(5);
        return new HikariDataSource(config);
    }

    @Bean
    public PlatformTransactionManager getTransactionManager(@Autowired DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    @Bean
    public SqlSessionFactoryBean getSqlSessionFactoryBean(@Autowired DataSource dataSource) {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dataSource);
        return sqlSessionFactoryBean;
    }
}
```
该类主要作用是配置注解,开启`Spring`的`AOP`功能,开启`事务管理`功能,开启`MyBatis`的`Mapper`扫描功能， 以及开启`WebMvc`的配置。
以及创建数据库连接池`HikariDataSource`， 创建事务管理器`DataSourceTransactionManager`， 以及创建`MyBatis`的`SqlSessionFactoryBean`。

## 数据返回工具类
```java
package org.example.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {
    private Integer code;
    private String message;
    private T data;

    // 成功响应方法
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    public static <T> Result<T> success() {
        return success(null);
    }

    // 失败响应方法
    public static <T> Result<T> fail(Integer code, String message) {
        return new Result<>(code, message, null);
    }
}

```
该类的作用是封装数据返回结果，包括状态码、消息和数据。

## 实体类
```java
package org.example.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class User {
    private Long id;
    private String username;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String email;
}
```
该类的作用是定义用户实体类，包括用户ID、用户名、密码和邮箱。使用了`Lombok`的`@Data`注解，自动生成了`getter`、`setter`、`toString`、`equals`和`hashCode`方法。
以及`@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`注解，用于在序列化时忽略`password`字段。表明该字段在序列化时只可写入不可读取。

## Mapper接口
```java
package org.example.mapper;

import org.apache.ibatis.annotations.*;
import org.example.entity.User;

import java.util.List;

public interface UserMapper {
    @Select("SELECT * from users WHERE id = #{id}")
    User getUserById(@Param("id") long id);

    @Select("SELECT * from users WHERE username = #{username} and password = #{password}")
    User getUserByUsernameAndPassword(@Param("username") String username, @Param("password") String password);

    @Update("UPDATE users SET username = #{user.username} WHERE id = #{user.id}")
    int updateUser(@Param("user") User user);

    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    @Insert("INSERT INTO users (email, username, password) VALUES(#{user.email}, #{user.username}, #{user.password})")
    int insertUser(@Param("user") User user);

    @Select("SELECT * from users")
    List<User> getUsers();
}
```
该接口的作用是定义用户的数据库操作方法，包括根据ID查询用户、根据用户名和密码查询用户、更新用户、插入用户和查询所有用户。
使用了`MyBatis`的注解，包括`@Select`、`@Update`、`@Insert`和`@Options`。

## 服务层
```java
package org.example.service;

import org.example.entity.User;
import org.example.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public User signIn(String username, String password) {
        User user = userMapper.getUserByUsernameAndPassword(username, password);
        if (user == null) {
            throw new RuntimeException("账号不存在");
        }
        return user;
    }

    public User register(User user) {
        User user1 = userMapper.getUserByUsernameAndPassword(user.getUsername(), user.getPassword());
        if (user1 != null) {
            throw new RuntimeException("账号已存在");
        }
        int result = userMapper.insertUser(user);
        if (result < 0) {
            throw new RuntimeException("注册失败");
        }
        return user;
    }

    public User updateUsername(User user) {
        int result = userMapper.updateUser(user);
        if (result < 0) {
            throw new RuntimeException("修改用户名失败");
        }
        return user;
    }

    public List<User> listUser() {
        return userMapper.getUsers();
    }
}
```
该类的作用是定义用户的服务层方法，包括登录、注册、修改用户名和查询所有用户。
使用了`Spring`的`@Service`注解，表明该类是一个服务层组件。
以及`@Transactional`注解，开启了事务管理。

## 控制层
```java
package org.example.controller;

import org.example.entity.User;
import org.example.service.UserService;
import org.example.util.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public Result<List<User>> getUsers() {
        List<User> users = userService.listUser();
        return Result.success(users);
    }

    @PostMapping("/signin")
    public Result<User> signin(@RequestBody RequestSignIn request) {
        try {
            User user = userService.signIn(request.username, request.password);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.fail(500, "登录失败");
        }
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody RequestSignUp request) {
        try {
            User user1 = new User();
            user1.setUsername(request.username);
            user1.setPassword(request.password);
            user1.setEmail(request.email);
            User user = userService.register(user1);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.fail(500, "注册失败");
        }
    }

    public static class RequestSignIn {
        public String username;
        public String password;
    }

    public static class RequestSignUp {
        public String username;
        public String password;
        public String email;
    }
}

```
该类的作用是定义用户的控制层方法，包括查询所有用户、登录和注册。
使用了`Spring`的`@RestController`注解，表明该类是一个`RESTful`控制器。
以及`@RequestMapping`注解，指定了该控制器的基础路径为`/api`。

## 总结
至此，我们即可使用`SpringMVC`框架来构建一个简单的用户管理系统，  当启动服务之后，我们可以通过`POST`请求`/api/register`来注册一个新用户，通过`POST`请求`/api/signin`来登录该用户，通过`GET`请求`/api/users`来查询所有用户。
还有需要注意的一个点是, 在`Spring`项目中连接数据库时, `url`可以是`jdbc:mysql://localhost:3306/spring_example`这种不带任何参数的地址，`Spring`在编译时会自动的添加上数据库连接所需要的一些额外参数,但是在`Servlet`中, 必须使用完整的`url`路径，比如`jdbc:mysql://localhost:3306/spring_example?useSSL=false&characterEncoding=utf8&allowPublicKeyRetrieval=true`, 需要设定`useSSl`等参数，因为`Servlet`不会帮你添加上这些，会导致数据库无法正确连接。
