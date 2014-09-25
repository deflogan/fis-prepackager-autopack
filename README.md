一个fis的自动打包插件。
===================================
介绍
----
- 以每个异步加载的js为一个打包模块的入口。
- 自动分析每个异步文件的依赖关系生成打包依赖关系。
- 需要一个入口文件,默认为loadmap.js,是整个项目js入口。
- 会引入用户默认的打包配置（打包css和页面内直接引用的js）,默认为pack.json，以此为基础生成auto-pack.json。
- 一些文件被引用后，暴露的接口一旦执行就执行require.async，这样就相当于require,这一类文件放入asyncToSync。

工作流程
------
1. 首先读取默认的打包配置。
2. 打包从入口进入的这条依赖关系(首屏加载)。
3. 打包widget/com下需要异步加载的模块。
4. 打包其他异步加载的模块。
5. 生成auto-pack.json,可以直接使用或者在此基础上修改。

```
fis.config.merge({
        ...
        settings: {
            prepackager: {
                autopack: {
                    access: 'loadmap.js', // 入口文件
                    asyncToSync: ['init.js', 'LoadCtrls.js', 'componentManager.js', 'ui3SearchBox.js'],// 这些文件内的异步引用将被当做同步处理
                    manualPackName: 'pack-test.json' // 用户手动打好的打包配置
                }
            }
        },
        modules: {
            prepackager: 'autopack' // 使用autopack后，执行fisp release即可在项目根目录生成auto-pack.json
        }
    })
```
