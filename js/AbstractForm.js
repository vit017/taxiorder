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

AbstractForm.prototype.setParam = function(key, value) {
    if (this.fields.hasOwnProperty(key)) {
        this.params[key] = value;
    }
};