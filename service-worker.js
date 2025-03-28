'use strict';

const LogLevel = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
    OFF: 6,
    UNKNOWN: 9
}
const _loggingLevel = LogLevel.TRACE;

/** 
 * @return {object} An associative array of functions that are based on console.log.
 * @note _logger().info('This is a test.');           //   [2023-04-05T06:07:08.090Z] [INFO] (service-worker)  This is a test.
 *       _logger().object({'a':1, 'b':2});            //   [2023-04-05T06:07:08.091Z] [INFO] (service-worker)  >{'a':1, 'b':2}
 *       _logger().debug('object: ', {'a':1, 'b':2}); //   [2023-04-05T06:07:08.092Z] [DEBUG] (service-worker)  object: >{'a':1, 'b':2}
 *       _logger().errobj(err);                       // x > [2023-04-05T06:07:08.093Z] [ERROR] (service-worker)  TypeError: Cannot read properties of ...
 *       _logger().fatal('', err);                    // x > [2023-04-05T06:07:08.094Z] [FATAL] (service-worker)  TypeError: Cannot read properties of ...
 */
var _logger = () => {
    return {
        trace: (() => {
            if(_loggingLevel <= LogLevel.TRACE){
                return console.debug.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [TRACE] (service-worker)  ');
            }else{
                return () => {};
            };
        })(),
        debug: (() => {
            if(_loggingLevel <= LogLevel.DEBUG){
                return console.debug.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [DEBUG] (service-worker)  ');
            }else{
                return () => {};
            };
        })(),
        log: (() => {
            if(_loggingLevel <= LogLevel.INFO){
                return console.info.bind (console, '%s%s', '[' + (new Date).toJSON() + '] [INFO] (service-worker)  ');
            }else{
                return () => {};
            };
        })(),
        object: (() => {
            if(_loggingLevel <= LogLevel.INFO){
                return console.info.bind (console, '%s%o', '[' + (new Date).toJSON() + '] [INFO] (service-worker)  ');
            }else{
                return () => {};
            };
        })(),
        info: (() => {
            if(_loggingLevel <= LogLevel.INFO){
                return console.info.bind (console, '%s%s', '[' + (new Date).toJSON() + '] [INFO] (service-worker)  ');
            }else{
                return () => {};
            };
        })(),
        warn: (() => {
            if(_loggingLevel <= LogLevel.WARN){
                return console.warn.bind (console, '%s%s', '[' + (new Date).toJSON() + '] [WARN] (service-worker)  ');
            }else{
                return () => {};
            };
        })(),
        error: (() => {
            if(_loggingLevel <= LogLevel.ERROR){
                return console.error.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [ERROR] (service-worker)  ');
            }else{
                return () => {};
            };
        })(),
        fatal: (() => {
            if(_loggingLevel <= LogLevel.FATAL){
                return console.error.bind(console, '%s%s', '[' + (new Date).toJSON() + '] [FATAL] (service-worker)  ');
            }else{
                return () => {};
            };
        })()
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "search",
        title: "閲覧中のネット通販で検索",
        contexts: ["selection"]
    });
    /*
    chrome.contextMenus.create({
        id: "search-old",
        title: "中古品を閲覧中のネット通販で検索",
        contexts: ["selection"]
    });
    */
})

chrome.contextMenus.onClicked.addListener(async (selectionData) => {
    let keyward = selectionData.selectionText;
    keyward = keyward.replace('&', '%26').replace(' ', '%20');
    //_logger().debug('keyward', keyward);
    _logger().info('keyward', keyward);

    let platformPrefix = {
        mandarake: 'https://order.mandarake.co.jp/order/listPage/list?keyword=',
        surugaya: 'https://www.suruga-ya.jp/search?search_word=',
        // exso: 1                                        -> 販売中のみ表示
        offmall: 'https://netmall.hardoff.co.jp/search/?exso=1&q=',
        //fixed: 1                                        -> 定額
        //fixed: 3                                        -> すべて
        yahuoku: 'https://auctions.yahoo.co.jp/search/search?fixed=1&p=',
        //search_condition_id: 1cx0zHHN0HTEcaWNkHTE       -> [販売中] && [新品、未使用]
        //search_condition_id: 1cx0zHHN0HTEcaWNkHTEeMh4z  -> [販売中] && [新品、未使用 || 未使用に近い || 目立った傷や汚れなし]
        mercari: 'https://jp.mercari.com/search?search_condition_id=1cx0zHHN0HTEcaWNkHTE&keyword='
    }

    Object.keys(platformPrefix).forEach(async (platform) => {
        new Promise(resolve => {
            chrome.tabs.query({url: platformPrefix[platform].match(RegExp('https://[^/]+'))+'/*'}, tabs => {
                tabs.forEach(tab => {
                    _logger().debug('Target tab id is [' + tab.id + '].');

                    resolve(tab.id);
                });
            });
        }).then(tabId => {
            chrome.tabs.update(tabId, {url:platformPrefix[platform]+keyward}).then(tab => {
                _logger().debug('Updated tab[' + tabId + '] to ' + platformPrefix[platform]+keyward);

                return Promise.resolve();
            });
        });
    });
});
