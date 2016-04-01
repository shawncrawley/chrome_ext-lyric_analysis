/*jslint
 browser, devel, this
 */
/*global
 chrome, $, MutationObserver, window
 */
/*property
 addClass, addListener, albumInfo, artist, attr, attributeOldValue,
 attributes, characterData, childList, click, contents, each, explicit, find,
 forEach, indexOf, innerHTML, last, length, name, observe, onMessage, parse,
 push, runtime, sendMessage, setTimeout, some, songsToDisable, substring,
 subtree, target, text, tracks
 */
(function () {
    'use strict';
    var $albumContents;

    //noinspection JSCheckFunctionSignatures
    chrome.runtime.onMessage.addListener(function (message, ignore, sendResponse) {
        var $albumTracks;
        var $albumArtist;
        var $trackElement;
        var $appPlayerContents;
        var parenthIndex;
        var config;
        var target;
        var observer;
        var albumInfo;
        var trackName;

        if (message === 'getAlbumInfo') {
            $albumContents = $('iframe[id*="app-spotify:app:album"]').last().contents();
            $albumTracks = $albumContents.find('.tracklist-album').find('tbody').find('tr[tabindex]');
            $albumArtist = $($albumContents.find('a[href*="https://play.spotify.com/artist"]')[0]).text();
            albumInfo = {
                'artist': $albumArtist,
                'tracks': [],
                'explicit': {}
            };

            $albumTracks.each(function () {
                $trackElement = $(this);
                trackName = JSON.parse($trackElement.attr('data-log-data')).name;
                parenthIndex = trackName.indexOf(' (');
                if (parenthIndex !== -1) {
                    trackName = trackName.substring(0, parenthIndex);
                }
                albumInfo.tracks.push(trackName);
                if ($trackElement.find('.tl-explicit').length !== 0) {
                    albumInfo.explicit[trackName] = true;
                }
            });

            chrome.runtime.sendMessage({text: "albumInfo", albumInfo: albumInfo}, sendResponse);
        } else {
            message.songsToDisable.forEach(function (song) {
                $albumContents.find('tr[data-log-data*="' + song + '"')
                    .addClass('unavailable');
            });
            $appPlayerContents = $('#app-player').contents();
            target = $appPlayerContents.find('#track-name')[0];
            observer = new MutationObserver(function (mutations) {
                message.songsToDisable.some(function (explicitSong) {
                    if (mutations[0].target.innerHTML.indexOf(explicitSong) !== -1) {
                        window.setTimeout(function () {
                            $appPlayerContents.find('#next')[0].click();
                        }, 1000);
                        return true;
                    }
                });
            });
            config = {childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true};
            observer.observe(target, config);
        }
        return true;
    });
}());