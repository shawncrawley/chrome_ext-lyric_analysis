// Regex-pattern to check URLs against.
var urlRegex = /^https?:\/\/(?:[^\.]+\.)?play\.spotify\.com\/album/;
var swearImgDict = {
    '(^s|s)hit[.!,;]?': 'images/poo.svg',
    '(^d|d)amn[.!,;]?': '/images/dam.svg',
    '(^h|[^A-Za-z]h)ell[^A-Za-z]':'images/flame.svg',
    '(^f|f)uck': 'images/bomb.svg',
    '(^b|b)itch': 'images/dog.svg',
    '(^b|b)astard': 'images/baby.svg',
    '(^a|[ ]a)ss([ ]|[.!,])': 'images/donkey.svg',
    '(^s|[ ]s)ex([ ]|[.!,])': 'images/love.svg'
};
var questionImg = 'images/question.svg';

var swears = Object.keys(swearImgDict);

function checkForValidUrl(tabId, changeInfo, tab) {
    if (urlRegex.test(tab.url)) {
        chrome.pageAction.show(tabId);
    }
    else {
        chrome.pageAction.hide(tabId);
    }
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

//noinspection JSCheckFunctionSignatures
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.text === 'albumInfo') {
        var albumInfo,
            artist,
            lyricsInfo,
            unauthorized = false,
            listExists,
            numTracks,
            requestLyrics,
            checkNextTrack;

        albumInfo = message.albumInfo;
        artist = albumInfo.artist;
        numTracks = albumInfo.tracks.length;
        lyricsInfo = {};

        requestLyrics = function (trackIndex) {
            var track = albumInfo.tracks[trackIndex];
            $.ajax({
                type: 'GET',
                url: 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get',
                dataType: 'json',
                contentType: 'json',
                data: {
                    'q_artist': artist,
                    'q_track': track,
                    'format': 'json',
                    'apikey': 'fc3b11535b1c34769b61b84e04e46ddd'
                },
                error: function () {
                    console.error('Error while processing the following lyric request:');
                    console.error(track + ' by ' + artist);
                    checkNextTrack(trackIndex, lyricsInfo);
                },
                success: function (response) {
                    var lyricsObj = response.message.body.lyrics;
                    var lyrics = lyricsObj.lyrics_body;
                    var explicit = lyricsObj.explicit;
                    if (lyrics === '') {
                        unauthorized = true;
                    } else {
                        listExists = false;
                        swears.forEach(function(swear) {
                            if (lyrics.search(new RegExp(swear, 'gi')) !== -1) {
                                if (listExists) {
                                    lyricsInfo[track].push(swearImgDict[swear]);
                                } else {
                                    lyricsInfo[track] = [swearImgDict[swear]];
                                    listExists = true;
                                }
                            }
                        });
                        if (lyricsInfo[track] === undefined && (explicit || albumInfo.explicit[track])) {
                            lyricsInfo[track] = [questionImg];
                        }
                    }
                    checkNextTrack(trackIndex, lyricsInfo);
                }
            });
        };

        checkNextTrack = function(track, lyricsInfo) {
            track++;
            if (track < numTracks) {
                requestLyrics(track)
            } else {
                if (Object.keys(lyricsInfo).length === 0) {
                    lyricsInfo = "Clean";
                    if (unauthorized) {
                        lyricsInfo = "Unauthorized"
                    }
                }
                sendResponse({
                    'lyricsInfo': lyricsInfo
                });
            }
        };

        requestLyrics(0);
    }
    return true;
});