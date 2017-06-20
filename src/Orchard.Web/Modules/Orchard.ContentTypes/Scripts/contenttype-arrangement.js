(function ($) {
    var tabAttrName = 'data-tab';
    var sortableOptionForTabs = {
        placeholder: "placement-placeholder",
        connectWith: 'ul[' + tabAttrName + ']',
        start: function (event, ui) {
            var self = $(ui.item);
            startPos = self.prevAll().size();
        },
        stop: function (event, ui) {
            assignPositionsWithTab(ui.item);
            showSaveMessage();
        }
    };
    function init() {
        var assignPositions = assignPositionsWithoutTab;
        var startPos;
        var allPlacementTabs = $('ul[' + tabAttrName + ']');
        if (allPlacementTabs.length !== 0) {
            for (var i = 0; i < allPlacementTabs.length; i++) {
                var tabName = allPlacementTabs[i].getAttribute(tabAttrName);
                var liUnderTab = $('li[' + tabAttrName + '="' + tabName + '"]');
                if (tabName === "Content")
                    liUnderTab = $('li[content-part]:not([' + tabAttrName + '])');
                if (liUnderTab.length !== 0) {
                    liUnderTab.detach();
                    liUnderTab.appendTo(allPlacementTabs[i]);
                }
            }
            assignPositions = assignPositionsWithTab;

            $('ul[' + tabAttrName + ']').sortable(sortableOptionForTabs);
            $('h3.clickable').on('click', tabTitleClicked);
            $('span.glyphicon-ok').on('click', tabChanged);
            $('span.glyphicon-remove').on('click', tabCancelChange);
        } else {
            $('#placement').sortable({
                placeholder: "placement-placeholder",
                start: function (event, ui) {
                    var self = $(ui.item);
                    startPos = self.prevAll().size();
                },
                stop: function (event, ui) {
                    assignPositions();
                    showSaveMessage();
                }
            });
        }
        assignPositions();

        $('.add-tab').on('click', function () {
            if ($('ul[' + tabAttrName + ']').length <= 0) {
                var newTab = $(createNewTab('Content', false));
                $('#placement').append(newTab);

                // rebind events
                newTab.find('h3.clickable').on('click', tabTitleClicked);
                newTab.find('span.glyphicon-ok').on('click', tabChanged);
                newTab.find('span.glyphicon-remove').on('click', tabCancelChange);
                newTab.find('ul[' + tabAttrName + ']').sortable(sortableOptionForTabs).disableSelection();
            }
            
            var newTab = $(createNewTab('', true));
            $('#placement').append(newTab);

            // rebind events
            newTab.find('h3.clickable').on('click', tabTitleClicked);
            newTab.find('span.glyphicon-ok').on('click', tabChanged);
            newTab.find('span.glyphicon-remove').on('click', tabCancelChange);
            newTab.find('ul[' + tabAttrName + ']').sortable(sortableOptionForTabs).disableSelection();
            $('ul[' + tabAttrName + ']').sortable("refresh");
        });
    }
    
    function tabTitleClicked() {
        toggleVisibility($(this).parent());
    }

    function tabChanged() {
        var parentTabDiv = $(this).parent().parent();
        var newTabName = parentTabDiv.find('input').val();
        reassignTab(parentTabDiv.parent().find('li'), parentTabDiv.find('h3'), newTabName);
        parentTabDiv.next('ul').attr(tabAttrName, newTabName);
        toggleVisibility(parentTabDiv);
        showSaveMessage();
    }

    function tabCancelChange() {
        var parentTabDiv = $(this).parent().parent();
        parentTabDiv.find('input').val(parentTabDiv.find('h3').text());
        toggleVisibility(parentTabDiv);
    }

    function createNewTab(tabName, isTabRename) {
        if (!tabName || tabName === '') {
            tabName = "Click here to edit";
        }
        var clickableClass = "";
        if (isTabRename) {
            clickableClass = "clickable";
        }
        return "<li>" + 
            "<div class='shape-type'>" +
                "<h3 class='" + clickableClass + "'>" + tabName + "</h3>" + 
                    "<div style='display: none'>" +
                        "<input type='text' value='" + tabName + "' />" +
                        "<span class='glyphicon glyphicon-ok'></span>" +
                        "<span class='glyphicon glyphicon-remove'></span>" +
                    "</div>" +
            "</div>" +
            "<ul " + tabAttrName + "='" + tabName + "'></ul>" +
        "</li>";
    }

    function showSaveMessage() {
        $('#save-message').show();
    }

    function toggleVisibility(parentTabDiv) {
        var tabTitle = parentTabDiv.find('h3');
        var inputDiv = parentTabDiv.find('div');
        if (tabTitle.is(":visible")) {
            tabTitle.hide();
            inputDiv.show();
            inputDiv.find('input').select();
        } else {
            tabTitle.show();
            inputDiv.hide();
        }
    }

    function reAssignIdName(input, pos) {
        var name = input.attr('name');
        input.attr('name', name.replace(new RegExp("\\[.*\\]", 'gi'), '[' + pos + ']'));

        var id = input.attr('id');
        input.attr('id', id.replace(new RegExp('_.*__', 'i'), '_' + pos + '__'));
    };

    function reassignTab(childParts, tabHeader, newTabName) {
        if (newTabName !== undefined && newTabName !== '') {
            childParts.find('input[type="hidden"][class="tab"]').val(newTabName);
            tabHeader.text(newTabName);
        }
    }

    function assignPositionsWithoutTab() {
        var position = 0;
        $('.type').each(function () {
            var input = $(this);
            iterateReasign(input, position, true);
            input.val(++position);
        });
    }

    function assignPositionsWithTab(targetPanel) {
        var tabPanel 
        if (targetPanel === undefined || targetPanel === null) {
            tabPanel = $('ul[' + tabAttrName + ']');
        } else {
            tabPanel = $(targetPanel).parent();
        }
        tabPanel.each(function (index) {
            var tabName = $(this).attr(tabAttrName);
            if (tabName === 'Content') {
                tabName = '';
            }
            var tabPosition = 0;
            $(this).children().each(function (index) {
                var positionInput = $(this).find('input.position[type="hidden"]');
                positionInput.val(++tabPosition);

                var tabInput = positionInput.next();
                tabInput.val(tabName);
            });
        });
        var position = 0;
        $('.type').each(function () {
            var input = $(this);
            iterateReasign(input, position, false);
            position++;
        });
    }

    function iterateReasign(input, position, skipTab)
    {
        reAssignIdName(input, position);  // type

        input = input.next();
        reAssignIdName(input, position);  // differentiator

        input = input.next();
        reAssignIdName(input, position);  // zone

        input = input.next();
        reAssignIdName(input, position);  // position

        if (!skipTab) {
            input = input.next();
            reAssignIdName(input, position);  // tab
        }
    }
    $(document).ready(function () {
        init();
    });
})(jQuery);