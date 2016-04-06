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

    var getOptionHtmlString = function (word) {
        var regexString = '';
        var optionHtmlString = '';
        var wordEdited;

        wordEdited = editWord(word);
        regexString += '(^' + word[0] + '|' + word[0] + ')' + word.slice(1) + '[.!,;]?';
        optionHtmlString += '<div class="option">' +
            '<img src="../images/user-defined.svg" title="' + wordEdited + '">' +
            '<div class="slider">' +
            '<input type="checkbox" value="' + regexString + '" id="' + word.slice(1, 3) + '-word" class="slider" checked />' +
            '<label for="' + word.slice(1, 3) + '-word"></label>' +
            '</div>' +
            '</div>';

        return optionHtmlString;
    };

    var onClickAddWord = function (word) {
        var optionHtmlString;

        if (word !== '') {
            optionHtmlString = getOptionHtmlString(word);
            $('#container-options').append(optionHtmlString);
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
    };

    $(function () {
        $('#btn-add-word').on('click', function () {
            onClickAddWord($('#inpt-txt-word').val());
            $('#inpt-txt-word').val('');
        });
        $('#btn-save-options').on('click', function () {
            chrome.storage.sync.clear();
            onClickSaveOptions();
        });
        $('#btn-test').on('click', function () {
            chrome.storage.sync.get(null, function (variable) {
                console.log(variable);
                //TODO: Setup page according to options
            });
        });
        $('#inpt-txt-word').on('keyup', function(e) {
            if (e.which == 13) {
                onClickAddWord($(this).val());
                $(this).val('');
            }
        })
    });
}());
