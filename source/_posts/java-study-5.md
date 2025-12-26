---
title: Java学习记录(5) -  Http编程
author: stan
date: 2025-11-26 18:04:25
tags: [java, http]
index_img: /images/index_img/java_http.webp
---

### 通过学习Http编程，更清晰的了解Java实现网络通信的底层逻辑与实现。

### Server端

```java
package org.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

public class ServerCase {
    private static final Logger log = LoggerFactory.getLogger(ServerCase.class);
    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(6666)) {
            log.info("服务已启动");
            for (;;) {
                Socket socket = serverSocket.accept();
                log.info("connect from ="+socket.getRemoteSocketAddress());
                Thread thread = new Handler(socket);
                thread.start();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }
}

class Handler extends Thread {
    private static final Logger log = LoggerFactory.getLogger(Handler.class);

    private Socket socket;
    public Handler(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try (InputStream inputStream = this.socket.getInputStream()) {
            try (OutputStream outputStream = this.socket.getOutputStream()) {
                handle(inputStream, outputStream);
            }
        } catch (IOException e) {
            try {
                this.socket.close();
            } catch (IOException ex) {

            }
            log.error("client disconnected");
        }
    }

    private void handle (InputStream inputStream, OutputStream outputStream) throws IOException {
        var writer = new BufferedWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));
        var reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        writer.write("Hello\n");
        writer.flush();
        for (;;) {
            String line = reader.readLine();
            log.info("client say:" + line);
            if (line.equals("bye")) {
                writer.write("bye\n");
                writer.flush();
                break;
            }
            writer.write("yes\n");
            writer.flush();
        }
    }
}

```

### Client端
```java
package org.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class ClientCase {
    private static final Logger log = LoggerFactory.getLogger(ClientCase.class);

    public static void main(String[] args) {
        try (Socket socket = new Socket("localhost", 6666)) {
            log.info("connect from =" + socket.getRemoteSocketAddress());
            try (InputStream inputStream = socket.getInputStream();
                 OutputStream outputStream = socket.getOutputStream()) {
                handle(inputStream, outputStream);
            }
        } catch (IOException e) { // Socket的异常在这里捕获
            log.error("Error during communication", e);
        }
        log.info("socket closed");
    }

    public static void handle(InputStream inputStream, OutputStream outputStream) throws IOException {
        var writer = new BufferedWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));
        var reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        log.info("server say=" + reader.readLine());
        Scanner scanner = new Scanner(System.in);
        for  (;;) {
            log.info(">>>");
            String s = scanner.nextLine();
            writer.write(s);
            writer.newLine();
            writer.flush();

            var line = reader.readLine();
            log.info("<<<" + line);
            if (line.equals("bye")) {
                break;
            }
        }
    }
}

```


### 总结
总得来说，Java的网络通信通过Socket实现，Server端监听指定端口，Client端连接到Server端的端口，双方通过输入输出流进行通信。
需要特别注意的是，当利用`BufferedWriter`进行写入操作时，写完之后一定要跟上换行符 `\n`, 否则输入输出流会一直等待，这个小问题卡了我不少时间ORZ。
