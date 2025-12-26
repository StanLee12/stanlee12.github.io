---
title: Java学习记录(6) - 数据库连接
author: stan
date: 2025-11-27 18:04:25
tags: [java, mysql, jdbc]
index_img: /images/index_img/mysql.webp
---

### 依赖
```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.47</version>
    <scope>runtime</scope>
</dependency>
```

`指定mysql的连接器jar包的范围在运行时，因为在编译时不需要使用到mysql的连接器jar包。`

### 示例代码
```java
package org.example;
import java.sql.*;

public class DataBaseConnect {
    public static void main(String[] args) {
        String JDBC_URL = "jdbc:mysql://localhost:3306/learnjdbc?useSSL=false&characterEncoding=utf8&allowPublicKeyRetrieval=true";
        String USER = "username"; // 数据库用户名
        String PASSWORD = "*******"; // 数据库用户密码
        try (Connection connection = DriverManager.getConnection(JDBC_URL, USER, PASSWORD)) {
            try (PreparedStatement preparedStatement = connection.prepareStatement("select id, name, grade from students where gender = ? and grade = ?")) {
                preparedStatement.setObject(1, 1);
                preparedStatement.setObject(2, 2);
                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    while (resultSet.next()) {
                        long id = resultSet.getLong("id");
                        String name = resultSet.getString("name");
                        int grade = resultSet.getInt("grade");
                        System.out.println(id + " " + name + " " + grade);
                    }
                }
            }
            try (PreparedStatement ps2 = connection.prepareStatement("insert into students (name, grade, gender, score) values (?, ?, ?, ?)")) {
                ps2.setObject(1, "Stan");
                ps2.setObject(2, 99);
                ps2.setObject(3, 1);
                ps2.setObject(4, 199);
                ps2.executeUpdate();
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}

```

### 总结
- 数据库连接的URL格式为：`jdbc:mysql://主机名:端口号/数据库名?参数1=值1&参数2=值2&...`
- 连接数据库时需要提供用户名和密码，用户名和密码在数据库中配置。
- 连接数据库后，需要使用`PreparedStatement`对象执行SQL语句，`ResultSet`对象接收查询结果。
- 执行完SQL语句后，需要关闭`PreparedStatement`和`ResultSet`对象，以及`Connection`对象。

`需要特别注意的是，Statement对象也是执行Sql语句的，但是存在sql注入的风险，所以在实际开发中，应该使用PreparedStatement对象来执行Sql语句。PreparedStatement对象可以防止sql注入攻击，因为它会自动对参数进行转义。`
