---
title: 修复 HBuilder 在 Mac M 系列芯片上的兼容性问题
author: Stan
date: 2025-04-14 10:00:00
tags: [HBuilder, Mac, M系列芯片, ARM]
index_img: /images/index_img/uniapp.png
---

## 问题描述

当在Mac OS（M系列芯片）上使用HBuilder时，可能会遇到以下错误：

```bash
Error: Cannot find module '@rollup/rollup-darwin-x64'
```

这是因为运行时依赖以下两个x64架构的包：

- @esbuild/darwin-x64
- @rollup/rollup-darwin-x64

## 解决方案

需要手动安装对应的x64版本包：

```bash
npm install @esbuild/darwin-x64@0.20.2 @rollup/rollup-darwin-x64@4.29.1 --save-dev --force
```
## 说明

1. --save-dev (-D) 表示作为开发依赖安装
2. --force (-f) 强制安装，覆盖可能存在的冲突
3. 指定版本号是为了确保兼容性

## 注意事项

如果后续更新HBuilder版本，可能需要重新检查这些依赖包的版本兼容性。