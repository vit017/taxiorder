function GootaxAdapter() {
    this.url = '/api_integration/index_client.php?command=';
    this.authorizePhones = {};
}

GootaxAdapter.prototype = Object.create(StandartAdapter.prototype);
GootaxAdapter.constructor = GootaxAdapter;