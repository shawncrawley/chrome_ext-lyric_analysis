/*global
 chrome, window, $, MutationObserver
 */
(function () {
    'use strict';
    var $albumContents;

    //noinspection JSCheckFunctionSignatures
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        var $albumTracks,
            $albumArtist,
            $trackElement,
            $appPlayerContents,
            parenthIndex,
            config,
            length,
            target,
            observer,
            albumInfo,
            trackName,
            i;

        if (message === 'getAlbumInfo') {
            $albumContents = $('iframe[id*="app-spotify:app:album"]').last().contents();
            $albumTracks = $albumContents.find('.tracklist-album').find('tbody').find('tr[tabindex]');
            $albumArtist = $($albumContents.find('a[href*="https://play.spotify.com/artist"]')[0]).text();
            length = $albumTracks.length;
            albumInfo = {
                'artist': $albumArtist,
                'tracks': [],
                'explicit': {}
            };

            for (i = 0; i < length; i++) {
                $trackElement = $($albumTracks[i]);
                trackName = JSON.parse($trackElement.attr('data-log-data')).name;
                parenthIndex = trackName.indexOf(' (');
                if (parenthIndex !== -1) {
                    trackName = trackName.substring(0, parenthIndex);
                }
                albumInfo.tracks.push(trackName);
                if ($trackElement.find('.tl-explicit').length !== 0) {
                    albumInfo.explicit[trackName] = true;
                }
            }
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
            config = { childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true };
            observer.observe(target, config);
        }
        return true;
    });
}());