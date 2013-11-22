;(function() {
	var root = this
	  , app  = root.app
	  , vent = app.vent;

	Backbone.Region = Backbone.View.extend({
		initialize: function(options) {
			this.container = options.renderIn ? this.$(options.renderIn) : this.$el;
		},

		show: function(view) {
			var $el;

			this.container.empty();
			if (this._view) this._view.remove();

			$el = view.render().$el;

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
			this.show(this._view);

			return this;
		},

		remove: function() {
			Backbone.View.prototype.remove.apply(this, arguments);

			if(this._view) {
				this._view.remove();
				delete this._view;
			}
		}
	});

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
			vent.trigger('close:sidebar');
			this.$toggle.attr('class', 'toggle open');
			this.$el.css({
				'margin-left': -this.$el.width()
			});

			return this;
		},

		open: function() {
			vent.trigger('open:sidebar');
			this.$toggle.attr('class', 'toggle close');
			this.$el.css({
				'margin-left': 0
			});

			return this;
		}
	});

	var HistoryRegion = Backbone.Region.extend({
		events: {
			'click .close': 'close'
		},

		show: function() {
			Backbone.Region.prototype.show.apply(this, arguments);

			if(app.store.dataViewPref === app.options.views.TABLE) {
				this.$el.addClass('hovered');
			}
		},

		close: function() {
			vent.trigger('close:history');
		}
	});

	var MapRegion = Backbone.Region.extend({
		show: function() {
			Backbone.Region.prototype.show.apply(this, arguments);

			vent.trigger('move:map');
		} 
	});

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