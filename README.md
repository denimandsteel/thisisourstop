# This Is Our Stop

This is Our Stop is an ad-hoc social network around bus stops! See it running at: <http://thisisourstop.com>. Currently we only support Vancouver-area bus stops using Translink's open data, but the code can be readily adapted to work for any municipal transit system that has data available in a format the Google Transit can use.

We invite re-use and adaptation of the project for other experiments in micro social networks, and contribution to the current Vancouver-based project to see how far we can take the idea. 

For more information about any aspect of the project, contact hello@denimandsteel.com.

## License

Copyright (C) 2012 [Denim & Steel Interactive](http://denimandsteel.com) (Tylor Sherman and Todd Sieling)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Acknowledgements

We gratefully acknowledge the contributions of [Sam Dal Monte](http://negativeboy.com) in his visual design work and assistance in refining the interaction design and sticker ordering. We also acknowledge [Karen Quinn Fung](http://countablyinfinite.ca) for the original idea from which This is Our Stop was made.

## Installation

### On your local environment

Install [node and npm](http://nodejs.org/#download).

- $ git clone git@github.com:denimandsteel/thisisourstop.git
- $ cd thisisourstop
- $ npm install
- $ npm start

Visit the site at <http://localhost:3000> in a web browser.

Create a postgres database, import your GTFS data using csv or pg with the migrate scripts (`node import.js csv` or `node import.js pg`).

Import the GTFS data using: `gtfsdb-load --database_url postgresql://postgres@localhost/thisisourstop --file http://mapexport.translink.bc.ca/CURRENT/google_transit.zip --schema public`

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

Make sure you set up your environment properly:

- $ heroku config:add NODE_ENV=production
- $ heroku config:add TIOS_ADMIN=admin:password

## Todo

- look at using media queries for retina (that way we can use background images in css)
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
