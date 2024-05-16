import { connectToCouchbase } from './src/lib/couchbaseConnector.ts';
import type {Cluster, PingResult, QueryResult} from 'couchbase';

let cluster: Cluster;
let successfulDrops = 0;
let failedDrops = 0;

type DropIndexConfig = {
    bucketName: string;
    indexName: string;
};

async function getIndexesToDrop(): Promise<DropIndexConfig[]> {
    const query: string = `
        SELECT 
  (SELECT i_inner.name, i_inner.keyspace_id, i_inner.\`namespace\`, i_inner.namespace_id, i_inner.state
  FROM system:indexes AS i_inner
  WHERE i_inner.metadata.last_scan_time IS NULL AND ANY v IN ["travel-sample"] SATISFIES i_inner.keyspace_id LIKE v || "%" END) as last_scan_null,
  COUNT(*) AS total
FROM system:indexes AS i
WHERE i.metadata.last_scan_time IS NULL AND ANY v IN ["travel-sample"] SATISFIES i.keyspace_id LIKE v || "%" END;
    `;
    let result: QueryResult = await cluster.query(query);
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

async function dropIndices(dropIndexConfigs: DropIndexConfig[]): Promise<void> {
    for (const config of dropIndexConfigs) {
        console.log(`Dropping index: ${config.indexName} of bucket: ${config.bucketName}`);
        await dropIndex(config.bucketName, config.indexName);
    }
}

async function pingCluster(): Promise<void> {
    try {
        const result: PingResult  = await cluster.ping();
        console.log(JSON.stringify(result, null, 2));
    } catch (error: unknown) {
        console.error("Error pinging the cluster:", error);
    }
}

async function dropIndex(bucketName: string, indexName: string): Promise<void> {
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


async function queryCapella(query: string): Promise<void> {
    try {
        let result: QueryResult = await cluster.query(query);
        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Query Error:', error);
    }
}

const n1qlQuery : any = 'SELECT ARRAY_AGG({"orderId": d.orderId, "reference": d.reference, "documentType": d.documentType, "brand": d.brand, "salesOrganizationCode": d.salesOrganizationCode, "masterSalesOrganizationCode": d.masterSalesOrganizationCode}) AS orders, COUNT(*) AS total_count FROM `orders`.`_default`.`_default` AS d';

async function main() :Promise<void> {
    try {
        const result = await connectToCouchbase();
        cluster = result.cluster;
        const dropIndicesConfig: DropIndexConfig[] = await getIndexesToDrop();
        await dropIndices(dropIndicesConfig);
    } finally {
        console.log(`Successful Index Deletions: ${successfulDrops}`);
        console.log(`Failed Index Deletions: ${failedDrops}`);
        console.log(`Total Attempted Deletions: ${successfulDrops + failedDrops}`);
        console.log("Exiting...");
        process.exit(0);
    }
}

main().catch(err => console.error(err));