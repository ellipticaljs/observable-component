//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical=root.elliptical || {};
        root.elliptical.observable=root.elliptical.observable || {};
        root.elliptical.observable.report = factory(root.elliptical.utils);
        root.returnExports=root.elliptical.observable.report;
    }
}(this, function (utils) {

    var string=utils.string;


    return {

        /**
         * converts a delimited path into an array of props
         * 'items.0.FirstName' --> [items,0,FirstName]
         *
         * @param path {String}
         * @param separator {String}
         * @returns {Array}
         */
        splitPath:function(path,separator){
            if (typeof separator == 'undefined') {
                separator = '.';
            }
            if ((typeof path ==='undefined') || path === '') {
                return [];
            } else {
                if (Array.isArray(path)) {
                    return path.slice(0);
                } else {
                    return path.toString().split(separator);
                }
            }
        },

        /**
         * resolves the value of an object path
         * obj, 'items.0.FirstName'  --> 'John'
         *
         * @param obj {Object}
         * @param path {String}
         * @returns value {Object}
         */
        getObjValueByPath: function(obj,path){
            try{
                var pathArray=this.splitPath(path);
                var a=obj;
                pathArray.forEach(function(p){
                    var b=a[p];
                    a=b;
                });
                return a;
            }catch(ex){
                return undefined;
            }
        },

        /**
         * sets the value of an object path
         * @param obj {Object}
         * @param path {String}
         * @param value {Object}
         */
        setObjValueByPath:function(obj,path,value){
            try{
                var pathArray=this.splitPath(path);
                var a=obj;
                var len=pathArray.length;
                var max=len-1;
                for(var i=0;i<len;i++){
                    if(i===max){
                        a[pathArray[i]]=value;
                    } else{
                        var b=a[pathArray[i]];
                        a=b;
                    }
                }
            }catch(ex){

            }
        },

        /**
         * maps dot normalized path a.i.b to bracket format: a[i]b
         * @param path {String}
         * @returns {String}
         */
        bracketPathFormat:function(path){
            var arr=this.splitPath(path);
            var num=utils.isNumeric;
            if(arr && arr.length){
                var mapped=arr.map(function(v){
                    return (num(v)) ? '['+ v.toString() + ']' : v;
                });

                return mapped.join('.').replace(/.\[/,'[');

            }else{
                return path;
            }
        },

        /**
         * returns an object of changed props when comparing new object with old object
         * @param n {Object}
         * @param o {Object}
         * @returns {Object}
         */
        objChangedProps:function(n,o){
            var obj={};
            var keys= this.keys(n);
            keys.forEach(function(v){
                if(!(utils.isEqual(n[v],o[v]))){
                    obj[v]=n[v];
                }
            });
            return obj;
        },

        /**
         *
         * @param obj
         * @param index
         * @returns {boolean}
         */
        isPropertyArray:function(obj,index){
            try{
                var o=obj[Object.keys(obj)[index]];
                return !!((Array.isArray(o)));
            }catch(ex){
                return false;
            }
        },

        /**
         * gets the value of an object prop by index
         * @param obj {Object}
         * @param index {Number}
         * @returns value
         */
        propertyByIndex:function(obj,index){
            return obj[Object.keys(obj)[index]];
        },


        /**
         * change record entity
         */
        changeRecord:{
            get entity(){
                return{
                    object:undefined,
                    value:undefined,
                    oldValue:undefined,
                    path:undefined,
                    name:undefined,
                    root:undefined

                }
            },

            get result(){
                return {
                    added:[],
                    changed:[],
                    removed:[]
                };
            }
        },

        keys:function(obj){
            var keys=[];
            for(var prop in obj){
                if (obj.hasOwnProperty(prop)) {
                    keys.push(prop);
                }
            }
            return keys;
        },

        isArrayList: function (obj) {
            if (Array.isArray(obj)) {
                return obj;
            } else {
                var keys = this.keys(obj).length;
                if (keys > 1) {
                    return null;
                } else {
                    //else if keys <=1, test if first prop is an array list
                    var o = obj[Object.keys(obj)[0]];
                    return (Array.isArray(o)) ? o : null;
                }
            }

        },

        pathReplace:function(p){
            var n= p.replace(/\//g,'.');
            if(string.firstChar(n)==='.'){
                n=string.trimFirstChar(n);
            }
            return n;
        },

        objDiffReport:function(obj,changeRecords){
            var result=this.changeRecord.result;
            var self=this;
            var _o=this.isArrayList(obj);
            var path_;
            if(changeRecords && changeRecords.length){
                changeRecords.forEach(function(c){
                    if(_o){
                        if(c.addedCount && c.addedCount>0 && c.type==='splice'){
                            result.added.push(c.object[c.index]);
                        }
                        if(c.removed && c.removed.length>0 && c.type==='splice'){
                            result.removed=result.removed.concat(c.removed);
                        }
                        if(c.type==='update'){
                            path_=self.pathReplace(c.path);
                            var u_={
                                object: c.object,
                                value: c.value,
                                oldValue: c.oldValue,
                                path: path_,
                                name: c.name,
                                root: c.root
                            };
                            result.changed.push(u_);
                        }
                    }else{
                        path_=self.pathReplace(c.path);
                        var chg_={
                            object: c.object,
                            value:c.object[c.name],
                            oldValue: c.oldValue,
                            path:path_,
                            name: c.name,
                            root: c.root
                        };

                        result.changed.push(chg_);
                    }
                });
            }

            return result;
        }


    };
}));
