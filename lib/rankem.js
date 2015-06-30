(function($) {

    var minHeight = 20;

    function addDragOntoDiv(height, top, extraClass, containerLeft, container) {
        var arrow = $('<div class="kem-arrow">').css({
            left: containerLeft
        });
        $('<div class="kem-drag-onto ' + extraClass + '" />').css({
            height: height + 'px',
            top: top + 'px'
        }).appendTo('body').on('dragenter.kem', allowDrop).on('dragover.kem', allowDrop).on('dragleave.kem', dragLeave).on('drop.kem', function(event) {
            var dragOntoDiv = $(event.delegateTarget);
            var newDropTarget;
            var dropIndex;
            var oldRank;
            if(dragOntoDiv.hasClass('kem-drag-onto')) {
                if (dragOntoDiv.hasClass('kem-drag-onto-top')) {
                    newDropTarget = $('<div class="kem-rank" />').prependTo(container);
                } else if (dragOntoDiv.hasClass('kem-drag-onto-between')) {
                    dropIndex = $('.kem-drag-onto-between').index(dragOntoDiv)
                    newDropTarget = $('<div class="kem-rank" />');
                    container.find('.kem-rank').eq(dropIndex).after(newDropTarget);
                } else {
                    dropIndex = $('.kem-drag-onto-on').index(dragOntoDiv);
                    newDropTarget = container.find('.kem-rank').eq(dropIndex);
                }
                oldRank = $('.kem-dragging').closest('.kem-rank');
                $('.kem-dragging').detach().appendTo(newDropTarget).removeClass('kem-dragging');
                if (oldRank.find('.kem-item').length === 0) {
                    oldRank.remove();
                }
            }
        }).append(arrow);
    }

    function allowDrop(event) {
        if (event.originalEvent.dataTransfer && event.originalEvent.dataTransfer.types.indexOf("kem") > -1) {
            event.preventDefault();
            $(event.delegateTarget).addClass('kem-dragging-over');
        }
    }

    function dragLeave(event) {
        $(event.delegateTarget).removeClass('kem-dragging-over');
    }

    /**
     * Drag onto divs should be 3/5s dragging onto a rank and 2/5s dragging off of a rank
     */
    function createDragOntoDivs(container, containerLeft) {
        var i, heightBetween, topBetween = 0, top, height, fifthOfSection, cur, next, curMid, nextMid = null, arrow, elems;
        elems = container.find('.kem-rank');
        if(elems.length > 0) {
            heightBetween = Math.max($(elems[0]).offset().top, minHeight)
            addDragOntoDiv(heightBetween, topBetween, 'kem-drag-onto-top', containerLeft, container);
        }
        for(i = 0; i < elems.length - 1; i++) {
            top = topBetween + heightBetween;
            cur = $(elems[i]);
            next = $(elems[i+1]);
            curMid = nextMid || (cur.offset().top + cur.outerHeight()/2);
            nextMid = next.offset().top + next.outerHeight()/2;
            fifthOfSection = (nextMid - curMid)/5;
            topBetween = curMid + 1.5 * fifthOfSection;
            height = topBetween - top;
            heightBetween = 2 * fifthOfSection;
            addDragOntoDiv(height, top, 'kem-drag-onto-on', containerLeft, container);
            addDragOntoDiv(heightBetween, topBetween, 'kem-drag-onto-between', containerLeft, container);
        }
        if(elems.length > 0) {
            top = topBetween + heightBetween;
            cur = $(elems[elems.length - 1])
            height = cur.outerHeight() - (top - cur.offset().top);
            heightBetween = Math.max($(window).height() - top - height, minHeight);
            topBetween = $(window).height() - heightBetween;
            addDragOntoDiv(height, top, 'kem-drag-onto-on', containerLeft, container);
            arrow = $('<div class="kem-arrow">').css({
                left: containerLeft
            });
            $('<div class="kem-drag-onto kem-drag-onto-bottom" />').css({
                top: topBetween + 'px',
                bottom: '0px'
            }).appendTo('body').on('dragenter.kem', allowDrop).on('dragover.kem', allowDrop).on('dragleave.kem', dragLeave).on('drop.kem', function(event) {
                var newDropTarget;
                var oldRank;
                newDropTarget = $('<div class="kem-rank" />').appendTo(container);
                oldRank = $('.kem-dragging').closest('.kem-rank');
                $('.kem-dragging').detach().appendTo(newDropTarget).removeClass('kem-dragging');
                if (oldRank.find('.kem-item').length === 0) {
                    oldRank.remove();
                }
            }).append(arrow);
        }
    }

    /**
     * An overarching goal of this library is for all state to be expressed in the DOM, so that it can both be used for
     * CSS and so the library itself can remain stateless
     */
    $.fn.rankem = function(options) {
        this.addClass('kem-container');
        if(options.ties === true) {
            this.addClass('kem-ties');
        }
        this.each(function () {
            var $elem = $(this),
                rank = $('<div class="kem-rank" />').appendTo(this);
            $elem.find('.kem-item').each(function() {
                $item = $(this);
                $item.appendTo(rank);
            }).attr('draggable', true).on('dragstart.kem', function(event){
                var dragging = $(event.currentTarget),
                    link = dragging.find('a'),
                    dt = event.originalEvent.dataTransfer;
                dt.effectAllowed = 'move';
                dt.setData("kem", ".kem-dragging");
                dt.setData('text/html', event.currentTarget.outerHTML);
                if(link.length > 0 && link.attr('href')) {
                    dt.setData("text/uri-list", link.attr('href'));
                }
                // Chrome does not allow you to change the DOM during a dragstart
                setTimeout(function() {
                    dragging.addClass('kem-dragging');
                    createDragOntoDivs($elem, $elem.offset().left);
                }, 1);
            }).on('dragend.kem', function(event) {
                $(event.currentTarget).removeClass('.kem-dragging');
                $('.kem-drag-onto').remove();
            });
        });
        //$('.kem-drag-onto').hide();
    }
}(jQuery))
