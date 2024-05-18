import type {Cluster, QueryResult} from 'couchbase';
import type {BunFile} from 'bun';
import { getCluster } from './clusterProvider.ts';
import { mkdir } from 'node:fs/promises';
import path from 'path';

export async function queryCapella(query: string, logToFile: boolean = false, fileName: string = 'queryResults.txt'): Promise<void> {
    try {
        const cluster: Cluster = await getCluster();
        const result: QueryResult = await cluster.query(query);
        const jsonStringResult: string = JSON.stringify(result, null, 2);
        console.log(jsonStringResult);

        if (logToFile) {
            const directory: string = 'src/query_results';
            await mkdir(directory, { recursive: true });

            const destFile:BunFile = Bun.file(path.join(directory, fileName));
            await Bun.write(destFile, jsonStringResult);
        }
    } catch (error: any) {
        console.error('Query Error:', error);
    }
}