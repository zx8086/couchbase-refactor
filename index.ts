import { connectToCouchbase } from './src/lib/couchbaseConnector.ts';
import type {Cluster, PingResult, QueryResult} from 'couchbase';

let cluster: Cluster;

async function pingCluster(): Promise<void> {
    try {
        const result: PingResult  = await cluster.ping();
        console.log(JSON.stringify(result, null, 2));
    } catch (error: unknown) {
        console.error("Error pinging the cluster:", error);
    }
}

async function queryCapella(query: string): Promise<void> {
    try {
        let result: QueryResult = await cluster.query(query);
        console.log(JSON.stringify(result, null, 2));
    } catch (error: unknown) {
        console.error('Query Error:', error);
    }
}

const n1qlQuery : any = 'SELECT ARRAY_AGG({"orderId": d.orderId, "reference": d.reference, "documentType": d.documentType, "brand": d.brand, "salesOrganizationCode": d.salesOrganizationCode, "masterSalesOrganizationCode": d.masterSalesOrganizationCode}) AS orders, COUNT(*) AS total_count FROM `orders`.`_default`.`_default` AS d';

async function main() :Promise<void> {
    try {
        const result = await connectToCouchbase();
        cluster = result.cluster;

        await pingCluster();
        await queryCapella(n1qlQuery);
    } catch(err) {
        console.error(err);
    } finally {
        console.log("Exiting...");
        process.exit(0);
    }
}

main().catch(err => console.error(err));