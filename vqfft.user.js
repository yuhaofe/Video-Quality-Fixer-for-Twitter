// ==UserScript==
// @name                Video Quality Fixer for X (Twitter)
// @name:zh             X (Twitter) 视频画质修复
// @name:zh-CN          X (Twitter) 视频画质修复
// @namespace           https://github.com/yuhaofe
// @version             0.3.1
// @description         Force highest quality playback for X (Twitter) videos.
// @description:zh      强制 X (Twitter) 播放最高画质的视频
// @description:zh-CN   强制 X (Twitter) 播放最高画质的视频
// @author              yuhaofe
// @match               https://x.com/*
// @match               https://mobile.x.com/*
// @match               https://pro.x.com/*
// @match               https://twitter.com/*
// @match               https://mobile.twitter.com/*
// @match               https://pro.twitter.com/*
// @exclude             https://x.com/i/cards-frame/*
// @exclude             https://*.x.com/i/cards-frame/*
// @exclude             https://twitter.com/i/cards-frame/*
// @exclude             https://*.twitter.com/i/cards-frame/*
// @grant               none
// ==/UserScript==

(function () {
  'use strict';

  var QUALITY_DEFINE = {
    'Auto': {},
    'Best': {
      min: 1080
    },
    '1080P': {
      max: 1080,
      min: 720
    },
    '720P': {
      max: 720,
      min: 480
    },
    'Worst': {
      max: 480
    }
  };

  function XVidHijacker(quality) {
    this.quality = quality; // Auto / Best / 1080P / 720P / Worst
    this.realOpen = window.XMLHttpRequest.prototype.open;
  }

  XVidHijacker.prototype.setQuality = function(quality) {
    this.quality = quality;
  }

  XVidHijacker.prototype.hijack = function() {
    var self = this;
    window.XMLHttpRequest.prototype.open = function() {
      var url = arguments['1'];
      if (self.isHLSUrl(url)) {
        this.addEventListener('readystatechange', function (e) {
          if (this.readyState === 4) {
            var originalText = e.target.responseText;
            if (!self.isAutoQuality() && self.isMasterPlaylist(originalText)) {
              var modifiedText = self.modifyMasterPlaylist(originalText);
              Object.defineProperty(this, 'response', { writable: true });
              Object.defineProperty(this, 'responseText', { writable: true });
              this.response = this.responseText = modifiedText;
            }
          }
        });
      }
      return self.realOpen.apply(this, arguments);
    };
  }

  XVidHijacker.prototype.isHLSUrl = function(url) {
    var reg = new RegExp(/^https:\/\/video\.twimg\.com\/.+m3u8?/, 'i');
    return reg.test(url);
  }

  XVidHijacker.prototype.isMasterPlaylist = function(text) {
    return text.indexOf('#EXT-X-TARGETDURATION') === -1 && text.indexOf('#EXT-X-STREAM-INF') != -1;
  }

  XVidHijacker.prototype.isAutoQuality = function() {
    return this.quality === 'Auto';
  }

  XVidHijacker.prototype.modifyMasterPlaylist = function(text) {
    var result = text;
    var reg = new RegExp(/^#EXT-X-STREAM-INF:(.*)\r?\n.*$/, 'gm');
    var stream = reg.exec(text);
    if (stream) {
      var globalTags = text.substring(0, stream.index);

      var targetPlaylist = null;
      var hlsPlaylists = [];
      var hlsPlaylist = new HLSPlaylist(stream[0], stream[1]);
      hlsPlaylists.push(hlsPlaylist);
      while ((stream = reg.exec(text)) != null) {
        hlsPlaylist = new HLSPlaylist(stream[0], stream[1]);
        hlsPlaylists.push(hlsPlaylist);
      }

      hlsPlaylists.forEach(playlist => {
        if (playlist.isTargetQuality(this.quality)) {
          targetPlaylist = playlist;
        }
      });

      if (!targetPlaylist) {
        targetPlaylist = hlsPlaylists[0];
      }

      result = globalTags + targetPlaylist.streamStr;
    }
    return result;
  }

  function HLSPlaylist(streamStr, infStr) {
    var inf = this.parseInf(infStr);
    this.streamStr = streamStr;
    this.bandwidth = inf.bandwidth;
    this.resolution = inf.resolution;
  }

  HLSPlaylist.prototype.parseInf = function(infStr) {
    var result = {};
    var resKeys = {
      'BANDWIDTH': 'bandwidth',
      'RESOLUTION': 'resolution',
      'AVERAGE-BANDWIDTH': 'averageBandwidth',
      'CODECS': 'codecs'
    }
    var infs = infStr.split(',');
    infs.forEach(inf => {
      var infKV = inf.split('=');
      var infKey = infKV[0];
      var infValue = infKV[1];
      var resKey = resKeys[infKey];
      if (resKey) {
        result[resKey] = infValue;
      }
    })
    return result;
  }

  HLSPlaylist.prototype.getShorterDimension = function() {
    if(this.resolution) {
      var dims = this.resolution.split('x');
      if (parseInt(dims[0]) > parseInt(dims[1])) {
        return parseInt(dims[1]);
      } else {
        return parseInt(dims[0]);
      }
    } else {
      return 0;
    }
  }

  HLSPlaylist.prototype.isTargetQuality = function(quality) {
    var shorterDim = this.getShorterDimension();
    var qualityReq = QUALITY_DEFINE[quality];
    var passMin = qualityReq.min ? shorterDim > qualityReq.min : true;
    var passMax = qualityReq.max ? shorterDim <= qualityReq.max : true;
    return passMin && passMax;
  }

  function initUI(hijacker) {
    var htmlStr = '<div id="vqfft-quality-select" class="vqfft-quality-select">' +
        '<div class="current-item">Best</div>' +
        '<div class="item-list">' +
            '<div class="select-item">Auto</div>' +
            '<div class="select-item">Best</div>' +
            '<div class="select-item">1080P</div>' +
            '<div class="select-item">720P</div>' +
            '<div class="select-item">Worst</div>' +
        '</div>' +
        '<style>' +
            '.vqfft-quality-select { position: fixed; right: 5px; top: 5px; width:fit-content; height:fit-content; padding: 2px 0px; color: white; border-width: 0px; border-radius: 5px; background-color: rgba(0,0,0,0.4); cursor: pointer; }' +
            '.vqfft-quality-select .item-list, .vqfft-quality-select .item-list.disable, .vqfft-quality-select:hover .item-list.disable { display: none; }' +
            '.vqfft-quality-select:hover .item-list { display: block; }' +
            '.vqfft-quality-select .current-item { padding: 0px 5px; }' +
            '.vqfft-quality-select .select-item { padding: 0px 5px; }' +
            '.vqfft-quality-select .select-item.selected { display: none; }' +
            '.vqfft-quality-select .select-item:hover { background-color: rgba(0,0,0,0.6); }' +
        '</style>' +
    '</div>';

    var selectWrapper = document.createElement('div');
    selectWrapper.innerHTML = htmlStr;
    document.body.appendChild(selectWrapper.children[0]);

    // listen to quality change
    var selectElm = document.getElementById("vqfft-quality-select");
    selectElm.addEventListener("click", function(e) {
      if (e.target.classList.contains("select-item")) {
        var selectItems = selectElm.querySelectorAll(".select-item");
        selectItems.forEach(function(item) {
          item.classList.remove("selected");
        });
        e.target.classList.add("selected");

        var quality = e.target.innerText;
        var currentItem = selectElm.querySelector(".current-item");
        currentItem.innerText = quality;

        hijacker.setQuality(quality);
        localStorage.setItem('vqfft-quality', quality);

        selectElm.querySelector(".item-list").classList.add("disable");
        setTimeout(function() {
          selectElm.querySelector(".item-list").classList.remove("disable");
        }, 0);
      }
    });

    // select current quality
    var selectItems = selectElm.querySelectorAll(".select-item");
    selectItems.forEach(function(item) {
      if (item.innerText === hijacker.quality) {
        item.click();
      }
    });
  }

  function init() {
    var quality = localStorage.getItem('vqfft-quality');
    quality = quality ? quality : 'Best';
    var hijacker = new XVidHijacker(quality);
    hijacker.hijack();
    initUI(hijacker);
  }

  init();
})();

