const express = require('express');
const database = require('./connection');
const BSON = require('bson');
const path = require('path');

let uri = 'mongodb://localhost:27017'
const router = express.Router();

// Get: Databases and Collections
router.get('/', async(req, res) => {
    var collections = await loadListCollections();
    console.log(collections)
    res.send(collections);
});

// Post: export JSON 
router.post('/json', async(req, res) => {
    const collections = req.body
    console.log(collections)
    res.sendFile(path.join(__dirname, '../../tmp/test_mattina1911_1720.json'));
});

// Add Post
router.post('/', async(req, res) => {
    res.status(400).send("No POST bitch ass");
});

// Delete Post
router.delete('/:id', async(req, res) => {
    res.status(400).send("No POST bitch ass");
});

async function loadListCollections() {
    let result = {}
    await database.connect(uri)
    const databases = await database.listDatabases();
    console.log(databases)
    const collections = await Promise.all(databases.map(async db => ({
        db,
        collections: await (database.listCollections(db))
    })))
    for (db of collections) {
        result[db.db] = db.collections;
    }
    return result;
}

module.exports = router;