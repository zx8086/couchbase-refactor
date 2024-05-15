import { connectToCouchbase } from './src/lib/couchbaseConnector.ts';

async function pingCluster() {
    try {
        const { cluster } = await connectToCouchbase();
        const result = await cluster.ping();
        console.log(JSON.stringify(result, null, 2));
        // const diagnostics = await bucket.diagnostics();
        // console.log(JSON.stringify(diagnostics, null, 2));
    } catch (error) {
        console.error("Error pinging the cluster:", error);
    }
}

async function queryCapella(query: string) {
    try {
        const { cluster } = await connectToCouchbase();
        let result = await cluster.query(query);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Query Error:', error);
    }
}

// const n1qlQuery = 'SELECT d.* FROM `default`.`_default`.`_default` d LIMIT 5';
// const n1qlQuery = 'SELECT COUNT(*) AS total_documents FROM `orders`.`_default`.`_default`';
// const n1qlQuery = 'SELECT orderId, reference, documentType, brand, salesOrganizationCode, masterSalesOrganizationCode FROM `orders`.`_default`.`_default`';
// const n1qlQuery = 'DROP INDEX adv_brand_documentType_masterSalesOrganizationCode_orderId_reference_salesOrganizationCode USING GSI';
// const query = 'DROP INDEX `orders`.`_default`.adv_brand_documentType_masterSalesOrganizationCode_orderId_reference_salesOrganizationCode USING GSI';
// DROP INDEX `_default`.adv_brand_documentType_masterSalesOrganizationCode_orderId_reference_salesOrganizationCode USING GSI;
const n1qlQuery : any = 'SELECT ARRAY_AGG({"orderId": d.orderId, "reference": d.reference, "documentType": d.documentType, "brand": d.brand, "salesOrganizationCode": d.salesOrganizationCode, "masterSalesOrganizationCode": d.masterSalesOrganizationCode}) AS orders, COUNT(*) AS total_count FROM `orders`.`_default`.`_default` AS d';

async function main() {
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