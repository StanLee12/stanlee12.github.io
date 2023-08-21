---
title: git操作常用命令说明
author: stan
date: 2023-08-02 17:11:48
tags: [git, rebase]
---

```shell
  git status
```
查看当前git目录下文件的修改情况


```shell
  git diff {file}
```
查看文件修改了什么内容， 不指定文件默认显示全部修改过的文件


```shell
  git checkout . / {file}
```
撤回修改，当为 . 时， 撤销所有的修改，除了新添加的文件。当指定文件时只撤销该文件的修改


```shell
  git checkout -b {branch_name}
```
新建一个分支, 当没有 -b 时，指定分支名则为切换分支


```shell
  git pull
```
拉取远程仓库最新代码到当前分支


```shell
  git push
```
推送当前分支commit到远程分支


```shell
  git rebase {branch_name}
```
同步分支代码时建议使用，会保持commit记录干净整洁
使当前仓库的commit与指定分支进行同步，只会更新当前分支的commit，与主分支无关
当出现冲突时，会进入到rebase进度, git status会发现有修改了的文件，其中有冲突，并将冲突解决
解决之后使用```git add .```  然后 ```git rebase --continue```继续rebase.
直到分支正常切换到当前分支下。如果中途不想继续rebase可以使用```git rebase --abort```中断rebase操作