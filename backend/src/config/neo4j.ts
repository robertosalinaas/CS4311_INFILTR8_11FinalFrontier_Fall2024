// src/config/neo4j.ts
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const {
    NEO4J_URI = 'neo4j://localhost:7687',
    NEO4J_USERNAME = 'neo4j',
    NEO4J_PASSWORD = 'password'
} = process.env;

export const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
    {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 120 seconds
    }
);

// Test the connection
driver.verifyConnectivity()
    .then(() => console.log('Connected to Neo4j'))
    .catch(error => console.error('Neo4j connection error:', error));

process.on('exit', () => {
    driver.close();
});