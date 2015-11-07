
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-utils'),require('./report'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-utils','./report'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.observable=root.elliptical.observable || {};
        root.elliptical.observable.scope = factory(root.elliptical.utils,root.elliptical.observable.report);
        root.returnExports = root.elliptical.observable.scope;
    }
}(this, function (utils,report) {
    var object=utils.object;

    return {

        /**
         *
         * @private
         */
        _initScopeElement:function(){
            var scopeBind=(this.options) ? this.options.scopeBind : this.scopeBind;
            var idProp=(this.options) ? this.options.idProp : this.idProp;
            if(scopeBind===undefined) scopeBind=true;
            this._data.set('scopeTimeoutId',null);
            this._data.set('scopeObserver',null);
            this._data.set('scopeId',idProp);
            this.__initScope();
            if(this.__bindByDataAttribute()) this._setObservable();
            else{
                if(scopeBind){
                    this.__initScopeObservable();
                }
            }
        },

        /**
         * init a $scope on the instance
         * @private
         */
        __initScope:function(){
            this.$scope={};
        },

        /**
         * init a watcher that binds an observable to the $scope when it becomes non-empty
         * terminates itself when it calls _setObservable
         * the init watcher avoids the initial $scope setting by the developer firing a change event
         * since an inherited parent's _initElement event is sequentially is going to fire before the element's _initElement
         * @private
         */
        __initScopeObservable:function(){
            var self = this;
            var MAX_COUNT=5;
            var count=0;
            var timeoutId=setInterval(function(){
                self._data.set('scopeTimeoutId',timeoutId);
                var isEmpty=object.isEmpty(self.$scope);
                if(!isEmpty){
                    clearInterval(timeoutId);
                    self._setObservable();
                }else {
                    if(count <= MAX_COUNT){
                        count++;
                    }else{
                        clearInterval(timeoutId);
                    }
                }
            },300);
        },

        /**
         *
         * @returns {boolean}
         * @private
         */
        __bindByDataAttribute:function(){
            var data=(this.options) ? this.options.data : this.data;
            if(data===undefined)return false;
            data=JSON.parse(data);
            var scope=(this.options) ? this.options.scope : this.scope;
            if(scope) this.$scope[scope]=data;
            else{
                this.$scope=data;
            }
            return true;
        },

        /**
         * set the observable
         * @private
         */
        _setObservable:function(){
            if(this._data.get('scopeObserver')) return;
            var $scope = this.$scope;
            var self=this;
            var observer = new ObjectObserver($scope,true);
            observer.open(function (result) {
                self.__onScopeChange(result);
            });
            /* save reference to the observer instance */
            this._data.set('scopeObserver',observer);
        },

        /**
         * destroy the scope observable
         * @private
         */
        __destroyObservable:function(){
            var scopeObserver=this._data.get('scopeObserver');
            if(scopeObserver){
                scopeObserver.disconnect_();
                scopeObserver=null;
                this.$scope=null;
            }
        },

        /**
         * reset observable
         * @private
         */
        __resetObservable: function(){
            this.__destroyObservable();
            this._setObservable();
        },


        /**
         * returns scope length...(-1)==object, not array
         * @returns {Number}
         * @controller
         */
        __scopeLength:function(obj){
            var scope=(typeof obj==='undefined') ? this.$scope : obj;
            if(report.isPropertyArray(scope,0)){
                var arr=report.propertyByIndex(scope,0);
                return arr.length;
            }else{
                return -1;  //object
            }
        },


        /**
         * recycles the observable
         * @private
         */
        __recycle:function(){
            this.__destroyObservable();
            this._setObservable();
        },


        /**
         * hook for scope observable change
         *
         * @param result {Object}
         * @controller
         */
        __onScopeChange:function(result){
            this._onScopeChange(result);
        },


        /**
         * returns changed object properties from the result param in _onScopeChange
         * @param obj
         * @returns {Object}
         * @private
         */
        _objectChange:function(obj){
            if(obj !==undefined){
                if(obj.object && obj.oldObject){
                    return report.objChangedProps(obj.object,obj.oldObject);
                }else{
                    var chg_={};
                    chg_[obj.name]=obj.value;
                    return chg_;
                }
            }
        },

        _disposeScope:function(){
            this.__destroyObservable();
        },

        /**
         * destroy clean-up
         * @private
         */
        _dispose:function(){
            this._disposeScope();
            if(this._super){
                this._super();
            }
        },

        /**
         *
         * @private
         */
        _onScopeChange: function (){},

        /**
         *
         * @private
         */
        _onScopeBind: function(){},

        /**
         * asynchronous $scope property setter for browsers that have polyfilled Object.observe
         * if Object.observe is native, defaults to a simple synchronous setter
         * @param prop {String}
         * @param value {Object} []
         * @param obj {Object} [optional object property on the $scope]
         */
        _scopeSetter: function (prop, value, obj) {
            var delay=(this.options) ? this.options.scopeSetterDelay : this.scopeSetterDelay;
            if(delay===undefined){
                delay=300;
            }
            var polyfilled = (window.__observePolyfill !== undefined);
            var $scope = this.$scope;
            if (typeof obj === 'undefined') {
                if (polyfilled) {
                    setTimeout(function () {
                        $scope[prop] = value;
                    }, delay);
                } else {
                    $scope[prop] = value; //just set if native observe
                }
            } else {
                if (polyfilled) {
                    setTimeout(function () {
                        $scope[obj][prop] = value;
                    }, delay);
                } else {
                    $scope[obj][prop] = value; //just set if native observe
                }
            }
        },

        /**
         * gives the difference between two objects
         * @param n {Object}
         * @param o {Object}
         * @returns {Object}
         * @public
         */
        _changeReport:function(n,o){
            return report.objChangedProps(n,o);
        },

        /**
         *
         * @param val
         */
        $setScope: function(val){
            if(val!==undefined) this.$scope=val;
            this._setObservable();
            this._onScopeBind();
        }
    };
}));