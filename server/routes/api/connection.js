const MongoClient = require('mongodb');

let connection = null;
let urlmLab = 'mongodb://eagletrt:eagleTRT2019@ds033841.mlab.com:33841/telemetria';
let options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};


module.exports = {
    connected() {
        return connection !== null;
    },
    async connect(url) {
        connection = await MongoClient.connect(url, options);
    },
    async listDatabases() {
        return (await connection.db().admin().listDatabases()).databases.map(database => database.name);
    },
    async listCollections(db) {
        return (await connection.db(db).listCollections().toArray())
            .map(collection => collection.name);
    },
    async disconnect() {
        await connection.close();
    }
}