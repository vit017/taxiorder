function StandartAdapter() {

}

StandartAdapter.prototype = Object.create(AbstractAdapter.prototype);
StandartAdapter.constructor = StandartAdapter;

StandartAdapter.prototype.wrapTimeout = function (func, functionName, timeoutValue) {
    clearTimeout(this[functionName].timeOut);
    this[functionName].timeOut = setTimeout(func, timeoutValue);
};

StandartAdapter.prototype.isCorrectPhone = function (clientPhone) {
    var phone = clientPhone.trim();
    return phone && phone.length;
};

StandartAdapter.prototype.formatOrderTime = function (OrderTime) {
    var addZero = function (val) {
        if (+val < 10) {
            val = '0' + val;
        }
        return val;
    };

    return addZero(OrderTime.getDate()) + '.' + addZero(OrderTime.getMonth() + 1) + '.' + OrderTime.getFullYear() + ' ' + addZero(OrderTime.getHours()) + ':' + addZero(OrderTime.getMinutes()) + ':' + addZero(OrderTime.getSeconds());
};

StandartAdapter.prototype.isAuthorizedPhone = function (phone, yes, no) {
    if (this.authorizePhones.hasOwnProperty(phone)) {
        yes();
        return;
    }

    this.needSendSms(phone, function (need) {
        need ? no() : yes();
    });
};

StandartAdapter.prototype.setAuthorizedPhone = function (params, then) {
    if (!params || !params.phone) {
        return;
    }

    this.authorizePhones[params.phone] = true;

    if (params.browserKey) {
        var
            cookieBrowserKey = {
                name: 'browserKey',
                value: params.browserKey
            };

        this.setCookie(cookieBrowserKey);
    }

    if (params.token) {
        var
            cookieToken = {
                name: 'token',
                value: params.token
            };

        this.setCookie(cookieToken);
    }

    if (TypeHelper.isFunction(then)) {
        then();
    }
};

StandartAdapter.prototype.createEmptyParam = function () {
    return '';
};

StandartAdapter.prototype.isEmptyParam = function (value) {
    return value === this.createEmptyParam();
};

StandartAdapter.prototype.findTariffs = function (success, error) {
    var that = this;

    this.process(new Request({
        url: that.url + 'findTariffs',
        success: success,
        error: error
    }));
};

StandartAdapter.prototype.findCars = function (success, error) {
    var that = this;

    this.process(new Request({
        url: that.url + 'findCars',
        success: success,
        error: error
    }));
};

StandartAdapter.prototype.findGeoObjects = function (clientParams, success, error) {

    var that = this,
        text = clientParams.text.trim();

    if (text.length < 3) {
        return;
    }

    var params = {
        streetPart: text,
        city: clientParams.city || '',
        maxLimit: clientParams.results || 10,
        type: clientParams.type || ''
    };

    this.wrapTimeout(function () {

        that.process(new Request({
            url: that.url + 'findGeoObjects',
            params: params,
            success: success,
            error: error
        }));

    }, 'findGeoObjects', 400);

};

StandartAdapter.prototype.needSendSms = function (clientPhone, success, error) {
    var that = this,
        phone = clientPhone.trim();

    if (!this.isCorrectPhone(phone)) {
        throw new Error('Phone is required');
    }

    var params = {
        phone: phone
    };

    this.process(new Request({
        url: that.url + 'needSendSms',
        params: params,
        success: success,
        error: error
    }));
};

StandartAdapter.prototype.sendSms = function (clientPhone, success, error) {
    var that = this,
        phone = clientPhone.trim();

    if (!this.isCorrectPhone(phone)) {
        throw new Error('Phone is required');
    }

    var params = {
        phone: phone
    };

    this.process(new Request({
        url: that.url + 'sendSms',
        params: params,
        success: success,
        error: error
    }));
};

StandartAdapter.prototype.confirmSms = function (clientParams, success, error) {
    var that = this,
        params = {
            phone: clientParams.phone,
            smsCode: clientParams.smsCode
        };

    this.process(new Request({
        url: that.url + 'login',
        params: params,
        success: success,
        error: error
    }), function () {
        that.setAuthorizedPhone(this.getData())
    });
};

StandartAdapter.prototype.calculateCost = function (clientParams, success, error) {
    var that = this,
        params = {
            fromCity: clientParams.cityFrom,
            fromStreet: clientParams.streetFrom,
            fromHouse: clientParams.houseFrom,
            fromHousing: clientParams.housingFrom,
            fromBuilding: clientParams.buildingFrom,
            fromPorch: clientParams.porchFrom,
            fromLat: clientParams.latFrom,
            fromLon: clientParams.lonFrom,
            toCity: clientParams.toCity,
            toStreet: clientParams.streetTo,
            toHouse: clientParams.houseTo,
            toHousing: clientParams.housingTo,
            toBuilding: clientParams.buildingTo,
            toPorch: clientParams.porchTo,
            toLat: clientParams.latTo,
            toLon: clientParams.lonTo,
            clientName: clientParams.clientName,
            phone: clientParams.phone,
            priorTime: clientParams.orderTime,
            customCarId: clientParams.carID,
            customCar: clientParams.car,
            carType: clientParams.carType,
            carGroupId: clientParams.carGroupID,
            tariffGroupId: clientParams.tariffID,
            comment: clientParams.comment
        };

    var empty = that.createEmptyParam(),
        paramIsEmpty = that.isEmptyParam.bind(that);

    Object.keys(params).forEach(function (key) {
        if (!(params[key])) {
            params[key] = empty;
        }
    });


    if (
        paramIsEmpty(params.fromStreet)
        || paramIsEmpty(params.toStreet)
        || paramIsEmpty(params.tariffGroupId)
    ) {
        return;
    }

    var
        round = Math.round,
        request = new Request({
            url: that.url + 'callCost',
            params: params,
            success: success,
            error: error
        });


    this.process(request, function () {
        /**
         * @this is Response object
         */
        var data = this.getData();
        this.setData({
            length: round(data.summary_distance),
            time: round(data.summary_time),
            cost: round(data.summary_cost)
        });
    });
};

StandartAdapter.prototype.validateParams = function (clientParams, success, error) {
    var
        that = this,
        paramsToValidate = {},
        params = {
            fromCity: clientParams.cityFrom,
            fromStreet: clientParams.streetFrom,
            fromHouse: clientParams.houseFrom,
            fromHousing: clientParams.housingFrom,
            fromBuilding: clientParams.buildingFrom,
            fromPorch: clientParams.porchFrom,
            fromLat: clientParams.latFrom,
            fromLon: clientParams.lonFrom,
            toCity: clientParams.toCity,
            toStreet: clientParams.streetTo,
            toHouse: clientParams.houseTo,
            toHousing: clientParams.housingTo,
            toBuilding: clientParams.buildingTo,
            toPorch: clientParams.porchTo,
            toLat: clientParams.latTo,
            toLon: clientParams.lonTo,
            clientName: clientParams.clientName,
            phone: clientParams.phone,
            priorTime: clientParams.orderTime,
            customCarId: clientParams.carID,
            customCar: clientParams.car,
            carType: clientParams.carType,
            carGroupId: clientParams.carGroupID,
            tariffGroupId: clientParams.tariffID,
            comment: clientParams.comment
        };

    var empty = this.createEmptyParam();
    Object.keys(params).forEach(function (key) {
        if (!(params[key])) {
            params[key] = empty;
        }
        paramsToValidate[key] = params[key];
    });

    params = {
        command: 'createOrder',
        paramsToValidate: paramsToValidate
    };

    this.process(new Request({
        url: that.url + 'validateCommand',
        params: params,
        success: success,
        error: error
    }), function () {
        var data = this.getData();
        if (data.hasErrors) {
            this.setData({
                result: false,
                errors: data.errorsInfo.errors,
                html: data.errorsInfo.summaryHtml,
                text: data.errorsInfo.summaryText
            });
        }
        else {
            this.setData({
                result: true
            });
        }
    });
};

StandartAdapter.prototype.createOrder = function (clientParams, success, error) {
    var that = this,
        params = {
            fromCity: clientParams.cityFrom,
            fromStreet: clientParams.streetFrom,
            fromHouse: clientParams.houseFrom,
            fromHousing: clientParams.housingFrom,
            fromBuilding: clientParams.buildingFrom,
            fromPorch: clientParams.porchFrom,
            fromLat: clientParams.latFrom,
            fromLon: clientParams.lonFrom,
            toCity: clientParams.toCity,
            toStreet: clientParams.streetTo,
            toHouse: clientParams.houseTo,
            toHousing: clientParams.housingTo,
            toBuilding: clientParams.buildingTo,
            toPorch: clientParams.porchTo,
            toLat: clientParams.latTo,
            toLon: clientParams.lonTo,
            clientName: clientParams.clientName,
            phone: clientParams.phone,
            priorTime: clientParams.orderTime,
            customCarId: clientParams.carID,
            customCar: clientParams.car,
            carType: clientParams.carType,
            carGroupId: clientParams.carGroupID,
            tariffGroupId: clientParams.tariffID,
            comment: clientParams.comment
        };

    var empty = this.createEmptyParam();
    Object.keys(params).forEach(function (key) {
        if (!(params[key])) {
            params[key] = empty;
        }
    });

    this.process(new Request({
        url: that.url + 'createOrder',
        params: params,
        success: success,
        error: error
    }));
};

StandartAdapter.prototype.rejectOrder = function (orderID, success, error) {
    var that = this,
        params = {
            orderId: +orderID
        };

    this.process(new Request({
        url: that.url + 'rejectOrder',
        params: params,
        success: success,
        error: error
    }));
};

StandartAdapter.prototype.getOrderInfo = function (orderID, success, error) {
    var that = this,
        params = {
            orderId: +orderID
        };

    this.process(new Request({
        url: that.url + 'getOrderInfo',
        params: params,
        success: success,
        error: error
    }));
};

StandartAdapter.prototype.process = function (request, beforeSendResponse) {
    var that = this,
        response = new Response(),
        xhr = {};

    $.ajax({
        url: request.getUrl(),
        type: request.getMethod(),
        data: request.getParams(),
        dataType: request.getDataType()
    }).done(function (data, textStatus, jqXHR) {
        xhr = jqXHR;
        if (!that.isSuccessfulRequest(data)) {
            jqXHR.status = 400;
            jqXHR.statusText = data ? data.errorMessage : 'Bad Request';
            response.createFail(request, jqXHR);
            return;
        }

        if (TypeHelper.isFunction(beforeSendResponse)) {
            response.beforeSend = beforeSendResponse.bind(response);
        }

        response.createSuccessful(request, jqXHR, data);

    }).fail(function (jqXHR) {
        xhr = jqXHR;
        response.createFail(request, jqXHR);

    }).always(function () {

        response.send();

    });
};

StandartAdapter.prototype.isSuccessfulRequest = function (data) {
    return TypeHelper.checkType(data, {}) && +data.status > 0;
};

StandartAdapter.prototype.setCookie = function (params) {
    Cookies.set(params.name, params.value, params.attributes);
};

StandartAdapter.prototype.removeCookie = function (name) {
    Cookies.remove(name);
};

StandartAdapter.prototype.getCookie = function (name) {
    return Cookies.get(name);
};

StandartAdapter.prototype.orderIsNew = function (OrderInfo) {
    return 'new' === OrderInfo.status;
};

StandartAdapter.prototype.orderInProcess = function (OrderInfo) {
    return !this.orderIsNew(OrderInfo) && !this.orderIsDone(OrderInfo);
};

StandartAdapter.prototype.orderIsDone = function (OrderInfo) {
    return 'completed' === OrderInfo.status || 'rejected' === OrderInfo.status;
};

StandartAdapter.prototype.getCookieForOrder = function () {
    return 'api_order_id';
};