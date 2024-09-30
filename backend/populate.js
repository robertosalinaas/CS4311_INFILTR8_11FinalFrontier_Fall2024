var neo4j = require('neo4j-driver');

var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '12345678'));
var session = driver.session();

async function populateDatabase() {
    try {
        // Create some movies
        await session.run('CREATE (m:Movie {title: $title}) RETURN m', { title: 'The Matrix' });
        await session.run('CREATE (m:Movie {title: $title}) RETURN m', { title: 'Inception' });

        // Create some actors
        await session.run('CREATE (a:Actor {name: $name}) RETURN a', { name: 'Keanu Reeves' });
        await session.run('CREATE (a:Actor {name: $name}) RETURN a', { name: 'Leonardo DiCaprio' });

        // Create relationships
        await session.run('MATCH (a:Actor {name: $actorName}), (m:Movie {title: $movieTitle}) CREATE (a)-[:ACTED_IN]->(m) RETURN a, m', { actorName: 'Keanu Reeves', movieTitle: 'The Matrix' });
        await session.run('MATCH (a:Actor {name: $actorName}), (m:Movie {title: $movieTitle}) CREATE (a)-[:ACTED_IN]->(m) RETURN a, m', { actorName: 'Leonardo DiCaprio', movieTitle: 'Inception' });

        console.log('Database populated successfully');
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

populateDatabase();