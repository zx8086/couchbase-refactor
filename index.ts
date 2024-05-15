import { connectToCouchbase } from './src/lib/couchbaseConnector.ts';

import type {PingResult, QueryResult} from 'couchbase';

async function pingCluster(): Promise<void> {
    try {
        const { cluster } = await connectToCouchbase();
        const result: PingResult  = await cluster.ping();
        console.log(JSON.stringify(result, null, 2));

    } catch (error: unknown) {
        console.error("Error pinging the cluster:", error);
    }
}

async function queryCapella(query: string): Promise<void> {
    try {
        const { cluster } = await connectToCouchbase();
        let result: QueryResult = await cluster.query(query);
        console.log(JSON.stringify(result, null, 2));
    } catch (error: unknown) {
        console.error('Query Error:', error);
    }
}

const n1qlQuery : any = 'SELECT ARRAY_AGG({"orderId": d.orderId, "reference": d.reference, "documentType": d.documentType, "brand": d.brand, "salesOrganizationCode": d.salesOrganizationCode, "masterSalesOrganizationCode": d.masterSalesOrganizationCode}) AS orders, COUNT(*) AS total_count FROM `orders`.`_default`.`_default` AS d';

async function main() :Promise<void> {
    try {
        await pingCluster();
        await queryCapella(n1qlQuery);
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

main().catch(err => console.error(err));