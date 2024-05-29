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
        AND requestTime >= DATE_ADD_STR(NOW_STR(), -8, 'week')
        AND UPPER(statement) NOT LIKE 'INFER %'
        AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
        AND UPPER(statement) NOT LIKE '% SYSTEM:%'
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
    FROM total_error_count
    ORDER BY requestTime DESC;
`;

export const n1qlLongestRunningQueries: string = `
SELECT statement,
    MILLIS_TO_STR(AVG(serviceTime)) AS avgServiceTime,
COUNT(1) AS queries
FROM system:completed_requests
WHERE UPPER(statement) NOT LIKE 'INFER %'
AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
AND UPPER(statement) NOT LIKE '% SYSTEM:%'
GROUP BY statement
ORDER BY AVG(serviceTime) DESC;
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
ORDER BY queries DESC;
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
ORDER BY avgResultSize DESC;
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
ORDER BY avgResultCount DESC;
`;

export const n1qlPrimaryIndexes: string = `
SELECT *
FROM system:completed_requests
WHERE phaseCounts.\`primaryScan\` IS NOT MISSING
    AND UPPER(statement) NOT LIKE '% SYSTEM:%'
    AND UPPER(statement) NOT LIKE 'INFER %'
    AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
ORDER BY resultCount DESC;
`;

export const n1qlSystemIndexes: string = `
SELECT
    (SELECT 
        COUNT(*) 
    FROM system:indexes
    WHERE UPPER(statement) NOT LIKE '% SYSTEM:%'
    AND UPPER(statement) NOT LIKE 'INFER %'
    AND UPPER(statement) NOT LIKE 'CREATE INDEX%'
) AS total_count,
t.*
FROM system:indexes t;
`;

export const n1qlCompletedRequests: string = `
SELECT *, meta().plan FROM system:completed_requests
WHERE requestTime >= DATE_ADD_STR(NOW_STR(), -8, 'week')
ORDER BY elapsedTime DESC;
`;

export const n1qlPreparedStatements: string = `
SELECT * FROM system:prepareds;
`;

export const n1qlIndexesToDrop: string = `
SELECT 
  (SELECT i_inner.name, i_inner.keyspace_id, i_inner.\`namespace\`, i_inner.namespace_id, i_inner.state
  FROM system:indexes AS i_inner
  WHERE i_inner.metadata.last_scan_time IS NULL AND ANY v IN ["default", "prices"] SATISFIES i_inner.keyspace_id LIKE v || "%" END) as last_scan_null,
  COUNT(*) AS total
FROM system:indexes AS i
WHERE i.metadata.last_scan_time IS NULL AND ANY v IN ["default", "prices"] SATISFIES i.keyspace_id LIKE v || "%" END;`;

export const mostExpensiveQueries: string = `
SELECT
       COUNT(*) AS count,
       preparedText,
       statement,
       AVG(resultSize) AS avg_resultSize,
       AVG(resultCount) AS avg_resultCount,
       AVG(usedMemory) AS avg_usedMemory,
       AVG(phaseCounts.\`fetch\`) AS avg_fetches,
       AVG(phaseCounts.indexScan) AS avg_indexScanResults,
       AVG(phaseOperators.indexScan) AS avg_indexesScanned,
       SUM(STR_TO_DURATION(serviceTime)) as sum_serviceTimeMs,

       DURATION_TO_STR(AVG(STR_TO_DURATION(serviceTime))) AS avg_serviceTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(serviceTime))) AS sum_serviceTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(elapsedTime))) AS avg_elapsedTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(elapsedTime))) AS sum_elapsedTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.run))) AS avg_runTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.run))) AS sum_runTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.\`fetch\`))) AS avg_fetchTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.\`fetch\`))) AS sum_fetchTime,
       TOSTRING(ROUND(AVG(STR_TO_DURATION(phaseTimes.\`fetch\`))/AVG(STR_TO_DURATION(elapsedTime))*100,2)) || "%" AS pct_fetchTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.plan))) AS avg_planTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.plan))) AS sum_planTime,
       TOSTRING(ROUND(AVG(STR_TO_DURATION(phaseTimes.plan))/AVG(STR_TO_DURATION(elapsedTime))*100,2)) || "%" AS pct_planTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.\`filter\`))) AS avg_filterTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.\`filter\`))) AS sum_filterTime,
       TOSTRING(ROUND(AVG(STR_TO_DURATION(phaseTimes.\`filter\`))/AVG(STR_TO_DURATION(elapsedTime))*100,2)) || "%" AS pct_filterTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.indexScan))) AS avg_indexScanTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.indexScan))) AS sum_indexScanTime,
       TOSTRING(ROUND(AVG(STR_TO_DURATION(phaseTimes.indexScan))/AVG(STR_TO_DURATION(elapsedTime))*100,2)) || "%" AS pct_indexScanTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.authorize))) AS avg_authorizeTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.authorize))) AS sum_authorizeTime,
       TOSTRING(ROUND(AVG(STR_TO_DURATION(phaseTimes.authorize))/AVG(STR_TO_DURATION(elapsedTime))*100,2)) || "%" AS pct_authorizeTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.project))) AS avg_projectTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.project))) AS sum_projectTime,
       TOSTRING(ROUND(AVG(STR_TO_DURATION(phaseTimes.project))/AVG(STR_TO_DURATION(elapsedTime))*100,2)) || "%" AS pct_projectTime,

       DURATION_TO_STR(AVG(STR_TO_DURATION(phaseTimes.stream))) AS avg_streamTime,
       DURATION_TO_STR(SUM(STR_TO_DURATION(phaseTimes.stream))) AS sum_streamTime,
       TOSTRING(ROUND(AVG(STR_TO_DURATION(phaseTimes.stream))/AVG(STR_TO_DURATION(elapsedTime))*100,2)) || "%" AS pct_streamTime,
       
       MIN(requestTime) as requestTimeFirst,
       MAX(requestTime) as requestTimeLast

FROM system:completed_requests
WHERE LOWER(statement) AND LOWER(statement) NOT LIKE "%advise %" AND LOWER(statement) NOT LIKE "%infer %"
GROUP BY statement,preparedText
ORDER BY sum_serviceTimeMs DESC;
`;