# This Is Our Stop

This is Our Stop is an ad-hoc social network around bus stops! See it running at: <http://thisisourstop.com>. Currently we only support Vancouver-area bus stops using Translink's open data, but the code can be readily adapted to work for any municipal transit system that has data available in a format the Google Transit can use.

We invite re-use and adaptation of the project for other experiments in micro social networks, and contribution to the current Vancouver-based project to see how far we can take the idea.

For more information about any aspect of the project, contact hello@denimandsteel.com.

## Acknowledgements

We gratefully acknowledge the contributions of [Sam Dal Monte](http://negativeboy.com) in his visual design work and assistance in refining the interaction design and sticker ordering. We also acknowledge [Karen Quinn Fung](http://countablyinfinite.ca) for the original idea from which This is Our Stop was made.

## Installation

### On your local environment

Create a postgres database, import your GTFS data using [gtsfsdb](http://code.google.com/p/gtfsdb/): `gtfsdb-load --database_url postgresql://postgres@localhost/thisisourstop --file http://mapexport.translink.bc.ca/CURRENT/google_transit.zip --schema public`. Install [node and npm](http://nodejs.org/#download).

- $ git clone git@github.com:denimandsteel/thisisourstop.git
- $ cd thisisourstop
- $ npm install
- $ npm start

Visit the site at <http://localhost:3000> in a web browser.


### On a Heroku instance

The site was originally developed using Heroku, and here are some basic steps that may guide you on getting it to work there. Create an account at [Heroku](http://www.heroku.com/).

- $ gem install heroku
- $ heroku keys:add
- $ heroku create --stack cedar # to get a node.js capable stack
- $ git push heroku
- $ heroku ps:scale web=1 # node apps require a resize
- $ heroku open # open a web browser to the site
- $ heroku logs -t # show instance log (useful to keep an eye on if you have a large GTFS file)

Import GTFS using GTFSDB to a local database then migrate data to Heroku using [this](https://devcenter.heroku.com/articles/import-data-heroku-postgres) or similar.

Make sure you set up your environment properly for production:

- $ heroku config:add NODE_ENV=production
- $ heroku config:add TIOS_ADMIN=admin:password

## License

Copyright (C) 2012 [Denim & Steel Interactive](http://denimandsteel.com) (Tylor Sherman and Todd Sieling)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
