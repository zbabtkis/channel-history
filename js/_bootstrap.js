;(function() {
	var root     = this
	  , ls       = root.localStorage || {}
      , vent     = _.extend({}, Backbone.Events);

  	root.app            = {};
  	root.app.prototypes = {};
  	root.app.options    = {};
  	root.app.vent       = vent;
  	root.app.store      = ls;

}).call(this);