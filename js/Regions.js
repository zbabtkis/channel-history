;(function() {
	"use strict";

	var root = this
	  , app  = root.app
	  , settings = app.options
	  , proto    = app.prototypes
	  , vent = app.vent;

	/**
	 * Backbone.Region
	 * ---------------
	 *
	 * An extension of Backbone.View designed as a container for single views.
	 * It's primary function is to manage adding, rendering and removing Backbone.Views 
	 * from the DOM. A backbone region can also implement transitions between views.
	 *
	 * Example
	 * -------
	 * var myRegion = new Backbone.Region({el: '#my-region'});
	 * var myView = Backbone.View.extend({render: function() { this.$el.html("I am a view!")}});
	 * 
	 * myRegion.show(myView);
	 * myRegion.hide();
	 */
	Backbone.Region = Backbone.View.extend({
		/**
		 * Use this.renderIn to display views inside sub element
		 */
		initialize: function(options) {
			this.container = options.renderIn ? this.$(options.renderIn) : this.$el;
		},

		/**
		 * Replaces current view with new view and handles destruction of old view.
		 *  - Last view is cached so it can be returned to with the "last" method.
		 */
		show: function(view) {
			var $el;

			// Destroy markup currently in region container.
			this.container.empty();
			// Remove old cached view.
			if (this._view) this._view.remove();

			$el = view.render().$el;

			// Cache last view.
			this._view = this.view;
			this.view = view;

			this.container.append($el);

			return this;
		},

		hide: function() {
			this.$el.css('display', 'none');

			return this;
		},

		last: function() {
			// Render last view.
			this.show(this._view);

			return this;
		},

		remove: function() {
			Backbone.View.prototype.remove.apply(this, arguments);

			// Destroy cached view as well.
			if(this._view) {
				this._view.remove();
				delete this._view;
			}
		}
	});

	/** 
	 * Custom region to display station trees.
	 * 
	 * Can be opend and cloesd with 'toggle' button.
	 */
	proto.SidebarRegion = Backbone.Region.extend({
		events: {
			'click .toggle.close': 'close',
			'click .toggle.open':  'open'
		},

		initialize: function() {
			Backbone.Region.prototype.initialize.apply(this, arguments);
			this.$toggle = this.$('.toggle');
		},

		close: function() {
			// Warn application that sidebar is about to close.
			vent.trigger('close:sidebar');
			this.$toggle.attr('class', 'toggle open');
			this.$el.css({
				'margin-left': - this.$el.width() - 14 + 'px'
			});

			this.isOpen = false;

			return this;
		},

		fitContents: function() {
			var $nets = this.$('#networks')
			  , $tree = this.$('#tree');
			
			console.log(app.$el);

	
			$tree.css('height', app.$el.height() - $nets.height());

			return this;
		},

		open: function() {
			vent.trigger('open:sidebar');
			this.$toggle.attr('class', 'toggle close');
			this.$el.css({
				'margin-left': 0
			});

			this.isOpen = true;

			return this;
		},

		isOpen: false
	});

	/** 
	 * Custom region for displaying History
	 *
	 * - Can be closed with the '.close' button.
	 */
	proto.HistoryRegion = Backbone.Region.extend({
		events: {
			'click .close': 'close',
			"dragstart": "windowView"
		},

		windowView: function(e) {
			// Open new window to display table in.
			this.external = window.open("", "History", 'left=-500, top=0, toolbar=no, status=no, location=no, menubar=no');

			var edom  = this.external.document;

			// Add helper class to blank window
			edom.body.className = "no-app";

			// Add styles to blank window
			copyStyles(document, edom);

			// When app closes or reloads, current table window should be closed.
			window.addEventListener('unload', function() {
				this.external.close();
			}.bind(this), null);

			// This is needed for drop on new window to work.
			edom.body.addEventListener('dragover', function(e) {
				e.preventDefault();
			}, false);	

			// Close window if user decides not to drop table.
			edom.body.addEventListener('dragleave', function() {
				this.external.close();
			}.bind(this), false);

			// Listen for user dropping table on new window.
			edom.body.addEventListener('drop', function(e) {
				edom.body.appendChild(this.el);
				// Does history close animation and other tasks related to history closing.
				vent.trigger('close:history');
				e.preventDefault();
			}.bind(this), false);

			// When external table window is closed, table should be inserted back into app.
			this.external.addEventListener('unload', function(e) {
				document.body.appendChild(this.el);
				// Does history open animation and other necessary tasks for reinsertion.
				vent.trigger('open:history');
			}.bind(this));
		},

		close: function() {
			// Tell application that history should be closed.
			vent.trigger('close:history');
		}
	});

	/** 
	 * Custom Region for displaying map and station layout.
	 */
	proto.MapRegion = Backbone.Region.extend({
		show: function() {
			Backbone.Region.prototype.show.apply(this, arguments);

			// Map should be redrawn after our view is rendered.
			vent.trigger('move:map');
		},

		resize: function(offset) {
			this.$el.css({
				width: app.$el.width() - settings.BORDER - offset 
			});
		}
	});

}).call(this);
