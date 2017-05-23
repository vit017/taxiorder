var OrderAdapter = AdapterFactory().createAdapter(),
    Form = new OrderForm(),
    Order = new TaxiOrder();

console.log(OrderAdapter);
console.log(OrderForm);


OrderAdapter.findTariffs(function (tariffs) {
    console.log('success');
    console.log(tariffs);
}, function (error) {
    console.log('error');
    console.log(error);
});


Form.addEvent('keyup', '#FIELD_FROM_STREET, #FIELD_TO_STREET', function (Event) {
    var $targetStreet = Form.getEventTarget(Event);

    OrderAdapter.findGeoObjects({
            text: Form.getFieldValue($targetStreet)
        },
        function (foundedObjects) {
            var autocompleteSelector = Form.getFieldAttr($targetStreet, 'data-autocomplete');

            var OrderAutocomplete = new Autocomplete({
                selector: autocompleteSelector
            });

            OrderAutocomplete.createContent(foundedObjects);
            OrderAutocomplete.show();

            Form.addEvent('click', autocompleteSelector, function (Event) {
                var $autocompleteItem = Form.getEventTarget(Event);

                Form.setFieldValue($targetStreet, Form.getFieldContent($autocompleteItem));
                OrderAutocomplete.hide();

                Order.setParam(Form.getFieldAttr($targetStreet, 'data-order-param'), JSON.parse(Form.getFieldAttr($autocompleteItem, 'data-res')));
            });

        }, function (error) {
            console.log('error');
            console.log(error);
        });
});