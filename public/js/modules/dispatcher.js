'use strict';

define([
  'app',
  'jquery',
  'underscore'
],

function(app, $, _) {
  window.dispatcher = _.extend({
    ready: function(user) {
      console.log('ready');
      // The swf has loaded and is ready for use
      this.trigger('ready', user);
    },

    playStateChanged: function(playState) {
      // The playback state has changed.
      // http://developer.rdio.com/docs/Web_Playback_API
      // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.
      // not sure why they broadcast 2 pause states...

      console.log('playStateChanged');
      var state;
      switch (playState) {
        case 0:
          state = 'paused';
          break;

        case 1:
          state = 'playing';
          break;

        case 2:
          state = 'stopped';
          break;

        case 3:
          state = 'buffering';
          break;

        case 4:
          state = 'paused';
          break;
      }
      this.trigger('playStateChanged', state);
      this.trigger(state);
    },

    playingTrackChanged: function(playingTrack, sourcePosition) {
      console.log('playingTrackChanged');
      // The currently playing track has changed.
      // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.
      this.trigger('playingTrackChanged', playingTrack, sourcePosition);
    },

    playingSourceChanged: function(playingSource) {
      console.log('playingSourceChanged');
      // The currently playing source changed.
      // The source metadata, including a track listing is inside playingSource.
      this.trigger('playingSourceChanged', playingSource);
    },

    volumeChanged: function(volume) {
      console.log('volumeChanged');
      // The volume changed to volume, a number between 0 and 1.
      this.trigger('volumeChanged', volume);
    },

    muteChanged: function(mute) {
      console.log('muteChanged');
      // Mute was changed. mute will either be true (for muting enabled) or false (for muting disabled).
      this.trigger('muteChanged', mute);
    },

    positionChanged: function(position) {
      console.log('positionChanged');
      //The position within the track changed to position seconds.
      // This happens both in response to a seek and during playback.
      this.trigger('positionChanged', position);
    },

    queueChanged: function(newQueue) {
      console.log('queueChanged');
      // The queue has changed to newQueue.
      this.trigger('queueChanged', newQueue);
    },

    shuffleChanged: function(shuffle) {
      console.log('shuffleChanged');
      // The shuffle mode has changed.
      // shuffle is a boolean, true for shuffle, false for normal playback order.
      this.trigger('shuffleChanged', shuffle);
    },

    repeatChanged: function(repeatMode) {
      console.log('repeatChanged');
      // The repeat mode change.
      // repeatMode will be one of: 0: no-repeat, 1: track-repeat or 2: whole-source-repeat.
      this.trigger('repeatChanged', repeatMode);
    },

    playingSomewhereElse: function() {
      console.log('playingSomewhereElse');
      // An Rdio user can only play from one location at a time.
      // If playback begins somewhere else then playback will stop and this callback will be called.
      this.trigger('playingSomewhereElse');
    }
  }, Backbone.Events);
});