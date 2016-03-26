chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === 'getAlbumInfo') {
        var $albumIframe = $('iframe[id*="browse-app-spotify:app:album"]').last();
        var $albumTracks = $albumIframe.contents().find('.tracklist-album').find('tbody').find('tr[tabindex]');
        var $albumArtist = $($albumIframe.contents().find('a[href*="https://play.spotify.com/artist"]')[0]).text();
        var length = $albumTracks.length;
        var albumInfo = {
            'artist': $albumArtist,
            'tracks': []
        };
        var trackName;
        for (var i = 0; i < length; i++) {
            trackName = JSON.parse($($albumTracks[i]).attr('data-log-data')).name;
            parenthIndex = trackName.indexOf(' (');
            if (parenthIndex !== -1) {
                trackName = trackName.substring(0, parenthIndex);
            }
            albumInfo.tracks.push(trackName);
        }
        chrome.runtime.sendMessage({text: "albumInfo", albumInfo: albumInfo}, sendResponse);
    }
    return true;
});