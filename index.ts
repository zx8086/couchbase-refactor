import { pingCluster } from './src/lib/clusterOperations.ts';
import { queryCapella } from './src/lib/capellaQueries.ts';
import { getIndexesToDrop, dropIndices } from './src/lib/indexOperations.ts';
import type { DropIndexConfig } from './src/lib/interfaces.ts';
import { n1qlQueryFatalRequests, n1qlLongestRunningQueries, n1qlMostFrequentQueries, n1qlLargestResultSizeQueries, n1qlLargestResultCountQueries, n1qlPrimaryIndexes, n1qlSystemIndexes, n1qlCompletedRequests, n1qlPreparedStatements } from './src/queries/n1qlQueries.ts';

let successfulDrops = 0;
let failedDrops = 0;

async function main() :Promise<void> {
    try {

        console.log("\nBun Version",Bun.version);

        console.log("\nPinging cluster...");
        await pingCluster();

        console.log("\nQuery Completed Request...");
        await queryCapella(n1qlCompletedRequests, true, 'completedRequests.txt');

        console.log("\nQuery Prepared Statements...");
        await queryCapella(n1qlPreparedStatements, true, 'preparedStatements.txt');

        console.log("\nQuery Failed Fatal Queries...");
        await queryCapella(n1qlQueryFatalRequests, true, 'fatalRequestsResults.txt');

        console.log("\nQuery Longest Running Queries...");
        await queryCapella(n1qlLongestRunningQueries, true, 'longestRunningQueries.txt');

        console.log("\nQuery Most Frequent Queries...");
        await queryCapella(n1qlMostFrequentQueries, true, 'mostFrequentQueries.txt');

        console.log("\nQuery Largest Result Size...");
        await queryCapella(n1qlLargestResultSizeQueries, true, 'largestResultSizeQueries.txt');

        console.log("\nQuery Largest Result Counts...");
        await queryCapella(n1qlLargestResultCountQueries, true, 'largestResultCountQueries.txt');

        console.log("\nQuery PRIMARY Indexes...");
        await queryCapella(n1qlPrimaryIndexes, true, 'primaryIndexes.txt');

        console.log("\nQuery Indexes...");
        await queryCapella(n1qlSystemIndexes, true, 'systemIndexes.txt');

        console.log("\nDropping Unused Indexes...");
        const dropIndicesConfig: DropIndexConfig[] = await getIndexesToDrop();
        await dropIndices(dropIndicesConfig);

    } finally {
        console.log(`\nSuccessful Index Deletions: ${successfulDrops}`);
        console.log(`Failed Index Deletions: ${failedDrops}`);
        console.log(`Total Attempted Deletions: ${successfulDrops + failedDrops}`);
        console.log("\nExiting...");
        process.exit(0);
    }
}

main().catch(err => console.error(err));