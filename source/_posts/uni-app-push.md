---
title: uni-app 接入推送
author: stan
date: 2023-12-21 16:08:56
tags: [uni-app, push, notification, uni-app消息推送]
index_img: /images/index_img/uniapp.png
---

### uni-app 移动端app介入消息推送(本文只介绍安卓版本)

1. 首先需要在`manifest.json`文件中的`App模块配置` 选中 `Push(消息推送)`, 离线推送需要对应厂商平台的密钥和key，作者并没有申请下来，所以暂时只针对在线推送

   ![天地图Key](/images/uni-app-push/uni-app-push-01.png)

2. 接着需要点击右侧的`申请开通`按钮, 此时会打开uni-app的配置推送应用的界面
   
   ![天地图Key](/images/uni-app-push/uni-app-push-02.png)
   
   - `APPID` 可以在uni-app的`manifest.json`文件的基础配置模块看到
   - `包名` 是打包app时命名的应用名称(建议测试版、正式版各打一个，使用不同的包名)
   - `Android应用签名` 需要在应用管理内进行配置, 打包时使用的密钥文件内包含, 可以点击 `包名在“应用详情”中“各平台信息”管理，点击前往` 进行配置, uni-app 界面内都有详细的说明
   - `关联服务空间`  需要在uniCloud中新建一个自己的云服务空间, 我这里申请的是阿里云免费的服务空间, 后续的推送管理端也需要该云空间填完这些信息提交修改即可

3. 完成上面这些步骤基本就已经配置完成了，当然`manifest.json`修改完成之后需要重新打包，记得包名要保持一致.完成了app相关配置还需要管理后台进行消息的发送
   这时需要新建一个uni-admin 模板的项目,选择`文件>新建>项目>un-app>uni-admin`, 新建一个uni-admin 模板的项目,并添加`uni-push-admin`插件进项目中
   这是一个web应用，管理uni-app应用的.

4. 新的`uni-admin`以及添加`uni-push-admin` 完成之后, 启动项目时记得选中 `连接云端函数`.
   
   ![天地图Key](/images/uni-app-push/uni-app-push-03.png)

5. 项目启动之后需要先注册一个管理员账号, 注册完成登录,项目是这个样子的
   
   ![天地图Key](/images/uni-app-push/uni-app-push-04.png)

   项目添加并配置了`uni-push-admin`，但是看不到`推送管理`的菜单栏, 需要在`系统管理`下的`菜单管理进行添加`

6. 进入`推送管理 > 消息推送`, 可以进行测试发送了

   ![天地图Key](/images/uni-app-push/uni-app-push-05.png)

   - 如果`选择应用`中没有自己的应用，则需要在`系统管理 > 应用管理`中进行添加
   - 因为只开启了在线推送，所以需要将 `强制通知栏消息` 打开, 并且应用在设备上处于开启状态才会收到推送消息
   - 接着填入必填信息即可进行推送消息的发送了
  
7. 小程序内的订阅消息需要审核，则需要单独配置，且需要接入后端服务。总的来说, uni-app的文档还是挺详细的，接入时候也不算麻烦，文章内具体提到的内容也算是我没有注意到的点，花费了些许时间.