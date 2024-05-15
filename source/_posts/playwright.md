---
title: playwright
author: stan
date: 2024-05-14 11:48:22
tags: [node, playwright, web自动化测试]
---

# 微软超强爬虫工具，可用于Web页面自动化测试工具 --- Playwright

### Playwright是微软在2020年初开源的新一代自动化测试工具。它的功能和Selenium、Pyppeteer等工具类似，可以驱动浏览器进行各种自动化操作。Playwright支持当前所有的主流浏览器，包括Chrome、Edge、Firefox、Safari等，并且支持浏览器有头和无头模式。此外，Playwright的安装和配置过程简单，会自动安装对应的浏览器和驱动，不需要额外配置WebDriver等。

### Playwright支持多种编程语言，包括JavaScript、TypeScript、Python和Java，这使得开发人员可以使用他们喜欢的语言来编写自动化测试。

### 我是用的是JavaScript版本，主要介绍基于node的playwright的使用

### 1. 安装
    可以通过使用npm来安装playwright

    npm install playwright -g

    将playwright安装在全局环境下，我们就可以直接使用playwright命令进行相关操作

### 2. 功能介绍
      Usage: playwright [options] [command]

      Options:
        -V, --version                          output the version number
        -h, --help                             display help for command

      Commands:
        open [options] [url]                   open page in browser specified via -b,
                                              --browser
        codegen [options] [url]                open page and generate code for user actions
        install [options] [browser...]         ensure browsers necessary for this version of
                                              Playwright are installed
        install-deps [options] [browser...]    install dependencies necessary to run browsers
                                              (will ask for sudo permissions)
        cr [options] [url]                     open page in Chromium
        ff [options] [url]                     open page in Firefox
        wk [options] [url]                     open page in WebKit
        screenshot [options] <url> <filename>  capture a page screenshot
        pdf [options] <url> <filename>         save page as pdf
        show-trace [options] [trace...]        show trace viewer
        help [command]                         display help for command

### 3. 自动代码生成指令
      playwright codegen --target javascript -o 'playwright-baidu.js' -b chromium https://www.baidu.com 

      // --target 生成脚本的语言，可选python、java、javascript等

      // -o output输出脚本文件的名称

      // -b 使用的浏览器内核,包含chromium、firefox、safari等

### 4. 示例

![示例](/images/playwright/playwright-baidu.gif)

    如图所示, 当在浏览器执行相关操作时，代码记录器会对应的生成相关代码，
    但是代码不是完全准确无误的，如果是实际使用脚本代码，
    还需要进行检查和修改，也可以添加自己需要代码才能完成的操作，
    总之很大的省去了很多时间和精力.

