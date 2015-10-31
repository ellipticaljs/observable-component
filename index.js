


module.exports.component=require('component-extensions');
module.exports.observe=require('Object.observe');
module.exports.nestedObserve=require('nested-observe');
module.exports.event=require('elliptical-event');
module.exports.observeJs=require('observe-js');
module.exports.nodeBind=require('NodeBind');
module.exports.observable={
    observeJs:require('./lib/component.observe-js'),
    cache:require('./lib/prototype.cache'),
    pubsub:require('./lib/prototype.pubsub'),
    scope:require('./lib/prototype.scope'),
    template:require('./lib/prototype.template'),
    report:require('./lib/report')
};