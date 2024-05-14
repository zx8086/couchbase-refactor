import { connectToCouchbase } from './src/lib/couchbaseConnector.ts';

async function pingCluster() {
    try {
        const { cluster, bucket } = await connectToCouchbase();
        const result = await cluster.ping();
        console.log(JSON.stringify(result, null, 2));
        // const diagnostics = await bucket.diagnostics();
        // console.log(JSON.stringify(diagnostics, null, 2));
    } catch (error) {
        console.error("Error pinging the cluster:", error);
    }
}

async function queryDatabase(query: string) {
    try {
        const { cluster } = await connectToCouchbase();
        let result = await cluster.query(query);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Query Error:', error);
    } finally {
        process.exit(0);
    }
}

// Define your query
const selectQuery = 'SELECT d.* FROM `default`.`_default`.`_default` d LIMIT 5';

// Call the functions
async function main() {
    try {
        await pingCluster();
        await queryDatabase(selectQuery);
    } catch(err) {
        console.error(err);
    }
}

main().catch(err => console.error(err));