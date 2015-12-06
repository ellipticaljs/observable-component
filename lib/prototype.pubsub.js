
//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-event'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-event'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.observable=root.elliptical.observable || {};
        root.elliptical.observable.pubsub = factory(root.elliptical.Event);
        root.returnExports = root.elliptical.observable.pubsub;
    }
}(this, function (Event) {

    return {

        /**
         * publish data to channel
         * @param {string} channel
         * @param {object} data
         * @private
         */
        _publish: function(channel,data){
            Event.emit(channel,data);
        },

        /**
         * get subscriptions Map
         * @private
         */
        _getSubscriptions:function(){
            var subscriptions=this._data.get('subscriptions');
            if(!subscriptions){
                subscriptions=new Map();
            }
            return subscriptions;
        },

        /**
         * subscribe to data/message over channel
         * @param {string} channel
         * @param {function} fn
         * @private
         */
        _subscribe:function(channel,fn){
            var subscriptions=this._getSubscriptions();
            subscriptions.set(channel,fn);
            this._data.set('subscriptions',subscriptions);
            Event.on(channel,fn);
        },

        _bindSubscriptions:function(){
            var callbacks=this._subscriptions;
            for(var prop in callbacks){
                if(callbacks.hasOwnProperty(prop)){
                    var channel=prop;
                    var callback=callbacks[prop];
                    this._subscribe(channel,this[callback].bind(this));
                }
            }
        },

        _subscriptions: {},

        /**
         * unbind subscriptions
         * @private
         */
        _unbindSubscriptions:function(){
            var subscriptions=this._getSubscriptions();
            subscriptions.forEach(function(fn,channel){
                Event.off(channel,fn);
            });
        },

        _disposePubSub:function(){
            this._unbindSubscriptions();
        },

        /**
         *
         * @private
         */
        _dispose:function(){
            this._disposePubSub();
            if(this._super){
                this._super();
            }
        }


    };
}));
