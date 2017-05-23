var OrderAdapter = AdapterFactory().createAdapter(),
    Form = new OrderForm(),
    Order = new TaxiOrder();

OrderAdapter.findTariffs(function (tariffs) {
    Form.showTariffs(tariffs);
}, function (error) {

});


Form.addEvent('keyup', '#FIELD_FROM_STREET, #FIELD_TO_STREET', function (Event) {
    var $targetStreet = Form.getEventTarget(Event);

    OrderAdapter.findGeoObjects({
            text: Form.getFieldValue($targetStreet)
        },
        function (foundedObjects) {
            var autocompleteSelector = Form.getFieldAttr($targetStreet, 'data-autocomplete');

            var StreetAutocomplete = new Autocomplete({
                selector: autocompleteSelector
            });
            StreetAutocomplete.createContent(foundedObjects);
            StreetAutocomplete.show();

            if (!foundedObjects.length) {
                return;
            }

            Form.addEvent('click', autocompleteSelector, function (Event) {
                var $autocompleteItem = Form.getEventTarget(Event);

                Form.setFieldValue($targetStreet, Form.getFieldContent($autocompleteItem));
                StreetAutocomplete.hide();

                var geoObjectAddress = JSON.parse(Form.getFieldAttr($autocompleteItem, 'data-res'));
                Form.setParam(Form.getFieldAttr($targetStreet, 'data-order-param'), geoObjectAddress.address);
            });

        }, function (error) {
            console.log('error');
            console.log(error);
        });
});

Form.addEvent('click', '.confirm-address', function (Event) {
    var $target = Form.getEventTarget(Event),
        direction = Form.getDirection($target),
        $house = Form.getFieldByDirection(Form.fields[direction].house, direction);

    Form.params[direction].house = $house.val();
    if ('from' === direction) {
        $porch = Form.getFieldByDirection(Form.fields[direction].porch, direction);
        $comment = Form.getBySelector(Form.fields.comment);
        Form.params[direction].porch = $porch.val();
        Form.params.comment = $comment.val();
    }

    OrderAdapter.calculateCost(Form.params, function(cost) {
        console.log(cost)
    }, function(e) {
        console.log(e)
    });
});