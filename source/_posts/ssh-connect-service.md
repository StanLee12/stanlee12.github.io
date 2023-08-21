---
title: 使用ssh免密连接服务器
author: stan
date: 2023-08-09 17:54:17
tags: ssh
---

1. 首先需要生成ssh密钥，类似于连接github、gitee的ssh密钥。
密钥文件默认生成在 ~/.ssh/ 文件夹下
```shell
ssh-keygen -t rsa -f [file_name]
# -t 指定加密方式, 有rsa 和 dsa, 通常默认使用rsa就好
# -f 指定生成密钥文件的名称, 默认生成的是id_rsa, 但是可能会有多个密钥文件
# 所以需要指定一个名称, 例如 id_rsa.[server_name]

```

2. 执行`ssk-keygen`之后，会出现
```shell
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in id_rsa.[server_name]
Your public key has been saved in id_rsa.[server_name].pub
The key fingerprint is:
# 这里是提示输入使用密钥文件时的密码，可以设置为空，直接回车就是
```

3. 文件生成之后，需要修改其权限，避免服务器验证密钥无法读取
```shell
sudo chmod 600 ~/.ssh/id_rsa.[server_name] ~/.ssh/id_rsa.[server_name].pub

# 600 表示文件拥有者对该文件有读写的权限，其他用户无权限
```

4. 密钥文件生成且权限修改之后将.pub后缀的公钥文件上传至服务器.
上传成功之后, 会在服务器的`~/.ssh/authorized_keys` 文件中添加一条公钥记录
如果后续验证失败可以看看该文件内的内容是否有冲突
```shell
ssh-copy-id -i ~/.ssh/id_rsa.[server_name].pub -p [port] [name]@[server_ip]
# -i 指定要上传的公钥文件
# -p 服务器开放端口号
```

5. 配置完成之后可以开始免密连接服务器了
```shell
ssh -i ~/.ssh/id_rsa.[server_name] -p [port] [name]@[server_ip]
# -i 指定连接服务器时使用的私钥文件
```

ok， 至此最基础的ssh免密连接服务器就完成了