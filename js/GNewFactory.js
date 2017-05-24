function GNewFactory() {

}

GNewFactory.prototype = Object.create(AbstractTaxiOrderFactory.prototype);
GNewFactory.constructor = GNewFactory;


GNewFactory.prototype.createMessenger = function() {
    return new TaxiMasterAdapter();
};

GNewFactory.prototype.createForm = function() {
    return new GNewForm();
};

GNewFactory.prototype.createTemplate = function() {
    return new GNewTemplate();
};