require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('ansari_mohammad_zaid_user', 'ansari_mohammad_zaid'),
    ssl: (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('render.com')) ? { rejectUnauthorized: false } : false
});

client.connect()
    .then(() => {
        console.log('Connected successfully!');
        return client.end();
    })
    .catch(err => {
        console.error('Connection failed:', err);
        console.error('Code:', err.code);
        console.error('Detail:', err.detail);
        client.end();
    });
