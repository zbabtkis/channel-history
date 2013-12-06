;(function() {
	var root = this
		app = root.app,
		proto = app.prototypes,
		vent = app.vent,
		store = app.store,
		$app = $('#app'),
		$side = $('#sidebar'),
		$nets = $('#networks');

	/**
	 * Prototype of ChannelView
	 */
	proto.ChannelView = Backbone.View.extend({
		className: 'region',

		template: function() {
			return _.template($(store.dataViewPref).html());
		},

		initialize: function() {
			_.bindAll(this, 'remove');
		},

		render: function() {
			var locals = {
				results: _.groupBy(this.collection.toJSON(), 'pub_name'),

				// date formatter to use in template.
				date: function(date) {
					var date = new Date(parseFloat(date) * 1000),
						m = date.getMonth() + 1,
						d = date.getDate(),
						y = date.getFullYear();

					return m + '/' + d + '/' + y;
				}
			};

			this.$el.hide()
				.html(this.template()(locals))
				.fadeIn('fast');

			return this;
		},

		remove: function() {
			var _this = this;
			this.$el.fadeOut('fast', function() {
				_this.trigger('remove');
				Backbone.View.prototype.remove.apply(_this, arguments);
			});
		}
	});

	/**
	 * MapView
	 */
	proto.MapView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render', 'drawSite');

			window.map = this.map = new google.maps.Map(this.el, app.options.map);

			// Re-render map after animation has occured.
			setTimeout(this.render, app.options.ANIMATE_LENGTH);
		},

		render: function() {
			this.$el.attr('style', 'width: 100%; height:100%;');

			return this;
		},

		drawSite: function(data) {
			var info = data.info,
				site = new google.maps.LatLng(data.lat, data.lon);

			if (this.marker) {

				// Remove previous marker from map.
				this.marker.setMap(null);

			}

			if (info) {

				// Info contains info about a special layout map to use.
				var imageBounds = new google.maps.LatLngBounds(
					new google.maps.LatLng(info.bounds.x0, info.bounds.y0),
					new google.maps.LatLng(info.bounds.x1, info.bounds.y1)

				);

				this.marker = new google.maps.GroundOverlay(
					app.options.imageRoot + info.thumbbe,
					imageBounds, 70);
				this.marker.setMap(this.map);

				// When layout icon is clicked, trigger a layout selection.
				google.maps.event.addListener(this.marker, 'click', function() {
					vent.trigger('select:layout', info)
				});

			} else {

				// If no app info, display simple dot on map where station is.
				this.marker = new google.maps.Circle({
					center: site,
					fillColor: 'yellow',
					radius: 20,
					map: this.map
				});
			}

			// Center site on selected station.
			this.map.setCenter(site);
			this.map.setZoom(17);

			return this;
		}
	});

	/**
	 * SiteLayoutView
	 */
	proto.SiteLayout = Backbone.View.extend({
		events: {
			'click .close': 'close',
			'click .channel.active': 'channel'
		},

		template: _.template($("#channel-template").html()),

		close: function() {
			vent.trigger('close:layout');
		},

		render: function() {
			var close = $('<div class="icon dark close"></div>');

			this.$el.empty();

			this.$el.prepend(close);
			this.$el.append($("<img />", {
				src: this.model.get('src')
			}));

			this.$el.append(this.template({
				channels: this.collection.toJSON()
			}));

			return this;
		},

		channel: function(e) {
			var id = $(e.currentTarget).data('id');

			vent.trigger('select:channel', id)
		}
	});

	/**
	 * Prototype of NetworkList
	 */
	proto.NetworkList = Backbone.View.extend({
		events: {
			'click .network': 'openLeaf'
		},

		initialize: function() {
			_.bindAll(this, 'render', 'highlight');

			vent.on('select:network', this.marker);
		},

		template: _.template("<% _.each(networks, function(network) { %><span data-id='<%= network.id %>' class='network'><%=network.id%></span><% }); %>"),

		render: function() {
			var html = this.template({
				networks: this.collection.toJSON()
			});
			this.$el.html(html);

			return this;
		},

		highlight: function(id) {
			this.$el.find('.active').removeClass('active');
			this.$el.find('[data-id=' + id + ']').addClass('active');

			return this;
		},

		openLeaf: function(e) {
			vent.trigger('select:network', $(e.currentTarget).html());

			return this;
		}
	});

	proto.NetworkTree = Backbone.View.extend({
		defaults: {
			duration: 300,
			margin: {
				left: 0,
				right: 0,
				left: 0,
				right: 0
			}
		},

		initialize: function(options) {
			_.bindAll(this, 'toggle', 'collapse');

			this.layout = d3.layout.tree();
			this.diagonal = d3.svg.diagonal();
			this.svg = d3.select(this.el).append('svg:svg');

			options = options || {};
			this.options = _.defaults(options, this.defaults);
		},

		render: function() {
			var HEIGHT = $('#tree').height(),
				WIDTH  = $('#tree').width(),
				LMARG  = this.options.margin.left,
				RMARG  = this.options.margin.right;

			this.svg
				.attr('viewBox', '0 0 ' + WIDTH + ' ' + HEIGHT)
				.attr('preserveAspectRatio', 'xMinYMid meet')
				.append('g')
					.attr('transform', 'translate(' + LMARG + ',' + RMARG + ')');

			this.layout.size([HEIGHT, WIDTH]);
			this.diagonal.projection(function(d) {
				return [d.y, d.x];
			});

			this.model.set('x0', HEIGHT / 2);
			this.model.set('y0', 0);
			this.model.get('children').forEach(this.collapse);

			d3.select(self.frameElement).style('height', HEIGHT);

			this.update(this.model.toJSON());

			return this;
		},

		resize: function() {
			var WIDTH = $("#tree").width()
			  , HEIGHT = $("#tree").height();

			this.svg
				.attr('width', WIDTH)
				.attr('height', HEIGHT);
		},

		collapse: function(d) {
			if (d.children) {
				d._children = d.children;
				d._children.forEach(this.collapse);
				delete d.children;
			}
		},

		update: function(source) {
			var nodes = this.layout.nodes(this.model.toJSON()).reverse() // Why reverse?
				,
				links = this.layout.links(nodes),
				_this = this;

			// Set -10 for left margin on first node and 180 * depth for all others.
			nodes.forEach(function(d) {
				d.y = d.depth * 180 || -10;
			});

			var node = this.svg.selectAll('g.node')
				.data(nodes, function(d) {
					return d.name;
				});

			var nodeEnter = node.enter().append('g')
				.attr('class', 'node')
				.attr('transform', function(d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
				})
				.on('click', this.toggle);

			nodeEnter.append('text')
				.attr('x', function(d) {
					return d.children || d._children ? -10 : 10
				})
				.attr('dy', '.35em')
				.attr('text-anchor', function(d) {
					return d.children || d._children ? "end" : "start";
				})
			.text(function(d) {
					return d.name;
				})
				.style('font-size', '16px')
				.style("fill-opacity", 1e-6);

			var nodeUpdate = node.transition()
				.duration(this.options.duration)
				.attr('transform', function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

			nodeUpdate.select('text')
				.style('fill', '#222')
				.attr('font-family', 'Tahoma')
				.style('fill-opacity', 1);

			var nodeExit = node.exit().transition()
				.duration(this.options.duration)
				.attr('transform', function(d) {
					return "translate(" + source.y + "," + source.x + ")"
				})
				.remove();

			nodeExit.select('text')
				.style('fill-opacity', 1e-6);

			var link = this.svg.selectAll('path.link')
				.data(links, function(d) {
					return d.target.name;
				});

			link.enter().insert('path', 'g')
				.attr('class', 'link')
				.attr('d', function(d) {
					var o = {
						x: source.x0,
						y: source.y0
					};
					return _this.diagonal({
						source: o,
						target: o
					});
				});

			link.transition()
				.duration(this.options.duration)
				.attr('d', _this.diagonal);

			link.exit().transition()
				.duration(this.options.duration)
				.attr('d', function(d) {
					var o = {
						x: source.x,
						y: source.y
					};
					return _this.diagonal({
						source: o,
						target: o
					});
				})
				.remove();

			nodes.forEach(function(d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		},

		toggle: function(d) {
			if (d.children) {
				d._children = d.children;
				delete d.children;
			} else {
				d.children = d._children;
				delete d._children;

				if (d.lat && d.lon) {
					vent.trigger('select:site', d);
				}
			}

			if (d.history) {
				vent.trigger('select:channel', d.name);
			} else {
				this.update(d);
			}
		}
	});
}).call(this);
