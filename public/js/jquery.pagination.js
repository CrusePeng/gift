//@charset "utf-8";
/**
 * This jQuery plugin displays pagination links inside the selected elements.
 *
 * This plugin needs at least jQuery 1.4.2
 *
 * @author Gabriel Birke (birke *at* d-scribe *dot* de)
 * @version 2.2
 * @param {int} maxentries Number of entries to paginate
 * @param {Object} opts Several options (see README for documentation)
 * @return {Object} jQuery Object
 */
/**
 * 检查是否是首页末页上一页下一页
 */
function checkPage(str) {
    if(str != "n_after" && str != "n_efore" && str != "before" && str != "after") {
        return true;
    }
}
(function($) {
    /**
     * @class Class for calculating pagination values
     */
    $.PaginationCalculator = function(maxentries, opts) {
        this.maxentries = maxentries;
        this.opts = opts;
    };

    $.extend($.PaginationCalculator.prototype, {
        /**
         * Calculate the maximum number of pages
         *
         * @method
         * @returns {Number}
         */
        numPages : function() {
            return Math.ceil(this.maxentries / this.opts.items_per_page);
        },
        /**
         * Calculate start and end point of pagination links depending on
         * current_page and num_display_entries.
         *
         * @returns {Array}
         */
        getInterval : function(current_page) {
            var ne_half = Math.floor(this.opts.num_display_entries / 2);
            var np = this.numPages();
            var upper_limit = np - this.opts.num_display_entries;
            var start = current_page > ne_half ? Math.max(Math.min(current_page - ne_half, upper_limit), 0) : 0;
            var end = current_page > ne_half ? Math.min(current_page + ne_half + (this.opts.num_display_entries % 2), np) : Math.min(this.opts.num_display_entries, np);
            return {
                start : start,
                end : end
            };
        }
    });

    // Initialize jQuery object container for pagination renderers
    $.PaginationRenderers = {}

    /**
     * @class Default renderer for rendering pagination links
     */
    $.PaginationRenderers.defaultRenderer = function(maxentries, opts) {
        this.maxentries = maxentries;
        this.opts = opts;
        this.pc = new $.PaginationCalculator(maxentries, opts);
    };
    $.extend($.PaginationRenderers.defaultRenderer.prototype, {
        /**
         * Helper function for generating a single link (or a span tag if it's
         * the current page)
         *
         * @param {Number}
         *            page_id The page id for the new item
         * @param {Number}
         *            current_page
         * @param {Object}
         *            appendopts Options for the new item: text and classes
         * @returns {jQuery} jQuery object containing the link
         */
        createLink : function(page_id, current_page, appendopts) {
            var lnk1, np = this.pc.numPages();
            page_id = page_id < 0 ? 0 : (page_id < np ? page_id : np - 1);
            // Normalize
            // page id to
            // sane value
            appendopts = $.extend({
                text : page_id + 1,
                classes : ""
            }, appendopts || {});
            if(page_id == current_page && checkPage(appendopts.classes)) {
                lnk1 = $("<a href=\"javascript:void(0);\" class='current'>" + appendopts.text + "</a>");
            } else {
                lnk1 = $("<a>" + appendopts.text + "</a>").attr('href', this.opts.link_to.replace(/__id__/, page_id));
            }
            if(appendopts.classes) {
                lnk1.addClass(appendopts.classes);
            }
            lnk1.data('page_id', page_id);

            var lnk = $("<li></li>");
            lnk1.appendTo(lnk);
            return lnk;
        },
        // Generate a range of numeric links
        appendRange : function(container, current_page, start, end, opts) {
            var i;
            for( i = start; i < end; i++) {
                this.createLink(i, current_page, opts).appendTo(container);
            }
        },
        getLinks : function(current_page, eventHandler) {
            var begin, end, interval = this.pc.getInterval(current_page), np = this.pc.numPages(), fragment = $("<ul></ul>");

            // Generate "首页"-Link
            if(this.opts.first_text && (current_page > 0)) {
                fragment.append(this.createLink(0, current_page, {
                    text : this.opts.first_text,
                    classes : "first"
                }));
            } else if(this.opts.first_text && (current_page == 0)) {
                fragment.append(this.createLink(0, current_page, {
                    text : this.opts.first_text,
                    classes : "n_efore"
                }));
            }

            // Generate "Previous"-Link
            if(this.opts.prev_text && (current_page > 0)) {
                fragment.append(this.createLink(current_page - 1, current_page, {
                    text : this.opts.prev_text,
                    classes : "before"
                }));
            } else if(this.opts.prev_text && (current_page == 0)) {
                fragment.append(this.createLink(current_page - 1, current_page, {
                    text : this.opts.prev_text,
                    classes : "n_efore"
                }));
            }
            // Generate starting points
            if(interval.start > 0 && this.opts.num_edge_entries > 0) {
                end = Math.min(this.opts.num_edge_entries, interval.start);
                this.appendRange(fragment, current_page, 0, end, {
                    classes : 'sp'
                });
                if(this.opts.num_edge_entries < interval.start && this.opts.ellipse_text) {
                    $("<li><a href=\"#\" class=\"n_efore\">" + this.opts.ellipse_text + "</a></li>").appendTo(fragment);
                }
            }
            // Generate interval links
            this.appendRange(fragment, current_page, interval.start, interval.end);
            // Generate ending points
            if(interval.end < np && this.opts.num_edge_entries > 0) {
                if(np - this.opts.num_edge_entries > interval.end && this.opts.ellipse_text) {
                    $("<li><a href=\"#\" class=\"n_efore\">" + this.opts.ellipse_text + "</a></li>").appendTo(fragment);
                }
                begin = Math.max(np - this.opts.num_edge_entries, interval.end);
                this.appendRange(fragment, current_page, begin, np, {
                    classes : 'ep'
                });

            }
            // Generate "Next"-Link
            if(this.opts.next_text && (current_page < np - 1)) {
                fragment.append(this.createLink(current_page + 1, current_page, {
                    text : this.opts.next_text,
                    classes : "after"
                }));
            } else if(this.opts.next_text && (current_page == np - 1)) {
                fragment.append(this.createLink(current_page + 1, current_page, {
                    text : this.opts.next_text,
                    classes : "n_after"
                }));
            }
            // Generate "末页"-Link
            if(this.opts.last_text && (current_page < np - 1)) {
                fragment.append(this.createLink(np - 1, current_page, {
                    text : this.opts.last_text,
                    classes : "last"
                }));
            } else if(this.opts.last_text && (current_page == np - 1)) {
                fragment.append(this.createLink(np - 1, current_page, {
                    text : this.opts.last_text,
                    classes : "n_after"
                }));
            }
            $('a', fragment).click(eventHandler);
            return fragment;
        }
    });

    // Extend jQuery
    $.fn.pagination = function(maxentries, opts) {

        // Initialize options with default values
        opts = $.extend({
            items_per_page : 10,
            num_display_entries : 11,
            current_page : 0,
            num_edge_entries : 0,
            link_to : "#",
            anchor : false,
            prev_text : "上一页",
            next_text : "下一页",
            first_text : "首页",
            last_text : "末页",
            ellipse_text : "...",
            prev_show_always : true,
            next_show_always : true,
            renderer : "defaultRenderer",
            show_if_single_page : false,
            load_first_page : false,
            orderfield : "ctime",
            order : "desc",
            page_index : false,
            callback : function() {
                return false;
            }
        }, opts || {});

        var containers = this, renderer, links, current_page;

        /**
         * This is the event handling function for the pagination links.
         *
         * @param {int}
         *            page_id The new page number
         */
        function paginationClickHandler(evt) {
            var links, new_current_page = $(evt.target).data('page_id'), continuePropagation = selectPage(new_current_page);
            if(!continuePropagation) {
                evt.stopPropagation();
            }
            return continuePropagation;
        }

        /**
         * This is a utility function for the internal event handlers. It sets
         * the new current page on the pagination container objects, generates a
         * new HTMl fragment for the pagination links and calls the callback
         * function.
         */
        function selectPage(new_current_page) {
            // update the link display of a all containers
            containers.data('current_page', new_current_page);
            links = renderer.getLinks(new_current_page, paginationClickHandler);
            containers.empty();
            links.appendTo(containers);
            var orderfield = opts.orderfield;
            var order = opts.order;
            if(opts.anchor != false) {
                var orderY = $(opts.anchor).offset().top;
                $(window).scrollTop(orderY);
            }
            if(order == false && orderfield == false) {
                // call the callback and propagate the event if it does not
                // return false
                var continuePropagation = opts.callback(new_current_page);
            } else {
                if(opts.page_index == false) {
                    // call the callback and propagate the event if it does not
                    // return false
                    var continuePropagation = opts.callback(new_current_page, orderfield, order);
                } else {
                    // call the callback and propagate the event if it does not
                    // return false
                    var continuePropagation = opts.callback(opts.page_index, orderfield, order);
                }
            }
            return continuePropagation;
        }

        // -----------------------------------
        // Initialize containers
        // -----------------------------------
        current_page = parseInt(opts.current_page);
        containers.data('current_page', current_page);
        // Create a sane value for maxentries and items_per_page
        maxentries = (!maxentries || maxentries < 0) ? 1 : maxentries;
        opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0) ? 1 : opts.items_per_page;

        if(!$.PaginationRenderers[opts.renderer]) {
            throw new ReferenceError("Pagination renderer '" + opts.renderer + "' was not found in jQuery.PaginationRenderers object.");
        }
        renderer = new $.PaginationRenderers[opts.renderer](maxentries, opts);

        // Attach control events to the DOM elements
        var pc = new $.PaginationCalculator(maxentries, opts);
        var np = pc.numPages();
        containers.bind('setPage', {
            numPages : np
        }, function(evt, page_id) {
            if(page_id >= 0 && page_id < evt.data.numPages) {
                selectPage(page_id);
                return false;
            }
        });
        containers.bind('prevPage', function(evt) {
            var current_page = $(this).data('current_page');
            if(current_page > 0) {
                selectPage(current_page - 1);
            }
            return false;
        });
        containers.bind('nextPage', {
            numPages : np
        }, function(evt) {
            var current_page = $(this).data('current_page');
            if(current_page < evt.data.numPages - 1) {
                selectPage(current_page + 1);
            }
            return false;
        });
        // When all initialisation is done, draw the links
        links = renderer.getLinks(current_page, paginationClickHandler);
        containers.empty();
        if(np > 1 || opts.show_if_single_page) {
            links.appendTo(containers);
        }
        // call callback function
        if(opts.load_first_page) {
            opts.callback(current_page, containers);
        }
    };
    // End of $.fn.pagination block
})(jQuery);
