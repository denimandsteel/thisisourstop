# This Is Our Stop

An ad-hoc social network around your bus stop! See it running at: <http://thisisourstop.herokuapp.com>

## Installation

### On your local environment

Install [node and npm](http://nodejs.org/#download).

- $ git clone git@github.com:denimandsteel/thisisourstop.git
- $ cd thisisourstop
- $ npm install
- $ npm start

Visit the site at <http://localhost:3000> in a web browser.

Create a postgres database, import your GTFS data using csv or pg with the migrate scripts (`node import.js csv` or `node import.js pg`).

You can install your own GTFS feed by replacing the google_transit directory with your own.

### On a Heroku instance

Create an account at [Heroku](http://www.heroku.com/).

- $ gem install heroku
- $ heroku keys:add
- $ heroku create --stack cedar # to get a node.js capable stack
- $ git push heroku
- $ heroku ps:scale web=1 # node apps require a resize
- $ heroku open # open a web browser to the site
- $ heroku logs -t # show instance log (useful to keep an eye on if you have a large GTFS file)

To run the database migration scripts:

- $ heroku run node migrate.js schema
- $ heroku run node import.js csv

Watch your logs for it to complete.

## Todo

- instructions for installation on other platforms (eg. no.de)
- <del>database backends for comments and stops</del>
- cookies/sessions for recent stops
- comment flagging
- admin
- cookie user account
- <del>look at using ejs (on server) and underscore (on client) templating together. They both use <% %></del>
- <del>want to serve up full layout at /stop/123 and json at /stop/123.json, that can then be passed to the same partial template./del>
- <del>implement a parser for gtfs</del>
- <del>make sure I am using the best way to determine format, can also use accept: application/json/del>
- checklist: http://googlegeodevelopers.blogspot.com/2011/11/four-tips-for-improving-your-mobile-web.html?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+GoogleGeoDevelopersBlog+(Google+Geo+Developers+Blog)
