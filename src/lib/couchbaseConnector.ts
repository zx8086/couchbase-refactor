// src/lib/couchbaseConnector.ts
import config from '../../config.ts';
import { connect as couchbaseConnect } from 'couchbase'; // Regular import for the function used at runtime
import type { Cluster, Bucket, Scope, Collection } from 'couchbase';  // Type-only imports

// Define the interface for the connection details
export interface CouchbaseConnection {
    cluster: Cluster;
    bucket: Bucket;
    scope: Scope;
    collection: Collection;
    connect: typeof couchbaseConnect;
}

// Connection function using the defined interface
export async function connectToCouchbase(): Promise<CouchbaseConnection> {

    console.log("Attempting to connect to Couchbase...");

    try {
        const clusterConnStr: string = config.couchbase.URL;
        const username: string = config.couchbase.USERNAME;
        const password: string = config.couchbase.PASSWORD;
        const bucketName: string = config.couchbase.BUCKET;
        const scopeName: string = config.couchbase.SCOPE;
        const collectionName: string = config.couchbase.COLLECTION;

        console.log(`Configuring connection with the following details:
                    URL: ${clusterConnStr}, 
                    Username: ${username}, 
                    Bucket: ${bucketName}, 
                    Scope: ${scopeName}, 
                    Collection: ${collectionName}`);

        const cluster: Cluster = await couchbaseConnect(clusterConnStr, {
            username: username,
            password: password
        });

        console.log("Cluster connection established.");

        const bucket: Bucket = cluster.bucket(bucketName);

        console.log(`Bucket ${bucketName} accessed.`);

        const scope :Scope = bucket.scope(scopeName);
        const collection: Collection = scope.collection(collectionName);

        console.log(`Collection ${collectionName} accessed under scope ${scopeName}.`);

        return { cluster, bucket, scope, collection, connect: couchbaseConnect };
    } catch (error) {

        console.error("Couchbase connection failed:", error);

        throw error; // Re-throw the error after logging
    }
}