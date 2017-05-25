function DemoNewForm() {
    this.params = {};
    this.messenger = {};

    this.setFields();
    this.initParamsEvents();
}

DemoNewForm.prototype = Object.create(AbstractForm.prototype);
DemoNewForm.constructor = DemoNewForm;

DemoNewForm.prototype.setFields = function () {
    this.fields = {
        cityFrom: '',
        streetFrom: '#FIELD_FROM_STREET',
        autocompleteFrom: '#FIELD_FROM_AUTOCOMPLETE_STREET',
        houseFrom: '#FIELD_FROM_HOUSE',
        porchFrom: '#FIELD_FROM_PORCH',
        cityTo: '',
        streetTo: '#FIELD_TO_STREET',
        autocompleteTo: '#FIELD_TO_AUTOCOMPLETE_STREET',
        houseTo: '#FIELD_TO_HOUSE',
        comment: '#FIELD_FROM_COMMENT',
        phone: '#FIELD_PHONE',
        tariffID: '#FIELD_TARIFFS',
        cost: '#RESULT_COST_SUM',
        orderTime: '#FIELD_TIME',
    };
};

DemoNewForm.prototype.initParamsEvents = function () {
    var calculateCost = this.calculateCost.bind(this);

    this.fieldsRaiseEvents = {
        streetFrom: [calculateCost],
        houseFrom: [calculateCost],
        porchFrom: [calculateCost],
        streetTo: [calculateCost],
        houseTo: [calculateCost],
        tariffID: [calculateCost],
        orderTime: [calculateCost]
    };
};

DemoNewForm.prototype.getFieldsEvents = function () {
    return this.fieldsRaiseEvents;
};

DemoNewForm.prototype.waitFieldsEvents = function () {
    var
        that = this,
        fields = this.getFields(),
        addressFields = [
            'streetFrom',
            'houseFrom',
            'porchFrom',
            'streetTo',
            'houseTo',
            'phone',
            'comment'
        ];

    addressFields.forEach(function (field) {
        if (fields.hasOwnProperty(field)) {
            that.startListen('blur', fields[field], that.fieldChanged.bind(that, field));
        }
    });
};

DemoNewForm.prototype.fieldChanged = function (field, Event) {
    var
        that = this,
        $target = this.getEventTarget(Event);

    this.setParam(field, that.getFieldValue($target));
    console.log(this)
};

DemoNewForm.prototype.findTariffs = function () {
    var
        $target = $(this.getField('tariffID'));

    this.messenger.findTariffs(function (tariffs) {
        this.setTariffs($target, tariffs);
        this.showTariffs($target);
        this.waitTariffChange();
    }.bind(this));
};

DemoNewForm.prototype.setTariffs = function ($target, tariffs) {
    var
        $documentFragment = $(document.createDocumentFragment()),
        option = {};

    tariffs.forEach(function (tariff) {
        option = document.createElement('option');
        option.value = tariff.id;
        option.text = tariff.label;
        $documentFragment.append(option);
    });

    $target.append($documentFragment);
};

DemoNewForm.prototype.showTariffs = function ($target) {
    $target.show();
};

DemoNewForm.prototype.waitTariffChange = function () {
    this.startListen('change', this.getField('tariffID'), function (Event) {
        var
            $target = this.getEventTarget(Event),
            tariffID = +this.getFieldValue($target);

        this.setParam('tariffID', tariffID);
    }.bind(this));
};

DemoNewForm.prototype.calculateCost = function (Event) {
    var
        that = this,
        $target = $(this.getField('cost'));

    setTimeout(function () {
        that.messenger.calculateCost(that.params, function (cost) {
            that.setCost($target, cost);
            that.showCost($target);
        }.bind(that), function (e) {
            console.error(e)
        });
    }, 200);
};

DemoNewForm.prototype.setCost = function ($target, cost) {
    console.log(cost);
};

DemoNewForm.prototype.showCost = function ($target) {

};

DemoNewForm.prototype.waitGeoObjects = function () {
    var
        streetFrom = this.getField('streetFrom'),
        streetTo = this.getField('streetTo');

    this.startListen('keyup', streetFrom + ',' + streetTo, this.findGeoObjects.bind(this));
};

DemoNewForm.prototype.findGeoObjects = function (Event) {
    var
        $target = this.getEventTarget(Event),
        text = this.getFieldValue($target),
        $autocomplete = $(this.getFieldAttr($target, 'data-autocomplete'));

    this.messenger.findGeoObjects({text: text}, function (objects) {
        this.setGeoObjects($autocomplete, objects);
        this.showGeoObjects($autocomplete);
        this.waitGeoObjectClick();
    }.bind(this));
};

DemoNewForm.prototype.setGeoObjects = function ($target, objects) {
    var
        $fragment = $(document.createDocumentFragment());

    objects.forEach(function (object) {
        $fragment.append("<li class='geoobject' data-res='" + JSON.stringify(object) + "'>" + object.label + "</li>");
    });

    $target.append($fragment);
};

DemoNewForm.prototype.showGeoObjects = function ($target) {
    $target.addClass('active_autocomplete');
    $target.parents('.di_invisible').find('.dii_step').hide();
    $target.parents('.di_invisible').find('.ds_1').show();
};

DemoNewForm.prototype.waitGeoObjectClick = function () {
    this.startListen('click', '.geoobject', this.geoObjectChoosen.bind(this));
};

DemoNewForm.prototype.geoObjectChoosen = function (Event) {
    var
        $object = this.getEventTarget(Event),
        objectAddress = JSON.parse(this.getFieldAttr($object, 'data-res')),
        direction = this.defineDirection($object),
        field = 'from' === direction ? 'streetFrom' : 'streetTo',
        $street = $(this.getField(field)),
        $autocomplete = $(this.getFieldAttr($street, 'data-autocomplete'));

    this.setFieldValue($street, $object.text());
    this.setParam(field, objectAddress.address.street);

    this.hideGeoObjects($autocomplete);
};

DemoNewForm.prototype.hideGeoObjects = function ($target) {
    $target.parents('.direction_input').find('.dii_step').hide();
    $target.parents('.direction_input').find('.ds_2').show();
};

DemoNewForm.prototype.waitOrderTime = function () {
    this.startListen('click', '.time_selector button', function (Event) {
        var
            $target = this.getEventTarget(Event),
            orderTime = $target.parent().find('option:selected').html() + ' ' + $target.parent().find('input[type="time"]').val() + ':00';

        this.setParam('orderTime', orderTime);
    }.bind(this));

    this.startListen('click', '.tm_selector label', function (Event) {
        var
            $target = this.getEventTarget(Event),
            dataAttribute = parseInt(this.getFieldAttr($target, 'data-time'), 10);

        if (!isFinite(dataAttribute)) {
            return;
        }

        var
            orderTime = '',
            now = new Date();

        if (dataAttribute) {
            now.setMinutes(now.getMinutes() + dataAttribute);
            orderTime = this.messenger.formatOrderTime(now);
        }

        this.setParam('orderTime', orderTime);
    }.bind(this));
};

DemoNewForm.prototype.afterSetParam = function (key) {
    var fieldsEvents = this.getFieldsEvents();

    if (!fieldsEvents.hasOwnProperty(key)) {
        return;
    }

    var events = fieldsEvents[key];

    events.forEach(function (event) {
        event();
    });
};

DemoNewForm.prototype.defineDirection = function ($target) {
    return $target.closest('.direction_input').attr('data-direction');
};

DemoNewForm.prototype.waitCreateOrder = function () {
    this.startListen('click', '#BUTTON_CREATE_ORDER', function (Event) {
        this.preventEvent(Event);

        var $phone = $(this.getField('phone')),
            phone = this.getFieldValue($phone).trim();

        if (!phone.length) {
            $phone.addClass('error');
            return;
        }

        this.tryAuthorize(phone, function () {
            this.createOrder();
        }.bind(this));

    }.bind(this));
};

DemoNewForm.prototype.tryAuthorize = function (phone, then) {
    if (!phone.length) {
        throw new Error('Phone is required');
    }

    this.messenger.isAuthorizedPhone(phone, then, function () {
        this.authorize(phone, then);
    }.bind(this));
};

DemoNewForm.prototype.authorize = function (phone, then) {
    this.messenger.sendSms(phone, function (sendResult) {
        if (!sendResult.success) {
            this.showPopup(sendResult.text);
            return;
        }
        go_to_step(3);
        this.waitConfirmSms(then);
    }.bind(this));
};

DemoNewForm.prototype.waitConfirmSms = function (then) {
    this.startListen('click', '#BUTTON_SMS', function (Event) {
        this.preventEvent(Event);

        var $smsCode = $('#FIELD_SMS'),
            smsCode = this.getFieldValue($smsCode).trim(),
            phone = this.getParam('phone');

        if (!smsCode.length) {
            $smsCode.addClass('error');
            return;
        }

        this.confirmSms(phone, smsCode, then);
    }.bind(this));
};

DemoNewForm.prototype.confirmSms = function (phone, smsCode, then) {
    var params = {
        phone: phone,
        smsCode: smsCode
    };

    this.messenger.confirmSms(params, function (confirmResult) {
        if (!confirmResult.success) {
            this.showPopup(confirmResult.text);
            return;
        }

        then();
    }.bind(this));
};

DemoNewForm.prototype.createOrder = function () {
    var params = this.getParams();

    this.messenger.createOrder(params, function (orderResult) {
        var orderID = +orderResult;

        if (orderID > 0) {
            this.startOrderInfo(orderID);
            go_to_step(4);
        }
    }.bind(this));
};

DemoNewForm.prototype.rejectOrder = function (orderID) {
    this.messenger.rejectOrder(orderID, function (rejected) {

        this.showPopup(rejected);

    }.bind(this));
};

DemoNewForm.prototype.startOrderInfo = function (orderID) {
    if (!orderID) {
        throw new Error('orderID is required');
    }

    this.startOrderInfo.interval = setInterval(function () {
        this.messenger.getOrderInfo(orderID, this.showOrderInfo.bind(this));
    }.bind(this), 1000);
};

DemoNewForm.prototype.showOrderInfo = function (orderInfo) {
    console.log(orderInfo)
    //carId
    //statusLabel
};