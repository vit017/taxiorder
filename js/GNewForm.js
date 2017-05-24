function GNewForm() {
    this.params = {};
    this.messenger = {};
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
        tariffs: '#input-tariffs'
    }
}

GNewForm.prototype = Object.create(AbstractForm.prototype);
GNewForm.constructor = GNewForm;

GNewForm.prototype.waitFieldsEvents = function () {
    var
        that = this,
        fields = this.getFields(),
        addressFields = [
            fields.streetFrom,
            fields.houseFrom,
            fields.housingFrom,
            fields.porchFrom,
            fields.streetTo,
            fields.houseTo,
            fields.housingTo,
            fields.porchTo,
            fields.phone,
            fields.comment,
            fields.clientName
        ];

    addressFields.forEach(function (field) {
        that.startListen('blur', field, that.fieldChanged.bind(that, field));
    });
};

GNewForm.prototype.fieldChanged = function (field, Event) {
    var
        that = this,
        $target = this.getEventTarget(Event),
        fields = this.getFields();

    Object.keys(fields).forEach(function (key) {
        if (field === fields[key]) {
            that.setParam(key, that.getFieldValue($target));
            console.log(that)
        }
    });
};

GNewForm.prototype.findTariffs = function () {
    var
        $target = $(this.getField('tariffs')).find('select');

    this.messenger.findTariffs(function(tariffs) {
        this.setTariffs($target, tariffs);
        this.showTariffs($target);
        this.waitTariffChange();
    }.bind(this));
};

GNewForm.prototype.setTariffs = function($target, tariffs) {
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
    $(this.getField('tariffs')).show();
    $target.show();
};

GNewForm.prototype.waitTariffChange = function () {
    this.startListen('change', this.getField('tariffs'), this.calculateCost.bind(this));
};

GNewForm.prototype.calculateCost = function (Event) {
    console.log(this.params)
    console.log(Event)
    console.log(Event)
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
        text = this.getFieldValue($target),
        $autocomplete = $(this.getFieldAttr($target, 'data-autocomplete'));

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