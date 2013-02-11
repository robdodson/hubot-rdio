'use strict';

define([
  // Application.
  'app',
  // Modules
  'modules/rdio'
],

function(app, Rdio) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      '': 'player'
    },

    player: function() {
      var rdio = new Rdio.Views.Index({
        el: '#app-viewport'
      });
    }
  });

  return Router;

});
