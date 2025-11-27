---
title: Java学习记录(4) - 邮件发送以及查看
author: stan
date: 2025-11-25 18:04:25
tags: [java, 邮件]
index_img: /images/index_img/java.gif
---

### 依赖
```xml
<dependency>
    <groupId>jakarta.mail</groupId>
    <artifactId>jakarta.mail-api</artifactId>
    <version>2.0.1</version>
</dependency>

<dependency>
    <groupId>com.sun.mail</groupId>
    <artifactId>jakarta.mail</artifactId>
    <version>2.0.1</version>
</dependency>

```
`通过添加这两个Maven依赖，就可以在Java项目中使用Jakarta Mail API来发送和接收邮件了。`


### 发送邮件
```java
package org.example;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

public class MailSender {
    public static void main(String[] args) {
        String smtp = "smtp.qq.com";
        String username = "542762411@qq.com";
        String password = "***************"; // 在qq邮箱安全设置处获取到的授权码
        Properties props = new Properties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.host", smtp);
        props.put("mail.smtp.port", 465);
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2"); // 指定SSL版本
        props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        Session session = Session.getInstance(props, new Authenticator() {
           protected PasswordAuthentication getPasswordAuthentication() {
               return new PasswordAuthentication(username, password);
           }
        });
        session.setDebug(true);
        MimeMessage message = new MimeMessage(session);
        try {
            message.setFrom(new InternetAddress(username));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("stanlee1226@gmail.com"));
            message.setSubject("Hello，this is stan‘s qq");
            message.setText("我是Stan lee的qq", "UTF-8");
            Transport.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}

```

### 查看邮箱
```java
package org.example;

import com.sun.mail.pop3.POP3SSLStore;
import jakarta.mail.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;

public class MailReader {
    private static final Logger log = LoggerFactory.getLogger(MailReader.class);

    public static void main(String[] args) {
        String host = "imap.qq.com";
        int port = 993;
        String username = "542762411@qq.com";
        String password = "***************"; // 在qq邮箱安全设置处获取到的授权码

        Properties props = new Properties();
        props.setProperty("mail.store.protocol", "imap"); // 使用IMAP协议
        props.setProperty("mail.imap.host", host); // QQ邮箱IMAP服务器地址
        props.setProperty("mail.imap.port", port + ""); // SSL端口
        props.setProperty("mail.imap.ssl.enable", "true"); // 启用SSL加密
        props.setProperty("mail.imap.socketFactory.class", "javax.net.ssl.SSLSocketFactory"); // SSL Socket工厂类

        Session session = Session.getInstance(props, null);
        session.setDebug(true);

        try (Store store = session.getStore("imap")) {
            store.connect("imap.qq.com", username, password);
            Folder folder = store.getFolder("INBOX");
            folder.open(Folder.READ_WRITE);

            log.info("Inbox opened:" + folder.getFullName());
            log.info("Inbox size: " + folder.getMessageCount());
            log.info("Unread:" + folder.getUnreadMessageCount());
            log.info("新邮件:" + folder.getNewMessageCount());
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}

```
