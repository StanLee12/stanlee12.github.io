---
title: VsCode快速生成Vue3默认用户片段
author: stan
date: 2023-08-24 11:56:28
tags: [vscode, vue3]
index_img: /images/index_img/vscode.png
---

#### 使用VsCode开发Vue项目的时候，有个Vue Snippets的插件，其中的VueInit命令可以默认生成一段Vue文件的基础模板
#### 但是和自己的使用习惯不太一致，而且和Vue3也不是很搭配
#### 所以就想着自己创建一个命令，可以符合自己的预期, 然后就研究了一下

1. ### 首先是VsCode中按下 `cmd + shift + p` 键，打开VsCode的配置搜索框，输入`Config Use Snippets`, 选中并点击

2. ### 点击之后会出现让你选择修改或新建一个`snippet`, 这里我们选择新建一个全局的 `global`, 输入框输入要创建的用户片段的名称之后回车就可以

3. ### 创建成功之后会出现其配置文件，这是我修改过后的:
    ```json
      {
        "Init Vue3 template": {
          "prefix": "Vue3Init",
          "body": [
            "<template>",
            "  <div>",
            "    ",
            "  </div>",
            "</template>",
            "<script lang=\"ts\" setup>",
            "defineOptions({ name: \"${TM_DIRECTORY/(.*\\/)([^\\/]+)/${2:/capitalize}/}\" })",
            "  ",
            "</script>",
            "<style lang=\"scss\" scoped>",
            "  ",
            "</style>"
          ],
          "description": "Init Vue3 Template By Default"
        }
      }
    ```
    `Init Vue3 template` 模板名称

    `scope` 模板命令生效的范围 "" 表示所有文件都生效, 可选 ‘javascript, typescript, vue, html’等等等

    `prefix` 使用该模板时需要敲击的命令, 例如在新文件中敲下 Vue3Init 就会生成该模板

    `body` 使用`Vue3Init` 命令户生成的内容

    `description` 描述信息

4. ### defineOptions说明:
   #### `${TM_DIRECTORY/(.*\\/)([^\\/]+)/${2:/capitalize}/}` 其中这段代码的意思是使用正则取当前文件目录名称
   #### 并将其首字母大写，因为我的vue项目的文件目录结构是`/fileName/index.vue`, 所以需要将其转换为`FileName`用于组件的名称

5. ### VsCode的一些内置变量:
    ${TM_DIRECTORY}：当前文件的目录路径。

    ${TM_FILEPATH}：当前文件的完整路径，包括文件名。
  
    ${TM_FILENAME}：当前文件的完整文件名（包括扩展名）。
  
    ${TM_FILENAME_BASE}：当前文件的基本文件名（不包括扩展名）。

    ${TM_SELECTED_TEXT}：选定的文本内容（如果有选定的文本）。

    ${TM_CURRENT_LINE}：当前所在行的内容。

    ${TM_CURRENT_WORD}：当前光标所在位置的单词。

    ${TM_LINE_INDEX}：当前行的索引（从0开始）。

    ${TM_LINE_NUMBER}：当前行的行号（从1开始）。

    ${TM_SOFT_TABS}：当前文件是否使用软制表符。

    ${TM_TAB_SIZE}：当前文件的制表符大小（空格数）。
  
    ${TM_FULLNAME}：当前用户的完整名称。

    ${CLIPBOARD}：剪贴板的内容。








