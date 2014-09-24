一个fis的自动打包插件，主要针对pcmap业务。
===================================
- 自动分析依赖关系
- 需要一个入口文件
- 用户可以自定义默认的打包配置，默认为pack.json，以此为基础生成auto-pack.json的打包配置。

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
