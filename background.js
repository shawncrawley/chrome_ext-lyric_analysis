// Regex-pattern to check URLs against.
var urlRegex = /^https?:\/\/(?:[^\.]+\.)?play\.spotify\.com\/album/;
var swearImgDict = {
    'shit': 'images/poo.svg',
    'damn': '/images/dam.svg',
    ' hell ':'images/flame.svg',
    'fuck': 'images/bomb.svg',
    'bitch':'images/dog.svg',
    'bastard':'images/baby.svg',
    ' ass ': 'images/donkey.svg',
    'sex ': 'images/love.svg'
};

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
            lyricsInfo,
            unauthorized = false,
            listExists,
            numTracks,
            requestLyrics,
            checkNextTrack;

        albumInfo = message.albumInfo;
        numTracks = albumInfo.tracks.length;
        lyricsInfo = {};

        requestLyrics = function (track) {

            $.ajax({
                type: 'GET',
                url: 'http://api.musixmatch.com/ws/1.1/matcher.lyrics.get',
                dataType: 'json',
                contentType: 'json',
                data: {
                    'q_artist': albumInfo.artist,
                    'q_track': albumInfo.tracks[track],
                    'format': 'json',
                    'apikey': 'fc3b11535b1c34769b61b84e04e46ddd'
                },
                error: function () {
                    console.error('Error while processing the following lyric request:');
                    console.error(albumInfo.tracks[track] + ' by ' + albumInfo.artist);
                    checkNextTrack(track, lyricsInfo);
                },
                success: function (response) {
                    var lyrics = response.message.body.lyrics.lyrics_body;
                    if (lyrics === '') {
                        unauthorized = true;
                    } else {
                        listExists = false;
                        swears.forEach(function(swear) {
                            if (lyrics.indexOf(swear) !== -1) {
                                if (listExists) {
                                    lyricsInfo[albumInfo.tracks[track]].push(swearImgDict[swear]);
                                } else {
                                    lyricsInfo[albumInfo.tracks[track]] = [swearImgDict[swear]];
                                    listExists = true;
                                }
                            }
                        });
                    }
                    checkNextTrack(track, lyricsInfo);
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