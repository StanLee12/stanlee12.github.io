
// 鼠标移动特效
hexo.extend.injector.register('body_end', `
    <script src="/js/star.js"></script>
`)

// 点击爆炸特效
hexo.extend.injector.register('body_end', `
    <script src="/js/explosion.js"></script>
`)

// 樱花背景
hexo.extend.injector.register('body_end', `
    <script src="/js/sakura.js"></script>
`)

// 鼠标了粒子跟随效果
// hexo.extend.injector.register('body_end', `
//     <canvas></canvas>
//     <script src="/js/particle.js"></script>
// `)

// 添加Aplayer播放器
hexo.extend.injector.register('body_begin', `
    <link rel="stylesheet" href="https://unpkg.com/aplayer@1.10.1/dist/APlayer.min.css"><!--APlayer的样式-->
    <script src="https://unpkg.com/aplayer@1.10.1/dist/APlayer.min.js"></script><!--APlayer的依赖-->
    <script src="https://unpkg.com/meting@2/dist/Meting.min.js"></script><!--Meting的依赖-->
    <meting-js
        server="netease"
        type="song"
        autoplay=true
        lrc-type=3
        id="4940920"
        fixed=true
        mini=true
    >
    </meting-js>
    <script> 
        let ref = setInterval(function(){	//每隔2秒尝试播放一次
            isaplay();
        },2000);
        function isaplay(){
            $(".aplayer-play").click()	//尝试播放
            setTimeout(function() {		//延时100毫秒再执行其内部的判断
                if($(".aplayer-pause").length > 0){
                    clearInterval(ref);		//停止Interval，即停止循环
            }}, 100);
        }
    </script>
`)