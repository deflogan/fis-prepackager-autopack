/*
 * fis plug-in
 * http://fis.baidu.com
 * by deflogan
 */

'use strict';

module.exports = function (ret, conf, settings, opt) {
    var fs = require('fs');
    var path = require('path');
    var map = ret.map.res;
    var src = ret.src;
    var conf = fis.config.data;
    var pkg = {};
    var pkgMap = {};
    var asyncMap = {};
    var asyncStack = [];
    var commentStack = [];
    var index = 0;

    var asyncAccess = settings.asyncToSync || [];
    var access = settings.access || 'loadmap.js';
    var asyncAccessRequire = settings.asyncAccessRequire || [];
    var asyncAccess = settings.asyncAccess;
    var asyncToSync = settings.asyncToSync || [];
    var commentRequire = settings.commentRequire || 'com-conf.js';

    var projectPath = fis.project.getProjectPath();
    var packName = settings.manualPackName || 'pack.json';
    var packPath = path.join(projectPath, packName);
    var autoPackPath = path.join(projectPath, 'auto-pack.json');

    var pack = fis.file.wrap(packPath);
    var manualPack = {};
    // debugger;
    if (pack.exists()) {
        // 排除pack.json中已有的文件
        manualPack = JSON.parse(pack.getContent());
        fis.util.map(manualPack, function (i, v) {
            debugger;
            fis.util.map(v, function (g, h) {
                pkgMap['/' + h] = true;
            });
        });
    }

    // debugger;
    fis.util.map(src, function (id, file) {
        // console.dir(id);
        var async = file.extras.async;
        var basename = file.basename;

        if (file.isJsLike && async) {
            // 入口文件
            if (basename === access) {
                async.forEach(function (v, i) {
                    var dep = src[asyncKeyToSrcKey(v)];

                    if (dep.isJsLike) {
                        deployAccess(dep);
                    }
                });
            } else {
                debugger;
                async.forEach(function (v, i) {
                    var path = asyncKeyToSrcKey(v);
                    if (!asyncMap[path]) {
                        if (basename == commentRequire) {
                            commentStack.push(path);
                        } else {
                            asyncStack.push(path);
                        }
                        asyncMap[path] = true;
                    }
                });
            }
        }
    });

    asyncStack = commentStack.concat(asyncStack);

    // console.dir(asyncStack);

    asyncStack.forEach(function (path, i) {
        var file = src[path];

        if (file && ~asyncToSync.indexOf(file.basename)) {
            // console.log(file.basename);
            deployAccess(file, true);
        } else {
            deployAccess(file, false);
        }
    });

    // console.dir(pkg);
    pkg = fis.util.merge(manualPack, pkg);

    fs.openSync(autoPackPath, 'w+');

    fs.writeFileSync(autoPackPath, JSON.stringify(pkg, null, 4));

    function asyncKeyToSrcKey(path) {
        return path.replace(conf.namespace + ':', '/');
    }

    function deployAccess(file, isAsync) {
        if (!file) {
            return;
        }

        var subpath = file.subpath;

        // 已经打包过的异步文件排除
        if (pkgMap[subpath]) {
            return;
        }

        // 异步文件首先打包
        var pkgList = [];
        // pkgMap[subpath] = true;

        getDeps(file, pkgList, isAsync);
        // console.dir(pkgList);

        if (pkgList.length === 0) {
            return;
        } else if (pkgList.length === 1) {
            delete pkgMap['/' + pkgList[0]];
        } else {
            pkg['pkg/pkg' + (++index) + '.js'] = pkgList;
            // console.log('pkg/pkg' + (++index) + '.js');
        }
    }

    function getDeps(file, pkgList, isAsync) {
        var subpath = file.subpath;
        // debugger;
        if (pkgMap[subpath]) {
            return;
        }

        pkgList.push(subpath.slice(1));
        pkgMap[subpath] = true;

        var deps = file.requires;

        if (!Array.isArray(deps)) {
            return;
        }
        // console.log(file.basename);

        // if (index === 0 && pkgList.length === 1 && file.basename === asyncAccess) {
        //     fis.util.map(asyncAccessRequire, function(v, i) {
        //         // console.log(i);
        //         deps.push(conf.namespace + ':' + i);
        //     });
        //     // console.dir(deps);
        //     // deps = deps.concat(accessRequire);
        // }

        if (~asyncToSync.indexOf(file.basename)) {
            deps = deps.concat(file.extras.async || []);
            // console.dir(file.extras.async);
        }

        if (Array.isArray(deps) && deps.length) {
            // console.dir(deps);
            // console.dir(deps);
            deps.forEach(function (v, i) {
                var dep = src[asyncKeyToSrcKey(v)];

                // console.dir(dep);

                if (dep && dep.isJsLike) {
                    getDeps(dep, pkgList);
                }
            })
        }
    }
}