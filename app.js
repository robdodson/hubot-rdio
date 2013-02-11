'use strict';

var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    path = require('path'),
    Rdio = require('./rdio'),
    _ = require('lodash'),
    port = process.env.PORT || 3000;

console.log('server listening on port ', port);
server.listen(port);

var RDIO_CONSUMER_KEY = 'YOUR_CONSUMER_KEY',
    RDIO_CONSUMER_SECRET = 'YOUR_CONSUMER_SECRET',
    HEROKU_URL = 'http://path-to-heroku.herokuapp.com';

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'super-duper-secret',
    key: 'sid',
  }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.configure('production', function() {
  // Heroku won't actually allow us to use WebSockets
  // so we have to setup polling instead.
  // https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
  io.configure(function () {
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
  });
});

/* ---------------------------------------

CONTROLS API

--------------------------------------- */
app.get('/play', function(req, res) {
  broadcast('rdio:play');
  res.json({ success: true });
});

app.get('/pause', function(req, res) {
  broadcast('rdio:pause');
  res.json({ success: true });
});

app.get('/stop', function(req, res) {
  broadcast('rdio:stop');
  res.json({ success: true });
});

app.get('/next', function(req, res) {
  broadcast('rdio:next');
  res.json({ success: true });
});

app.get('/clear', function(req, res) {
  broadcast('rdio:clear');
  res.json({ success: true });
});

/* ---------------------------------------

PLAY API

--------------------------------------- */
app.get('/play/artist', function(req, res) {
  // var session = req.session,
  //     accessToken = session.at,
  //     accessTokenSecret = session.ats;

  var accessToken = req.query.token,
      accessTokenSecret = req.query.secret,
      subject = req.query.subject,
      now = !!req.query.now;

  if (accessToken && accessTokenSecret) {
    var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [accessToken, accessTokenSecret]);

    // Find the artist's object with the Rdio search api
    rdio.call('search', { query: subject, types: 'artist' }, function (err, data) {
      if (err) return console.log(err);
      if (!data.result.results.length) return res.json({ success: false });

      var topSongsKey = data.result.results[0].topSongsKey;

      // Find a list of their top songs
      rdio.call('get', { keys: topSongsKey }, function (err, data) {
        if (err) return console.log(err);

        // Send an event to socket.io asking it to queue a list of the
        // artist's songs.
        var topSongsKeys = _.pluck(data.result[topSongsKey].tracks, 'key');
        broadcast('rdio:queue', { keys: topSongsKeys, now: now });
        res.json({ success: true });
      });
    });
  } else {
    res.render('login', { title: 'Login' });
  }
});

app.get('/play/album', function(req, res) {
  // var session = req.session,
  //     accessToken = session.at,
  //     accessTokenSecret = session.ats;

  var accessToken = req.query.token,
      accessTokenSecret = req.query.secret,
      subject = req.query.subject,
      now = !!req.query.now;

  if (accessToken && accessTokenSecret) {
    var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [accessToken, accessTokenSecret]);

    // Find the album object with the Rdio search api
    rdio.call('search', { query: subject, types: 'album' }, function (err, data) {
      if (err) return console.log(err);
      if (!data.result.results.length) return res.json({ success: false });

      // Grab all the tracks in the album and send to socket.io
      var trackKeys = data.result.results[0].trackKeys;
      broadcast('rdio:queue', { keys: trackKeys, now: now });
      res.json({ success: true });
    });
  } else {
    res.render('login', { title: 'Login' });
  }
});

app.get('/play/track', function(req, res) {
  // var session = req.session,
  //     accessToken = session.at,
  //     accessTokenSecret = session.ats;

  var accessToken = req.query.token,
      accessTokenSecret = req.query.secret,
      subject = req.query.subject,
      now = !!req.query.now;

  if (accessToken && accessTokenSecret) {
    var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [accessToken, accessTokenSecret]);

    // Find the album object with the Rdio search api
    rdio.call('search', { query: subject, types: 'track' }, function (err, data) {
      if (err) return console.log(err);
      if (!data.result.results.length) return res.json({ success: false });

      // Grab the track and send it to rdio. The queue method expects
      // its data to come in as an array so just toss the track into one.
      var key = data.result.results[0].key;
      broadcast('rdio:queue', { keys: [key], now: now });
      res.json({ success: true });
    });
  } else {
    res.render('login', { title: 'Login' });
  }
});

app.get('/play/radio', function(req, res) {
  // var session = req.session,
  //     accessToken = session.at,
  //     accessTokenSecret = session.ats;

  var accessToken = req.query.token,
      accessTokenSecret = req.query.secret,
      subject = req.query.subject,
      now = !!req.query.now;

  if (accessToken && accessTokenSecret) {
    var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [accessToken, accessTokenSecret]);

    // Find the artist's object with the Rdio search api
    rdio.call('search', { query: subject, types: 'artist' }, function (err, data) {
      if (err) return console.log(err);
      if (!data.result.results.length) return res.json({ success: false });

      var radioKey = data.result.results[0].radioKey;

      // Find a list of their top songs
      rdio.call('get', { keys: radioKey }, function (err, data) {
        if (err) return console.log(err);

        // Send an event to socket.io asking it to queue a list of the
        // artist's songs.
        var radioKeys = _.pluck(data.result[radioKey].tracks, 'key');
        broadcast('rdio:queue', { keys: radioKeys, now: now });
        res.json({ success: true });
      });
    });
  } else {
    res.render('login', { title: 'Login' });
  }
});

app.get('/search', function(req, res) {
  // var session = req.session,
  //     accessToken = session.at,
  //     accessTokenSecret = session.ats;

  var accessToken = req.query.token,
      accessTokenSecret = req.query.secret;

  if (accessToken && accessTokenSecret) {
    var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [accessToken, accessTokenSecret]);

    var query = _.values(req.query).join(' '),
        types = _.keys(req.query).join(',');

        // topSongsKeys -- artist
        // trackKeys  -- album
        // key -- track

    // Broadly search rdio based on the query params passed in
    rdio.call('search', { query: query, types: types }, function (err, data) {
      if (err) return console.log(err);
      if (!data.result.results.length) return res.json({ success: false });

      if (data.result.results[0].topSongsKey) {
        // PLAY ARTIST
        var topSongsKey = data.result.results[0].topSongsKey;

        // Find a list of their top songs
        rdio.call('get', { keys: topSongsKey }, function (err, data) {
          if (err) return console.log(err);

          // Send an event to socket.io asking it to queue a list of the
          // artist's songs.
          var topSongsKeys = _.pluck(data.result[topSongsKey].tracks, 'key');
          broadcast('rdio:queue', { keys: topSongsKeys });
          res.json({ success: true });
        });
      } else if (data.result.results[0].trackKeys) {
        // PLAY ALBUM
        var trackKeys = data.result.results[0].trackKeys;
        broadcast('rdio:queue', { keys: trackKeys });
        res.json({ success: true });
      } else if (data.result.results[0].key) {
        // PLAY TRACK
        var key = data.result.results[0].key;
        broadcast('rdio:queue', { keys: [key] });
        res.json({ success: true });
      }
    });
  } else {
    res.render('login', { title: 'Login' });
  }
});

/* ---------------------------------------

LOGIN API

--------------------------------------- */
// Check that the user has already signed in and been
// given an accessToken and secret. If not, redirect them
// to the login page.
app.get('/', function(req, res) {
  var session = req.session,
      accessToken = session.at,
      accessTokenSecret = session.ats;

  if (accessToken && accessTokenSecret) {
    var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [accessToken, accessTokenSecret]);

    // Pull the currentUser's data from the RDIO api
    rdio.call('currentUser', function (err, data) {
      if (err) return console.log(err);

      var currentUser = data.result;
      res.render('player', { title: 'Playlists', currentUser: currentUser });
    });
  } else {
    res.render('login', { title: 'Login' });
  }
});

app.get('/login', function(req, res) {
  var session = req.session;

  // Begin the authentication process.
  var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET]);
  var callbackUrl = HEROKU_URL + '/callback';

  rdio.beginAuthentication(callbackUrl, function (err, authUrl) {
    if (err) return console.log(err);

    // Save the request token/secret in the session.
    session.rt = rdio.token[0];
    session.rts = rdio.token[1];

    // Go to Rdio to authenticate the app.
    res.redirect(authUrl);
  });
});

app.get('/callback', function(req, res) {
  var session = req.session,
      requestToken = session.rt,
      requestTokenSecret = session.rts,
      verifier = req.query.oauth_verifier;

  if (requestToken && requestTokenSecret && verifier) {
    // Exchange the verifier and token for an access token.
    var rdio = new Rdio([RDIO_CONSUMER_KEY, RDIO_CONSUMER_SECRET],
                        [requestToken, requestTokenSecret]);

    rdio.completeAuthentication(verifier, function (err) {
      if (err) return console.log(err);

      // Save the access token/secret in the session (and discard the
      // request token/secret).
      session.at = rdio.token[0];
      session.ats = rdio.token[1];
      console.log('token', session.at);
      console.log('secret', session.ats);
      delete session.rt;
      delete session.rts;

      // Go to the home page.
      res.redirect('/');
    });
  } else {
    // We're missing something important.
    res.redirect('/logout');
  }
});

app.get('/logout', function (req, res) {
  // req.session = {};
  res.redirect('/');
});

app.get('/player', function(req, res) {
  res.render('player', { title: 'Rdio Player' });
});

/* ---------------------------------------

SOCKET.IO

--------------------------------------- */
var connections = {};

function broadcast(event, params) {
  Object.keys(connections).forEach(function(key, index) {
    connections[key].emit(event, params);
  });
}

io.sockets.on('connection', function(socket) {
  connections[socket.id] = socket;
  socket.on('disconnect', function() {
    delete connections[socket.id];
  });
});
