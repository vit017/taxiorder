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
    this.process(new Request({
        url: this.url + 'findTariffs',
        success: success,
        error: error
    }.bind(this)));
};

AbstractAdapter.prototype.findGeoObjects = function (clientParams, success, error) {

    var
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
            url: this.url + 'findGeoObjects',
            params: params,
            success: success,
            error: error
        }.bind(this)));

    }.bind(this), 'findGeoObjects', 400);

};

AbstractAdapter.prototype.needSendSms = function (clientPhone, success, error) {
    var
        phone = clientPhone.trim();

    if (this.isCorrectPhone(phone)) {
        throw new Error('Phone is required');
    }

    var params = {
        phone: phone
    };

    this.process(new Request({
        url: this.url + 'needSendSms',
        params: params,
        success: success,
        error: error
    }.bind(this)));
};

AbstractAdapter.prototype.sendSms = function (clientPhone, success, error) {
    var
        phone = clientPhone.trim();

    if (this.isCorrectPhone(phone)) {
        throw new Error('Phone is required');
    }

    var params = {
        phone: phone
    };

    this.process(new Request({
        url: this.url + 'sendSms',
        params: params,
        success: success,
        error: error
    }.bind(this)));
};

AbstractAdapter.prototype.confirmSms = function (clientParams, success, error) {
    var
        params = {
            phone: clientParams.phone,
            smsCode: clientParams.smsCode
        };

    this.process(new Request({
        url: this.url + 'login',
        params: params,
        success: success,
        error: error
    }.bind(this)));
};

AbstractAdapter.prototype.rejectOrder = function (orderID, success, error) {
    var
        params = {
            orderId: +orderID
        };

    this.process(new Request({
        url: this.url + 'rejectOrder',
        params: params,
        success: success,
        error: error
    }.bind(this)));
};

AbstractAdapter.prototype.getOrderInfo = function (orderID, success, error) {
    var
        params = {
            orderId: +orderID
        };

    this.process(new Request({
        url: this.url + 'getOrderInfo',
        params: params,
        success: success,
        error: error
    }.bind(this)));
};

AbstractAdapter.prototype.process = function (request, beforeSendResponse) {
    var
        that = this,
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
    return typeof data === 'object' && +data.status > 0;
};

AbstractAdapter.prototype.setCookie = function (params) {
    Cookies.set(params.name, params.value, params.attributes);
};

AbstractAdapter.prototype.getCookie = function (name) {
    return Cookies.get(name);
};