function DemoNewFactory() {

}

DemoNewFactory.prototype = Object.create(AbstractTaxiOrderFactory.prototype);
DemoNewFactory.constructor = DemoNewFactory;


DemoNewFactory.prototype.createMessenger = function() {
    return new GootaxAdapter();
};

DemoNewFactory.prototype.createForm = function() {
    return new DemoNewForm();
};

DemoNewFactory.prototype.createTemplate = function() {
    return new DemoNewTemplate();
};