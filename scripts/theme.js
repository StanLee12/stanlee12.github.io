
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
