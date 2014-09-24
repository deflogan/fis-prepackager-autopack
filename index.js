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
    var index = 0;

    var asyncAccess = settings.asyncToSync || [];

    var projectPath = fis.project.getProjectPath();
    var packName = settings.packName || 'pack.json';
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

        if (file.isJsLike && async) {
            // 入口文件
            if (file.basename === settings.access) {
                async.forEach(function (v, i) {
                    var dep = src[asyncKeyToSrcKey(v)];

                    if (dep.isJsLike) {
                        deployAccess(dep);
                    }
                });
            } else {
                async.forEach(function (v, i) {
                    asyncMap[asyncKeyToSrcKey(v)] = true;
                });
            }
        }
    });

    fis.util.map(asyncMap, function (path, i) {
        var file = src[path];

        if (file && ~asyncAccess.indexOf(file.basename)) {
            console.log(file.basename);
            deployAccess(file, true);
        } else {
            deployAccess(file, false);
        }
    });

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

        if (pkgList.length === 0) {
            return;
        } else if (pkgList.length === 1) {
            delete pkgMap['/' + pkgList[0]];
        } else {
            pkg['pkg/pkg' + (++index) + '.js'] = pkgList;
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

        if (~asyncAccess.indexOf(file.basename)) {
            deps = deps.concat(file.extras.async || []);
            // console.log(file.basename);
            // console.dir(file.extras.async);
        }

        if (Array.isArray(deps) && deps.length) {
            console.dir(deps);
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