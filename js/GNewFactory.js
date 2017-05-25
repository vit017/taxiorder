function GNewFactory() {

}

GNewFactory.prototype.createMessenger = function() {
    return new GootaxAdapter();
};

GNewFactory.prototype.createForm = function() {
    return new GNewForm();
};

GNewFactory.prototype.createTemplate = function() {
    return new GNewTemplate();
};