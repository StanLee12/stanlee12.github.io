---
title: ssh配置快捷连接服务器
author: stan
date: 2023-08-21 11:50:20
tags: [ssh, github, gitlab, gitee]
index_img: /images/index_img/ssh.png
---

```shell
Host myserver
    HostName [ip_address] # 服务器ip地址
    User [user_name] # 服务器登录的账户名称
    IdentityFile ~/.ssh/id_rsa # ssh生成的密钥文件地址
    PreferredAuthentications publickey
    AddKeysToAgent yes

```

`PreferredAuthentications` 是一个用于配置 SSH 客户端首选身份验证方式的选项。它允许你指定客户端在连接远程服务器时首选的身份验证方式顺序。SSH 支持多种身份验证方式，如密码、公钥、GSSAPI 等。

如果需要同时支持多种身份验证方式，可以使用逗号分隔它们：

```shell
PreferredAuthentications publickey,password
```

`AddKeysToAgent` 是一个用于配置 SSH 客户端是否将密钥添加到 SSH 代理（如 ssh-agent）中的选项。SSH 代理可以管理你的私钥，允许你在登录后只需要输入一次密码即可在整个会话中使用私钥。

默认情况下，SSH 客户端不会自动将密钥添加到代理中。如果你想在每次登录时将密钥添加到代理，可以在 SSH 配置文件中添加以下行：
```bash
AddKeysToAgent yes
```
这样，在登录时会提示你输入私钥的密码，并将私钥添加到代理中，以后不再需要重复输入密码。


还有ssh配置github、gitee、gitlab连接的示例:
```shell
#Default gitHub user Self
Host github.com
  HostName github.com
  User [stanlee1226@gmail.com] # email
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/id_rsa.github
  AddKeysToAgent yes
```

```shell
#Add gitee user
Host gitee.com
  HostName gitee.com
  User [stanlee1226@gmail.com] #email
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/id_rsa.gitee
  AddKeysToAgent yes
```

```shell
#Add gitlab user
Host git@[ip_address]
  HostName [ip_address]
  Port [port]
  User [account]
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/id_rsa.gitlab
  AddKeysToAgent yes
```
