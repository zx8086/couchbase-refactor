import { pingCluster } from './src/lib/clusterOperations.ts';
import { queryCapella } from './src/lib/capellaQueries.ts';
import { getIndexesToDrop, dropIndices } from './src/lib/indexOperations.ts';
import { n1qlQueryFatalRequests } from './src/queries/n1qlQueries.ts';

let successfulDrops = 0;
let failedDrops = 0;

type DropIndexConfig = {
    bucketName: string;
    indexName: string;
};

async function main() :Promise<void> {
    try {
        console.log("Pinging cluster...");
        await pingCluster();

        console.log("Query fatal requests...");
        await queryCapella(n1qlQueryFatalRequests);

        console.log("Dropping Unused Indexes...");
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