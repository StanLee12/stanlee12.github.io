---
title: Spring Boot接入极光推送api sdk
author: stan
date: 2026-11-04 10:06:49
tags: [Spring Boot, jpush, 极光推送, sdk]
index_img: /images/index_img/jiguang.jpeg
---

## 版本说明
| 配置 | -版本- |
| --- | --- |
| Jdk | 17.0.15 |
| Spring Boot | 3.5.15 |
| jiguang-sdk | 5.3.1 |

## 导入依赖
```xml
<dependency>
    <groupId>io.github.jpush</groupId>
    <artifactId>jiguang-sdk</artifactId>
    <version>5.3.1</version>
</dependency>
```

## 配置OkHttp
```java
@Configuration
public class OkHttpConfig {

    @Bean
    public OkHttpClient okHttpClient() {
        ConnectionPool connectionPool = new ConnectionPool(20, 5, TimeUnit.MINUTES);

        return new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)   // 连接超时
                .readTimeout(10, TimeUnit.SECONDS)      // 读取超时
                .writeTimeout(10, TimeUnit.SECONDS)     // 写入超时
                .callTimeout(30, TimeUnit.SECONDS)      // 整体调用超时
                .retryOnConnectionFailure(true)         // 连接失败自动重试
                .connectionPool(connectionPool)
                .build();
    }
}
```

## 配置PushApi

```java
@Configuration
@RequiredArgsConstructor
public class PushApiConfig {
    @Value("${jpush.appKey}")
    private String appKey;
    @Value("${jpush.masterSecret}")
    private String masterSecret;

    // RequiredArgsConstructor注解会自动注入final声明的依赖，无需手动创建
    private final OkHttpClient okHttpClient;

    @Bean
    public PushApi jgPushApi() {
        return new PushApi.Builder()
                .setClient(new feign.okhttp.OkHttpClient(okHttpClient)) // 这里使用OkHttp作为JPush的HTTP客户端
                .setAppKey(jgAppKey)
                .setMasterSecret(jgMasterSecret)
                .setLoggerLevel(Logger.Level.FULL) // 开启日志，方便调试, 生产环境建议修改为BASIC
                .build();
    }
}
```

## 使用PushApi
```java
 private PushSendParam buildPushSendParam(PushSendReqVo reqVO) {
        PushSendParam pushSendParam = new PushSendParam();

        // 配置推送的目标，按照RegistrationId列表
        Audience audience = new Audience();
        audience.setRegistrationIdList(reqVO.getRegistrationIds());
        pushSendParam.setAudience(audience);

        // 平台指定 Android 和鸿蒙
        pushSendParam.setPlatform(Arrays.asList(ApiConstants.Platform.ANDROID, ApiConstants.Platform.IOS));

        // 配置安卓设备
        NotificationMessage.Android android = new NotificationMessage.Android();
        android.setAlert(reqVO.getAlert());
        // 优先级别 -2 至 2
        android.setPriority(2);
        android.setStyle(1);
        android.setDisplayForeground("1");

        // 设置点击通知消息跳转的页面为应用主界面
        NotificationMessage.Android.Intent androidIntent = new NotificationMessage.Android.Intent();
        androidIntent.setUrl("intent:#Intent;action=android.intent.action.MAIN;end");
        android.setIntent(androidIntent);

        // 配置ios设备
        NotificationMessage.Ios ios = new NotificationMessage.Ios();
        Map<String, String> iOSAlert = new HashMap<>();
        iOSAlert.put("title", "this is iOS title");
        iOSAlert.put("subtitle", "this is iOS subtitle");
        ios.setAlert(iOSAlert);
        ios.setBadge(1);

        NotificationMessage notificationMessage = new NotificationMessage();
        notificationMessage.setAlert(reqVO.getAlert());
        notificationMessage.setAndroid(android);
        notificationMessage.setIos(ios);

        pushSendParam.setNotification(notificationMessage);

        return pushSendParam;
    }

```

## 发送通知
```java
@Schema(description = "消息推送的 Request VO")
@Data
public class PushSendReqVo {

    @Schema(description = "业务幂等编号（同一 bizId 视为同一次推送）", requiredMode = Schema.RequiredMode.REQUIRED,
            example = "ALARM-20261103-0001")
    @NotBlank(message = "bizId 不能为空")
    private String bizId;

    @Schema(description = "需要推送的 RegistrationId 列表", requiredMode = Schema.RequiredMode.REQUIRED,
            example = "[\"12312312\", \"12312312\"]")
    @NotEmpty(message = "需要推送的 RegistrationId 列表不能为空")
    private List<String> registrationIds;

    @Schema(description = "需要推送的应用标识（jg 监管、qy 企业、wb 维保）",
            requiredMode = Schema.RequiredMode.REQUIRED, example = "qy")
    @NotBlank(message = "需要推送的应用标识不能为空")
    private String appKey;

    @Schema(description = "需要推送的通知内容（alert）", requiredMode = Schema.RequiredMode.REQUIRED, example = "告警信息")
    @NotBlank(message = "需要推送的通知内容不能为空")
    private String alert;

    @Schema(description = "需要推送的附加内容", requiredMode = Schema.RequiredMode.NOT_REQUIRED,
            example = "哪里哪里发生了什么样的问题")
    private String content;

    @Schema(description = "业务来源标识", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "fire-alarm")
    private String source;
}

PushSendResult result = pushApi.send(buildPushSendParam(reqVO));
```

## 说明
- `result` 是推送结果，包含了推送的统计信息，如成功数、失败数等。
- 可以根据 `result` 中的字段，判断推送是否成功。
- 这只是最简单的发送通知的示例，如果需要实现离线等同送，需要注册各厂商的推送服务，然后配置`Options`下的`ThirdPartChannel`。

## 参考
- [JPush 官方文档](https://docs.jiguang.cn/jpush/server/push/rest_api_v3_push)
- [Sdk 源码地址](https://github.com/jpush/jiguang-sdk-java)
