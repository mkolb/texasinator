var restify = require('restify');
var pg = require('pg');
var conString = "/var/run/postgresql texasinator";

var server = restify.createServer();
 
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.listen(3000, function () {
    console.log("Server started @ 3000");
});

server.get("/enrollments", function (req, res, next) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres');
    }
    client.query('select xmlelement(name student, xmlforest(idnumber as eid,course_shortname as class)) from enrollments', function(err, result) {
      if(err) {
	return console.error('error running query', err);
      }
      res.send(result.rows[0].xmlelement);
      client.end();
    });
  });
  return next();
});
