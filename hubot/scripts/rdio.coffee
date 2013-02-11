# Description:
#   Control an Rdio webplayer with your friendly hubot.
#
# Dependencies:
#   None
#
# Configuration:
#   HUBOT_RDIO_URL
#   HUBOT_RDIO_TOKEN
#   HUBOT_RDIO_SECRET
#
# Commands:
#   hubot play - Plays music.
#   hubot play next - Plays the next song.
#   hubot play previous - Plays the previous song.
#   hubot what's playing - Returns the currently-played song.
#   hubot I want this song - Returns a download link for the current song.
#   hubot I want this album - Returns a download link for the current album.
#   hubot play <artist> - Queue up ten songs from a given artist.
#   hubot play <album> - Queue up an entire album.
#   hubot play <song> - Queue up a particular song. This grabs the first song by playcount.
#   hubot play <something> right [fucking] now - Play this shit right now.
#   hubot where's play - Gives you the URL to the web app.
#   hubot volume? - Returns the current volume level.
#   hubot volume [0-100] - Sets the volume.
#   hubot be quiet - Mute play.
#   hubot say <message> - `say` your message over your speakers.
#   hubot clear play - Clears the Play queue.
#
# Author:
#   holman

URL = "#{process.env.HUBOT_RDIO_URL}"

authedRequest = (message, path, action, options, callback) ->
  message.http("#{URL}#{path}")
    .query(token: "#{process.env.HUBOT_RDIO_TOKEN}", secret: "#{process.env.HUBOT_RDIO_SECRET}")
    .header('Content-Length', 0)
    .query(options)[action]() (err, res, body) ->
      callback(err,res,body)

module.exports = (robot) ->
  # robot.respond /where'?s play/i, (message) ->
  #   message.finish()
  #   authedRequest message, '/stream_url', 'get', {}, (err, res, body) ->
  #     message.send("play's at #{URL} and you can stream from #{body}")

  # robot.respond /what'?s playing/i, (message) ->
  #   authedRequest message, '/now_playing', 'get', {}, (err, res, body) ->
  #     json = JSON.parse(body)
  #     str = "\"#{json.name}\" by #{json.artist}, from \"#{json.album}\"."
  #     message.send("#{URL}/images/art/#{json.id}.png?login=HOTFIX#.jpg")
  #     message.send("Now playing " + str)



  #
  # BASIC CONTROLS
  #

  robot.respond /play rdio/i, (message) ->
    message.finish()
    authedRequest message, '/play', 'get', {}, (err, res, body) ->
      json = JSON.parse(body)
      message.send("Okay! Playing Rdio...")

  robot.respond /stop rdio/i, (message) ->
    message.finish()
    authedRequest message, '/stop', 'get', {}, (err, res, body) ->
      json = JSON.parse(body)
      message.send("Okay. Stopping Rdio...")

  robot.respond /pause rdio/i, (message) ->
    message.finish()
    authedRequest message, '/pause', 'get', {}, (err, res, body) ->
      json = JSON.parse(body)
      message.send("Okay. Pausing Rdio...")

  robot.respond /play next/i, (message) ->
    message.finish()
    authedRequest message, '/next', 'get', {}, (err, res, body) ->
      json = JSON.parse(body)
      # message.send("On to the next one (which conveniently is #{json.artist}'s \"#{json.name}\")")
      message.send("On to the next one!")

  #
  # PLAYING
  #
  
  # Because I suck at regex this has to appear before the regular play task
  # Otherwise the greedy (.*) of the regular play task will match the word 'now'
  # And they'll both be triggered. By calling message.finish() we prevent this.
  robot.respond /play (artist|album|track|radio) (.*) now/i, (message) ->
    message.finish()
    params = { subject: message.match[2], now: true }
    authedRequest message, "/play/#{message.match[1]}", 'get', params, (err, res, body) ->
      # console.log body
      message.send("Playing #{message.match[1]}: #{message.match[2]} right MEOW!")

  robot.respond /play (artist|album|track|radio) (.*)/i, (message) ->
    message.finish()
    params = { subject: message.match[2] }
    authedRequest message, "/play/#{message.match[1]}", 'get', params, (err, res, body) ->
      # console.log body
      message.send("Queuing up #{message.match[1]}: #{message.match[2]}")

    # authedRequest message, "/play/artist/#{params.subject}", 'post', params, (err, res, body) ->
    #   if body.length == 0
    #     return message.send("That doesn't exist in Play. Or anywhere, probably. If it's not"+
    #            " in Play the shit don't exist. I'm a total hipster.")

    #   json = JSON.parse(body)
    #   str = json.songs.map (song) ->
    #     "\"#{song.name}\" by #{song.artist}"
    #   str.join(', ')

    #   message.send("Queued up #{str}")


  # robot.respond /search (.*)/i, (message) ->
  #   params = {subject: message.match[1]}
  #   authedRequest message, "/play/radio/#{params.subject}", 'get', params, (err, res, body) ->
  #     console.log body

  robot.respond /clear queue/i, (message) ->
    authedRequest message, '/clear', 'get', {}, (err, res, body) ->
      message.send(":fire: :bomb:")