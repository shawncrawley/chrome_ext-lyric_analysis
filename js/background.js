/*jslint
 browser
 */
/*global
 chrome, $
 */
/*property
 addListener, ajax, albumInfo, apikey, artist, body, contentType, data,
 dataType, error, explicit, forEach, format, hide, keys, length, lyrics,
 lyricsInfo, lyrics_body, message, onMessage, onUpdated, pageAction, push,
 q_artist, q_track, runtime, search, show, success, tabs, test, text,
 tracks, type, url
 */
(function () {
    'use strict';

    var urlRegex = /^https?:\/\/(?:[^\.]+\.)?play\.spotify\.com\/album/;
    var explicitDict;
    var unknownDict;
    var swearDict;
    var regexStrings;
    var checkedAlbums = {};

    swearDict = {
        '(^s|s)hit[.!,;]?': {
            'imgSrc': '../images/poo.svg',
            'tooltip': 's**t'
        },
        '(^d|d)amn[.!,;]?': {
            'imgSrc': '../images/dam.svg',
            'tooltip': 'd**n'
        },
        '(^h|[^AZaz]h)ell[^A-Za-z]': {
            'imgSrc': '../images/flame.svg',
            'tooltip': 'h**l'
        },
        '(^f|f)uck': {
            'imgSrc': '../images/bomb.svg',
            'tooltip': 'f**k'
        },
        '(^b|b)itch': {
            'imgSrc': '../images/dog.svg',
            'tooltip': 'b**ch'
        },
        '(^b|b)astard': {
            'imgSrc': '../images/baby.svg',
            'tooltip': 'ba***rd'
        },
        '(^a|[ ]a)ss([ ]|[.!,])': {
            'imgSrc': '../images/donkey.svg',
            'tooltip': 'a**'
        },
        '(^s|[ ]s)ex([ ]|[.!,])': {
            'imgSrc': '../images/love.svg',
            'tooltip': 's*x'
        }
    };
    explicitDict = {
        'imgSrc': '../images/danger.svg',
        'tooltip': 'Spotify or MusixMatch identify this song as explicit'
    };
    unknownDict = {
        'imgSrc': '../images/question.svg',
        'tooltip': 'This song could not be checked for copyright purposes'
    };

    regexStrings = Object.keys(swearDict);

    //noinspection JSUnusedLocalSymbols
    function checkForValidUrl(tabId, ignore, tab) {
        if (urlRegex.test(tab.url)) {
            chrome.pageAction.show(tabId);
        } else {
            chrome.pageAction.hide(tabId);
        }
    }

    chrome.tabs.onUpdated.addListener(checkForValidUrl);

//noinspection JSCheckFunctionSignatures
    chrome.runtime.onMessage.addListener(function (message, ignore, sendResponse) {
        if (message.text === 'optionsChanged') {
            checkedAlbums = {};
            return;
        } else if (message.text === 'albumInfo') {
            var albumInfo;
            var albumName;
            var artist;
            var lyricsInfo;
            var unauthorizedCount;
            var listExists;
            var numTracks;
            var requestLyrics;
            var checkNextTrack;

            chrome.storage.sync.get(null, function (userOptions) {
                if (Object.keys(userOptions).length !== 0) {
                    swearDict = userOptions;
                    regexStrings = Object.keys(swearDict);
                }
            });

            albumInfo = message.albumInfo;
            albumName = albumInfo.name;
            artist = albumInfo.artist;
            numTracks = albumInfo.tracks.length;
            unauthorizedCount = 0;
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
                        lyricsInfo[track] = [unknownDict];
                        checkNextTrack(trackIndex);
                    },
                    success: function (response) {
                        var lyricsObj;
                        var lyrics;
                        var explicit;

                        lyricsObj = response.message.body.lyrics;

                        if (lyricsObj === undefined) {
                            lyricsInfo[track] = [unknownDict];
                            checkNextTrack(trackIndex);
                            return;
                        }

                        lyrics = lyricsObj.lyrics_body;
                        explicit = lyricsObj.explicit;

                        if (lyrics === '') {
                            unauthorizedCount += 1;
                            lyricsInfo[track] = [unknownDict];
                            checkNextTrack(trackIndex);
                            return;
                        }

                        listExists = false;
                        regexStrings.forEach(function (regexString) {
                            console.log(lyrics.search(new RegExp(regexString, 'gi')));
                            if (lyrics.search(new RegExp(regexString, 'gi')) !== -1) {
                                if (listExists) {
                                    lyricsInfo[track].push(swearDict[regexString]);
                                } else {
                                    lyricsInfo[track] = [swearDict[regexString]];
                                    listExists = true;
                                }
                            }
                        });
                        if (lyricsInfo[track] === undefined && (explicit || albumInfo.explicit[track])) {
                            lyricsInfo[track] = [explicitDict];
                        }
                        checkNextTrack(trackIndex);
                    }
                });
            };

            checkNextTrack = function (track) {
                track += 1;
                if (track < numTracks) {
                    requestLyrics(track);
                } else {
                    if (Object.keys(lyricsInfo).length === 0) {
                        lyricsInfo = "Clean";
                    } else if (unauthorizedCount === numTracks) {
                        lyricsInfo = "Unauthorized";
                    }
                    checkedAlbums[albumName] = lyricsInfo;
                    sendResponse({
                        'lyricsInfo': lyricsInfo
                    });
                }
            };
            if (checkedAlbums[albumName] === undefined) {
                requestLyrics(0);
            } else {
                sendResponse({
                    'lyricsInfo': checkedAlbums[albumName]
                });
            }
        }
        return true;
    });
}());