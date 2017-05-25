function DemoNewTemplate() {

}

DemoNewTemplate.prototype = Object.create(AbstractTemplate.prototype);
DemoNewTemplate.constructor = DemoNewTemplate;