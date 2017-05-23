function Response(args) {
    this.status = args.status;
    this.statusText = args.statusText;
    this.data = args.data;
    this.successFunction = args.success;
    this.errorFunction = args.error;
}

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