---
title: Vue3中v-for列表中使用Transition，设置delay延迟失效的bug
author: stan
date: 2025-04-22 18:34:21
tags: [Vue, v-for, Transition, delay]
index_img: /images/index_img/vue3.png
---

当我们想在`v-for`下的每一列添加渐入效果的动画，然后根据index设置不同的延迟时间，就会发现设置的延迟时间失效了。

```html
<div v-for="(item, index) in 5" :key="item">
    <Transition
        appear
        :enter-active-class="`animate__animated animate__fadeInRight animate__delay-${index + 1}s`"
    >
        <div class="item" :key="index">
            {{ index }}
        </div>
    </Transition>
</div>
```

其中设置动画效果是通过的 `animate.css` 库实现的, 其中 `animate__delay-1s` 就是设置延迟时间的, 表示延迟 `1s` 后开始动画。

但是当通过 `index` 为 `enter-active-class` 设置延迟时间时，动态赋值 `animate__delay-${index + 1}s` 时，发现设置的延迟时间失效了。
也不算是失效，而是有些列的延迟时间正常，但是有的列的延迟时间却没有生效。

我猜测是由于 `class` 动态绑定的原因，渲染延迟失效，导致 `class` 没有正确的被解析和转换。

所以，将其延迟属性通过 `style` 样式的方式进行设置，就可以解决这个问题。

```html
<div v-for="(item, index) in 5" :key="item">
    <Transition
        appear
        :enter-active-class="`animate__animated animate__fadeInRight`"
        :style="{ animationDelay: `${index + 1}s` }"
    >
    </Transition>
</div>
```
这样就可以解决这个问题了。
