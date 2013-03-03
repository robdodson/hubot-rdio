hubot. How on Earth did we exist without you? Really I feel like I can demarcate my life into two phases: the time before hubot, and all the awesomeness after. For those not in the know, [hubot is an amazing chatbot created by the team at Github.](http://hubot.github.com/) Out of the box he has a ton of cool features but once you start digging into [the hubot scripts catalog](http://hubot-script-catalog.herokuapp.com/) things get WAY more interesting.

One of the most exciting projects is [play](http://zachholman.com/talk/play/), a combination iTunes remote and streaming music player. Play lets you broadcast music to everyone on your team and allows anyone in the chatroom to dictate what goes into the queue. Personally, I don't use iTunes all that much, opting instead to use [rdio](http://www.rdio.com/) for all my music needs. I figured, wouldn't it be cool if hubot could do all the same stuff he does for play...but with rdio! So that's what I set out to build.

## A call for help!

Let me start by saying that this project is **extremely** rough. I didn't intend to release it in this state but I figure the best (and fastest) way to improve it is by opening it up for other to play with. The Backbone code is grizzly, the Express code is gnarly, and the things I'm doing with OAuth might be downright illegal (I'm an OAuth newb). But—and this is extremely important—it is **super** stable (much to my amazement). My team and I have run it for about 2 weeks and never once managed to crash it. Never needed a reboot or any kind of reset. So while the code might make your face melt, just think of it kinda like the walking dead. The unstoppable, bloodthirsty walking dead. You can hit it with a shovel, poke it in the eye, whatever! It'll keep on truckin'

## Grab the project

OK let's get started. This is going to be a bulleted list kind of thing cuz I'm sleepy and there's about a million steps. Brevity, people!

* `git clone https://github.com/robdodson/hubot-rdio.git`

## Register with rdio

* Go [here](http://developer.rdio.com/docs/read/rest/oauth)
* Register
* Get a consumer key and consumer secret
* Add the secret and key to `app.js`
* Go [here](https://github.com/rdio/hello-web-playback/blob/master/token.js)
* Read the instructions
* Use [rdio-python](https://github.com/rdio/rdio-python) to generate a playback token (I've found this to be a little flaky. If it doesn't work for you let me know).
* Add playback token to `public/js/modules/rdio.js` in the `flashvars` object.

## Create your site on Heroku

* Follow [the Heroku quickstart](https://devcenter.heroku.com/articles/quickstart) if you've never used Heroku before.
* Create a new site on Heroku with `heroku create`
* Copy the path to your new heroku site, it will look like: zen-jargon-1234.herokuapp.com
* Add the path to your site in `app.js` where it says HEROKU_URL
* Add just the domain to `public/js/modules/rdio.js` in the `flashvars` object.
* Push your site up to Heroku `git push heroku master`
* Scale the process `heroku ps:scale web=1`

## Add the script to hubot

* Copy the `hubot/scripts/rdio.coffee` file into your hubot's `scripts` folder. Normally you would just install the script from the catalog but I haven't submitted yet because it's still very rough.
* You'll need to add 3 environment variables to your hubot
  * HUBOT_RDIO_URL
  * HUBOT_RDIO_TOKEN
  * HUBOT_RDIO_SECRET
* HUBOT_RDIO_URL is just the path address of your app on heroku (http://zen-jargon-1234.herokuapp.com)
* HUBOT_RDIO_TOKEN and HUBOT_RDIO_SECRET are the two parts of your OAuth token. I've left two `console.logs` for you in `app.js` at lines 341 and 342. If you go to your app on Heroku and login the console should spit out your OAuth token and secret. Add those to hubot and then remove the `logs` from `app.js`.
* Push everything to your hubot server

To test that everything is working open up your heroku app in Chrome and login. You should see an empty player. From Campfire, tell hubot: `hubot play artist deadmau5`. Wait a few seconds and the player should fire up. If not, check your terminal or your browser console to see if there are any errors.

## Fire up Nicecast

* You'll need to purchase Nicecast in order to stream, you can [buy it here.](http://www.rogueamoeba.com/nicecast/)
* Click on `Source` and choose Chrome or whatever browser you're running.
* Depending on your machine you'll probably want to click on `Quality` and turn it down. On my Macbook Air I have it set to the 3rd lowest tick.
* Click `Start Broadcast` and Nicecast will tell you it has to restart your browser (lame). Restart the browser, login again and instruct hubot to start playing some music.
* Click the `Share` tab
* Copy the link to the .m3u file.
* Pass around the .m3u link to your officemates. The easiest way to tune in is with iTunes. Just do File > Open Stream or Advanced > Open Stream and paste in the link.
* Dance

Holy shit that's a lot of steps! Hopefully it all worked, if not *please* log an issue. kthnxbye
