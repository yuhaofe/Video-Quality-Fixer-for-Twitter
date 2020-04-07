// ==UserScript==
// @name            Video Quality Fixer for Twitter
// @name:zh         Twitter强制高清视频
// @namespace       https://github.com/flyhaozi
// @version         0.1
// @description     Force highest quality playback for Twitter videos.
// @description:zh  强制Twitter播放最高画质的视频
// @author          flyhaozi
// @match           https://twitter.com/*
// @grant           unsafeWindow
// ==/UserScript==

(function() {
    // unregister twitter serviceworker
    function unregisterServiceWorker(){
        unsafeWindow.navigator.serviceWorker.getRegistration().then(reg => {
            if(reg) reg.unregister();
        });
    }

    unregisterServiceWorker();
    unsafeWindow.navigator.serviceWorker.addEventListener('controllerchange', () => {
        unregisterServiceWorker();
    });

    console.log("■ Video Quality Fixer for Twitter ■ service worker unregistered!");
    console.log("■ Video Quality Fixer for Twitter ■ start loading...");

    var realOpen = unsafeWindow.XMLHttpRequest.prototype.open;
    unsafeWindow.XMLHttpRequest.prototype.open = function() {
        var url = arguments['1'];
        url.startsWith("https://video.twimg.com") && url.includes("m3u8?tag=") && this.addEventListener('readystatechange', function(e) {
            if ( this.readyState === 4 ) {
                var originalText = e.target.responseText;
                var lines = originalText.split(new RegExp('\\r?\\n'));
                var modifiedText = lines[0] + '\r\n' + lines[1] + '\r\n' + lines[lines.length - 3] + '\r\n' +lines[lines.length - 2] + '\r\n';

                console.log("■ Video Quality Fixer for Twitter ■");
                console.log("playlist: "+ url + "\n" + "best quality: " + lines[lines.length - 3]);

                Object.defineProperty(this, 'response',     {writable: true});
                Object.defineProperty(this, 'responseText', {writable: true});
                this.response = this.responseText = modifiedText;
            }
        });
        return realOpen.apply(this, arguments);
    };

    // a sign helps identify if userscript loaded successfully
    var sign = document.createElement("div");
    sign.innerText = "HD";
    sign.style = "position: fixed; right: 0; bottom: 0; color: grey";
    document.querySelector('body').appendChild(sign);

    console.log("■ Video Quality Fixer for Twitter ■ loaded successfully!");
})();

