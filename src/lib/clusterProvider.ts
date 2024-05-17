// clusterProvider.ts
import type { Cluster } from 'couchbase';
import { connectToCouchbase } from './couchbaseConnector.ts';

let cluster: Cluster | null = null;

export const getCluster = async () => {
    if (!cluster) {
        const result = await connectToCouchbase();
        cluster = result.cluster;
    }

    return cluster;
}