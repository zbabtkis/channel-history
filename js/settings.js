;(function() {
	var root     = this
	  , app      = root.app
	  , settings = app.options;

	//  Map channel history view template options.
	settings.views = {
		BLOCK: '#history-template',
		TABLE: '#history-table-template'
	};

	// Duration of CSS animations (used for JS callbacks)
	settings.ANIMATE_LENGTH   = 400;
	// How wide should we start using responsive layout?
	settings.RESPONSIVE_WIDTH = 1200;
	// Margin to use around application.
	settings.MARGIN           = 50;

	// Where station images are stored on server.
	settings.imageRoot = '/zhst/sites/images/';

	// Google maps settings (includes cool theme from snazzymaps!.
	settings.map = {
	    zoom: 6,
	    center: new google.maps.LatLng(34.836350, -119.882813),
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    styles: [
		    {
		        "featureType": "water",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#333739"
		            }
		        ]
		    },
		    {
		        "featureType": "landscape",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#2ecc71"
		            }
		        ]
		    },
		    {
		        "featureType": "poi",
		        "stylers": [
		            {
		                "color": "#2ecc71"
		            },
		            {
		                "lightness": -7
		            }
		        ]
		    },
		    {
		        "featureType": "road.highway",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#2ecc71"
		            },
		            {
		                "lightness": -28
		            }
		        ]
		    },
		    {
		        "featureType": "road.arterial",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#2ecc71"
		            },
		            {
		                "visibility": "on"
		            },
		            {
		                "lightness": -15
		            }
		        ]
		    },
		    {
		        "featureType": "road.local",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#2ecc71"
		            },
		            {
		                "lightness": -18
		            }
		        ]
		    },
		    {
		        "elementType": "labels.text.fill",
		        "stylers": [
		            {
		                "color": "#ffffff"
		            }
		        ]
		    },
		    {
		        "elementType": "labels.text.stroke",
		        "stylers": [
		            {
		                "visibility": "off"
		            }
		        ]
		    },
		    {
		        "featureType": "transit",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "color": "#2ecc71"
		            },
		            {
		                "lightness": -34
		            }
		        ]
		    },
		    {
		        "featureType": "administrative",
		        "elementType": "geometry",
		        "stylers": [
		            {
		                "visibility": "on"
		            },
		            {
		                "color": "#229C56"
		            },
		            {
		                "weight": 0.8
		            }
		        ]
		    },
		    {
		        "featureType": "poi.park",
		        "stylers": [
		            {
		                "color": "#2ecc71"
		            }
		        ]
		    },
		    {
		        "featureType": "road",
		        "elementType": "geometry.stroke",
		        "stylers": [
		            {
		                "color": "#333739"
		            },
		            {
		                "weight": 0.3
		            },
		            {
		                "lightness": 10
		            }
		        ]
		    }
		]
	};

	// Can use this to determine wheter debug stuff should be displayed.
	settings.DEBUG = true;
}).call(this);