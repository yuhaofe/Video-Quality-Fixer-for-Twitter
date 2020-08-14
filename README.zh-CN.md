# Twitter 视频画质修复
强制Twitter播放最高画质视频。

脚本加载成功后网页右下角会出现"HD"标志。

## 使用限制
只有Twitter的[service worker](https://developer.mozilla.org/docs/Web/API/Service_Worker_API)没有注册的时候可以正常使用本脚本。

你可以使用[Block Service Workers (Chrome)](https://chrome.google.com/webstore/detail/block-service-workers/ceokjgeibfjfcboemhdpkdalankbmnej) 或者 [Service Worker Control (Firefox)](https://addons.mozilla.org/firefox/addon/service-worker-control/) 来取消Twitter的service worker并且阻止其再注册。

:warning:注意: 取消service worker注册以后Twitter页面的加载速度会变慢。