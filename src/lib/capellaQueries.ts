import type { QueryResult } from 'couchbase';
import { getCluster } from './clusterProvider.ts';
import { mkdir } from 'node:fs/promises';
import path from 'path';

export async function queryCapella(query: string, logToFile: boolean = false, fileName: string = 'results.txt'): Promise<void> {
    const cluster = await getCluster();
    try {
        const result: QueryResult = await cluster.query(query);
        const jsonStringResult = JSON.stringify(result, null, 2);
        console.log(jsonStringResult);

        if (logToFile) {
            const directory = 'src/query_results';
            await mkdir(directory, { recursive: true });

            const destFile = Bun.file(path.join(directory, fileName));
            await Bun.write(destFile, jsonStringResult);
        }
    } catch (error: any) {
        console.error('Query Error:', error);
    }
}