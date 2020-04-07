// ==UserScript==
// @name            Video Quality Fixer for Twitter
// @name:zh         Twitter强制高清视频
// @namespace       https://github.com/flyhaozi
// @version         0.1
// @description     Force highest quality playback for Twitter videos.
// @description:zh  强制Twitter播放最高画质的视频
// @author          flyhaozi
// @match           https://twitter.com/*
// @run-at          document-start
// @grant           unsafeWindow
// ==/UserScript==

(function() {
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

    console.log("■ Video Quality Fixer for Twitter ■ loaded successfully!");
})();

