function OrderForm() {
    this.params = {
        from: {},
        to: {},
        comment: '',
        phone: '',
        tariffID: 0,
        carType: '',
        orderTime: +(+new Date() / 1000)
    };
}

OrderForm.prototype.fields = {
    from: {
        'street': '#FIELD_FROM_STREET',
        'house': '#FIELD_FROM_HOUSE',
        'porch': '#FIELD_FROM_PORCH'
    },
    to: {
        'street': '#FIELD_TO_STREET',
        'house': '#FIELD_TO_HOUSE'
    },
    comment: '#FIELD_FROM_COMMENT',
    phone: '#FIELD_PHONE',
    tariffID: '',
    carType: '',
    orderTime: ''
};

OrderForm.prototype.setParam = function (key, value) {
    if (this.params.hasOwnProperty(key)) {
        this.params[key] = value;
    }
};

OrderForm.prototype.getById = function (id) {
    return $(document.getElementById(id));
};

OrderForm.prototype.getBySelector = function (selector) {
    return $(document.querySelector(selector));
};

OrderForm.prototype.getAllBySelector = function (selector) {
    return $(document.querySelectorAll(selector));
};

OrderForm.prototype.getDirection = function ($target) {
    return $target.closest('.direction_input').attr('data-direction');
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

OrderForm.prototype.getFieldByDirection = function (selector, direction) {
    return $('[data-direction="' + direction + '"]').find(selector);
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

OrderForm.prototype.showTariffs = function(tariffs) {
    console.log(tariffs)
};