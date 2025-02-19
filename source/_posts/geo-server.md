---
title: GeoServer发布tif格式的图层
author: stan
date: 2023-10-31 18:25:43
tags: [GeoServer, tif]
index_img: /images/index_img/geoserver.png
---

## GeoServer支持使用TIF图片作为空间数据的一种格式，可以通过上传、配置和调整参数等方式来使用TIF图片，并与地图和其他数据进行集成和发布。

## 遥感图导出则为tif格式的，就可以上传至GeoServer进行发布，作为图层展示在地图上。

## 1. 首先，点击存储仓库，添加新的存储

![步骤1](/images/geo_server/buzhou1.png)

![步骤2](/images/geo_server/buzhou2.png)

## 2. 选择栅格数据源下的GeoTIFF
![步骤3](/images/geo_server/buzhou3.png)

## 3. 为新图层命名并选择对应的tif图片

![步骤4](/images/geo_server/buzhou4.png)

## 4. 保存之后点击发布

![步骤5](/images/geo_server/buzhou5.png)

## 5. 发布页可以调整相关配置，比较特殊的地方在于Input Transparent Color，过滤掉图片的背景。如果tif图片有白色的背景就可以填入‘FFFFFF’过滤掉白色背景，否则图层会有一个背景框显示在地图上

![步骤6](/images/geo_server/buzhou6.png)

## 6. 发布图层之后，接下来为图层切片缓存

![步骤7](/images/geo_server/buzhou7.png)

![步骤8](/images/geo_server/buzhou8.png)

## 7. zoom start和zoom stop根据地图的缩放控制来修改，缓存对应zoom级别的切片

![步骤9](/images/geo_server/buzhou9.png)

## 8. 完成上述步骤即可进行预览

![步骤10](/images/geo_server/buzhou10.png)

![步骤11](/images/geo_server/buzhou11.png)

![步骤12](/images/geo_server/buzhou12.png)
