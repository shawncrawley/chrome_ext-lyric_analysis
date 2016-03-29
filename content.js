var $albumContents;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === 'getAlbumInfo') {
        $albumContents = $('iframe[id*="browse-app-spotify:app:album"]').last().contents();
        var $albumTracks = $albumContents.find('.tracklist-album').find('tbody').find('tr[tabindex]');
        var $albumArtist = $($albumContents.find('a[href*="https://play.spotify.com/artist"]')[0]).text();
        var length = $albumTracks.length;
        var albumInfo = {
            'artist': $albumArtist,
            'tracks': [],
            'explicit': {}
        };
        var trackName;
        for (var i = 0; i < length; i++) {
            var $trackElement = $($albumTracks[i]);
            trackName = JSON.parse($trackElement.attr('data-log-data')).name;
            var parenthIndex = trackName.indexOf(' (');
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
        var $appPlayerContents = $('#app-player').contents();
        var target = $appPlayerContents.find('#track-name')[0];
        var observer = new MutationObserver(function(mutations) {
            message.songsToDisable.some(function (explicitSong) {
                if (mutations[0].target.innerHTML.indexOf(explicitSong) !== -1) {
                    window.setTimeout(function () {
                        $appPlayerContents.find('#next')[0].click();
                    }, 1000);
                    return true;
                }
            });
        });
        var config = { childList: true, attributes: true, characterData: true, subtree: true, attributeOldValue: true };
        observer.observe(target, config);
    }
    return true;
});