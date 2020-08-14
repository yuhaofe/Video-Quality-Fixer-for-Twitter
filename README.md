# Video Quality Fixer for Twitter
Force highest quality playback for Twitter videos.

There will be a "HD" mark on the bottom right corner of the webpage if this script is loaded successfully.

## Limitation
Only works when the [service worker](https://developer.mozilla.org/docs/Web/API/Service_Worker_API) of Twitter is not registered.

You can use [Block Service Workers (Chrome)](https://chrome.google.com/webstore/detail/block-service-workers/ceokjgeibfjfcboemhdpkdalankbmnej) or [Service Worker Control (Firefox)](https://addons.mozilla.org/firefox/addon/service-worker-control/) to unregister the service worker of Twitter and prevent Twitter from registering it.

:warning:CAUTION: Twitter will be slower after unregistering its service worker.