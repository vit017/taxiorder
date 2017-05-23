function Request(args) {
    this.url = args.url || '';
    this.params = args.params || {};
    this.successFunction = args.success;
    this.errorFunction = args.error;
    this.method = args.method || '';
    this.dataType = args.dataType || '';
}

Request.prototype.setParam = function (key, value) {
    if (this.hasOwnProperty(key)) {
        this[key] = value;
    }
};

Request.prototype.getUrl = function () {
    return '' + this.url;
};

Request.prototype.getMethod = function () {
    var method = ('' + this.method).trim();
    return method ? method : 'POST';
};

Request.prototype.getDataType = function () {
    var dataType = ('' + this.dataType).trim();
    return dataType ? dataType : 'JSON';
};

Request.prototype.getParams = function () {
    var params = this.params;
    return TypeHelper.isObject(params) ? params : {};
};

Request.prototype.getSuccessFunction = function () {
    var successFunction = this.successFunction;
    return TypeHelper.isFunction(successFunction) ? successFunction : function () {
    };
};

Request.prototype.getErrorFunction = function () {
    var errorFunction = this.errorFunction;
    return TypeHelper.isFunction(errorFunction) ? errorFunction : function () {
    };
};