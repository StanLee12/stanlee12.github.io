---
title: Java学习记录(3) - 文件流
author: stan
date: 2025-11-24 18:04:25
tags: [java, 文件流]
index_img: /images/index_img/java.gif
---

### InputStream与OutputStream
Java是一种面向对象的编程语言，它提供了丰富的类库来处理文件流。文件流是指将文件中的数据读取到内存中或将内存中的数据写入到文件中的操作。

在Java中，文件流主要分为两种类型：输入流（InputStream）和输出流（OutputStream）。输入流用于从文件中读取数据，而输出流用于将数据写入到文件中。

Java提供了多个类来实现文件流的操作，例如FileInputStream、FileOutputStream、BufferedInputStream、BufferedOutputStream等。这些类都实现了InputStream和OutputStream接口，提供了不同的读写方式和缓冲区大小。

通过使用文件流，我们可以方便地读取和写入文件中的数据。例如，我们可以使用FileInputStream来读取文件中的字节数据，使用FileOutputStream来写入字节数据到文件中。

### 示例 - 文件读取

```java
public void test8() {
        try (InputStream is = new FileInputStream("/Users/stanlee/work/chart.json");
            InputStreamReader isr = new InputStreamReader(is, "utf-8");
            BufferedReader br = new BufferedReader(isr);
        ) {
            String line;
            StringBuilder sb = new StringBuilder();
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            log.info(sb.toString());
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
}
```

### 示例 - 文件复制
```java
public void test9() {
        try(InputStream input = new FileInputStream("/Users/stanlee/work/chart.json");
            OutputStream output = new FileOutputStream("/Users/stanlee/work/chart-copy.json");
        ) {
            input.transferTo(output);
            output.flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
}
```
