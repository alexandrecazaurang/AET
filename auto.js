//PLUGIN AV
window.ATInternet = window.ATInternet || {};
window.ATInternet.HTMLMediaElement = {
    Controls: []
};
window.ATInternet.HTMLMediaElement.Times = {
    reset: function (media) {
        media.ATInternet.context.times.previous = 0;
        media.ATInternet.context.times.current = 0;
    },
    update: function (media) {
        media.ATInternet.context.times.previous = media.ATInternet.context.times.current;
        media.ATInternet.context.times.current = Math.floor(media.currentTime * 1000);
    }
};
window.ATInternet.HTMLMediaElement.MediaControl = function (media, tag) {
    if ((typeof HTMLMediaElement !== 'undefined') && (media instanceof HTMLMediaElement)) {
        this.media = media;
        this.media.ATInternet = {
            tagAVI: new tag.avInsights.Media(media.dataset['at_av_heartbeat']),
            context: {
                state: 'ended',
                times: {
                    previous: 0,
                    current: 0
                }
            },
            init: false
        };
        this.addListeners();
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.addListeners = function () {
    var mediaControl = this;
    var events = [
        {
            action: ['play', 'playing', 'pause', 'ended'],
            method: 'fire'
        },
        {
            action: ['error', 'waiting', 'seeked', 'timeupdate']
        }
    ];
    for (var i = 0; i < events.length; i++) {
        for (var j = 0; j < events[i].action.length; j++) {
            window.ATInternet.Utils.addEvtListener(mediaControl.media, events[i].action[j], mediaControl[events[i].method || events[i].action[j]]);
        }
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.fire = function (e) {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    switch (media.ATInternet.context.state + e.type) {
        case 'endedplay':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.play(Math.floor(media.currentTime * 1000));
            break;
        case 'endedplaying':
        case 'playplaying':
        case 'bufferingplaying':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.playbackStart(Math.floor(media.currentTime * 1000));
            break;
        case 'pauseplaying':
        case 'rebufferingplaying':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.playbackResumed(Math.floor(media.currentTime * 1000));
            break;
        case 'playingpause':
        case 'bufferingpause':
        case 'rebufferingpause':
            if (!media.seeking) {
                media.ATInternet.context.state = e.type;
                media.ATInternet.tagAVI.playbackPaused(Math.floor(media.currentTime * 1000));
            }
            break;
        case 'playended':
        case 'playingended':
        case 'pauseended':
        case 'bufferingended':
        case 'rebufferingended':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.playbackStopped(Math.floor(media.currentTime * 1000));
            window.ATInternet.HTMLMediaElement.Times.reset(media);
            break;
        default:
            break;
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.timeupdate = function () {
    var media = this;
    if (media.ATInternet.context.times.current !== Math.floor(media.currentTime * 1000)) {
        window.ATInternet.HTMLMediaElement.Times.update(media);
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.seeked = function () {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    if (media.ATInternet.context.times.previous !== Math.floor(media.currentTime * 1000)) {
        media.ATInternet.tagAVI.seek(media.ATInternet.context.times.previous, Math.floor(media.currentTime * 1000));
        window.ATInternet.HTMLMediaElement.Times.update(media);
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.waiting = function () {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    if (!media.seeking) {
        if (media.ATInternet.context.state === 'play') {
            media.ATInternet.context.state = 'buffering';
            media.ATInternet.tagAVI.bufferStart(Math.floor(media.currentTime * 1000));
        } else if (media.ATInternet.context.state === 'playing') {
            media.ATInternet.context.state = 'rebuffering';
            media.ATInternet.tagAVI.bufferStart(Math.floor(media.currentTime * 1000));
        }
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.error = function () {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    if (typeof media.error !== 'undefined') {
        media.ATInternet.tagAVI.error('Error ' + media.error.code + '; details: ' + media.error.message);
    }
};
window.ATInternet.HTMLMediaElement.Tag = {
    init: function (media) {
        media.ATInternet.tagAVI.set('av_player', media.dataset['at_av_player'] || '');
        media.ATInternet.tagAVI.set('av_player_version', media.dataset['at_av_player_version'] || '');
        media.ATInternet.tagAVI.set('av_player_position', media.dataset['at_av_player_position'] || '');
        media.ATInternet.tagAVI.set('av_content', media.dataset['at_av_content'] || '');
        media.ATInternet.tagAVI.set('av_content_id', media.dataset['at_av_content_id'] || media.currentSrc);
        media.ATInternet.tagAVI.set('av_content_type', media.dataset['at_av_content_type'] || '');
        media.ATInternet.tagAVI.set('av_content_duration', media.duration * 1000 || media.dataset['at_av_content_duration']);
        media.ATInternet.tagAVI.set('av_content_version', media.dataset['at_av_content_version'] || '');
        media.ATInternet.tagAVI.set('av_content_genre', window.ATInternet.Utils.jsonParse(media.dataset['at_av_content_genre']) || []);
        media.ATInternet.tagAVI.set('av_content_linked', media.dataset['at_av_content_linked'] || '');
        media.ATInternet.tagAVI.set('av_content_duration_range', media.dataset['at_av_content_duration_range'] || '');
        media.ATInternet.tagAVI.set('av_broadcasting_type', media.dataset['at_av_broadcasting_type'] || '');
        media.ATInternet.tagAVI.set('av_ad_type', media.dataset['at_av_ad_type'] || '');
        media.ATInternet.tagAVI.set('av_publication_date', media.dataset['at_av_publication_date'] || 0);
        media.ATInternet.tagAVI.set('av_show', media.dataset['at_av_show'] || '');
        media.ATInternet.tagAVI.set('av_show_season', media.dataset['at_av_show_season'] || '');
        media.ATInternet.tagAVI.set('av_episode_id', media.dataset['at_av_episode_id'] || '');
        media.ATInternet.tagAVI.set('av_episode', media.dataset['at_av_episode'] || '');
        media.ATInternet.tagAVI.set('av_channel', media.dataset['at_av_channel'] || '');
        media.ATInternet.tagAVI.set('av_author', media.dataset['at_av_author'] || '');
        media.ATInternet.tagAVI.set('av_broadcaster', media.dataset['at_av_broadcaster'] || '');
        media.ATInternet.tagAVI.set('av_auto_mode', window.ATInternet.Utils.jsonParse(media.dataset['at_av_auto_mode']) || false);
    }
};
window.ATInternet.HTMLMediaElement.init = function (tag) {
    if (typeof tag !== 'undefined') {
        var htmlTags = ['VIDEO', 'AUDIO'];
        var mediaObjects = [];
        for (var i = 0; i < htmlTags.length; i++) {
            mediaObjects = document.getElementsByTagName(htmlTags[i]);
            for (var j = 0; j < mediaObjects.length; j++) {
                window.ATInternet.HTMLMediaElement.Controls.push(new window.ATInternet.HTMLMediaElement.MediaControl(mediaObjects[j], tag));
            }
        }
    }
};

// FIRST AUTOJS
window.onload = function () {
    var n = new Date().getTime();
    //SCROLL : 
    document.addEventListener("scroll", myFunction);


    function myFunction() {
        if (55 > document.body.scrollTop && document.body.scrollTop > 50) {
            var block = "first";
        }

        if (block == "first") {
            for (i = 0; i < 1; i++) {
                tag.events.send("scroll", {
                    'scroll_level': '1',
                    'page': page,
                    'page_chapter1': chapterA,
                    'page_chapter2': chapterB,
                    'page_chapter3': chapterC
                });
            }
        }
        if (105 > document.body.scrollTop && document.body.scrollTop > 100) {
            var block = "second";
        }

        if (block == "second") {
            for (i = 0; i < 1; i++) {
                tag.events.send("scroll", {
                    'scroll_level': '2',
                    'page': page,
                    'page_chapter1': chapterA,
                    'page_chapter2': chapterB,
                    'page_chapter3': chapterC
                });
            }
        }
        if (205 > document.body.scrollTop && document.body.scrollTop > 200) {
            var block = "third";
        }

        if (block == "third") {
            for (i = 0; i < 1; i++) {
                tag.events.send("scroll", {
                    'scroll_level': '3',
                    'page': page,
                    'page_chapter1': chapterA,
                    'page_chapter2': chapterB,
                    'page_chapter3': chapterC
                });
            }
        }
        if (405 > document.body.scrollTop && document.body.scrollTop > 400) {
            var block = "fourth";
        }

        if (block == "fourth") {
            for (i = 0; i < 1; i++) {
                tag.events.send("scroll", {
                    'scroll_level': '4',
                    'page': page,
                    'page_chapter1': chapterA,
                    'page_chapter2': chapterB,
                    'page_chapter3': chapterC
                });
            }
        }
        if (705 > document.body.scrollTop && document.body.scrollTop > 700) {
            var block = "fifth";
        }

        if (block == "fifth") {
            for (i = 0; i < 1; i++) {
                tag.events.send("scroll", {
                    'scroll_level': '5',
                    'page': page,
                    'page_chapter1': chapterA,
                    'page_chapter2': chapterB,
                    'page_chapter3': chapterC
                });
            }
        }
        if (1005 > document.body.scrollTop && document.body.scrollTop > 1000) {
            var block = "sixth";
        }

        if (block == "sixth") {
            for (i = 0; i < 1; i++) {
                tag.events.send("scroll", {
                    'scroll_level': '6',
                    'page': page,
                    'page_chapter1': chapterA,
                    'page_chapter2': chapterB,
                    'page_chapter3': chapterC
                });
            }
        }

    }

    //CLICK FOR BUTTONS ONLY :
    for (i = 0; i < document.getElementsByTagName("button").length; i++) {
        document.getElementsByTagName('button')[i].setAttribute('at_id', "button" + i);
        document.getElementsByTagName("button")[i].addEventListener("click", function () {
            if (this.getAttribute("at_custom_id") != null) {
                var ButtonPage = this.getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                var ButtonPage_chapter1 = this.getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                var ButtonPage_chapter2 = this.getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                var ButtonPage_chapter3 = this.getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
                var ButtonClick = this.getAttribute("at_custom_id").split('*click*:*')[1].split('*')[0];
                var ButtonClick_chapter1 = this.getAttribute("at_custom_id").split('*click_chapter1*:*')[1].split('*')[0];
                var ButtonClick_chapter2 = this.getAttribute("at_custom_id").split('*click_chapter2*:*')[1].split('*')[0];
                var ButtonClick_chapter3 = this.getAttribute("at_custom_id").split('*click_chapter3*:*')[1].split('*')[0];
            } else {
                var ButtonPage = page;
                var ButtonPage_chapter1 = chapterA;
                var ButtonPage_chapter2 = chapterB;
                var ButtonPage_chapter3 = chapterC;
                var ButtonClick = this.getAttribute('at_id');
                var ButtonClick_chapter1 = chapterA;
                var ButtonClick_chapter2 = chapterB;
                var ButtonClick_chapter3 = chapterC;
            };
            tag.events.send("click.action", {
                'click': ButtonClick,
                'click_chapter1': ButtonClick_chapter1,
                'click_chapter2': ButtonClick_chapter2,
                'click_chapter3': ButtonClick_chapter3,
                'page': ButtonPage,
                'page_chapter1': ButtonPage_chapter1,
                'page_chapter2': ButtonPage_chapter2,
                'page_chapter3': ButtonPage_chapter3
            });
        });
    };

    //CLICK FOR DIVs USED AS A BUTTON
    for (i = 0; i < document.getElementsByTagName("div").length; i++) {
        if (document.getElementsByTagName('div')[i].getAttribute('at_custom_id') != null) {
            document.getElementsByTagName('div')[i].setAttribute('at_id', "div" + i);
            document.getElementsByTagName("div")[i].addEventListener("click", function () {
                
                    var ButtonPage = this.getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                    var ButtonPage_chapter1 = this.getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                    var ButtonPage_chapter2 = this.getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                    var ButtonPage_chapter3 = this.getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
                    var ButtonClick = this.getAttribute("at_custom_id").split('*click*:*')[1].split('*')[0];
                    var ButtonClick_chapter1 = this.getAttribute("at_custom_id").split('*click_chapter1*:*')[1].split('*')[0];
                    var ButtonClick_chapter2 = this.getAttribute("at_custom_id").split('*click_chapter2*:*')[1].split('*')[0];
                    var ButtonClick_chapter3 = this.getAttribute("at_custom_id").split('*click_chapter3*:*')[1].split('*')[0];
                
                tag.events.send("click.action", {
                    'click': ButtonClick,
                    'click_chapter1': ButtonClick_chapter1,
                    'click_chapter2': ButtonClick_chapter2,
                    'click_chapter3': ButtonClick_chapter3,
                    'page': ButtonPage,
                    'page_chapter1': ButtonPage_chapter1,
                    'page_chapter2': ButtonPage_chapter2,
                    'page_chapter3': ButtonPage_chapter3
                });
            });
        }
    };
	
	

    //CLICKS FOR LINKS (INCLUDING DOWNLOAD) :
    var download = 0;
    var navigation = 0;
    var exit = 0;
    for (i = 0; i < document.getElementsByTagName("a").length; i++) {
        if (document.getElementsByTagName("a")[i].getAttribute("download") == "") {
            download++;
            document.getElementsByTagName('a')[i].setAttribute('at_id', "linkdownload" + download);
            document.getElementsByTagName("a")[i].addEventListener("click", function () {
                if (this.getAttribute("at_custom_id") != null) {
                    var LinkPage = this.getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                    var LinkPage_chapter1 = this.getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                    var LinkPage_chapter2 = this.getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                    var LinkPage_chapter3 = this.getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
                    var LinkClick = this.getAttribute("at_custom_id").split('*click*:*')[1].split('*')[0];
                    var LinkClick_chapter1 = this.getAttribute("at_custom_id").split('*click_chapter1*:*')[1].split('*')[0];
                    var LinkClick_chapter2 = this.getAttribute("at_custom_id").split('*click_chapter2*:*')[1].split('*')[0];
                    var LinkClick_chapter3 = this.getAttribute("at_custom_id").split('*click_chapter3*:*')[1].split('*')[0];
                    console.log('yes');
                } else {
                    var LinkPage = page;
                    var LinkPage_chapter1 = chapterA;
                    var LinkPage_chapter2 = chapterB;
                    var LinkPage_chapter3 = chapterC;
                    var LinkClick = this.getAttribute('at_id');
                    var LinkClick_chapter1 = chapterA;
                    var LinkClick_chapter2 = chapterB;
                    var LinkClick_chapter3 = chapterC;
                    console.log('no');
                };
                tag.events.send("click.download", {
                    'click': LinkClick,
                    'click_chapter1': LinkClick_chapter1,
                    'click_chapter2': LinkClick_chapter2,
                    'click_chapter3': LinkClick_chapter3,
                    'page': LinkPage,
                    'page_chapter1': LinkPage_chapter1,
                    'page_chapter2': LinkPage_chapter2,
                    'page_chapter3': LinkPage_chapter3
                });
            })
        } else if (document.getElementsByTagName("a")[i].getAttribute("href").split('/')[2] != "www.alexandre-cazaurang.com" && document.getElementsByTagName("a")[i].getAttribute("href").slice(0, 1) != "#") {
            exit++;
            document.getElementsByTagName('a')[i].setAttribute('at_id', "linkexit" + exit);
            document.getElementsByTagName("a")[i].addEventListener("click", function () {
                if (this.getAttribute("at_custom_id") != null) {
                    var LinkPage = this.getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                    var LinkPage_chapter1 = this.getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                    var LinkPage_chapter2 = this.getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                    var LinkPage_chapter3 = this.getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
                    var LinkClick = this.getAttribute("at_custom_id").split('*click*:*')[1].split('*')[0];
                    var LinkClick_chapter1 = this.getAttribute("at_custom_id").split('*click_chapter1*:*')[1].split('*')[0];
                    var LinkClick_chapter2 = this.getAttribute("at_custom_id").split('*click_chapter2*:*')[1].split('*')[0];
                    var LinkClick_chapter3 = this.getAttribute("at_custom_id").split('*click_chapter3*:*')[1].split('*')[0];
                } else {
                    var LinkPage = page;
                    var LinkPage_chapter1 = chapterA;
                    var LinkPage_chapter2 = chapterB;
                    var LinkPage_chapter3 = chapterC;
                    var LinkClick = this.getAttribute('at_id');
                    var LinkClick_chapter1 = chapterA;
                    var LinkClick_chapter2 = chapterB;
                    var LinkClick_chapter3 = chapterC;
                };
                tag.events.send("click.exit", {
                    'click': LinkClick,
                    'click_chapter1': LinkClick_chapter1,
                    'click_chapter2': LinkClick_chapter2,
                    'click_chapter3': LinkClick_chapter3,
                    'page': LinkPage,
                    'page_chapter1': LinkPage_chapter1,
                    'page_chapter2': LinkPage_chapter2,
                    'page_chapter3': LinkPage_chapter3
                });
            });
        } else if (document.getElementsByTagName("a")[i].getAttribute("href").slice(0, 1) == "#") {
            navigation++;
            document.getElementsByTagName('a')[i].setAttribute('at_id', "linknavigation" + navigation);
            document.getElementsByTagName("a")[i].addEventListener("click", function () {
                if (this.getAttribute("at_custom_id") != null) {
                    var LinkPage = this.getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                    var LinkPage_chapter1 = this.getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                    var LinkPage_chapter2 = this.getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                    var LinkPage_chapter3 = this.getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
                    var LinkClick = this.getAttribute("at_custom_id").split('*click*:*')[1].split('*')[0];
                    var LinkClick_chapter1 = this.getAttribute("at_custom_id").split('*click_chapter1*:*')[1].split('*')[0];
                    var LinkClick_chapter2 = this.getAttribute("at_custom_id").split('*click_chapter2*:*')[1].split('*')[0];
                    var LinkClick_chapter3 = this.getAttribute("at_custom_id").split('*click_chapter3*:*')[1].split('*')[0];
                } else {
                    var LinkPage = page;
                    var LinkPage_chapter1 = chapterA;
                    var LinkPage_chapter2 = chapterB;
                    var LinkPage_chapter3 = chapterC;
                    var LinkClick = this.getAttribute('at_id');
                    var LinkClick_chapter1 = chapterA;
                    var LinkClick_chapter2 = chapterB;
                    var LinkClick_chapter3 = chapterC;
                };
                tag.events.send("click.navigation", {
                    'click': LinkClick,
                    'click_chapter1': LinkClick_chapter1,
                    'click_chapter2': LinkClick_chapter2,
                    'click_chapter3': LinkClick_chapter3,
                    'page': LinkPage,
                    'page_chapter1': LinkPage_chapter1,
                    'page_chapter2': LinkPage_chapter2,
                    'page_chapter3': LinkPage_chapter3
                });
            });
        } else {
            navigation++;
            document.getElementsByTagName('a')[i].setAttribute('at_id', "linknavigation" + navigation);
            document.getElementsByTagName("a")[i].addEventListener("click", function () {
                                if (this.getAttribute("at_custom_id") != null) {
                                    var LinkPage = this.getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                                    var LinkPage_chapter1 = this.getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                                    var LinkPage_chapter2 = this.getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                                    var LinkPage_chapter3 = this.getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
                                    var LinkClick = this.getAttribute("at_custom_id").split('*click*:*')[1].split('*')[0];
                                    var LinkClick_chapter1 = this.getAttribute("at_custom_id").split('*click_chapter1*:*')[1].split('*')[0];
                                    var LinkClick_chapter2 = this.getAttribute("at_custom_id").split('*click_chapter2*:*')[1].split('*')[0];
                                    var LinkClick_chapter3 = this.getAttribute("at_custom_id").split('*click_chapter3*:*')[1].split('*')[0];
                                } else {
                                    var LinkPage = page;
                                    var LinkPage_chapter1 = chapterA;
                                    var LinkPage_chapter2 = chapterB;
                                    var LinkPage_chapter3 = chapterC;
                                    var LinkClick = this.getAttribute('at_id');
                                    var LinkClick_chapter1 = chapterA;
                                    var LinkClick_chapter2 = chapterB;
                                    var LinkClick_chapter3 = chapterC;
                                };
                tag.events.send("click.navigation", {
                    'click': LinkClick,
                    'click_chapter1': LinkClick_chapter1,
                    'click_chapter2': LinkClick_chapter2,
                    'click_chapter3': LinkClick_chapter3,
                    'page': LinkPage,
                    'page_chapter1': LinkPage_chapter1,
                    'page_chapter2': LinkPage_chapter2,
                    'page_chapter3': LinkPage_chapter3
                });
            });
        }
    };


    //SEARCH :
    for (i = 0; i < document.getElementsByTagName("input").length; i++) {
        if (document.getElementsByTagName("input")[i].getAttribute("at_search") == "true") {
            document.getElementsByTagName('input')[i].setAttribute('at_id', "myinput" + i + 1);
            document.getElementsByTagName('input')[i].addEventListener("search", function () {
                if (this.getAttribute("at_custom_id") != null) {
                    var SearchPage = this.getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                    var SearchPage_chapter1 = this.getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                    var SearchPage_chapter2 = this.getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                    var SearchPage_chapter3 = this.getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
                    var SearchKeyword = this.getAttribute("at_custom_id").split('*keyword*:*')[1].split('*')[0];
                } else {
                    var SearchPage = page;
                    var SearchPage_chapter1 = chapterA;
                    var SearchPage_chapter2 = chapterB;
                    var SearchPage_chapter3 = chapterC;
                    var SearchKeyword = this.value;
                };
                tag.events.send("internal_search_result.search", {
                    'ise_keyword': SearchKeyword,
                    'page': SearchPage,
                    'page_chapter1': SearchPage_chapter1,
                    'page_chapter2': SearchPage_chapter2,
                    'page_chapter3': SearchPage_chapter3
                });

            });
        }
    };


    //URL Parsing
    var parser = document.createElement('a');
    parser.href = document.URL;
    parser.protocol; // => "http:"
    parser.hostname; // => "example.com"
    parser.port; // => "3000"
    parser.pathname; // => "/pathname/"
    parser.search; // => "?search=test"
    parser.hash; // => "#hash"
    parser.host; // => "example.com:3000"    

    //Chapters for URL ending by extensions (http://www.internet.com/test/AT/GTMTag/SmartTag/page.html )
    var pathNameA1 = parser.pathname.replace(/\//g, '::');
    var pathNameA2 = pathNameA1.substring(2); // 
    var pathNameA = '' + pathNameA2 + '';
    var pageFileA1 = pathNameA.match(/(::)(?!.*\b\1\b).+/g);
    var pageFileA2 = '' + pageFileA1 + '';
    var pageNoSlash = pageFileA2.substring(2);

    //Chapters for URL ending by a slash (http://www.internet.com/test/blog/)   
    var pathNameB1 = parser.pathname;
    var pathNameB1 = pathNameB1.substring(0, pathNameB1.lastIndexOf("/"));
    var pathNameB2 = pathNameB1.replace(/\//g, '::');
    var pathNameB = pathNameB2.substring(2);
    if (pathNameB.match(/::/g) == null) {
        var countPathNameB = 0;
    } else {
        var countPathNameB = pathNameB.match(/::/g).length;
    }
    var pageSlashA1 = pathNameB.match(/(::)(?!.*\b\1\b).+/g);
    var pageSlash = '' + pageSlashA1 + ''.substring(2);

    //URL detection implying chapter variables choices
    if (document.URL == "http://www.internet.com/" || document.URL == "http://www.internet.com/index.html" || document.URL == "http://www.my-domain-is-so-cool.com/" || document.URL == "http://www.my-domain-is-so-cool.com/index.html" || document.URL == "http://www.this-one-is-cool-too.com/" || document.URL == "http://www.this-one-is-cool-too.com/index.html") {
        var page = "home";
    } else if (document.URL.slice(-1) == '/' && countPathNameB == 1) { //"http://www.internet.com/test/blog/"
        var myRegexp0nA2 = /([a-zA-Z0-9-_]*)::/g;
        var regexOnA2 = myRegexp0nA2.exec(pathNameB);
        var chapterAT1 = regexOnA2[1];
        var pageSlashCase = pageSlash.substring(2);
        var chapterA = chapterAT1.replace('::', '/');
        var chapterB = '';
        var chapterC = '';
        var page = pageSlashCase;
    } else if (document.URL.slice(-1) == '/' && countPathNameB == 2) { //"http://www.internet.com/test/blog/example/"
        var myRegexp0nA3 = /([a-zA-Z0-9-_]*)::([a-zA-Z0-9-_]*)::/g;
        var regexOnA3 = myRegexp0nA3.exec(pathNameB);
        var chapterAT1 = regexOnA3[1];
        var chapterAT2 = regexOnA3[2];
        var pageSlashCase = pageSlash.substring(2);
        var chapterA = chapterAT1.replace('::', '/');
        var chapterB = chapterAT2.replace('::', '/');
        var chapterC = '';
        var page = pageSlashCase;
    } else if (document.URL.slice(-1) == '/' && countPathNameB >= 3) { //"http://www.internet.com/test/blog/2016/09/11/bardenas/"
        var myRegexp0nA4 = /([a-zA-Z0-9-_]*)::?([a-zA-Z0-9-_]*)::?([a-zA-Z0-9-_]*.+)::/g;
        var regexOnA4 = myRegexp0nA4.exec(pathNameB);
        var chapterAT1 = regexOnA4[1];
        var chapterAT2 = regexOnA4[2];
        var chapterAT3 = regexOnA4[3];
        var pageSlashCase = pageSlash.substring(2);
        var chapterA = chapterAT1.replace('::', '/');
        var chapterB = chapterAT2.replace('::', '/');
        var chapterC = chapterAT3.replace(/::/g, '/');
        var page = pageSlashCase;
    } else if (document.URL.slice(-1) != '/' && pathNameA.match(/::/g) == null) { //"http://www.internet.com/testurl.html"    
        var chapterA = '';
        var chapterB = '';
        var chapterC = '';
        var page = parser.pathname.substring(1);
    } else if (document.URL.slice(-1) != '/' && pathNameA.match(/::/g).length == 1) { //"http://www.internet.com/images/testurl.html"
        var myRegexp0nB2 = /([a-zA-Z0-9-_]*)::/g;
        var regexOnB2 = myRegexp0nB2.exec(pathNameA);
        var chapterAT1 = regexOnB2[1];
        var chapterA = chapterAT1.replace('::', '/');
        var chapterB = '';
        var chapterC = '';
        var page = pageNoSlash;
    } else if (document.URL.slice(-1) != '/' && pathNameA.match(/::/g).length == 2) { //"http://www.internet.com/images/test/testurl.html"
        var myRegexp0nB3 = /([a-zA-Z0-9-_]*)::([a-zA-Z0-9-_]*)::/g;
        var regexOnB3 = myRegexp0nB3.exec(pathNameA);
        var chapterAT1 = regexOnB3[1];
        var chapterAT2 = regexOnB3[2];
        var chapterA = chapterAT1.replace('::', '/');
        var chapterB = chapterAT2.replace('::', '/');
        var chapterC = '';
        var page = pageNoSlash;
    } else if (document.URL.slice(-1) != '/' && pathNameA.match(/::/g).length >= 3) { //"http://www.internet.com/test/AT/GTMTag/SmartTag/testurl.html"
        var myRegexp0nB4 = /([a-zA-Z0-9-_]*)::?([a-zA-Z0-9-_]*)::?([a-zA-Z0-9-_]*.+)::/g;
        var regexOnB4 = myRegexp0nB4.exec(pathNameA);
        var chapterAT1 = regexOnB4[1];
        var chapterAT2 = regexOnB4[2];
        var chapterAT3 = regexOnB4[3];
        var chapterA = chapterAT1.replace('::', '/');
        var chapterB = chapterAT2.replace('::', '/');
        var chapterC = chapterAT3.replace('::', '/');
        var page = pageNoSlash;
    }

    //PAGE TAGGING
    var tag = new ATInternet.Tracker.Tag();
    window.ATInternet.HTMLMediaElement.init(tag);
    //var myMedia = new tag.avInsights.Media(5, 5);
    if(document.getElementsByName('at_page')[0].getAttribute('at_custom_id') != null){
        var PagePage = document.getElementsByName('at_page')[0].getAttribute("at_custom_id").split('*page*:*')[1].split('*')[0];
                    var PagePage_chapter1 = document.getElementsByName('at_page')[0].getAttribute("at_custom_id").split('*page_chapter1*:*')[1].split('*')[0];
                    var PagePage_chapter2 = document.getElementsByName('at_page')[0].getAttribute("at_custom_id").split('*page_chapter2*:*')[1].split('*')[0];
                    var PagePage_chapter3 = document.getElementsByName('at_page')[0].getAttribute("at_custom_id").split('*page_chapter3*:*')[1].split('*')[0];
    }else{
        var PagePage = page;
                    var PagePage_chapter1 = chapterA;
                    var PagePage_chapter2 = chapterB;
                    var PagePage_chapter3 = chapterC;
    }
    tag.events.send("page.display", {
        'page': PagePage,
        'page_chapter1': PagePage_chapter1,
        'page_chapter2': PagePage_chapter2,
        'page_chapter3': PagePage_chapter3
    })
}
