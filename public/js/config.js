// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ['main'],

  paths: {
    // JavaScript folders.
    libs: './libs',
    plugins: './plugins',

    // Libraries.
    jquery: 'libs/jquery',
    underscore: 'libs/lodash',
    backbone: 'libs/backbone'
  },

  shim: {
    // Backbone library depends on lodash and jQuery.
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },

    // Backbone.LayoutManager depends on Backbone.
    'plugins/backbone.layoutmanager': ['backbone']
  }

});
