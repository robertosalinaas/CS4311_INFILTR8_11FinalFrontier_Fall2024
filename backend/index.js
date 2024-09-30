var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var neo4j = require('neo4j-driver');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
var session = driver.session();

// app.get('/', function (req, res) {
//     res.send('hello world');
//     console.log('GET /');
// });

app.get('/', async function (req, res) {
    try {
        // Fetch movies
        let movieResult = await session.run('MATCH (m:Movie) RETURN m');
        let movies = movieResult.records.map(record => record.get('m').properties);

        // Fetch actors
        let actorResult = await session.run('MATCH (a:Actor) RETURN a');
        let actors = actorResult.records.map(record => record.get('a').properties);

        // Render the template with the fetched data
        res.render('index', { movies: movies, actors: actors });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.send('Error fetching data');
        res.status(500).send(error);
    }
});

// Route to add a movie
app.post('/movie', function (req, res) {
    var title = req.body.title;
    console.log('POST /movie', title);
    session.run('CREATE (m:Movie {title: $title}) RETURN m', { title: title })
        .then(function (result) {
            console.log('Movie created:', result.records.get('m'));
            res.send(result.records.get('m'));
        })
        .catch(function (error) {
            console.error('Error creating movie:', error);
            res.status(500).send(error);
        });
});

// Route to add an actor
app.post('/actor', function (req, res) {
    var name = req.body.name;
    console.log('POST /actor', name);
    session.run('CREATE (a:Actor {name: $name}) RETURN a', { name: name })
        .then(function (result) {
            console.log('Actor created:', result.records.get('a'));
            res.send(result.records.get('a'));
        })
        .catch(function (error) {
            console.error('Error creating actor:', error);
            res.status(500).send(error);
        });
});

// Route to create ACTED_IN relationship
app.post('/acted_in', function (req, res) {
    var actorName = req.body.actorName;
    var movieTitle = req.body.movieTitle;
    console.log('POST /acted_in', actorName, movieTitle);
    session.run('MATCH (a:Actor {name: $actorName}), (m:Movie {title: $movieTitle}) CREATE (a)-[:ACTED_IN]->(m) RETURN a, m', { actorName: actorName, movieTitle: movieTitle })
        .then(function (result) {
            console.log('Relationship created:', result.records);
            res.send(result.records);
        })
        .catch(function (error) {
            console.error('Error creating relationship:', error);
            res.status(500).send(error);
        });
});

app.listen(3000, function() {
    console.log("server started on port 3000");
});

module.exports = app;