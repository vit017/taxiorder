function DemoNewFactory() {

}

DemoNewFactory.prototype.createMessenger = function() {
    return new GootaxAdapter();
};

DemoNewFactory.prototype.createForm = function() {
    return new DemoNewForm();
};

DemoNewFactory.prototype.createTemplate = function() {
    return new DemoNewTemplate();
};