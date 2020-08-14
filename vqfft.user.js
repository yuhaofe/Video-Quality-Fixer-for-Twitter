// ==UserScript==
// @name                Video Quality Fixer for Twitter
// @name:en             Video Quality Fixer for Twitter
// @name:zh             Twitter 视频画质修复
// @name:zh-CN          Twitter 视频画质修复
// @namespace           https://github.com/flyhaozi
// @version             0.1.1
// @description         Force highest quality playback for Twitter videos.
// @description:en      Force highest quality playback for Twitter videos.
// @description:zh      强制 Twitter 播放最高画质的视频
// @description:zh-CN   强制 Twitter 播放最高画质的视频
// @author              flyhaozi
// @match               https://twitter.com/*
// @grant               unsafeWindow
// ==/UserScript==

(function() {
    var realOpen = unsafeWindow.XMLHttpRequest.prototype.open;
    unsafeWindow.XMLHttpRequest.prototype.open = function() {
        var url = arguments['1'];
        url.startsWith("https://video.twimg.com") 
        && url.includes("m3u8?tag=") 
        && this.addEventListener('readystatechange', function(e) {
            if ( this.readyState === 4 ) {
                var originalText = e.target.responseText;
                var lines = originalText.split(new RegExp('\\r?\\n'));
                var modifiedText = lines[0] + '\r\n' 
                                + lines[1] + '\r\n' 
                                + lines[lines.length - 3] + '\r\n' 
                                + lines[lines.length - 2] + '\r\n';

                console.log("■ Video Quality Fixer for Twitter ■");
                console.log("playlist: "+ url + "\n" + "best quality: " + lines[lines.length - 3]);

                Object.defineProperty(this, 'response',     {writable: true});
                Object.defineProperty(this, 'responseText', {writable: true});
                this.response = this.responseText = modifiedText;
            }
        });
        return realOpen.apply(this, arguments);
    };

    // add a mark helps identify if userscript loaded successfully
    var sign = document.createElement("div");
    sign.innerText = "HD";
    sign.style = "position: fixed; right: 0; bottom: 0; color: grey";
    document.querySelector('body').appendChild(sign);
})();

