const express = require('express');
const database = require('./connection');
const path = require('path');
const childProcess = require('child_process');

let uri = 'mongodb://localhost:27017'
const router = express.Router();

// Get: Databases and Collections
router.get('/', async (req, res) => {
    var collections = await loadListCollections();
    console.log(collections)
    res.send(collections);
});

// Post: export JSON 
router.post('/json', async (req, res) => {
    const collections = req.body;
    console.log(collections)
    const timestamp = Date.now();
    Object.keys(collections)
        .forEach(db => collections[db]
            .forEach(collection => childProcess
                .execSync(`mongoexport --db=${db} --collection=${collection} --jsonArray --out=${path.join(__dirname, '../', '../', 'temp', `${timestamp}`, db, `${collection}.json`)}`))
        );
    childProcess.execSync(`zip -r ${path.join(__dirname, '../', '../', 'temp', `${timestamp}.zip`)} ${path.join(__dirname, '../', '../', 'temp', `${timestamp}`)}`);
    childProcess.execSync(`rm -rf ${path.join(__dirname, '../', '../', 'temp', `${timestamp}`)}`);
    res.download(path.join(__dirname, '../', '../', 'temp', `${timestamp}.zip`));
    //childProcess.execSync(`rm ${path.join(__dirname, '../', '../', 'temp', `${timestamp}.zip`)}`);
});

// Add Post
router.post('/', async (req, res) => {
    res.status(400).send("No POST bitch ass");
});

// Delete Post
router.delete('/:id', async (req, res) => {
    res.status(400).send("No POST bitch ass");
});

async function loadListCollections() {
    let result = {}
    await database.connect(uri)
    const databases = await database.listDatabases();
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