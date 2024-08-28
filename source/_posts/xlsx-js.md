---
title: xlsx-js
author: stan
date: 2024-08-28 11:04:28
tags: [nodejs, xlsx]
---

# nodejs解析Excel表格

### 解析excel可以说是工作中非常常用的一个功能，就简单叙述我工作中对excel文件进行解析的一个步骤吧

1. 初始化项目，因为是一个简单的脚本，我们先创建一个文件夹存放js文件的, 再新建`index.js`, 然后执行`npm init`, 会自动生成`package.json`, 再执行安装`npm install xlsx`, 我们就可以开始解析excel文件了

2. 以下就是解析excel文件并写入文件的简单示例代码
```javascript
const dayjs = require('dayjs')
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 替换为你的xlsx文件路径
const workbookPath = '/path/to/file';

// 读取xlsx文件  cellDates 表示时间类型的数据转换为时间格式，默认四展示1970年至时间日期的天数
const workbook = XLSX.readFile(workbookPath, { cellDates: true, dateNF: 'YYYY"年"MM"月"DD' });

// 假设我们想要读取第一个工作表
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

// 使用xlsx库的工具函数将工作表的数据转换为json对象数组
// 如果设置 raw: false, xlsx的时间格式会按照dateNF显示，但是数字类型会被转换为科学计数法显示
// 所以还是对时间格式使用dayjs直接转换
// header:1 表示第一行是标题行 将其去除掉
// reverse 是将数组倒序排列
let data = XLSX.utils.sheet_to_json(worksheet, { header:1  }).slice(1).reverse();
// 指定文件路径
const filePath = path.join(__dirname, 'data.json'); // __dirname是当前执行脚本所在的目录

// 2 表示多少个空格缩进
const jsonData = JSON.stringify(data, null, 2);
// 写入文件
fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
        console.error('写入文件时发生错误:', err);
        return;
    }
    console.log('JSON数据已成功写入文件');
});
```
3. 需要注意的是，xlsx解析时间格式的数据时默认会返回1970年1月1日至今的天数,如果你想将其格式化，可以设置在readFile时设置
`XLSX.readFile(workbookPath, { cellDates: true, dateNF: 'YYYY"年"MM"月"DD' });` dataNF属性，想要其生效，还需要在
`XLSX.utils.sheet_to_json()`发放中的第二个配置参数中设置 `{ raw: false }`, 但是大数字类型会被转换为科学计数法显示
所以想定义自己需要的时间格式，还是获取到时间之后使用dayjs进行转换，但是xlsx读取的时间数据会比获取到的时间少一天，需要处理一下
例如：`date: dayjs(_item[5]).add(1, 'days').format('YYYY年MM月DD日')`

4. 最后写完之后，将代码中的文件路径修改，终端跳转至当前目录，然后在命令行中执行`node index.js`即可运行