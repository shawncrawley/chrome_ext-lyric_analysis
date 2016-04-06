(function () {
    'use strict';
    var editWord = function (word) {
        var wordEdited = '';
        var indexLastLetter = word.length - 1;
        var i = indexLastLetter - 1;

        wordEdited += word.toUpperCase()[0];
        while (i--) {
            wordEdited += '*'
        }
        wordEdited += word.toUpperCase()[word.length - 1];
        return wordEdited;
    };

    var addOptionToUI = function (wordEdited, regexString) {
        var randomId = Math.floor((Math.random() * 100000) + 1);
        var optionHtmlString = '';
        optionHtmlString += '<div class="option">' +
            '<img src="../images/user-defined.svg" title="' + wordEdited + '">' +
            '<div class="slider">' +
            '<input type="checkbox" value="' + regexString + '" id="' + randomId + '" class="slider" checked />' +
            '<label for="' + randomId + '"></label>' +
            '</div>' +
            '</div>';

        $('#user-options').append(optionHtmlString);
    };

    var displayUserOptions = function () {
        chrome.storage.sync.get(null, function (userOptions) {
            if (Object.keys(userOptions).length !== 0) {
                $('input').prop('checked', false);
                Object.keys(userOptions).forEach(function (regexString) {
                    var $option = $('input[value="' + regexString + '"]');
                    if ($option.length === 1) {
                        $option.prop('checked', true);
                    } else {
                        addOptionToUI(userOptions[regexString]['tooltip'], regexString);
                    }
                });
            }
        });
    };

    var onClickAddWord = function (word) {
        var regexString = '';
        var wordEdited;

        if (word !== '') {
            wordEdited = editWord(word);
            regexString += '(^' + word[0] + '|' + word[0] + ')' + word.slice(1) + '[.!,;]?';
            addOptionToUI(wordEdited, regexString);
        }
    };

    var onClickSaveOptions = function () {
        var swearDict = {};
        $('.option').find('input').each(function () {
            if ($(this).prop('checked') === true) {
                swearDict[$(this).attr('value')] = {};
                swearDict[$(this).attr('value')]['imgSrc'] = $(this).parent().prev().attr('src');
                swearDict[$(this).attr('value')]['tooltip'] = $(this).parent().prev().attr('title');
            }
        });
        chrome.storage.sync.set(swearDict, function () {
           $('#status').text('Options saved');
            setTimeout(function() {
                $('#status').text('');
            }, 1000);
        });

        chrome.runtime.sendMessage({text: "optionsChanged"});
    };

    $(function () {
        displayUserOptions();
        $('#btn-add-word').on('click', function () {
            onClickAddWord($('#inpt-txt-word').val());
            $('#inpt-txt-word').val('');
        });
        $('#btn-save-options').on('click', function () {
            chrome.storage.sync.clear();
            onClickSaveOptions();
        });
        $('#inpt-txt-word').on('keyup', function(e) {
            if (e.which == 13) {
                onClickAddWord($(this).val());
                $(this).val('');
            }
        })
    });
}());
