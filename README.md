# This Is Our Stop

An ad-hoc social network around your bus stop!

## Todo

- look at using ejs (on server) and underscore (on client) templating together. They both use <% %>
	- could also just use one on both sides.
- want to serve up full layout at /stop/123 and json at /stop/123.json, that can then be passed to the same partial template.
- implement a parser for gtfs
- make sure I am using the best way to determine format, can also use accept: application/json