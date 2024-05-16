import { connectToCouchbase } from './src/lib/couchbaseConnector.ts';
import type {Cluster, PingResult, QueryResult} from 'couchbase';

let cluster: Cluster;

type DropIndexConfig = {
    bucketName: string;
    indexName: string;
};

async function getIndexesToDrop(): Promise<DropIndexConfig[]> {
    const query: string = `
        SELECT 
          (SELECT i_inner.name, i_inner.keyspace_id
          FROM system:indexes AS i_inner
          WHERE i_inner.metadata.last_scan_time IS NULL AND ANY v IN ["orders"] SATISFIES i_inner.keyspace_id LIKE "%" || v || "%" END) as indexes
        FROM system:indexes AS i
        WHERE i.metadata.last_scan_time IS NULL AND ANY v IN ["orders"] SATISFIES i.keyspace_id LIKE "%" || v || "%" END;
    `;
    let result: QueryResult = await cluster.query(query);
    console.log("Indexes to drop...",result);

    const dropIndexConfigs: DropIndexConfig[] = [];

    for(let row of result.rows){
        for(let indexInfo of row.indexes){
            dropIndexConfigs.push({
                bucketName: indexInfo.keyspace_id,
                indexName: indexInfo.name
            });
        }
    }

    return dropIndexConfigs;
}

async function dropIndices(dropIndexConfigs: DropIndexConfig[]): Promise<void> {
    for (const config of dropIndexConfigs) {
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
        let result: QueryResult = await cluster.query(queryIndex);
        console.log(JSON.stringify(result, null, 2));
        console.log(`Index ${indexName} dropped successfully`);
    } catch (error: any) {
        if (error.name === 'IndexNotFoundError') {
            console.log(`Index ${indexName} does not exist, hence cannot be dropped.`);
        } else {
            console.error(`Error dropping index ${indexName}:`, error);
        }
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
    } catch (error: any) {
        console.log(error);
        throw error;
    } finally {
        console.log("Exiting...");
        process.exit(0);
    }
}

main().catch(err => console.error(err));