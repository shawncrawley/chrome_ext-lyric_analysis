/*jslint
 browser, devel, this
 */
/*global
 chrome, $, window
 */
/*property
 active, addClass, addEventListener, close, currentWindow, each, forEach,
 hasOwnProperty, html, id, keys, lyricsInfo, on, prop, push, query,
 removeClass, sendMessage, songsToDisable, tabs, text, val
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        $('#btn-disable-songs').on('click', function () {
            var songsToDisable = [];
            $('input:checked').each(function () {
                songsToDisable.push($(this).val());
            });
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {'songsToDisable': songsToDisable});
            });
            $(this).prop('disabled', true);
        });

        $('#btn-select-all').on('click', function () {
            if ($(this).text() === 'Select All') {
                $('input').prop('checked', true);
                $(this).text('Deselect All');
            } else {
                $('input').prop('checked', false);
                $(this).text('Select All');
            }
        });
        $('#btn-close-popup').on('click', function () {
            window.close();
        });

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'getAlbumInfo', null, function (response) {
                var lyricsInfo;
                var lyricResultsHtml;
                var swearsList;

                if (response.hasOwnProperty('lyricsInfo')) {
                    lyricsInfo = response.lyricsInfo;
                    if (lyricsInfo === 'Clean') {
                        $('#status').addClass('hidden');
                        $('#results').html('All songs are clean!');
                    } else if (lyricsInfo === 'Unauthorized') {
                        $('#status').addClass('hidden');
                        $('#results').html('Sorry! We are not authorized to analyze these lyrics!');
                    } else {
                        lyricResultsHtml = '';
                        Object.keys(lyricsInfo).forEach(function (key) {
                            lyricResultsHtml += '<div class="song">' +
                                    '<input type="checkbox" value="' + key + '">' +
                                    '<span class="song-name">' + key + '</span>' +
                                    '<div class="swears">';
                            swearsList = lyricsInfo[key];
                            swearsList.forEach(function (swearImgSrc) {
                                lyricResultsHtml += '<img src="' + swearImgSrc + '"/>';
                            });
                            lyricResultsHtml += '</div></div>';
                        });

                        $('#results').html(lyricResultsHtml);
                        $('#status').addClass('hidden');
                        $('.btn').removeClass('hidden');
                    }
                }
            });
        });
    });
}());