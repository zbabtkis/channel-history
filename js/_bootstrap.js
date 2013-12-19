;(function() {
	"use strict";

	var root     = this
      , vent     = _.extend({}, Backbone.Events); // Event aggregator to keep app components decoupled

    // Our namespace -- original huh...
  	root.app            = {};
  	// Holds the prototypes for application models, views, etc.
  	root.app.prototypes = {};
  	// Holds application settings and options.
  	root.app.options    = {};
	// Holds application regions.
	root.app.regions    = {};
  	// Make our event aggregator accessible via the app namespace.
  	root.app.vent       = vent;
  	// Make localStorage available through our app namespace.
  	root.app.store      = window.localStorage || {};

}).call(this);
