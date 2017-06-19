(function ($) {
    var tabAttrName = 'data-tab';
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

            $('ul[' + tabAttrName + ']').sortable({
                placeholder: "placement-placeholder",
                connectWith: 'ul[' + tabAttrName + ']',
                start: function (event, ui) {
                    var self = $(ui.item);
                    startPos = self.prevAll().size();
                },
                stop: function (event, ui) {
                    assignPositions(ui.item);
                    $('#save-message').show();
                }
            });
        } else {
            $('#placement').sortable({
                placeholder: "placement-placeholder",
                start: function (event, ui) {
                    var self = $(ui.item);
                    startPos = self.prevAll().size();
                },
                stop: function (event, ui) {
                    assignPositions();
                    $('#save-message').show();
                }
            });
        }
        assignPositions();
    }

    function reAssignIdName(input, pos) {
        var name = input.attr('name');
        input.attr('name', name.replace(new RegExp("\\[.*\\]", 'gi'), '[' + pos + ']'));

        var id = input.attr('id');
        input.attr('id', id.replace(new RegExp('_.*__', 'i'), '_' + pos + '__'));
    };

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

    init();
})(jQuery);