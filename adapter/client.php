<?php

if (!is_array($_GET) || !array_key_exists('command', $_GET))
    return;


require_once $_SERVER["DOCUMENT_ROOT"] . "/include/taxiorder/TaxiOrder.php";
TaxiOrder::init();



if ('init' === $_GET['command']) {
    $includeFiles = TaxiOrder::getIncludeFiles();
    $config = TaxiOrder::getTemplateConfig();
    $params = TaxiOrder::getTemplateParams();
    
    $result = [
        'js' => $includeFiles['js'],
        'config' => $config,
        'params' => $params,
    ];

    echo json_encode($result);
}
