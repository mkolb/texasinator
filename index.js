var restify = require('restify');
var pg = require('pg');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var env = process.env.NODE_ENV || 'development';
var conString = process.env.DATABASE_URL || "/var/run/postgresql texasinator";

var server = restify.createServer();
 
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(passport.initialize());

server.listen(process.env.PORT || 3000);

passport.use(new BasicStrategy({
  },
  function(username, password, done) {
    process.nextTick(function () {
      if (username != process.env.AUTH_USERNAME) { return done(null, false); }
      if (password == process.env.AUTH_PASSWORD) { return done(null, username); }
      return done(null, false);
    });
  }
));


server.get("/enrollments", passport.authenticate('basic', { session: false }), function (req, res, next) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres');
    }
    client.query('select xmlelement(name student, xmlforest(idnumber as eid,course_shortname as class)) from enrollments', function(err, result) {
      if(err) {
	return console.error('error running query', err);
      }
      res.writeHead(200, {
	'Content-Type': 'application/xml; charset=utf-8'
      });
      res.end('<?xml version="1.0"?><enrollments>' + result.rows.map(flattenate).join('') + '</enrollments>');
      client.end();
    });
  });
  return next();
});

function flattenate(r) {
  return r.xmlelement;
}
