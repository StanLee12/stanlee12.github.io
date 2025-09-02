---
title: Vue3 中结合地图组件渲染InfoWindow 
author: stan
date: 2025-09-02 11:44:43
tags: [vue3, infoWindow, 天地图, 地图]
index_img: /images/index_img/vue3.png
---

## 前言

前端开发使用到地图组件的时候，难免要使用到`InfoWindow`, 但是在使用的过程中，发现`InfoWindow`的内容不能直接渲染`vue`组件，所以就有了这篇文章。
只能通过原生的`html`文本进行渲染，而且事件绑定还有起的麻烦，在`vue2`中得将事件绑定到 `window` 的全局对象下，才得以调用。所以研究发现了 `vue3` 的一个特性，可以通过 `vnode` 来渲染`vue`组件。
话不多说，进入使用环节.

## 实现

1. 先创建一个`vue`组件，用来渲染`InfoWindow`的内容。
    `InfoWindow.vue`
    ```javascript
    <template>
    <div class="w-300px bg-[#303133]">
        <div class="flex flex-col p-x-20px">
            <div class="font-bold text-20px color-#009e5c" @click="handleClick('info')">
                这是InfoWindow
            </div>
        </div>
    </div>
    </template>
    <script lang="ts" setup>

    const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    }
    })

    const emit = defineEmits(['click'])

    const handleClick = (type: string) => {
    emit('click', type)
    }

    </script>
    <style lang="scss" scoped>
    
    </style>
    ```
    可以看到，这是一个标准的`Vue3`组件，包含数据`data` 以及 回调事件 `click`

2. 在`InfoWindow`的`content`中，使用`vnode`来渲染`vue`组件。

    `index.vue`

    ```javascript
    import { createVNode, render } from 'vue'
    import InfoWindow from './InfoWindow.vue'

    const showInfoWindow = () => {
        const vnode = createVNode(InfoWindow, { landData, onClick: handleClick })
        const container = document.createElement('div');
        render(vnode, container)
        mapRef.value.showInfoWindow(vnode.el, lnglat)
    }

    const handleClick = (type: string) => {
        console.log(type)
    }
    ```
    可以看到，我们使用 `Vue` 提供的 `createVNode` 方法以及 `render` 方法来渲染`vue`组件。
    `createVNode` 方法用来创建`vnode`，第一个参数传入封装的组件，第二个参数传入组件的属性, 需要注意的是 回调事件前需要加 `on`。
    `render` 方法用来渲染`vnode`，第一个参数传入`vnode`，第二个参数传入`dom`节点。
    可以看到，我们创建了一个`div`节点，用来作为`InfoWindow`的`content`，并将`vnode`渲染到这个`div`节点中。
    最后将这个`div`节点作为`InfoWindow`的`content`传入`mapRef.value.showInfoWindow`方法中。
    即可渲染成功。
