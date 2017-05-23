function OrderForm() {

}

OrderForm.prototype.getById = function (id) {
    return document.getElementById(id);
};

OrderForm.prototype.getBySelector = function (selector) {
    return document.querySelector(selector);
};

OrderForm.prototype.getAllBySelector = function (selector) {
    return document.querySelectorAll(selector);
};

OrderForm.prototype.addEvent = function (eventType, selector, handler) {
    $(selector).on(eventType, handler);
};

OrderForm.prototype.removeEvent = function (eventType, selector, handler) {
    $(selector).off(eventType, handler);
};

OrderForm.prototype.getEventTarget = function (Event) {
    return $(Event.target);
};

OrderForm.prototype.setFieldValue = function (selector, value) {
    $(selector).val(value);
};

OrderForm.prototype.getFieldValue = function (selector) {
    return $(selector).val();
};

OrderForm.prototype.getFieldContent = function (selector) {
    return $(selector).text();
};

OrderForm.prototype.setFieldAttr = function (selector, attr, value) {
    return $(selector).attr(attr, value);
};

OrderForm.prototype.getFieldAttr = function (selector, attr) {
    return $(selector).attr(attr);
};