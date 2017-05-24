var FactoryTaxiOrder = function self() {

    return new Promise(function (resolve, reject) {
        self.init()
            .then(function (initResponse) {
                var config = initResponse.config;
                var params = initResponse.params;
                self.defineOrderHandler(params)
                    .then(function (orderHandler) {
                        self.createOrderHandler(orderHandler, initResponse)
                            .then(function (response) {
                                resolve(response);
                            })
                    })
            })
    });
}

FactoryTaxiOrder.loadJsMap = function (jsMap) {
    function load(jsMap, ready) {
        var script = document.createElement('script');
        script.src = jsMap[0];
        document.body.appendChild(script);
        script.onload = function () {
            jsMap.splice(0, 1);
            if (jsMap.length) {
                load(jsMap, ready);
            }
            else {
                ready();
            }
        }
    }

    return new Promise(function (resolve, reject) {
        load(jsMap, resolve);
    });
}

FactoryTaxiOrder.init = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        $.getJSON('/include/taxiorder/client.php', {command: 'init'})
            .done(function (response) {
                console.log('ok init')
                console.log(response)
                self.loadJsMap(response.js).then(function () {
                    delete response.js;
                    resolve(response);
                })
            })
            .fail(function (response) {
                console.log('err config')
                console.log(response)
            });
    });
}

FactoryTaxiOrder.defineOrderHandler = function (params) {
    var self = this;
    var taxiOrder;
    return new Promise(function (resolve, reject) {
        if (params.map) {
            taxiOrder = self.createOrderMap;
        }
        else {
            var taxiOrder = self.createOrder;
        }
        resolve(taxiOrder);
    });
}

FactoryTaxiOrder.createOrderHandler = function (handler, settings) {
    return new Promise(function (resolve, reject) {
        handler(settings).then(
            function (response) {
                resolve(response);
            }, function (response) {
                reject(response);
            }
        );
    });
}

FactoryTaxiOrder.createOrder = function (settings) {
    return new Promise(function (resolve, reject) {
        var taxiOrder = new Order(settings);
        resolve(taxiOrder);
    });
}

FactoryTaxiOrder.createOrderMap = function (settings) {
    return new Promise(function (resolve, reject) {
        var taxiOrder = new OrderMap(settings);
        resolve(taxiOrder);
    });
}

var taxiOrder = {
    ready: function (func) {
        FactoryTaxiOrder().then(function (response) {
            taxiOrder = response;
            taxiOrder.hasFormParams = false;
            func(taxiOrder);
        });
    }
}