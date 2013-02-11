'use strict';

define([
  'app',
  'jquery',
  // Modules
  'modules/dispatcher'
],

function(app, $, dispatcher) {
  var Rdio = app.module();

  Rdio.Views.Index = Backbone.View.extend({
    flashvars: {
      'playbackToken': 'YOUR_PLAYBACK_TOKEN',
      'domain': 'path-to-heroku.herokuapp.com',
      'listener': 'dispatcher'
    },
    params: {
      'allowScriptAccess': 'always'
    },
    attributes: {},

    events: {

    },

    initialize: function () {
      // Make sure all of our methods are called with the
      // correct context, especially event handlers
      _.bindAll(this);

      // The dispatcher is a monitor object created specifically
      // to receive Rdio callbacks. See modules/dispatcher
      this.dispatcher = window.dispatcher;

      // The socket is a socket.io connection which we use to change
      // the state of the player whenver hubot hits a url
      this.socket = window.io.connect(window.location.hostname);

      // State
      this.state = 'paused';

      // Add listeners
      this.on('rendered', this.embedSWF);

      this.dispatcher.on('ready', this.ready);
      this.dispatcher.on('playStateChanged', this.updatePlayState);
      this.dispatcher.on('playingTrackChanged', this.updateTrack);
      this.dispatcher.on('positionChanged', this.updatePosition);

      this.socket.on('rdio:queue', this.queue);
      this.socket.on('rdio:play', this.play);
      this.socket.on('rdio:pause', this.pause);
      this.socket.on('rdio:stop', this.stop);
      this.socket.on('rdio:next', this.next);
      this.socket.on('rdio:clear', this.clear);

      this.render();
    },

    render: function() {
      this.trigger('rendered');
    },

    embedSWF: function() {
      swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
      'apiswf', // the ID of the element that will be replaced with the SWF
      1, 1, '9.0.0', 'expressInstall.swf', this.flashvars, this.params, this.attributes);
    },

    ready: function() {
      // Save the rdio object. We'll use its
      // external interface to work with the rdio playback api
      this.api = $('#apiswf').get(0);

      // set up the controls
      $('#play').click(this.play);
      $('#stop').click(this.stop);
      $('#pause').click(this.pause);
      $('#previous').click(this.previous);
      $('#next').click(this.next);
    },

    play: function() {
      // var key = params.key || $('#play_key').val();
      // this.api.rdio_play(params.key);
      this.api.rdio_play();
    },

    stop: function() {
      this.api.rdio_stop();
    },

    pause: function() {
      this.api.rdio_pause();
    },

    previous: function() {
      this.api.rdio_previous();
    },

    next: function() {
      this.api.rdio_next();
    },

    clear: function() {
      this.api.rdio_clearQueue();
    },

    queue: function (params) {
      var api = this.api;

      if (params.now) {
        return this.queueNow(params);
      }

      // If we're already playing go ahead and queue
      if (this.state === 'playing') {
        _.each(params.keys, function (key) {
          api.rdio_queue(key);
        });

      // Otherwise we have to hack around the buggy queue api
      // First start playing a song from our list, then when we've
      // entered a playing state we'll be able to queue.

      } else {
        this.dispatcher.once('playing', function() {
          _.each(params.keys, function (key) {
            api.rdio_queue(key);
          });
        });
        api.rdio_play(params.keys.shift());
      }

    },

    queueNow: function (params) {
      var api = this.api;

      this.dispatcher.once('queueChanged', _.bind(function() {
        this.dispatcher.once('playing', function() {
          _.each(params.keys, function (key) {
            api.rdio_queue(key);
          });
        });
        api.rdio_play(params.keys.shift());
      }, this));
      api.rdio_clearQueue();

    },

    // Dispatch an event that we've changed
    // state and update the UI. Maybe this is
    // better not as view code...?
    updatePlayState: function(state) {
      this.state = state;
      $('#playState').text(state);
    },

    updateTrack: function(playingTrack, sourcePosition) {
      if (playingTrack !== null) {
        $('#track').text(playingTrack.name);
        $('#album').text(playingTrack.album);
        $('#artist').text(playingTrack.artist);
        $('#art').attr('src', playingTrack.icon);
      }
    },

    updatePosition: function(position) {
      $('#position').text(position);
    }
  });

  return Rdio;
});
