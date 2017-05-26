function AbstractForm() {
    throw new Error('AbstractForm constructor');
}

AbstractForm.prototype.setMessenger = function (messenger) {
    this.messenger = messenger;
};

AbstractForm.prototype.startListen = function (eventType, selector, handler) {
    $(selector).on(eventType, handler);
};

AbstractForm.prototype.stopListen = function (eventType, selector, handler) {
    $(selector).off(eventType, handler);
};

AbstractForm.prototype.getEventTarget = function (Event) {
    return $(Event.target);
};

AbstractForm.prototype.preventEvent = function (Event) {
    Event.preventDefault();
};

AbstractForm.prototype.getFields = function () {
    return this.fields;
};

AbstractForm.prototype.getField = function (key) {
    var fields = this.getFields();
    if (fields.hasOwnProperty(key)) {
        return fields[key];
    }

    return null;
};

AbstractForm.prototype.setFieldValue = function (selector, value) {
    return $(selector).val(value);
};

AbstractForm.prototype.getFieldValue = function (selector) {
    return $(selector).val();
};

AbstractForm.prototype.getFieldAttr = function (selector, attribute) {
    return $(selector).attr(attribute);
};

AbstractForm.prototype.getParam = function (key) {
    if (!this.fields.hasOwnProperty(key)) {
        return;
    }

    if (!this.params.hasOwnProperty(key)) {
        return;
    }

    return this.params[key];
};

AbstractForm.prototype.setParam = function (key, value) {
    if (!this.fields.hasOwnProperty(key)) {
        return;
    }

    this.params[key] = value;
    this.afterSetParam(key, value);
};

AbstractForm.prototype.getParams = function () {
    return this.params || {};
};

AbstractForm.prototype.afterSetParam = function (key, value) {

};

AbstractForm.prototype.showPopup = function (content) {
    alert(content);
};

AbstractForm.prototype.showConfirm = function (content, yes, no) {
    yes = TypeHelper.isFunction(yes) ? yes : function () {
    };
    no = TypeHelper.isFunction(no) ? no : function () {
    };

    confirm(content) ? yes() : no();
};