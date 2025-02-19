---
title: Hexo 主题使用 Injector 添加鼠标点击特效
author: stan
date: 2025-02-19 15:52:47
tags: [hexo, fluid, injector]
index_img: /images/index_img/hexo.png
---

## 序言

使用`Hexo`搭建了自己的的博客，并且配置了主题，看到了别人博客上的点击特效，就比较心动，试着研究了一下，怎么给自己的网站添加特效。

但是很多内容说的都是老版本的用法，我自己研究了下新版本的用法，本文章使用的相关版本:

| 依赖              | 版本号       |
| ---------------- | ----------- |
| Hexo             | 6.3.0       |
| hexo-theme-fluid | 1.9.8       |

## 1. 动效脚本

首先需要在`source`文件下新建一个`js`文件夹，用于存放动效脚本, 下面是我找到的可用的爆炸特效的完整脚本代码:

```javascript
function clickEffect() {
  let balls = [];
  let longPressed = false;
  let longPress;
  let multiplier = 0;
  let width, height;
  let origin;
  let normal;
  let ctx;
  const colours = ["#F73859", "#14FFEC", "#00E0FF", "#FF99FE", "#FAF15D"];
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.setAttribute("style", "width: 100%; height: 100%; top: 0; left: 0; z-index: 99999; position: fixed; pointer-events: none;");
  const pointer = document.createElement("span");
  pointer.classList.add("pointer");
  document.body.appendChild(pointer);
 
  if (canvas.getContext && window.addEventListener) {
    ctx = canvas.getContext("2d");
    updateSize();
    window.addEventListener('resize', updateSize, false);
    loop();
    window.addEventListener("mousedown", function(e) {
      pushBalls(randBetween(10, 20), e.clientX, e.clientY);
      document.body.classList.add("is-pressed");
      longPress = setTimeout(function(){
        document.body.classList.add("is-longpress");
        longPressed = true;
      }, 500);
    }, false);
    window.addEventListener("mouseup", function(e) {
      clearInterval(longPress);
      if (longPressed == true) {
        document.body.classList.remove("is-longpress");
        pushBalls(randBetween(50 + Math.ceil(multiplier), 100 + Math.ceil(multiplier)), e.clientX, e.clientY);
        longPressed = false;
      }
      document.body.classList.remove("is-pressed");
    }, false);
    window.addEventListener("mousemove", function(e) {
      let x = e.clientX;
      let y = e.clientY;
      pointer.style.top = y + "px";
      pointer.style.left = x + "px";
    }, false);
  } else {
    console.log("canvas or addEventListener is unsupported!");
  }
 
  function updateSize() {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(2, 2);
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
    origin = {
      x: width / 2,
      y: height / 2
    };
    normal = {
      x: width / 2,
      y: height / 2
    };
  }
  class Ball {
    constructor(x = origin.x, y = origin.y) {
      this.x = x;
      this.y = y;
      this.angle = Math.PI * 2 * Math.random();
      if (longPressed == true) {
        this.multiplier = randBetween(14 + multiplier, 15 + multiplier);
      } else {
        this.multiplier = randBetween(6, 12);
      }
      this.vx = (this.multiplier + Math.random() * 0.5) * Math.cos(this.angle);
      this.vy = (this.multiplier + Math.random() * 0.5) * Math.sin(this.angle);
      this.r = randBetween(8, 12) + 3 * Math.random();
      this.color = colours[Math.floor(Math.random() * colours.length)];
    }
    update() {
      this.x += this.vx - normal.x;
      this.y += this.vy - normal.y;
      normal.x = -2 / window.innerWidth * Math.sin(this.angle);
      normal.y = -2 / window.innerHeight * Math.cos(this.angle);
      this.r -= 0.3;
      this.vx *= 0.9;
      this.vy *= 0.9;
    }
  }
 
  function pushBalls(count = 1, x = origin.x, y = origin.y) {
    for (let i = 0; i < count; i++) {
      balls.push(new Ball(x, y));
    }
  }
 
  function randBetween(min, max) {
    return Math.floor(Math.random() * max) + min;
  }
 
  function loop() {
    ctx.fillStyle = "rgba(255, 255, 255, 0)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < balls.length; i++) {
      let b = balls[i];
      if (b.r < 0) continue;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2, false);
      ctx.fill();
      b.update();
    }
    if (longPressed == true) {
      multiplier += 0.2;
    } else if (!longPressed && multiplier >= 0) {
      multiplier -= 0.4;
    }
    removeBall();
    requestAnimationFrame(loop);
  }
 
  function removeBall() {
    for (let i = 0; i < balls.length; i++) {
      let b = balls[i];
      if (b.x + b.r < 0 || b.x - b.r > width || b.y + b.r < 0 || b.y - b.r > height || b.r < 0) {
        balls.splice(i, 1);
      }
    }
  }
}
clickEffect();

```

新建一个 `source/js/explosion.js` 文件，将上面的代码粘进去即可

## 2. 注入脚本

在博客项目的根目录下新建一个 `scripts` 文件夹， 文件夹名称要确保正确，`hexo` 编译时会根据目录名称运行添加的脚本

在 `scripts` 文件夹下新建一个`js`文件, 例如 `cursor.js`,并向其中添加代码:

```javascript
hexo.extend.injector.register('body_end', `
    <script src="/js/explosion.js"></script>
`)
```

###  `Hexo injector`

简单介绍下`hexo.extend.injector.register(entry, value, to);`

-------

**`entry <string>`**

在 HTML 中的注入代码的位置。

支持这些值：

- head_begin: 注入在 <head> 之后（默认）
- head_end: 注入在 </head> 之前
- body_begin: 注入在 <body> 之后
- body_end: 注入在 </body> 之前

-------

**`value <string> | <Function>`**

需要注入的代码片段。也就是将上面创建的`js`脚本导入。

-------

**`to <string>`**

哪些页面会被注入代码

- default: 注入到每个页面（默认值）
- home: 只注入到主页
- post: 只注入到文章页面
- page: 只注入到独立页面
- archive: 只注入到归档页面
- category: 只注入到分类页面
- tag: 只注入到标签页面
- 或是其他自定义 `layout` 名称
