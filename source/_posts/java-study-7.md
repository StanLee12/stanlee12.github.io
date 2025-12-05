---
title: Java学习记录(7) - Servlet与Jsp
author: stan
date: 2025-12-4 11:44:43
tags: [java, servlet, jsp]
index_img: /images/index_img/java.gif
---

## 前言
虽然JSP已经是属于淘汰的java框架了，但学习jsp对于java网络编程以及MVC架构的理解还是有一定的帮助的。

## 依赖

```xml
<groupId>org.example</groupId>
    <artifactId>JspWebExample</artifactId>
    <version>1.0-SNAPSHOT</version>
<packaging>war</packaging>

<dependencies>
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>5.0.0</version>
            <scope>provided</scope>
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
</dependencies>
```
需要添加的依赖主要有 `jakarta.servlet-api`提供了servlet的api, `HikariCP`提供了数据库连接池, `mysql-connector-java`提供了mysql的驱动, `jackson-databind`提供了json的序列化和反序列化。

需要注意的是 `<packaging>war</packaging>` 是必须的, 因为jsp是运行在servlet容器中的, 而servlet容器是war格式的。

以及Servlet项目需要跑在Tomcat容器中, 所以我们还需要下载Tomcat。目前我使用的是java17, 所以我下载的是Tomcat 11.0.14。

下载解压之后需要将Tomcat服务配置在idea中, 具体步骤如下:

点击 `Add Configuration` -> 点击 `+` -> 选择 `Tomcat Server` -> 配置 `Tomcat` 路径。

![1](/images/java/tomcat-01.png)

![2](/images/java/tomcat-02.png)

添加部署项目, 选择 exploded， 表示展开项目目录，方便开发调试。

![3](/images/java/tomcat-03.png)

修改项目启动访问地址，默认的启动地址是包含你的项目名称的，如果需要根据 `/` 根节点访问可以修改:

![4](/images/java/tomcat-04.png)

配置完成之后点击运行即可启动Servlet项目。

## 项目结构
```
JspWebExample
├── src
│   ├── main
│   │   ├── java
│   │   │   ├── com
│   │   │   │   ├── example
│   │   │   │   │   ├── db
│   │   │   │   │   ├── model
│   │   │   │   │   ├── service
│   │   │   │   │   ├── servlet
│   │   │   │   │   ├── Main.java
│   │   ├── resources
│   │   │   ├── db.properties
│   │   │   ├── log4j2.xml
│   │   ├── webapp
│   │   │   ├── index.jsp
```

Jsp需要添加一webapp文件夹, 用来存放jsp文件。Servlet会自动解析该目录下的jsp文件进行渲染。

## 代码
### 数据库连接
数据库连接的代码在 `db` 包中, 主要是使用 `HikariCP` 连接池来连接数据库。
```java
package org.example.db;


import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DataSourceServer {
    private static HikariDataSource dataSource = null;

    public static HikariDataSource getDataSource() {
        if (dataSource == null) {
            HikariConfig config = new HikariConfig();
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setJdbcUrl("jdbc:mysql://localhost:3306/learnjdbc?useSSL=false&characterEncoding=utf8&allowPublicKeyRetrieval=true");
            config.setUsername("root");
            config.setPassword("****************");

            // 配置连接池参数
            config.setMaximumPoolSize(20);           // 最大连接数
            config.setMinimumIdle(10);               // 最小空闲连接数
            config.setConnectionTimeout(30000);      // 获取连接超时时间（30秒）
            config.setIdleTimeout(600000);           // 空闲连接超时时间（10分钟）
            config.setMaxLifetime(1800000);          // 连接最大生命周期（30分钟）

            // MySQL 性能优化配置
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

            dataSource = new HikariDataSource(config);
        }
        return dataSource;
    }
}

```
使用`Hikari`创建一个数据库连接池, 并返回一个`HikariDataSource`对象。避免频繁创建数据库连接, 提高性能。并使用单例模式, 确保只有一个连接池实例。

### 数据库操作
```java
package org.example.service;

import org.example.bean.Student;
import org.example.db.DataSourceServer;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class StudentService {
    public List<Student> listAll() {
        List<Student> list = new ArrayList<>();
        try (Connection connection = DataSourceServer.getDataSource().getConnection()) {
            try (PreparedStatement statement = connection.prepareStatement("SELECT * FROM students")) {
                try (ResultSet resultSet = statement.executeQuery()) {
                    while (resultSet.next()) {
                        Student student = new Student();
                        student.setId(resultSet.getInt("id"));
                        student.setName(resultSet.getString("name"));
                        student.setGender(resultSet.getInt("gender"));
                        student.setGrade(resultSet.getInt("grade"));
                        student.setScore(resultSet.getDouble("score"));
                        list.add(student);
                    }
                    return list;
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Student getByName(String name) {
        Student student = new Student();
        try (Connection connection = DataSourceServer.getDataSource().getConnection()) {
            PreparedStatement ps =  connection.prepareStatement("SELECT * FROM students WHERE name = ? LIMIT 1");
            ps.setString(1, name);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    student.setId(rs.getInt("id"));
                    student.setName(rs.getString("name"));
                    student.setGender(rs.getInt("gender"));
                    student.setGrade(rs.getInt("grade"));
                    student.setScore(rs.getDouble("score"));
                }
                System.out.println(student);
                return student;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}

```

实现两个查询`students`表的方法, 一个是查询所有学生, 一个是根据姓名查询学生。

### 处理查询结果
查询结果的处理在 `service` 包中, 主要是将数据库查询结果转换为 `Student` 对象。
```java
package org.example.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.bean.Student;
import org.example.service.StudentService;

import java.io.IOException;

@WebServlet(urlPatterns = "/SearchStudent")
public class StudentServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");

        String name = req.getParameter("name");

        StudentService studentService = new StudentService();
        Student student = studentService.getByName(name);
        if (student.getId() != 0) {
            ObjectMapper mapper = new ObjectMapper();
            resp.getWriter().write(mapper.writeValueAsString(student));
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"服务器处理请求时发生错误\"}");
        }
    }
}

```

### 渲染Jsp页面 
```html
<%--
  Created by IntelliJ IDEA.
  User: stanlee
  Date: 2025/12/4
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.example.service.StudentService" %>
<%@ page import="org.example.bean.Student" %>`
<%@ page import="java.util.List" %>
<html>
<head>
    <title>
        Hello
    </title>

</head>
<body>
    <h1>你好</h1>
    <table>
        <tr>
            <th>编号</th>
            <th>姓名</th>
            <th>性别</th>
            <th>年级</th>
            <th>分数</th>
        </tr>
        <%
            StudentService ss = new StudentService();
            List<Student> list = ss.listAll();
            for (Student s : list) {
        %>
            <tr>
                <td><%= s.getId()%></td>
                <td><%= s.getName()%></td>
                <td><%= s.getGender()%></td>
                <td><%= s.getGrade()%></td>
                <td><%= s.getScore()%></td>
            </tr>
        <%
            }
        %>
    </table>
    <div>
        <input type="text" id="nameInput" />
        <button id="submitBtn" style="margin-left: 10px;" onclick="search()">搜索</button>
        <div>
            <p id="resultArea"></p>
        </div>
    </div>
</body>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script type="text/javascript">
function search() {
    const name = $("#nameInput").val();
    $.ajax({
        type: "GET",
        url: "SearchStudent?name=" + name,
        dataType: "json",
        success: (res) => {
            const content = `<span>${"${res.name}"}的分数是${"${res.score}"}</span>`
            $("#resultArea").html(content)
        },
        error: (err) => {
            console.log(err)
        }
    })
}
</script>
</html>

```

需要注意的是Jsp中没法正常使用es6的模板字符串, Jsp会将${}解析为El标签,所以需要添加""，
```html
<span>${"${res.name}"}的分数是${"${res.score}"}</span>
```
类似这样.

## 总结
通过重新实现Jsp以及Servlet的远程请求, 对于Java的MVC架构有了更深一步的认识和了解, 也更加熟悉了Java的Web开发流程，了解了其工作运行的原理。