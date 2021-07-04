// ==UserScript==
// @name                Video Quality Fixer for Twitter
// @name:zh             Twitter 视频画质修复
// @name:zh-CN          Twitter 视频画质修复
// @namespace           https://github.com/flyhaozi
// @version             0.1.2
// @description         Force highest quality playback for Twitter videos.
// @description:zh      强制 Twitter 播放最高画质的视频
// @description:zh-CN   强制 Twitter 播放最高画质的视频
// @author              flyhaozi
// @match               https://twitter.com/*
// @grant               none
// ==/UserScript==

(function() {
    'use strict';
    var realOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
        var url = arguments['1'];
        var reg = /^https:\/\/video\.twimg\.com\/.+m3u8\?.*tag=/i;
        if (reg.test(url)) {
            this.addEventListener('readystatechange', function(e) {
                if ( this.readyState === 4 ) {
                    var originalText = e.target.responseText;
                    var lines = originalText.split(new RegExp('\\r?\\n'));
                    var modifiedText = lines[0] + '\r\n' 
                                    + lines[1] + '\r\n' 
                                    + lines[lines.length - 3] + '\r\n' 
                                    + lines[lines.length - 2] + '\r\n';
                    Object.defineProperty(this, 'response',     {writable: true});
                    Object.defineProperty(this, 'responseText', {writable: true});
                    this.response = this.responseText = modifiedText;
                }
            });
        }
        return realOpen.apply(this, arguments);
    };

    // add a mark helps identify if userscript loaded successfully
    var disableHQ = localStorage.getItem('vqfft-disablehq');
    if(!disableHQ) {
        var mark = document.createElement('button');
        mark.innerText = 'HQ';
        mark.style = "position: fixed;right: 5px;bottom: 5px;color: white;border-width: 0px;border-radius: 5px;background-color: gray;opacity: 0.5;";
        mark.onclick = function() {
            if(confirm('Do not display HQ mark anymore?')){
                localStorage.setItem('vqfft-disablehq', 'true');
                mark.remove();
            }
        };
        document.body.appendChild(mark);
    }

    console.log('[Video Quality Fixer for Twitter] loaded!');
})();

