const { join } = require('path');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const database = require('./connection');

function printCsv(data, path) {
    if (data.length) {
        if (typeof data[0].value === 'object') {
            const keysRow = ['timestamp', ...Object.keys(data[0].value)].join('\t');
            const valueRows = data.sort((x, y) => x.timestamp - y.timestamp).map(el => {
                let row = '';
                row += `${el.timestamp}\t`;
                row += Object.keys(el.value).map(key => `${el.value[key]}`).join('\t');
                return row;
            });
            const rows = [keysRow, ...valueRows];
            const content = rows.join('\n');
            writeFileSync(path, content);
        }
        else {
            const keysRow = ['timestamp', 'value'].join('\t');
            const valueRows = data.sort((x, y) => x.timestamp - y.timestamp).map(el => {
                let row = '';
                row += `${el.timestamp}\t`;
                row += `${el.value}`;
                return row;
            });
            const rows = [keysRow, ...valueRows];
            const content = rows.join('\n');
            writeFileSync(path, content);
        }
    }
}

function print(data, path) {
    try {
        if (!existsSync(path)) {
            mkdirSync(path, { recursive: true });
        }
    }
    catch (error) { }

    for (const key in data) {
        if (Array.isArray(data[key])) {
            printCsv(data[key], join(path, `${key}.csv`));
        }
        else if (typeof data[key] === 'object') {
            print(data[key], join(path, key));
        }
    }
}

function printData(data, db, collection, outputPath) {
    const path = join(outputPath, db, collection);
    print(data, path);
}

function mergeDocument(result, document) {
    for (const key in document) {
        if (Array.isArray(document[key])) {
            result[key] = [...result[key], ...document[key]];
        }
        else if (typeof document[key] === 'object') {
            mergeDocument(result[key], document[key]);
        }
    }
}

function parseDocuments(documents) {
    if (documents.length) {
        const result = documents[0];
        for (let i = 1; i < documents.length; i++) {
            mergeDocument(result, documents[i]);
        }
        return result;
    }
    else {
        return null;
    }
}

async function exportCollection(db, collection, outputPath) {
    console.log(`\tCollection: ${collection}`);
    const documents = await database.pullCollection(db, collection);
    const data = parseDocuments(documents);
    printData(data, db, collection, outputPath);
    console.log(`\tCollection ${collection} done`);
}

module.exports = async function exportAll(collectionsAndOutputPath) {
    database.setUrl('mongodb://localhost:27017');
    const { outputPath, collections } = collectionsAndOutputPath;
    for (const db of Object.keys(collections)) {
        console.log(`Database: ${db}`);
        for (const collection of collections[db]) {
            await exportCollection(db, collection, join(outputPath, db));
        }
        console.log(`Database ${db} done`);
    }
}