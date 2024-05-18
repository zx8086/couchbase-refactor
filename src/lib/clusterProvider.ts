// clusterProvider.ts
import type { Cluster } from 'couchbase';
import {connectToCouchbase, type CouchbaseConnection} from './couchbaseConnector.ts';

let cluster: Cluster | null = null;

export const getCluster = async () :Promise<Cluster> => {
    if (!cluster) {
        const result: CouchbaseConnection = await connectToCouchbase();
        cluster = result.cluster;
    }
    return cluster;
};