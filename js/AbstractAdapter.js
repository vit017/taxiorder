function AbstractAdapter() {
    throw new Error('AbstractAdapter constructor');
}

AbstractAdapter.prototype.wrapTimeout = function (func, functionName, timeoutValue) {
    clearTimeout(this[functionName].timeOut);
    this[functionName].timeOut = setTimeout(func, timeoutValue);
};

AbstractAdapter.prototype.isCorrectPhone = function (clientPhone) {
    var phone = clientPhone.trim();
    return phone && phone.length;
};

AbstractAdapter.prototype.findTariffs = function (success, error) {
    var that = this;

    this.process(new Request({
        url: that.url + 'findTariffs',
        success: success,
        error: error
    }));
};

AbstractAdapter.prototype.findGeoObjects = function (clientParams, success, error) {

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

        this.process(new Request({
            url: that.url + 'findGeoObjects',
            params: params,
            success: success,
            error: error
        }));

    }, 'findGeoObjects', 400);

};

AbstractAdapter.prototype.needSendSms = function (clientPhone, success, error) {
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

AbstractAdapter.prototype.sendSms = function (clientPhone, success, error) {
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

AbstractAdapter.prototype.confirmSms = function (clientParams, success, error) {
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
    }));
};

AbstractAdapter.prototype.rejectOrder = function (orderID, success, error) {
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

AbstractAdapter.prototype.getOrderInfo = function (orderID, success, error) {
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

AbstractAdapter.prototype.process = function (request, beforeSendResponse) {
    var that = this,
        response = new Response();

    $.ajax({
        url: request.getUrl(),
        type: request.getMethod(),
        data: request.getParams(),
        dataType: request.getDataType()
    }).done(function (data, textStatus, jqXHR) {

        if (!that.isSuccessfulRequest(data)) {
            jqXHR.status = 400;
            jqXHR.statusText = 'Bad Request';
            response.createFail(request, jqXHR);
            return;
        }

        if (TypeHelper.isFunction(beforeSendResponse)) {
            response.beforeSend = beforeSendResponse.bind(response);
        }

        response.createSuccessful(request, jqXHR, data);

    }).fail(function (jqXHR) {

        response.createFail(request, jqXHR);

    }).always(function () {

        response.send();

    });
};

AbstractAdapter.prototype.isSuccessfulRequest = function (data) {
    return TypeHelper.checkType(data, {}) && +data.status > 0;
};

AbstractAdapter.prototype.setCookie = function (params) {
    Cookies.set(params.name, params.value, params.attributes);
};

AbstractAdapter.prototype.getCookie = function (name) {
    return Cookies.get(name);
};