import type { QueryResult } from 'couchbase';
import { getCluster } from './clusterProvider.ts';

export async function queryCapella(query: string): Promise<void> {
    const cluster = await getCluster();
    try {
        let result: QueryResult = await cluster.query(query);
        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Query Error:', error);
    }
}