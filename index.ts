import { pingCluster } from './src/lib/clusterOperations.ts';
import { queryCapella } from './src/lib/capellaQueries.ts';
import { getIndexesToDrop, dropIndices } from './src/lib/indexOperations.ts';

let successfulDrops = 0;
let failedDrops = 0;

type DropIndexConfig = {
    bucketName: string;
    indexName: string;
};

const n1qlQueryFatalRequests: string = `
    WITH fatal_requests AS (
    SELECT
        requestId,
        resultSize,
        statement,
        phaseTimes,
        errors,
        requestTime,
        userAgent,
        users
    FROM system:completed_requests
    WHERE state = "fatal"
        AND requestTime >= DATE_ADD_STR(NOW_STR(), -24, 'hour')
    ), 
    total_error_count AS (
    SELECT COUNT(*) AS totalErrorCount FROM fatal_requests
    )
    SELECT
        requestId,
        resultSize,
        statement,
        phaseTimes,
        errors,
        requestTime,
        userAgent,
        users
    FROM fatal_requests
    UNION ALL
    SELECT
        totalErrorCount
    FROM total_error_count;
`;

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