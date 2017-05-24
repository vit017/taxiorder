function Order() {
}
Order.prototype = Object.create(TaxiOrder.prototype);
Order.prototype.constructor = Order;


Order.prototype.findTariffs = function (successCbk, errorCbk) {
    var self = this;

    var method = {
        name: 'findTariffs',
        tryCount: 2
    };
    self.doRequest(method).then(
        function (result) {
            console.log('ok findTariffs');
            successCbk(result);
        },
        function (response) {
            console.log('err findTariffs');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.findGeoObjects = function (params, successCbk, errorCbk) {
    var self = this;

    var method = {
        name: 'findGeoObjects',
        params: {
            maxLimit: params.maxLimit || self.config.request.autoCompleteMaxLimit,
            streetPart: params.part
        },
    };
    self.doRequest(method).then(
        function (result) {
            console.log('ok findGeoObjects');
            console.log(result);
            successCbk(result);
        },
        function (response) {
            console.log('err findGeoObjects');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.calcCost = function (params, successCbk, errorCbk) {
    var self = this;
    var method = {
        name: 'callCost',
        params: params
    };
    self.doRequest(method).then(
        function (result) {
            console.log('ok calcCost');
            console.log(result);
            var res = {
                cost: (result.summaryCost || 0),
                time: (result.summaryTime || 0),
                dist: (result.summaryDistance || 0),
            }
            successCbk(res);
        },
        function (response) {
            console.log('err calcCost');
            console.log(response);
            errorCbk(response);
        }
    );
}
/*
Order.prototype.validateParams = function (params, successCbk, errorCbk) {
    var self = this;
    var params = {
        command: 'createOrder',
        paramsToValidate: params
    }
    var method = {
        name: 'validateCommand',
        params: params
    };
    self.doRequest(method).then(
        function (result) {
            if (!result.hasErrors) {
                console.log('ok validateParams');
                console.log(result);
                successCbk({check: true});
            }
            else {
                console.log('ok wrong2 validateParams');
                console.log(result);
                errorCbk({check: false, errors: result.errorsInfo});
            }
        },
        function (response) {
            errorCbk(response);
        }
    );
}
*/
Order.prototype.needSendSms = function (phone, successCbk, errorCbk) {
    var self = this;
    var phone = '8900';
    var method = {
        name: 'needSendSms',
        params: {
            phone: phone
        }
    };
    self.doRequest(method).then(
        function (result) {
            console.log('ok needSendSms');
            console.log(result);
            if (0 == result) {
                successCbk(false);
            }
            else if (1 == result) {
                successCbk(true);
            }
        },
        function (response) {
            console.log('err needSendSms');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.sendSms = function (phone, successCbk, errorCbk) {
    var self = this;

    var method = {
        name: 'sendSms',
        params: {
            phone: phone
        }
    }
    self.doRequest(method).then(
        function (result) {
            console.log('ok sendSms');
            console.log(result);
            successCbk(result);
        },
        function (response) {
            console.log('err createOrder');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.createOrder = function (params, successCbk, errorCbk) {
    var self = this;

    var method = {
        name: 'createOrder',
        params: params
    }
    self.doRequest(method).then(
        function (result) {
            console.log('ok createOrder');
            console.log(result);
            successCbk(result);
        },
        function (response) {
            console.log('err createOrder');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.getOrderInfoInterval = function (orderId, successCbk, errorCbk) {
    var self = this;

    var timer = setInterval(function () {
        self.getOrderInfo(orderId).then(
            function (result) {
                console.log('ok getOrderInfoInterval');
                console.log(result);
                successCbk(result);
                if ('completed' == result.status || 'rejected' == result.status)
                    clearInterval(timer);
            },
            function (response) {
                console.log('error getOrderInfoInterval')
                console.log(response)
                errorCbk(response);
            }
        );
    }, self.config.request.orderInfoInterval);
}

Order.prototype.getOrderInfo = function (orderId) {
    var self = this;

    var method = {
        name: 'getOrderInfo',
        params: {
            orderId: orderId
        }
    };

    return new Promise(function (resolve, reject) {
        self.doRequest(method).then(
            function (result) {
                resolve(result);
            },
            function (response) {
                reject(response);
            }
        );
    });
}


Order.prototype.validateParams = function (formParams, successCbk, errorCbk) {
    var self = this;
    var params = {
        command: 'createOrder',
        paramsToValidate: formParams
    }
    var method = {
        name: 'validateCommand',
        params: params
    };
    self.doRequest(method).then(
        function (result) {
            if (!result.hasErrors) {
                console.log('ok validateParams');
                console.log(result);
                /*document.getElementById(self.config.html.form.id).dispatchEvent(new CustomEvent('validateParamsTrue', {
                 detail: {
                 check: true,
                 errors: ''
                 }
                 }));*/
                successCbk({check: true});
            }
            else {
                console.log('ok wrong2 validateParams');
                console.log(result);
                /*document.getElementById(self.config.html.form.id).dispatchEvent(new CustomEvent('validateParamsFalse', {
                 detail: {
                 check: false,
                 errors: result.errorsInfo.summaryText
                 }
                 }));*/
                errorCbk({check: false, errors: result.errorsInfo.summaryHtml});
            }
        },
        function (response) {
            errorCbk(response);
        }
    );
}

Order.prototype.needSendSms = function (formPhone, successCbk, errorCbk) {
    var self = this;
    var formPhone = '8900';
    var method = {
        name: 'needSendSms',
        params: {
            phone: formPhone
        }
    };
    self.doRequest(method).then(
        function (result) {
            console.log('ok needSendSms');
            console.log(result);
            if (0 == result) {
                //document.getElementById(self.config.html.form.id).dispatchEvent(new CustomEvent('needSendSmsFalse', {detail: false}));
                successCbk(false);
            }
            else if (1 == result) {
                //document.getElementById(self.config.html.form.id).dispatchEvent(new CustomEvent('needSendSmsTrue', {detail: true}));
                successCbk(true);
            }
        },
        function (response) {
            console.log('err needSendSms');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.sendSms = function(paramsPhone, successCbk, errorCbk) {
    var self = this;

    var method = {
        name: 'sendSms',
        params: {
            phone: paramsPhone
        }
    }
    self.doRequest(method).then(
        function (result) {
            console.log('ok sendSms');
            console.log(result);
            //document.getElementById(self.config.html.form.id).dispatchEvent(new CustomEvent('createOrder', {detail: result}));
            successCbk(result);
        },
        function (response) {
            console.log('err createOrder');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.createOrder = function (formParams, successCbk, errorCbk) {
    var self = this;

    var method = {
        name: 'createOrder',
        params: formParams
    }
    self.doRequest(method).then(
        function (result) {
            console.log('ok createOrder');
            console.log(result);
            self.order = {id: result};
            //document.getElementById(self.config.html.form.id).dispatchEvent(new CustomEvent('createOrder', {detail: result}));
            successCbk(result);
        },
        function (response) {
            console.log('err createOrder');
            console.log(response);
            errorCbk(response);
        }
    );
}

Order.prototype.getOrderInfoInterval = function (params, successCbk, errorCbk) {
    var self = this;

    var timer = setInterval(function () {
        self.getOrderInfo(params.orderId).then(
            function (result) {
                console.log('ok getOrderInfoInterval');
                console.log(result);
                //document.getElementById(self.config.html.form.id).dispatchEvent(new CustomEvent('getOrderInfo', {detail: result}));
                successCbk(result);
                if ('completed' == result.status || 'rejected' == result.status)
                    clearInterval(timer);
            },
            function (response) {
                console.log('error getOrderInfoInterval')
                console.log(response)
                errorCbk(response);
            }
        );
    }, self.config.request.orderInfoInterval);
}

Order.prototype.getOrderInfo = function (orderId) {
    var self = this;

    var method = {
        name: 'getOrderInfo',
        params: {
            orderId: orderId
        }
    };

    return new Promise(function (resolve, reject) {
        self.doRequest(method).then(
            function (result) {
                resolve(result);
            },
            function (response) {
                reject(response);
            }
        );
    });
}

Order.prototype.rejectOrder = function (orderParams, successCbk, errorCbk) {
    var self = this;

    var method = {
        name: 'rejectOrder',
        params: orderParams
    };

    self.doRequest(method).then(
        function (result) {
            successCbk(true);
        },
        function (response) {
            errorCbk(response);
        }
    );
}