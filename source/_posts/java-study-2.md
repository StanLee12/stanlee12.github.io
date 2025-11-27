---
title: Java学习记录(2) - 注解、反射、泛型
author: stan
date: 2025-11-22 18:04:25
tags: [java, 反射, 泛型, 注解]
index_img: /images/index_img/java.gif
---

### 我理解注解是Java的一种元数据，它可以在编译时或运行时被读取和处理。注解可以用于类、方法、字段等元素上，用于添加额外的信息或行为。简化代码，方便一些逻辑判断操作。

### 而写好注解的基础就在于Java反射与泛型的的机制，利用反射可以在运行时动态获取类的信息，包括注解。而泛型则可以在编译时检查类型错误，避免在运行时出现类型转换异常。

### 贴上我的练习代码

### 定义注解，注解本质上是一个interface
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD) // 表示检测字段
public @interface Range {
    int min() default 0;
    int max() default 255;
}

```

### 定义一个类，使用注解

```java
public class TestClass {
    @Range(min = 10, max = 20)
    private int age;

    public void setAge(int age) {
        this.age = age;
    }

    public int getAge() {
        return age;
    }
}

```

### 添加注解的处理逻辑
```java
public void check(Object o) throws IllegalAccessException {
        for (Field field : o.getClass().getDeclaredFields()) {
            Range range = field.getAnnotation(Range.class);
            if (range != null) {
                field.setAccessible(true);
                Object value = field.get(o);
                if (value instanceof String) {
                    if (((String) value).length() < range.min() || ((String) value).length() > range.max()) {
                        throw new IllegalArgumentException("参数长度不符:" + field.getName() + "长度是:" + (((String) value).length()));
                    }
                }
                if (value instanceof Integer) {
                    if ((Integer) value < range.min() || (Integer) value > range.max()) {
                        throw new IllegalArgumentException("参数值不符:" + field.getName() + "值大小为:" + ((Integer) value));
                    }
                }
            }
        }
    }

```

### 测试注解
```java
    public void testCheck() throws IllegalAccessException {
        TestClass testClass = new TestClass();
        testClass.setAge(15);
        check(testClass);
    }

```

