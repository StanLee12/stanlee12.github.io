---
title: shell自动化构建部署脚本
author: stan
date: 2024-11-08 19:09:35
tags: [build, ssh, scp, zip, unzip]
index_img: /images/index_img/vue3.png
---

# 使用shell脚本自动化打包部署前端项目

```bash
#!/bin/sh
# 使用sh作为解释器  
set -e # 当脚本执行出现错误立即退出

# 设置当脚本退出时打印异常信息
trap 'echo "退出: $?"' EXIT

# 获取当前时间
CURRENT_TIME=`date "+%Y%m%d%H%M"`
# 获取当前文件夹名称
SHELL_FOLDER=$(basename $(pwd))
# 使用文件夹名称以及当前时间作为压缩包名称
FILE_NAME="$SHELL_FOLDER-$CURRENT_TIME.zip"

# 打包后的文件夹
FOLDER="dist" 

echo "开始打包"
npm run build

echo "打包完成, 开始压缩文件"

# 进入到dist文件目录内进行打包
# $(echo $(cd $FOLDER;ls)) 是获取文件夹下的所有文件
FILES=$(echo $(cd $FOLDER;ls))
echo $FILES

# 跳转至打包后的文件目录进行压缩
cd $FOLDER
zip -r $FILE_NAME $FILES

# 移到项目根目录
mv $FILE_NAME ../

echo "文件名为:$FILE_NAME"

# 因为压缩的时候跳转到了dist目录内，所以需要跳转至上一层目录
cd ../

echo "上传打包文件至服务器..."
# 上传压缩包至服务器指定目录下
scp $FILE_NAME [服务器]:/www/wwwroot/home

echo "上传完成，开始解压..."

# 注意，unzip -o 是指覆盖原文件, 传递的文件只能是具体文件名
# 需要先cd到需要解压文件的目录下,再执行解压操作，否则会解压出问题
# 下面命令时远程操作服务器命令，分别是跳转至指定文件夹，然后解压对应文件，最后删除压缩包
ssh [服务器] "cd /www/wwwroot/home && unzip -o $FILE_NAME && rm $FILE_NAME"

rm $FILE_NAME

echo "更新完成,请刷新网页查看效果"

```

### 代码中的`[服务器]是指服务器地址，最好是配置ssh免密登录，并在ssh的config文件中配置别名，方便连接使用
如下配置好之后代码中的`[服务器]`就可以替换为 [服务器代称]

### 在 `~/.ssh/config` 中进行配置
```
Host [服务器代称]
HostName [服务器ip]
Port [服务器连接端口号]
User [服务器用户名]
IdentityFile [密钥路径]

```
