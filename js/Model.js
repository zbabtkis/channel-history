;(function() {
	"use strict";

	var root  = this
	  , app   = root.app
	  , proto = root.app.prototypes;
	  
	proto.Network = Backbone.Model.extend({
		url: function() {
			return "api/networks/" + this.get('id');
		}
	});

	proto.Networks = Backbone.Collection.extend({
		model: proto.Network,
		url: 'api/networks'
	});

	proto.History = Backbone.Collection.extend({
		url: function() {
			return 'api/history/' + this.id;
		},

	    comparator: function(model) {
	    	return model.get('ontime');
	    },

	    initialize: function(collectionm, options) {
	    	this.id = options.id;
	    }
	});

}).call(this);
