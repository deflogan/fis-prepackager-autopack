一个fis的自动打包插件，主要针对pcmap业务。
===================================
- 以每个异步加载的js为一个打包模块。
- 自动分析每个异步文件的依赖关系。
- 需要一个入口文件,pcmap为loadmap.js,是整个项目js入口。
- 首先会引入用户默认的打包配置（打包css和页面内直接引用的js）,默认为pack.json，以此为基础生成auto-pack.json。
- 一些文件被引用后，暴露的接口一旦执行就执行require.async，这样就相当于require,这一类文件放入asyncToSync。

```
fis.config.merge({
        ...
        settings: {
            prepackager: {
                autopack: {
                    access: 'loadmap.js', // 入口文件
                    asyncToSync: ['LoadCtrls.js', 'componentManager.js'],
                    packName: 'pack-test.json'
                }
            }
        },
        modules: {
            optimizer: {
                tpl: 'html-compress'
            },
            prepackager: 'autopack'
        }
    })
```
