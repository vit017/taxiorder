function GNewForm() {
    this.params = {};
    this.messenger = {};

    this.setFields();
    this.initParamsEvents();
}

GNewForm.prototype = Object.create(AbstractForm.prototype);
GNewForm.constructor = GNewForm;

GNewForm.prototype.setFields = function () {
    this.fields = {
        cityFrom: '',
        streetFrom: '#input-from-street',
        houseFrom: '#input-from-house',
        housingFrom: '#input-from-housing',
        porchFrom: '#input-from-porch',
        cityTo: '',
        streetTo: '#input-to-street',
        houseTo: '#input-to-house',
        housingTo: '#input-to-housing',
        porchTo: '#input-to-porch',
        comment: '#input-from-comment',
        phone: '#input-user-phone',
        clientName: '#input-user-name',
        tariffID: '#input-tariffs',
        orderTime: '#input-order-time'
    }
};

GNewForm.prototype.initParamsEvents = function () {
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

GNewForm.prototype.getFieldsEvents = function () {
    return this.fieldsRaiseEvents;
};

GNewForm.prototype.waitFieldsEvents = function () {
    var
        that = this,
        fields = this.getFields(),
        fieldsEvents = [
            'streetFrom',
            'houseFrom',
            'housingFrom',
            'porchFrom',
            'streetTo',
            'houseTo',
            'housingTo',
            'porchTo',
            'phone',
            'comment',
            'clientName',
            'orderTime'
        ];

    fieldsEvents.forEach(function (field) {
        if (fields.hasOwnProperty(field)) {
            that.startListen('blur', fields[field], that.fieldChanged.bind(that, field));
        }
    });
};

GNewForm.prototype.fieldChanged = function (field, Event) {
    var
        $target = this.getEventTarget(Event);

    this.setParam(field, this.getFieldValue($target));
};

GNewForm.prototype.findTariffs = function () {
    var
        $target = $(this.getField('tariffID')).find('select');

    this.messenger.findTariffs(function (tariffs) {
        this.setTariffs($target, tariffs);
        this.showTariffs($target);
        this.waitTariffChange();
    }.bind(this));
};

GNewForm.prototype.setTariffs = function ($target, tariffs) {
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

GNewForm.prototype.showTariffs = function ($target) {
    $(this.getField('tariffID')).show();
    $target.show();
};

GNewForm.prototype.waitTariffChange = function () {
    this.startListen('change', this.getField('tariffID'), function (Event) {
        var
            $target = this.getEventTarget(Event),
            tariffID = +this.getFieldValue($target);

        this.setParam('tariffID', tariffID);
    }.bind(this));
};

GNewForm.prototype.calculateCost = function (Event) {
    var
        params = this.getParams(),
        $target = $(this.getField('cost'));

    setTimeout(function () {
        this.messenger.calculateCost(params, function (cost) {
            this.setCost($target, cost);
            this.showCost($target);
        }.bind(this), function (e) {
            console.error(e)
        });
    }.bind(this), 200);
};

GNewForm.prototype.setCost = function ($target, cost) {
    console.log(cost);
};

GNewForm.prototype.showCost = function ($target) {

};

GNewForm.prototype.waitGeoObjects = function () {
    var
        streetFrom = this.getField('streetFrom'),
        streetTo = this.getField('streetTo');

    this.startListen('keyup', streetFrom + ',' + streetTo, this.findGeoObjects.bind(this));
};

GNewForm.prototype.findGeoObjects = function (Event) {
    var
        $target = this.getEventTarget(Event),
        $autocomplete = $(this.getFieldAttr($target, 'data-autocomplete')),
        text = this.getFieldValue($target);

    this.messenger.findGeoObjects({text: text}, function (objects) {
        this.setGeoObjects($autocomplete, objects);
        this.showGeoObjects($autocomplete);
        this.waitGeoObjectClick();
    }.bind(this));
};

GNewForm.prototype.setGeoObjects = function ($target, objects) {
    var
        $fragment = $(document.createDocumentFragment());

    objects.forEach(function (object) {
        $fragment.append("<li class='geoobject' data-res='" + JSON.stringify(object) + "'>" + object.label + "</li>");
    });

    $target.append($fragment);
};

GNewForm.prototype.showGeoObjects = function ($target) {
    $target.addClass('active_autocomplete');
};

GNewForm.prototype.waitGeoObjectClick = function () {
    this.startListen('click', '.geoobject', this.geoObjectChoosen.bind(this));
};

GNewForm.prototype.geoObjectChoosen = function (Event) {
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

GNewForm.prototype.hideGeoObjects = function ($target) {
    $target.removeClass('active_autocomplete');
};

GNewForm.prototype.defineDirection = function ($target) {
    return $target.closest('.direction').attr('data-direction');
};

GNewForm.prototype.waitOrderTime = function () {

    this.startListen('change', this.getField('orderTime'), function (Event) {
        var $orderTimeField = this.getEventTarget(Event);
        this.setParam('orderTime', this.getFieldValue($orderTimeField));
    }.bind(this));

    this.startListen('click', '.order-now', function (Event) {
        this.setParam('orderTime', '');
    }.bind(this));
};