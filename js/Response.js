function Response(params) {
    var args = params || {};
    this.status = args.status;
    this.statusText = args.statusText;
    this.data = args.data;
    this.result = args.result;
    this.successFunction = args.success;
    this.errorFunction = args.error;
    this.callback = function () {
    };
    this.isSuccessful = args.isSuccessful;
    this.isFail = args.isFail;
}

Response.prototype.beforeSend = function () {
};

Response.prototype.setParam = function (key, value) {
    if (this.hasOwnProperty(key)) {
        this[key] = value;
    }
};

Response.prototype.getStatus = function () {
    return +this.status;
};

Response.prototype.getStatusText = function () {
    return '' + this.statusText;
};

Response.prototype.getData = function () {
    return this.data;
};

Response.prototype.getResult = function () {
    return this.result;
};

Response.prototype.setData = function (data) {
    this.data = data;
};

Response.prototype.isSuccessful = function () {
    return (this.status >= 200 && this.status < 300) || this.status === 304;
};

Response.prototype.getSuccessFunction = function () {
    var successFunction = this.successFunction;
    return TypeHelper.isFunction(successFunction) ? successFunction : function () {
    };
};

Response.prototype.getErrorFunction = function () {
    var errorFunction = this.errorFunction;
    return TypeHelper.isFunction(errorFunction) ? errorFunction : function () {
    };
};

Response.prototype.createSuccessful = function (request, jqXHR, data) {
    this.status = jqXHR.status;
    this.statusText = jqXHR.statusText;
    this.data = data.result;
    this.isSuccessful = true;
    this.callback = request.getSuccessFunction();
};

Response.prototype.createFail = function (request, jqXHR) {

    this.status = jqXHR.status;
    this.statusText = jqXHR.statusText;
    this.data = {
        status: jqXHR.status,
        statusText: jqXHR.statusText
    };
    this.isFail = true;
    this.callback = request.getErrorFunction();
};

Response.prototype.send = function () {
    if (this.isSuccessful) {
        this.beforeSend();
    }
    this.callback(this.getData());
};