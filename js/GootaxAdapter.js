function GootaxAdapter() {
    this.url = '/api_integration/index_client.php?command=';
}

GootaxAdapter.prototype = Object.create(AbstractAdapter.prototype);
GootaxAdapter.constructor = GootaxAdapter;
