;(function() {
     "use strict";

     var root      = this
       , app       = root.app
       , vent      = root.app.vent
       , proto     = root.app.prototypes
       , opts      = root.app.options
       , store     = root.app.store
       , regions   = root.app.regions;

     var appController, RouterController, appRouter;

     store.dataViewPref = opts.views.TABLE;

     var networks = new proto.Networks()
       , stationsView = new proto.NetworkTree();

     appController = {
          start: function() {
               regions.map.show(new proto.MapView());
               regions.networks.show(new proto.NetworkList({
                    collection: networks
               }));

               if($(window).width() <= opts.RESPONSIVE_WIDTH) {
                    $('#app').css('width', ($('#app-wrap').width() - regions.networks.$el.width() - 60) + 'px');
               }

               Backbone.history.start();
          },

          stations: function(id) {
               var network = networks.get(id);
               network.fetch({
                    success: function() {
                         regions.tree.show(new proto.NetworkTree({
                              model: network
                         })).open();
                    }
               });
          },

          site: function(data) {
               regions.map.show(regions.map.view.drawSite(data));
          },

          layout: function(info) {
               regions.map.show(new proto.SiteLayout({
                    model: new Backbone.Model({src: opts.imageRoot + info.image})
                  , collection: new Backbone.Collection(info.channel)
               }));
          },

          channel: function(channel_id) {
               var history = new proto.History([], {
                    id: channel_id
               });

               history.fetch({
                    success: function() {
                         regions.history.show(new proto.ChannelView({
                              collection: history
                         }));
                         vent.trigger('open:history');
                    }
               });

               appRouter.navigate('/channel/' + channel_id, {replace: true});
          },

          table: function(channel_id) {
               var history = new proto.History([], {
                    id: channel_id
               });

               history.fetch({
                    success: function() {
                         regions.basic.show(new proto.ChannelView({
                              collection: history
                         }));
                         vent.trigger('open:history');
                    }
               });
          },

          onSidebarClose: function() {
               $('#map-canvas').css({
                    width: $('#app').width()
               });

               vent.trigger('move:map');
          },

          onSidebarOpen: function() {
               $('#map-canvas').css({
                    width: $('#app').width() - ($('#tree').width() + 1)
               });

               vent.trigger('move:map');
          },

          onHistoryOpen: function() {
               var offset = $(window).width() > opts.RESPONSIVE_WIDTH ? opts.MARGIN : 0;

               $('#app-wrap').css('height', ($('body').height() - (regions.history.$el.height() + offset)) + 'px');

               vent.trigger('move:map');
               vent.trigger('move:tree');
          },

          onHistoryClose: function() {
               $('#app-wrap').css('height', '100%');

               vent.trigger('move:map');
               vent.trigger('move:tree');
          },

          onMapMove: function() {
               setTimeout(function() {
                    if(regions.map.view) regions.map.view.render();
               }, opts.ANIMATE_LENGTH);
          },

          onTreeMove: function() {
               setTimeout(function() {
                    if(regions.tree.view) regions.tree.view.resize();
               }, opts.ANIMATE_LENGTH);
          }
     };

     RouterController = Backbone.Router.extend(appController);

     appRouter = new RouterController({
          routes: {
               "site/:site"             : "site",
               "channel/:channel"       : "channel",
               "channel/:channel/table" : "table"
          }
     });

     vent.on('close:layout', function() {
          regions.map.last();
     });

     vent.on('select:site', appController.site);
     vent.on('select:channel', appController.channel);
     vent.on('select:network', appController.stations);
     vent.on('select:layout', appController.layout);
     vent.on('close:sidebar', appController.onSidebarClose);
     vent.on('open:sidebar', appController.onSidebarOpen);
     vent.on('open:history', appController.onHistoryOpen);
     vent.on('close:history', appController.onHistoryClose);
     vent.on('move:map', appController.onMapMove);
     vent.on('move:tree', appController.onTreeMove);

     networks.fetch({
          success: appController.start
     });

}).call(this);