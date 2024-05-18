export const n1qlQueryFatalRequests: string = `
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
        AND requestTime >= DATE_ADD_STR(NOW_STR(), -336, 'hour')
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

export const n1qlLongestRunningQueries: string = `
SELECT statement,
    DURATION_TO_STR(avgServiceTime) AS avgServiceTime,
    COUNT(1) AS queries
FROM system:completed_requests
WHERE UPPER(statement) NOT LIKE 'INFER %'
    AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
    AND UPPER(statement) NOT LIKE '% SYSTEM:%'
GROUP BY statement
LETTING avgServiceTime = AVG(STR_TO_DURATION(serviceTime))
ORDER BY avgServiceTime DESC
`;

export const n1qlMostFrequentQueries: string = `
SELECT statement,
    COUNT(1) AS queries
FROM system:completed_requests
WHERE UPPER(statement) NOT LIKE 'INFER %'
    AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
    AND UPPER(statement) NOT LIKE '% SYSTEM:%'
GROUP BY statement
LETTING queries = COUNT(1)
ORDER BY queries DESC
`;

export const n1qlLargestResultSizeQueries: string = `
SELECT statement,
    (avgResultSize) AS avgResultSizeBytes,
    (avgResultSize / 1000) AS avgResultSizeKB,
    (avgResultSize / 1000 / 1000) AS avgResultSizeMB,
    COUNT(1) AS queries
FROM system:completed_requests
WHERE UPPER(statement) NOT LIKE 'INFER %'
    AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
    AND UPPER(statement) NOT LIKE '% SYSTEM:%'
GROUP BY statement
LETTING avgResultSize = AVG(resultSize)
ORDER BY avgResultSize DESC
`;

export const n1qlLargestResultCountQueries: string = `
SELECT statement,
    avgResultCount,
    COUNT(1) AS queries
FROM system:completed_requests
WHERE UPPER(statement) NOT LIKE 'INFER %'
    AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
    AND UPPER(statement) NOT LIKE '% SYSTEM:%'
GROUP BY statement
LETTING avgResultCount = AVG(resultCount)
ORDER BY avgResultCount DESC
`;

export const n1qlPrimaryIndexes: string = `
SELECT *
FROM system:completed_requests
WHERE phaseCounts.\`primaryScan\` IS NOT MISSING
    AND UPPER(statement) NOT LIKE '% SYSTEM:%'
ORDER BY resultCount DESC
`;

export const n1qlSystemIndexes: string = `
SELECT
(SELECT COUNT(*) FROM system:indexes) AS total_count,
t.*
FROM system:indexes t;
`;

export const n1qlCompletedRequests: string = `
SELECT *, meta().plan FROM system:completed_requests
WHERE requestTime >= DATE_ADD_STR(NOW_STR(), -336, 'hour')
ORDER BY elapsedTime DESC
`;

export const n1qlPreparedStatements: string = `
SELECT * FROM system:prepareds;
`;

export const n1qlIndexesToDrop: string = `
SELECT 
  (SELECT i_inner.name, i_inner.keyspace_id, i_inner.\`namespace\`, i_inner.namespace_id, i_inner.state
  FROM system:indexes AS i_inner
  WHERE i_inner.metadata.last_scan_time IS NULL AND ANY v IN ["travel-sample"] SATISFIES i_inner.keyspace_id LIKE v || "%" END) as last_scan_null,
  COUNT(*) AS total
FROM system:indexes AS i
WHERE i.metadata.last_scan_time IS NULL AND ANY v IN ["travel-sample"] SATISFIES i.keyspace_id LIKE v || "%" END;`;