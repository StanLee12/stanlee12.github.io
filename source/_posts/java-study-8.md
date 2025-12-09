---
title: Java学习记录(8) - Spring之IoC容器
author: stan
date: 2025-12-08 17:19:55
tags: [java, servlet, jsp]
index_img: /images/index_img/java.gif
---

## 前言
IoC（Inversion of Control）容器是一种设计模式，用于管理应用程序的对象生命周期和依赖关系。 通俗易懂的讲就是当一个类内需要依赖其他类时，而不是自己创建或查找这些依赖，而是将这些依赖的创建和查找的责任交给统一的控制中心，在调用时由控制中心负责提供这些依赖。而Spring框架就是一种实现了IoC容器的框架，它通过依赖注入（Dependency Injection）来实现IoC容器的功能。

## 依赖
```xml
<dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId> <!-- Spring 框架-->
            <version>6.0.0</version>
        </dependency>
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>5.0.1</version> <!-- 数据库连接池 -->
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.27</version> <!-- MySQL 驱动 -->
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId> <!-- JSON 处理 -->
            <version>2.16.1</version>
        </dependency>
        <dependency>
            <groupId>jakarta.annotation</groupId>
            <artifactId>jakarta.annotation-api </artifactId> <!-- 注解处理 -->
            <version>2.1.1</version>
        </dependency>
</dependencies>

```

## XML配置

使用xml配置文件的形式实现IoC容器的功能，需要在xml文件中定义bean的配置信息，包括bean的id、class、构造函数参数、属性等。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="userService" class="org.example.service.UserService">
        <constructor-arg ref="dataSource" />
        <property name="mailService" ref="mailService" />
    </bean>
    <bean id="mailService" class="org.example.service.MailService" />
    <bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
        <property name="jdbcUrl" value="jdbc:mysql://localhost:3306/spring_example" />
        <property name="username" value="root" />
        <property name="password" value="stanlee1226" />
        <property name="maximumPoolSize" value="10" />
        <property name="autoCommit" value="true" />
    </bean>
</beans>

```
在Spring中, 需要组装的组件称之为Bean, 所以组装组件就是组装Bean。 而IoC容器就是负责管理这些Bean的生命周期和依赖关系的容器。如上所示，我们定义了3个Bean：userService、mailService、dataSource。其中userService依赖于dataSource和mailService。

`UserService`
```java
package org.example.service;

import org.example.bean.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserService {
    private MailService mailService;

    private DataSource dataSource;

    public void setMailService(MailService mailService) {
        this.mailService = mailService;
    }

    public User constructor(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public User login(String username, String password) {
        try (var conn = this.dataSource.getConnection()) {
            try (PreparedStatement statement = conn.prepareStatement("SELECT * FROM users WHERE username = ? AND password = ?")) {
                statement.setString(1, username);
                statement.setString(2, password);
                try (ResultSet rs = statement.executeQuery()) {
                    if (rs.next()) {
                        int id =  rs.getInt("id");
                        String email = rs.getString("email");
                        String _username = rs.getString("username");
                        String _password = rs.getString("password");
                        User user = new User(id, _username, _password, email);
                        this.mailService.sendLoginMail(user);
                        return user;
                    }
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

```

需要注意的是，绑定Bean的方式有两种：构造函数绑定和属性绑定。
- constructor-arg: 通过构造函数参数绑定Bean的依赖关系。所以我们需要添加一个 UserService 的构造函数, 参数为DataSource.
- property: 通过setter方法绑定Bean的依赖关系。所以我们需要添加一个 setMailService 方法, 参数为MailService.注意, 这里的setter方法名必须与xml配置文件中property的name属性值一致. 如setMailService

通过 `ClassPathXmlApplicationContext` 加载xml配置文件，创建IoC容器，然后通过 `getBean` 方法获取Bean实例。
```java
public class Main {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("application.xml");
        UserService userService = context.getBean(UserService.class);
        User user = userService.login("bob@example.com", "password");
        System.out.println(user.getName());
    }
}
```

## 注解(Annotation)配置
使用注解配置Bean的依赖关系, 可以减少xml配置文件的数量, 使配置更加简洁. 常用的注解有@Component, @Autowired, @Qualifier, @Value等.
我们在需要作为Bean的类上添加@Component注解, 表示将该类作为Bean进行管理. 如UserService类.
```java
@Component
public class UserService {
    @Autowired
    private MailService mailService;
    @Autowired
    private DataSource dataSource;
}

```
其中 `@Autowired` 注解表示自动装配, 即自动注入依赖的Bean. 如mailService和dataSource.`mailService`作为Bean当然也需要加上@Component注解.
但是`dataSource`是一个第三方库提供的类, 我们不能在它的类上添加@Component注解. 所以我们需要为其添加一个`@Bean`注解, 表示将其作为Bean进行管理.
```java
@Bean
public DataSource dataSource() {
    HikariDataSource dataSource = new HikariDataSource();
    dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/spring_example");
    dataSource.setUsername("root");
    dataSource.setPassword("********");
    dataSource.setMaximumPoolSize(10);
    dataSource.setAutoCommit(true);
    return dataSource;
}
```

将这段代码放置在程序入口, 也就是标记为 @ComponentScan 的类上
```java
@ComponentScan
@Configuration
public class AppConfig {
    public static void main(String[] args) {
        ApplicationContext applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);
        UserService userService = applicationContext.getBean(UserService.class);
        User user = userService.login("Stan", "stan12");
        System.out.println(user.getUsername() + ">" + user.getPassword() + ">" + user.getEmail() + ">" + user.getId());
    }
}
```
注解`@Configuration` 表示这是一个IoC配置类，其中被 `@Bean`注解的方法会向 Spring IoC 容器提供 Bean 的定义信息, 使得三方库可以被定位以Bean组件进行调用。
其中`AnnotationConfigApplicationContext` 是一个基于注解的IoC容器, 它可以扫描指定的包, 并将其中标记为@Component的类作为Bean进行管理.
通过运行`@ComponentScan` 类， Spring会自动扫描目录内的Bean组件，并装载至容器内等待被调用.

## 加载配置
首先需要在`resources`目录下创建一个以`properties`结尾的文件
```properties
url=jdbc:mysql://localhost:3306/spring_example
username=root
password=********
```
然后在启动类中使用注解`@PropertySource("db.properties")` 
```java

@Configuration
@ComponentScan
@PropertySource("db.properties")
public class AppConfig {

}
```

使用`@PropertySource`注解加载配置文件, 并将其中的属性绑定到Bean的属性上. 如url, username, password.
```java
@Configuration
@ComponentScan
@PropertySource("db.properties")
public class AppConfig {
    @Value("${url}")
    private String url;
    @Value("${username}")
    private String username;
    @Value("${password}")
    private String password;
}
```
其中`@Value("${url}")` 表示将配置文件中`url`属性的值绑定到`url`属性上. 其他属性同理.

使用`@Value("#{appConfig.url}")` 表示将从`AppConfig`类中获取`url`属性的值. 其他属性同理.

## 总结
- `@ComponentScan` 注解表示扫描指定的包, 并将其中标记为@Component的类作为Bean进行管理.
- `@Configuration` 注解表示这是一个IoC配置类，其中被 `@Bean`注解的方法会向 Spring IoC 容器提供 Bean 的定义信息, 使得三方库可以被定位以Bean组件进行调用。
- `@PropertySource` 注解表示加载配置文件, 并将其中的属性绑定到Bean的属性上.
- `@Value` 注解表示将配置文件中属性的值绑定到Bean的属性上. 可以使用`${}`表示从配置文件中获取属性值, 也可以使用`#{}`表示从Bean中获取属性值.
- `@Autowired` 注解表示自动装配, 即自动注入依赖的Bean. 如mailService和dataSource.`mailService`作为Bean当然也需要加上@Component注解.
- `@Qualifier` 注解表示指定装配的Bean的名称. 如`@Autowired @Qualifier("mailService") private MailService mailService;` 表示装配名称为`mailService`的Bean.
- `@Conditional` 注解表示根据条件来判断是否装配Bean. 如根据是否存在某个类来判断是否装配Bean.
- `@ConditionalOnClass` 注解表示根据是否存在某个类来判断是否装配Bean. 如根据是否存在`DataSource`类来判断是否装配`dataSource` Bean.
- `@ConditionalOnMissingClass` 注解表示根据是否不存在某个类来判断是否装配Bean. 如根据是否不存在`DataSource`类来判断是否装配`dataSource` Bean.
- `@ConditionalOnProperty` 注解表示根据是否存在某个属性来判断是否装配Bean. 如根据是否存在`url`属性来判断是否装配`dataSource` Bean.
- `@ConditionalOnMissingProperty` 注解表示根据是否不存在某个属性来判断是否装配Bean. 如根据是否不存在`url`属性来判断是否装配`dataSource` Bean.
- `@ConditionalOnBean` 注解表示根据是否存在某个Bean来判断是否装配Bean. 如根据是否存在`mailService` Bean来判断是否装配`userService` Bean.
- `@ConditionalOnMissingBean` 注解表示根据是否不存在某个Bean来判断是否装配Bean. 如根据是否不存在`mailService` Bean来判断是否装配`userService` Bean.

以前总以为java的反射和注解是什么复杂的知识，以为很难啃，但是通过学习`Spring IoC`容器, 深刻认识到反射以及注解在java中的使用方式及原理。当清楚了理论基础学习什么都不再是困难的事情了。







