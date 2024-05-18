import type { QueryResult } from 'couchbase';
import { getCluster } from './clusterProvider.ts';
import type { DropIndexConfig } from "./interfaces.ts";
import { n1qlIndexesToDrop } from './../queries/n1qlQueries.ts';

let successfulDrops = 0;
let failedDrops = 0;

export async function getIndexesToDrop(): Promise<DropIndexConfig[]> {
    const cluster = await getCluster();
    console.log("\nSelect Index To Drop Index...");
    let result: QueryResult = await cluster.query(n1qlIndexesToDrop);
    console.log(JSON.stringify(result, null, 2));

    const dropIndexConfigs: DropIndexConfig[] = [];

    for(let row of result.rows){
        if(row.last_scan_null){
            for(let indexInfo of row.last_scan_null){
                dropIndexConfigs.push({
                    bucketName: indexInfo.keyspace_id,
                    indexName: indexInfo.name
                });
            }
        } else {
            console.log('No indexes to drop for this row');
        }
    }

    return dropIndexConfigs;
}

export async function dropIndices(dropIndexConfigs: DropIndexConfig[]): Promise<void> {
    for (const config of dropIndexConfigs) {
        console.log(`Dropping index: ${config.indexName} of bucket: ${config.bucketName}`);
        await dropIndex(config.bucketName, config.indexName);
    }
}

async function dropIndex(bucketName: string, indexName: string): Promise<void> {
    const cluster = await getCluster();
    try {
        let queryIndex : string = `DROP INDEX \`${bucketName}\`.\`${indexName}\``;
        console.log(queryIndex)
        let result: QueryResult = await cluster.query(queryIndex);
        console.log(JSON.stringify(result, null, 2));
        console.log(`Index ${indexName} dropped successfully`);
        successfulDrops++; // increment successful drops by 1
    } catch (error: any) {
        if (error.name === 'IndexNotFoundError') {
            console.log(`Index ${indexName} does not exist, hence cannot be dropped.`);
        } else {
            console.error(`Error dropping index ${indexName}:`, error);
        }
        failedDrops++; // increment failed drops by 1
    }
}
