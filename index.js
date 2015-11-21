require('component-extensions');
require('nested-observe');
require('elliptical-event');
require('observe-js');
require('NodeBind');
module.exports={
    observeJs:require('./lib/component.observe-js'),
    cache:require('./lib/prototype.cache'),
    pubsub:require('./lib/prototype.pubsub'),
    scope:require('./lib/prototype.scope'),
    template:require('./lib/prototype.template'),
    report:require('./lib/report')
};