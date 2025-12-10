---
title: Java学习记录(9) - Spring之AOP编程
author: stan
date: 2025-12-10 10:29:45
tags: [java, Spring, AOP]
index_img: /images/index_img/java.gif
---

## 前言
AOP（Aspect-Oriented Programming）是与OOP（Object-Oriented Programming）不同的编程范式。它允许开发者将横切关注点（如日志记录、性能监控、事务管理等）从业务逻辑中分离出来，从而提高代码的可维护性和可重用性。更通俗的讲其实就是动态代理，Spring中使用的是 AspectJ 实现的 AOP。相当于为`@Aspect`注解的类动态生成代理类，生成的代理类会继承于该类，代理类会持有该类需要执行的Aspect实例与该类的实例，通过重写该类的方法获取该类实例获取到的属性值。

## 依赖
```xml
<dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>6.0.0</version>
        </dependency>
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>5.0.1</version> <!-- 请使用最新版本 -->
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.27</version> <!-- MySQL 驱动 -->
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.16.1</version> <!-- 请使用最新稳定版本 -->
        </dependency>
        <dependency>
            <groupId>jakarta.annotation</groupId>
            <artifactId>jakarta.annotation-api </artifactId>
            <version>2.1.1</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aspects</artifactId>
            <version>6.0.0</version>
        </dependency>
    </dependencies>

```

## 装配AOP

`LoggingAspect`
```java

package org.example.utils;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    @Before("execution(public * org.example.service.UserService.*(..))")
    public void doAccessCheck() {
        System.out.println("doAccessCheck !!!");
    }

    @Around("execution(public * org.example.service.MailService.*(..))")
    public Object doLogging(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("doLogging start!!");
        Object result = pjp.proceed();
        System.out.println("doLogging end!!");
        return result;
    }
}

```

通过`@Aspect`注解将`LoggingAspect`类标记为切面类，通过`@Component`注解将`LoggingAspect`类标记为组件类，Spring会自动扫描到该类并将其注册为Bean。
然后在具体方法上添加`@Before`或`@Around`注解，即可将该方法标记为切面方法。符合`execution(public * org.example.service.UserService.*(..))`表达式的方法会在调用前执行`doAccessCheck`方法，符合`execution(public * org.example.service.MailService.*(..))`表达式的方法会在调用前执行`doLogging`方法。

入口类需要添加 `@EnableAspectJAutoProxy` 注解开启 AOP 功能。


## 使用注解装配AOP

`注解类`
```java
package org.example.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MetricTime {
    String value() default "";
}

```

`切面实现类`
```java
package org.example.utils;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.example.annotation.MetricTime;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class MetricAspect {
    // @annotation(xxx)  其中xxx取决于 metric方法中的第二个参数名
    @Around("@annotation(metricTime)")
    public Object metric(ProceedingJoinPoint joinPoint, MetricTime metricTime) throws Throwable {
        String name = metricTime.value();
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long end = System.currentTimeMillis();
            long t = end - start;
            System.out.println(name + "总计用时" + t + "ms");
        }
    }
}
```


`使用注解`
```java
package org.example.service;

import org.example.annotation.MetricTime;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @MetricTime("addUser")
    public void addUser() {
        System.out.println("addUser");
    }
}
```

`metric` 会在执行`addUser`方法前后分别记录时间，并输出`addUser`总计用时xxxms。

## 总结
AOP是一个非常实用且好用的功能，它可以在不改变原有代码的情况下，为应用添加新的功能。基本的原理是通过动态代理，在目标方法执行前后插入切面代码。
但是使用AOP也有一个注意事项，就是如果目标方法是一个final方法，那么就无法使用AOP了。因为final方法是不能被重写的，所以无法在其执行前后插入切面代码。
还有就是通过AOP的学习，更深切认识到java编译时做的相关操作。一个类中定义的属性，会默认在类的构造方法中初始化，并且构造函数会默认调用super()方法。这些都是java编译时做的操作，所以在使用AOP时，需要注意这些细节。
因为AOP的原理是动态生成子类的实现，生成的动态类并不会调用父类的super()以及初始化父类的属性。所以我们要通过重写Get方法通过父类的实例获取对应的属性.
在使用AOP时我们应该通过方法获取属性值，并且需要被代理的类不要使用final方法