document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'getAlbumInfo', null, function (response) {
            if (response.hasOwnProperty('lyricsInfo')) {
                if (response.lyricsInfo === 'Clean') {
                    $('#status').addClass('hidden');
                    $('#results').html('All songs are clean!');
                } else if (response.lyricsInfo === 'Unauthorized') {
                    $('#status').addClass('hidden');
                    $('#results').html('Sorry! We are not authorized to analyze these lyrics!');
                } else {
                    var key,
                        lyricResultsHtml = '',
                        imgPath,
                        i,
                        numSwears,
                        swearsList;

                    for (key in response.lyricsInfo) {
                        if (response.lyricsInfo.hasOwnProperty(key)) {
                            lyricResultsHtml += '<div class="song"><span class="song-name">' + key + '</span><div class="swears">';
                            swearsList = response.lyricsInfo[key];
                            numSwears = swearsList.length;
                            for (i = 0; i < numSwears; i++) {
                                lyricResultsHtml += '<img src="' + swearsList[i] + '"/>'
                            }
                        }
                        lyricResultsHtml += '</div></div>';
                    }

                    $('#results').html(lyricResultsHtml);
                    $('#status').addClass('hidden');
                }
            }
        })
    });
});
