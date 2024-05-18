import type {Cluster, PingResult} from 'couchbase';
import { getCluster } from './clusterProvider.ts';

export async function pingCluster(): Promise<void> {
    const cluster: Cluster = await getCluster();
    try {
        const result: PingResult  = await cluster.ping();
        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error("Error pinging the cluster:", error);
    }
}