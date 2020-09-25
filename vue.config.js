const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
module.exports = {
  // entry: {
  //   // app: './src/main.js'
  //   app: ["babel-polyfill", "./src/main.js"]
  // },
  publicPath: '/', // 公共路径
  lintOnSave: 'error',
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_BASE_API,
        changeOrigin: true,
        onProxyRes: null,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  configureWebpack: config => {
    config.resolve.alias = Object.assign(config.resolve.alias, {
      'vue$': 'vue/dist/vue',
      'src': path.resolve(__dirname, './src'),
      'assets': path.resolve(__dirname, './src/assets'),
      'components': path.resolve(__dirname, './src/components'),
    });
    //gzip压缩
    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [new CompressionPlugin({
          test: /\.js$|\.css/,
          threshold: 10240,
          deleteOriginalAssets: false
        }),
        //预渲染
        new PrerenderSPAPlugin({
          // 生成文件的路径，也可以与webpakc打包的一致。
          // 下面这句话非常重要！！！
          // 这个目录只能有一级，如果目录层次大于一级，在生成的时候不会有任何错误提示，
          //在预渲染的时候只会卡着不动。
          // 需要进行预渲染的路由路径
          staticDir: path.join(__dirname, 'dist'),

          routes: ['/', '/miniProgram', '/mall/modelCenter', '/user/myworks', '/user/myCollect'
            , '/user/myBuy', '/404'],
          minify: {
            minifyCSS: true, // css压缩
            removeComments: true // 移除注释
          },
          // 这个很重要，如果没有配置这段，也不会进行预编译
          renderer: new Renderer({
            inject: {
              foo: 'bar'
            },
            headless: false,//这个必须有
            // 在 main.js 中 document.dispatchEvent(new Event('render-event'))，两者的事件名称要对应上。
            renderAfterDocumentEvent: 'render-event'
          })
        })]
      }
    }
  },
  chainWebpack: config => {
    config
      // 开发环境
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      );
  }
};
