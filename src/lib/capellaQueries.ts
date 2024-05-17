import type { QueryResult } from 'couchbase';
import { getCluster } from './clusterProvider.ts';

import { Bun } from '@types/bun'; // Import Bun from the correct module path

export async function queryCapella(query: string, logToFile: boolean = false, fileName: string = 'results.txt'): Promise<void> {
    const cluster = await getCluster();
    try {
        const result: QueryResult = await cluster.query(query);
        const jsonStringResult = JSON.stringify(result, null, 2);
        console.log(jsonStringResult);

        if (logToFile) {
            const bun = new Bun(); // Create a new Bun instance
            const destFile = bun.file(fileName); // Use the provided file name
            await bun.write(destFile, jsonStringResult); // Write the results into the file
        }
    } catch (error: any) {
        console.error('Query Error:', error);
    }
}