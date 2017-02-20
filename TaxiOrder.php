<?php
require_once $_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php";
define('DR', '/');

abstract class TaxiOrder
{

    const TEMPLATE_DIR = 'taxiorder';
    const ORDER_DIR = 'taxiorder';
    const ADAPTER_DIR = 'adapter';
    const BITRIX_DIR = 'bitrix';

    const TAXI_ORDER_JS_FILE = 'Order.js';
    const TAXI_ORDER_MAP_JS_FILE = 'OrderMap.js';
    const TAXI_ORDER_YANDEX_MAP_JS_FILE = 'OrderYandexMap.js';

    const TEMPLATE_PARAMS_FILE = 'params.php';
    const TEMPLATE_CONFIG_DIR = 'config';

    private static $cssMap = [];
    private static $jsMap = [0 => __DIR__ . DR . 'js' . DR . 'TaxiOrder.js'];

    private static $defaultLang;
    private static $currentLang;
    private static $templateParams = [];
    private static $templateConfig = [];
    private static $includeFiles = [];
    private static $taxiOrderDir;

    public static function init()
    {
        self::loadParams();
        self::loadTemplateConfig(self::$templateParams);
        self::defineIncludeFiles(self::$templateParams);
    }

    private static function loadParams()
    {
        $templateParams = require $_SERVER['DOCUMENT_ROOT'] . DR . SITE_TEMPLATE_PATH . DR . self::TEMPLATE_DIR . DR . self::TEMPLATE_PARAMS_FILE;
        self::$defaultLang = $templateParams['defaultLang'];
        if (array_key_exists('adapter', $templateParams) && $templateParams['adapter']) {
            self::$taxiOrderDir = __DIR__ . DR . self::ADAPTER_DIR;
        } else {
            self::$taxiOrderDir = __DIR__ . DR . self::BITRIX_DIR;
        }

        self::$templateParams = $templateParams;
    }

    private static function loadTemplateConfig($templateParams)
    {
        $configDir = $_SERVER['DOCUMENT_ROOT'] . SITE_TEMPLATE_PATH . DR . self::TEMPLATE_DIR . DR . self::TEMPLATE_CONFIG_DIR;
        $config = require_once $configDir . DR . 'order.php';
        if (array_key_exists('map', $templateParams) && array_key_exists('id', $templateParams['map'])) {
            $orderMapConfig = require_once $configDir . DR . 'ordermap.php';
            $orderMapConfig['map'] = $orderMapConfig['map'][$templateParams['map']['id']];
            $config = array_merge($config, $orderMapConfig);
        }

        self::$templateConfig = $config;
    }

    private static function defineIncludeFiles($templateParams)
    {
        $jsFiles = self::getIncludeJsFiles($templateParams);
        self::$includeFiles['js'] = $jsFiles;
    }

    private function getIncludeJsFiles($templateParams)
    {
        $orderJsDir = self::$taxiOrderDir . DR . 'js';
        $jsMap[] = $orderJsDir . DR . self::TAXI_ORDER_JS_FILE;
        if ($templateParams['map']) {
            if ('yandex' == $templateParams['map']['id'])
                $jsMap[] = $orderJsDir . DR . self::TAXI_ORDER_YANDEX_MAP_JS_FILE;

            $jsMap[] = $orderJsDir . DR . self::TAXI_ORDER_MAP_JS_FILE;
        }

        $jsMap = array_merge(self::$jsMap, $jsMap);
        foreach ($jsMap as $i => $js) {
            $jsMap[$i] = str_replace('\\', '/', substr_replace($js, '', 0, strlen($_SERVER['DOCUMENT_ROOT'])));
        }

        return $jsMap;
    }

    public static function getIncludeFiles()
    {
        return self::$includeFiles;
    }

    public static function getTemplateConfig()
    {
        return self::$templateConfig;
    }

    public static function getTemplateParams()
    {
        return self::$templateParams;
    }

    public static function getCurrentLang() {
        return self::$defaultLang;
    }

    public static function Phrase($key) {
        $conf = self::getTemplateConfig();
        $lang = self::getCurrentLang();
        $result = self::findKey(trim($key), '.', $conf['phrases'][$lang]);

        return $result;
    }

    public static function Config($key)
    {
        $arr = self::getTemplateConfig();
        $result = self::findKey(trim($key), '.', $arr);

        return $result;
    }

    private static function findKey($key, $split, $arr) {
        $found = 0;
        $keys = explode($split, $key);

        while (array_key_exists(current($keys), $arr)) {
            $arr = $arr[current($keys)];
            $found++;
            next($keys);
        }

        return ($found === count($keys)) ? $arr : null;
    }
}