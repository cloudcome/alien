/*!
 * utils/class.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/class', function () {
    'use strict';

    var currentScript = coolie.getCurrentScript();
    var currentScriptURL = coolie.getScriptURL(currentScript);
    var host = coolie.getHost(currentScriptURL);
    var dir = coolie.getPathDir(currentScriptURL);

    coolie.config({
        base: host + coolie.getPathJoin(dir, '../../src/'),
    }).use('./utils/class.js');


    it('.extend & .create', function (done) {
        coolie.callback(function (klass) {
            // ============= Father =============
            var Father = klass.create(function () {
                this.name = 'Father';
            });
            Father.type1 = 'Father';
            Father.prototype.hehe = 'hehe';


            // ============= Child =============
            var Child = klass.extends(Father, true).create({
                constructor: function () {
                    this.name = 'Child';
                },
                heihei: 'heihei'
            });
            Child.type2 = 'Child';


            // ============= Tom =============
            var Tom = klass.extends(Child, false).create({
                constructor: function () {
                    this.name = 'Tom';
                },
                huhu: 'huhu'
            });
            Tom.type3 = 'Tom';



            var father = new Father();
            var child = new Child();
            var tom = new Tom();

            // 原型
            expect(father.constructor === Father).toEqual(true);
            expect(father instanceof Father).toEqual(true);
            expect(child.constructor === Child).toEqual(true);
            expect(child instanceof Child).toEqual(true);
            expect(tom.constructor === Tom).toEqual(true);
            expect(tom instanceof Tom).toEqual(true);


            // 静态
            expect(Father.type1).toEqual('Father');
            expect(Child.type1).toEqual('Father');
            expect(Child.type2).toEqual('Child');
            expect(Tom.type1).toBeUndefined();
            expect(Tom.type2).toBeUndefined();
            expect(Tom.type3).toEqual('Tom');


            // 实例
            expect(father.name).toEqual('Father');
            expect(father.hehe).toEqual('hehe');
            expect(father.heihei).toBeUndefined();

            expect(child.name).toEqual('Child');
            expect(child.hehe).toEqual('hehe');
            expect(child.heihei).toEqual('heihei');

            expect(tom.name).toEqual('Tom');
            expect(tom.hehe).toEqual('hehe');
            expect(tom.heihei).toEqual('heihei');
            expect(tom.huhu).toEqual('huhu');

            done();
        });
    });
});