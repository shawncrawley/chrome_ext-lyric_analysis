# Spot-if-I Should Listen
This chrome extension interacts with the album pages of Spotify's web player (https://play.spotify.com) to do two things:

1. Report on the lyrical content of the album based on words or phrases you can specify
2. Allow you to disable the songs whose content you do not approve of

##Installation
The code can be downloaded straight from here (GitHub) by either cloning the directory through the command line, or by downloading the zipped folder and then extracting it where you would like it.

Once downloaded, open up a Chrome browser window and navigate to the Extensions page (chrome://extensions). Check the box at the top of the page that says "Developer mode." Three new buttons will appear. Click the one titled "Load unpacked extension..." and a "Browse for Folder" dialog will appear. Navigate to the location that you either cloned or unzipped the source code to. The folder that you need to select should be called "ShouldIListen." Click "OK" once you've found and selected it.

Now, you should see a new chrome extension at the top of the list called "Spot-if-I Should Listen" that is fully installed and ready to be used.

##Using the extension
###Setting your personal options
There is an options page where you can setup your personal preferences. This page can either be opened from the chrome extensions page by clicking the "Options" link, or by right-clicking the Spot-if-I should listen icon that appears in the upper-right corner of the Chrome browser window and selecting "Options."

On this page, you will see two categories: Standard Options, and User-defined Options. The Standard Options are built-in, and consist of eight words that are commonly known to be explicit and offensive to people. Since the goal of this extension is to avoid explicit words, I have done all I can to avoid using them in my text and explanations. With that said, each explicit word is referenced throughout the user interface of the extension with an icon that represents it. You can see the eight standard icons on the options page. The icons were chosen to allude to the words, however if there is any question about which word an icon represents, you can hover your mouse over the icon and an edited text representation of the word will appear with the only the first and last letters shown, and the rest as asteriks (i.e. S**T). Hopefully you will have no trouble.

Each word can be turned "ON" or "OFF," meaning that it can be searched for within the lyrics of an album, or not. All of the Standard Options words are turned "ON" by default.

If there is a word or phrase not represented by the Standard Options, there is a user input box at the top of the Options page that allows you to add your own words or phrases. Simply type the word in the input box and click the "Add" button. Immediately, a new icon will appear under the User-defined Options header with the same "ON/OFF" switch. However, these User-defined Options can also be completely deleted, rather than just turned off if they are no longer wanted on your options page. This is done by hovering over the option and clicking the "X" icon that appears.

Please note that all changes made to the options page must be saved before they will actually be reflected in your use of the extension. There is a "Save Options" button at the top of the options page that will save your options. Thus, if you leave the options page and come back, the options will still reflect how you defined them.

###Running the extension on a Spotify album page
The "Spot-if-I Should Listen" icon at the upper-right corner of the Chrome browser window will remain disabled (black and white) until you have navigated to a page that it applies to. Navigate to a Spotify album page (https://play.spotify.com/album/<album-id>), and then the "Spot-if-I Should Listen" icon will be enabled (colored). Now the icon can be clicked on, and should be if you would like to analyze the lyrical content of the album you are viewing. 

Once you've clicked the extension icon, a popup will appear which reads "Analyzing lyrics... Please wait." Soon thereafter, the results of the analysis will be displayed. If none of the words of interest were found in any of the songs, you will be informed that "All songs are clean!" If, on the other hand, one of the words that you turned "ON" from the options page appears in the song, the song title followed by the icon representing that word will show up. If multiple words of interest show up in a song, multiple icons will follow the song title. Each song title is also preceded by an empty checkbox. There will also be three button below all of the song titles that read "Select All," "Disable Songs," and "Done." The "Select All" button will check all of the checkboxes next to the songs. The "Disable Songs" button will disable all of the checked songs. This means that you can no longer listen to the song. It will automatically be skipped and go to the next song it can find that was not disabled. The "Done" button simply closes the dialog.

###DISCLAIMER:
The lyric service used to fetch and analyze lyrics (https://www.musixmatch.com) only provides 30% of the lyrics. Thus, the results provided by "Spot-if-I Should Listen" will only be about 30% accurate. It is highly likely that a word that you are concerned about does appear in a song, but after the 30% cut-off mark. Thus, this extension should be used with that in mind.
