//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.observable=root.elliptical.observable || {};
        root.elliptical.observable.template = factory(root.elliptical.utils,root.elliptical.observable.report);
        root.returnExports = root.elliptical.observable.template;
    }
}(this, function (utils,report) {
    var INTERVAL_COUNT=8;
    var INTERVAL_DELAY=500;
    var random=utils.random;
    var object=utils.object;
    var string=utils.string;

    return {

        /**
         *
         * @private
         */
        _initTemplateElement:function(){
            var scopeBind=(this.options) ? this.options.scopeBind : this.scopeBind;
            if (scopeBind === undefined) scopeBind=true;
            if(scopeBind){
                this._watch();
            }
            this._setAutoRebind();
            this._initPathObservers();
            this._data.set('templateId',null);
            this._data.set('templateNode',null);

        },

        /**
         *
         * @private
         */
        _setAutoRebind: function(){
            var autoRebind=(this.options) ? this.options.autoRebind : this.autoRebind;
            if (autoRebind === undefined) autoRebind=true;
            this._data.set('autoRebind',autoRebind);
        },

        /**
         *
         * @private
         */
        _initPathObservers:function(){
            this._data.set('pathObservers',[]);
        },

        /**
         *
         * @private
         */
        _disconnectPathObservers:function(){
            var pathObservers=this._data.get('pathObservers');
            pathObservers.forEach(function(observer){
                observer.disconnect();
            });
            pathObservers=null;
        },

        /**
         *
         * @private
         */
        _watch:function(){
            var count=0;
            var self=this;
            var intervalId=setInterval(function(){
                if(self.__isReady()){
                    var templateId=self._getTemplateId();
                    if(templateId){
                        self._data.set('templateId',templateId);
                        clearInterval(intervalId);
                        self.__render();
                    }else{
                        var templateNode=self._getTemplateNode();
                        if(templateNode){
                            clearInterval(intervalId);
                            self._data.set('templateNode',templateNode);
                            templateId=self._setTemplateId(templateNode);
                            self._precompileTemplate(templateNode,templateId);
                            self.__render();
                        }else{
                            if(count > INTERVAL_COUNT){
                                clearInterval(intervalId);
                            }
                            count++;
                        }
                    }
                }else{
                    if(count > INTERVAL_COUNT){
                        clearInterval(intervalId);
                    }
                    count++;
                }
            },INTERVAL_DELAY);

        },

        /**
         *
         * @returns {*}
         * @private
         */
        __isReady:function(){
            if(object.isEmpty(this.$scope)){
                return false;
            }else{
                return this._isReady();
            }
        },

        /**
         *
         * @returns {boolean}
         * @private
         */
        _isReady:function(){
            return true;
        },

        /**
         *
         * @returns {*}
         * @private
         */
        _getTemplateId:function(){
            var node=this._getTemplateNode();
            if(node){
                var attr=node.getAttribute('template');
                if(attr==='') return null;
                else{
                    return attr;
                }
            }else{
                return null;
            }
        },

        /**
         *
         * @returns {*}
         * @private
         */
        _getTemplateNode:function(){
            var element=this.element;
            var template=element.selfFind('[template]');
            if(template[0]){
                return template[0];
            }else{
                return null;
            }
        },

        /**
         *
         * @param node
         * @returns {string}
         * @private
         */
        _setTemplateId:function(node){
            var id='tmpl-' + random.str(6);
            node.setAttribute('template',id);
            this._data.set('templateId',id);
            return id;
        },

        /**
         *
         * @private
         */
        _setVisibility:function(){
            var templateNode=this._data.get('templateNode');
            if(templateNode){
                templateNode.classList.add('visible');
            }
        },

        /**
         *
         * @private
         */
        _connectDOMObserver:function(){
            var templateNode=this._data.get('templateNode');
            $(templateNode).mutationSummary('connect', this.__onMutation.bind(this), [{ all: true }]);
        },

        /**
         *
         * @private
         */
        _disconnectDOMObserver:function(){
            var templateNode=this._data.get('templateNode');
            $(templateNode).mutationSummary('disconnect');
        },

        /**
         *
         * @param summary
         * @private
         */
        __onMutation:function(summary){
            if(summary.added){
                this._onMutationAdded(summary.added)
            }
            if(summary.removed){
                this._onMutationRemoved(summary.removed);
            }
        },

        /**
         *
         * @param added
         * @private
         */
        _onMutationAdded:function(added){},

        /**
         *
         * @param removed
         * @private
         */
        _onMutationRemoved:function(removed){},

        /**
         *
         * @private
         */
        __render:function(){
            var self=this;
            var twoWayBind=(this.options) ? this.options.twoWayBind : this.twoWayBind;
            if(twoWayBind===undefined) twoWayBind=true;
            var templateNode=this._data.get('templateNode');
            var templateId=this._data.get('templateId');
            this._render(templateNode,templateId,this.$scope,function(err,out){
                if(twoWayBind){
                   self.__dataBind(templateNode);
                }
                self._setVisibility();
                self._connectDOMObserver();
            });
        },

        /**
         *
         * @param templateNode
         * @private
         */
        __dataBind:function(templateNode){
            var pathObservers=this._data.get('pathObservers');
            var self=this;

            var parseNode =function(node){
                if (node.nodeType !== 3) {
                    if (node.hasAttributes && node.hasAttributes()) {
                        parseNodeAttributes(node);
                    }
                }
            };

            var parseNodeAttributes =function(node){
                $.each(node.attributes,function(i,attribute){
                    if(attribute && attribute.name==='data-bind' && attribute.value !==undefined && attribute.value !==''){
                        var value=attribute.value.trim();
                        var ntuple=value.split(':');
                        var bindingType=ntuple[0];
                        (bindingType==='text') ? bindTextNodeObserver(node,ntuple) : bindAttributeObserver(node,ntuple);
                    }

                });
            };

            var bindTextNodeObserver =function(node,tuple){
                var fn={};
                if(tuple.length > 2){
                    fn=parseFunction(tuple[2]);
                }
                var path = tuple[1];
                var value = report.getObjValueByPath(self.$scope, path);

                /* if the tuple has a function attached, evaluate the value from the function */
                if(!object.isEmpty(fn)){
                    value=eval_(value,fn);
                    //update the path value of scope
                    utils.setObjValueByPath(self.$scope,path,value);
                }
                var text=self.__createTextNode(node,value);
                path=report.bracketPathFormat(path);
                var observer = new PathObserver(self.$scope, path);
                text.bind('textContent', observer);

                pathObservers.push(observer);

            };

            var bindAttributeObserver =function(node,tuple){
                var fn={};
                var attr=tuple[0];
                if(tuple.length > 2){
                    fn=parseFunction(tuple[2]);
                }
                var path = tuple[1];
                var value = report.getObjValueByPath(self.$scope, path);

                /* if the tuple has a function attached, evaluate the value from the function */
                if(!object.isEmpty(fn)){
                    value=eval_(value,fn);
                    //update the path value of scope
                    utils.setObjValueByPath(self.$scope,path,value);
                }
                path=report.bracketPathFormat(path);
                var observer = new PathObserver(self.$scope, path);
                node.bind(attr, observer);

                pathObservers.push(observer);

            };

            var parseFunction =function (sFunc){
                var argList;
                var args=sFunc.match(/\((.*?)\)/g);
                if(!args){
                    args='';
                }
                var func=sFunc.replace(args,'');
                args=args.replace('(','');
                args=args.replace(')','');
                if(args.length < 1){
                    argList=[]
                }else{
                    argList=args.split(',');
                }

                return{
                    func:func,
                    args:argList
                }
            };

            var eval_ =function(value,fn){
                var func=fn.func;
                var f,args;
                if(window.dust.helpers.inline[func]){//dust.helpers.inline
                    f=window.dust.helpers.inline[func];
                    args=fn.args;
                    (args.length >0) ? args.unshift(value) : args.push(value);
                    return f.apply(this,args);
                }else if(window[func]){//window
                    f=window[func];
                    args=fn.args;
                    (args.length >0) ? args.unshift(value) : args.push(value);
                    return f.apply(this,args);
                }else if(self[func]){ //element prototype
                    f=self[func];
                    args=fn.args;
                    (args.length >0) ? args.unshift(value) : args.push(value);
                    return f.apply(self,args);
                }else{
                    return value;
                }
            };


            this._traverseDOM(templateNode,parseNode);
        },

        /**
         * standard walk-the-dom recursion
         * @param node {Element}
         * @param func {Function}
         * @private
         */
        _traverseDOM:function(node,func){
            func(node);
            node = node.firstChild;
            while (node) {
                this._traverseDOM(node, func);
                node = node.nextSibling;
            }
        },

        /**
         *
         * @param node
         * @param value
         * @returns {*|Text}
         * @private
         */
        __createTextNode: function(node,value){
            var $node=$(node);
            var text=$node.text();
            if(text)  text=text.replace(value,'');
            else{
                text=value;
            }
            $node.text(text);
            var textNode=document.createTextNode(value);
            node.appendChild(textNode);

            return textNode;
        },

        /**
         *
         * @param result
         * @private
         */
        __onScopeChange: function(result){
            if(!this._passScopeFilter(result)) return;
            var autoRebind=this._data.get('autoRebind');
            if(autoRebind){
                if(result.removed && result.removed.length && result.removed.length > 0) {
                    this._rebind();
                }else if(result.added && result.added.length && result.added.length > 0){
                    this._rebind();
                }
            }

            this._onScopeChange(result);
        },

        /**
         *
         * @param result
         * @returns {*}
         * @private
         */
        _passScopeFilter:function(result){
            if(result.changed.length > 0){
                return this._filterScopeChange(result.changed);
            }else if(result.added >0){
                return this._filterScopeChange(result.added);
            }else if(result.removed.length > 0){
                return this._filterScopeChange(result.removed);
            }
        },

        /**
         *
         * @param arr
         * @returns {boolean}
         * @private
         */
        _filterScopeChange:function(arr){
            var bool=false;
            arr.forEach(function(record){
                if(string.firstChar(record.name)!=='$') bool=true;
            });
            return bool;
        },

        /**
         *
         * @private
         */
        _rebind:function(){
            this._dispose();
            this._initPathObservers();
            this.__render();
        },

        /**
         *
         * @private
         */
        _dispose:function(){
            this._disconnectDOMObserver();
            this._disconnectPathObservers();
            if(this._super){
                this._super();
            }
        },

        /**
         *
         */
        $rebind:function(){
            this._rebind();
        }

    };
}));