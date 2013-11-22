;(function() {
	var root = this
	  , app  = root.app
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
	var StationRegion = Backbone.Region.extend({
		events: {
			'click .toggle.close': 'close',
			'click .toggle.open': 'open'
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
				'margin-left': -this.$el.width()
			});

			return this;
		},

		open: function() {
			// Warn application that sidebar is about to open.
			vent.trigger('open:sidebar');
			this.$toggle.attr('class', 'toggle close');
			this.$el.css({
				'margin-left': 0
			});

			return this;
		}
	});

	/** 
	 * Custom region for displaying History
	 *
	 * - Can be closed with the '.close' button.
	 */
	var HistoryRegion = Backbone.Region.extend({
		events: {
			'click .close': 'close'
		},

		close: function() {
			// Tell application that history should be closed.
			vent.trigger('close:history');
		}
	});

	/** 
	 * Custom Region for displaying map and station layout.
	 */
	var MapRegion = Backbone.Region.extend({
		show: function() {
			Backbone.Region.prototype.show.apply(this, arguments);

			// Map should be redrawn after our view is rendered.
			vent.trigger('move:map');
		} 
	});

	/** 
	 * Instantiate our app regions!
	 */
	app.regions = {
		networks: new Backbone.Region({
			el: '#networks',
			renderIn: '.networks'
		}),
		tree: new StationRegion({
			el: '#tree',
			renderIn: '.inner'
		}),
		map: new MapRegion({
			el: '#map-canvas'
		}),
		history: new HistoryRegion({
			el: '#history',
			renderIn: '.inner'
		}),
		basic: new Backbone.Region({
			el: '#basic-wrap'
		})
	};
}).call(this);