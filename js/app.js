/**
 * NEES Channel History
 *  - A web interface for viewing equipment history at various NEES@UCSB stations.
 * 
 * @version 1.0.0
 * @author  Zachary Babtkis <zackbabtkis@gmail.com>
 * @date    November 22, 2013
 * @website http://webdlmon.nees.ucsb.edu/zhst/
 * 
 * If you can adapt this to work in your own project, feel free to use it 
 * without restrictions.
 */

;(function() {
     "use strict";

     var root      = this
       , app       = root.app
       , vent      = app.vent
       , proto     = app.prototypes
       , opts      = app.options
       , store     = app.store
       , regions   = app.regions;   

     var appController, RouterController, appRouter;

     /**
      * Default history view should be a  table
      */
     store.dataViewPref = opts.views.TABLE;

     var networks     = new proto.Networks()
       , stationsView = new proto.NetworkTree();

     /**
      * App Controller
      *
      * - Performs general application tasks and updates Region contents.
      * - Available callbacks for view events from app vent.
      */
     appController = {

          /**
           * Bootstraps application default state 
           *  - called when networks are loaded from server call
           */
          start: function() {
			   app.$el = $('#app');

               var mapView = new proto.MapView()
                 , netView = new proto.NetworkList({collection: networks})
				 , _this   = this;

				
			   /** 
			    * Instantiate our app regions!
			    */
			   
			   regions.sidebar = new proto.SidebarRegion({
			   		el: '#sidebar'
			   });
			   regions.networks = new Backbone.Region({
			   		el: '#networks',
			   		renderIn: '.networks'
			   });
			   regions.tree = new Backbone.Region({
			   		el: '#tree'
			   	});
			   regions.map = new proto.MapRegion({
			   		el: '#map-canvas'
			   });
			   regions.history = new proto.HistoryRegion({
			   		el: '#history',
			   		renderIn: '.inner'
			   });
			   regions.basic = new Backbone.Region({
			   		el: '#basic-wrap'
			   });

               _.bindAll(this, 'onResize');

               // Show networks list in Networks region.
               regions.networks.show(netView);

               // Show default map (without site overlays).
               regions.map.show(mapView);

			   $.getJSON('/zhst/api/sites')
			   	.done(function(data) {
					for(var i = 0, j = data.length; i < j; i++) {
						mapView.drawSite(data[i]);
					}
				});

               // Bind resize event to throttled controller action.
               $(window).resize(function() {
					_this.resizing = setTimeout(function() {
						clearTimeout(_this.resizing);
						_this.onResize();
					}, 300);
				});
               // Perform default resizing.

               Backbone.history.start();
          },

          /**
           * Display tree of stations from selected network
           *
           * @param {Int} id ID of selected network
           */
          stations: function(id) {
               var network = networks.get(id);

               network.fetch({
                    success: function() {
                         var statView = new proto.NetworkTree({model: network});
                         regions.tree.show(statView);

                    }
               });
          },

          /**
           * Displays new map in map region of selected site
           *
           * @param {Object} data Information about site including co-ords
           */
          site: function(data) {
               regions.map.view.showSite(data);
          },

          /** 
           * Displays image view of site layout in map region.
           * 
           * @param {Object} info Data necessary to place each sensor on the map.
           */
          layout: function(info) {
               var meta     = new Backbone.Model({src: opts.imageRoot + info.image})
                 , channels = new Backbone.Collection(info.channel)
                 , layout   = new proto.SiteLayout({model: meta,collection: channels});

               // Display channel layout (map or cross section) in map region.
               regions.map.show(layout);
          },

          /**
           * Displays history of channel equipment in history region
           * 
           * @param {String} channel_id REGEX'd ID of channel to fetch.
           * @param {Backbone.Region} region Region to display view in.
           */
          channel: function(channel_id, region) {
               //Empty collection to fetch from.
               var history = new proto.History([], {id: channel_id});

               region = region || regions.history;

               history.fetch({
                    success: function() {
                         var hist = new proto.ChannelView({collection: history});

                         // History can be displayed in History region or Basic region.
                         region.show(hist);
                         vent.trigger('open:history');
                    }
               });

               // Save state here so user can return to channel information via bookmark/history.
               appRouter.navigate('/channel/' + channel_id, {replace: true});
          },

          /** 
           * A simple hook for rendering basic channel history information 
           * without all the other app clutter.
           * 
           * @param {String} channel_id REGEX'd ID of channel to fetch.
           */
          table: function(channel_id) {
               this.channel(channel_id, regions.basic);
          },

          /** 
           * Handles responsive app actions -- proxied from window.onresize.
           */
          onResize: function() {
               if($(window).width() <= opts.RESPONSIVE_WIDTH) {
					var sb = regions.sidebar;

					if(sb.isOpen) {
						this.onSidebarOpen();
					} else {
						this.onSidebarClose();
					}
               }
          },

          /**
           * Called when sidebar (containing station tree is closed).
           */
          onSidebarClose: function() {
			   var offset = parseInt(regions.sidebar.$el.css('margin-left'), 10);

			   regions.map.resize(offset);
			
               vent.trigger('move:map');
          },

          /**
           * Called when sidebar is opened.
           */
          onSidebarOpen: function() {
			   var offset = parseInt(regions.sidebar.$el.css('margin-left'), 10);

			   regions.map.resize(-offset);
               vent.trigger('move:map');
          },

          /** 
           * Called when history is displayed.
           */
          onHistoryOpen: function() {
               var offset = $(window).width() > opts.RESPONSIVE_WIDTH ? opts.MARGIN : 0
				 , $app   = app.$el
			 	 , $table = $('#history')
				 , size   = $table.height() ? $table.height() + offset : 0;
 
			   app.$el.css('height', $(document.body).height() - size); 
			   regions.history.$el.addClass('open');

               vent.trigger('move:map');
               vent.trigger('move:tree');
          },

          /** 
           * Called when history is hidden.
           */
          onHistoryClose: function() {
               app.$el.css('height', '100%');

			   regions.history.$el.removeClass('open');
               vent.trigger('move:map');
               vent.trigger('move:tree');
          },

          /** 
           * When container containing map is somehow resized or moved.
           */
          onMapMove: function() {
               setTimeout(function() {
                    if(regions.map.view) regions.map.view.render();
               }, opts.ANIMATE_LENGTH);
          },

          /**
           * When container containing station tree is resized or moved.
           */
          onSidebarMove: function() {
            regions.sidebar.fitContents();
               setTimeout(function() {
					regions.sidebar.fitContents();
                    if(regions.tree.view) regions.tree.view.resize();
               }, opts.ANIMATE_LENGTH);
          }
     };

     // Router inherits methods from appController.
     RouterController = Backbone.Router.extend(appController);

     // Route hashchanges to appRouter actions.
     appRouter = new RouterController({
          routes: {
               "site/:site"             : "site",
               "channel/:channel"       : "channel",
               "channel/:channel/table" : "table"
          }
     });

     vent.on('close:layout', function() {
          // Revert to previous view in map region when layout view is closed.
          regions.map.last();
     });

     /**
      * Hook into view events and trigger application state changes.
      */
     vent.on('select:site', appController.site);
     vent.on('select:channel', appController.channel);
     vent.on('select:network', appController.stations);
     vent.on('select:layout', appController.layout);
     vent.on('close:sidebar', appController.onSidebarClose);
     vent.on('open:sidebar', appController.onSidebarOpen);
     vent.on('open:history', appController.onHistoryOpen);
     vent.on('close:history', appController.onHistoryClose);
     vent.on('move:map', appController.onMapMove);
     vent.on('move:tree', appController.onSidebarMove);

     /**
      * This in essence starts the application by bootstrapping network data
      */
     networks.fetch({
          success: _.bind(appController.start, appController)
     });

}).call(this);
