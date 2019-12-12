const MongoClient = require('mongodb');

let url = null;
//let urlmLab = 'mongodb://eagletrt:eagleTRT2019@ds033841.mlab.com:33841/telemetria';

function setUrl(newUrl) {
    url = newUrl;
}
async function getConnection() {
    console.log(url)
    return MongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
}
async function listDatabases() {
    const connection = await getConnection();
    const databases = (await connection.db().admin().listDatabases()).databases.map(database => database.name);
    await connection.close();
    return databases;
}
async function listCollections(db) {
    console.log(`list collectionsof ${db}`)
    const connection = await getConnection();
    const collections = (await connection.db(db).listCollections().toArray())
        .map(collection => collection.name);
    console.log('done')
    await connection.close();
    return collections;
}
async function pullCollection(db, collection) {
    const connection = await getConnection();
    const documents = await connection.db(db).collection(collection).find({}).toArray();
    await connection.close();
    return documents;
}

module.exports = {
    setUrl,
    getConnection,
    listDatabases,
    listCollections,
    pullCollection
};