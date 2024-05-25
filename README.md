# couchbase-refactor

This is to aid in refactoring Couchbase for the Cost Reduction plan - 30%

This application does the following:-

- Ping Cluster
- Query for Completed Requests in Last Week
- Query for Prepared Statements
- Query for Fatal Errors
- Query for Longest Running Queries
- Query for Most Frequent Running Queries
- Query for Largest Result Size Queries
- Query for Largest Result Count 
- Query foe Most Expensive Queries
- Query for Primary Index
- Query for All Indexes

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime. Upgraded to Bun v1.1.10
# couchbase-refactor
