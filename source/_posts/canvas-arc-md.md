---
title: 使用canvas绘制扇形
author: stan
date: 2023-08-02 17:05:55
tags: [canvas]
---

```html
<html>
  <body>
    <canvas id="box" width="500" height="500"></canvas>
  </body>
  <script>
     const colors = [
      "red", // 浅灰色
      "#FAFAD2", // 浅黄色
      "#9ACD32", // 浅绿色
      "#FFE4B5", // 浅粉色
      "#FFFACD", // 浅黄粉色
      "#B2DFEE", // 浅蓝色
      "#E1BEE7", // 浅蓝绿色
      "#F8BBD0", // 浅橙色
      "#19CAAD", // 浅橙红色
      "#FFDEAD", // 浅黄棕色
    ];
    /**
     *获取扇形的中心点 
     * center { x, y } 
     * radius 半径
     * startAngle 开始角度
     * endAngle 结束角度
     */
    function getArcMidpoint(center, radius, startAngle, endAngle) {
      var x = center.x + radius * Math.cos((startAngle + endAngle) / 2);
      var y = center.y + radius * Math.sin((startAngle + endAngle) / 2);
      return {
        x: x,
        y: y
      };
    }
    // 绘制扇形
    function renderArc() {
      // 默认画十个扇形组成一个圆
      const length = 10;
      const canvas = document.getElementById('box');
      const ctx = canvas.getContext('2d');
      const x = canvas.width * .5;
      const y = canvas.height * .5;
      const radius = canvas.width * .5;
      // 第一个扇形的开始度数为垂直方向，-90度再减去扇形的一半度数
      let beginAngel = -(90 + (360 / length) / 2) * Math.PI / 180;
      for (let i=0;i< length;i+=1) {
        ctx.beginPath();
        ctx.save();
        // canvas的填充色
        ctx.fillStyle = colors[i];
        // 画笔转移到圆形中心位置，也就是起点
        ctx.moveTo(x, y);
        // 圆的总量为1, 每一个扇形就是 1/length, 乘以360是让其顺时针旋转
        // 其实arc最后一个参数设为true也是顺时针旋转
        const tempAngle = 1 / length * 360 * Math.PI / 180;
        const endAngel = tempAngle + beginAngel;
        ctx.arc(x, y, radius, beginAngel, endAngel);
        ctx.fill();
        // 扇形绘制完成之后重置画笔
        ctx.restore();
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.font = '50px Aria';
        ctx.fontWeight = '500';
        // 设置扇形中文字在扇形中心点上
        const point = getArcMidpoint({x, y}, 200, beginAngel, endAngel);
        // 绘制文字，x y坐标为必填
        ctx.fillText(`${i + 1}`, point.x - 10, point.y + 10);
        ctx.restore();
        // 下一个扇形的开始角度为上一个扇形的结束角度
        beginAngel = endAngel;
      }
    }

  </script>
  <style type="text/css">
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        outline: none;
      }
      .outer {
        width: 200px;
        height: 400px;
        border-radius: 0 200px 200px 0;
        background-color: blue;
        /* overflow: hidden; */
      }
      .inner {
        width: 200px;
        height: 400px;
        transform: translateX(-200px) rotate(72deg);
        background-color: lightgray;
        transform-origin: right center;
        opacity: 0.5; 
      }
      .inner span {
        color: white;
        font-size: 50px;
        font-weight: 500;
        position: absolute;
        /* left: 110px;
        top : 10px; */
        left: 60px;
        top: 10px;
        transform-origin: center center;
        background-color: green;
        transform: rotate(-36deg);
      }
  </style>
</html>

```