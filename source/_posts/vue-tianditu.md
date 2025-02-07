---
title: Vue中使用天地图
author: stan
date: 2023-09-14 15:50:30
tags: [vue, 天地图]
---

### Vue3中简单使用天地图的示例

1. 首先是需要到天地图官网去注册账号并申请一个密钥，用于加载天地图的js文件。
   创建并生成一个key
    ![天地图Key](/images/tianditu_key.png)

2. 回到编辑器，首先需要添加一个div，让其能作为天地图的展示容器
    ```html
    <template>
      <div id="map" class="map">
      </div>
    </template>
    ```
    需要为其设置宽高，否则地图无法显示

3. 这里我们动态加载天地图的js，先实现一个动态加载js的方法
    ```javascript
    function loadScript(url: string) {
      return new Promise<void>((resolve, reject) => {
        const script = globalThis.document?.createElement("script");
        if (!script) resolve();
        script.src = url;
        script.type = "text/javascript";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = e => resolve();
        globalThis.document?.body.appendChild(script);
      });
    }
    ```
    该方法放在工具类中，加载任何动态脚本使用

4. 接着就是初始化地图, 其中的v是指版本号，这里使用4.0版本，将v替换成4.0即可.
   tk就是注册天地图账号时控制台中新增的应用密钥,将其替换为你注册的即可.
   js加载成功之后会在全局window对象下挂载一个T对象，其就是天地图对象.
   ```javascript
   // 加载天地图js, 
   await loadScript(`https://api.tianditu.gov.cn/api?v=${v}&tk=${tk}`);
   // 实例化天地图，
   // 参数 ‘map’ 即对应div的id
   const map = new window.T.map('map', {
        center: [116.397428, 39.90923], // 中心点坐标  
        zoom: 13, // 缩放级别  
        roam: true, // 开启鼠标缩放和平移交互
        zoomControl: true, // 开启缩放控件  
        scaleControl: true, // 开启比例尺控件  
        dragging: true, // 开启拖拽漫游  
        navigation: true, // 开启地图平移和缩放控件  
   });
   // 添加矢量地图图层
   const layer = new T.TileLayer(`https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`)
   map.addLayer(layer)
   ```
   到这里，就可以看到天地图的卫星地图显示在页面上了

5. 如果要使用到CarTrack，则需要单独引入d3、D3SvgOverlay、CarTrack
   ```javascript
   const CarTrackScripts = [
      "https://cdn.bootcss.com/d3/3.5.17/d3.min.js",
      "https://tianditu.lztl.cn/api/js4.0/opensource/openlibrary/D3SvgOverlay.min.js",
      "https://tianditu.lztl.cn/api/js4.0/opensource/openlibrary/CarTrack.min.js"
   ]
   await Promise.all([
    loadScript(CarTrackScripts[0]), loadScript(CarTrackScripts[1]), loadScript(CarTrackScripts[2])
   ])
   const opt: T.CarOverlayOptions = {
      interval: 1000, // 小车移动的间隔 ms
      speed: 0, // 小车移动的速度
      dynamicLine: true,
      carstyle: { // 移动小车图标样式
        display: true,
        iconUrl: 'car.png', // car图标
        width: 10,
        height: 10
      },
      polylinestyle: { display:true, color: 'red', width: 1, opacity: 1, }, // 移动轨迹路线样式
      Datas: props.trackDatas.map((pos) => toLngLat(pos)),
      passOneNode: handleCarMove // 小车移动时触发的回调函数，返回Lnglat以及index
   }
   // 初始化CarTrack对象，参数map为上一步创建的window.T.map对象实例
   const carTrack = new T.CarTrack(map, opt)
    
   carTrack.start() // 开始移动
   carTrack.pause() // 暂停移动
   carTrack.resume() // 继续移动
   carTrack.stop() // 停止移动
   carTrack.clear() // 清除移动轨迹
   ```

6. 添加天地图控制类组件, map为天地图对象的实例
   ```javascript
   let ctrlMapType = new T.Control.MapType({
    mapTypes: [{
      'title': '地图',
      'icon': 'https://api.tianditu.gov.cn/v4.0/image/map/maptype/vector.png',
      'layer': window.TMAP_NORMAL_MAP
    }, {
      'title': '卫星',
      'icon': 'https://api.tianditu.gov.cn/v4.0/image/map/maptype/satellite.png',
      'layer': window.TMAP_SATELLITE_MAP
    }, {
      'title': '卫星混合',
      'https': 'api.tianditu.gov.cn/v4.0/image/map/maptype/satellitepoi.png',
      'layer': window.TMAP_HYBRID_MAP
    }, {
      'title': '地形',
      'icon': 'https://api.tianditu.gov.cn/v4.0/image/map/maptype/terrain.png',
      'layer': window.TMAP_TERRAIN_MAP
    }, {
      'title': '地形混合',
      'icon': 'https://api.tianditu.gov.cn/v4.0/image/map/maptype/terrainpoi.png',
      'layer': window.TMAP_TERRAIN_HYBRID_MAP
    }]
   });
   // 添加地图类型选择控件
   map.addControl(ctrlMapType)
   ```
  
7. 天地图还有很多工具可以使用，具体可以参考天地图官网api. 
   
   [天地图Api4.0类参考](http://lbs.tianditu.gov.cn/api/js4.0/class.html)

   <http://lbs.tianditu.gov.cn/api/js4.0/class.html>