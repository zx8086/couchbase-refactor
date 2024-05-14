// config.ts
export interface CouchbaseConfig {
  URL: string;
  USERNAME: string;
  PASSWORD: string;
  BUCKET: string;
  SCOPE: string;
  COLLECTION: string;
}

export interface Config {
  couchbase: CouchbaseConfig;
}

function getOrThrow(envVariable: string | undefined, name: string): string {
  if (!envVariable) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return envVariable;
}

const couchbaseConfig: CouchbaseConfig = {
  URL: getOrThrow(Bun.env.COUCHBASE_URL, 'COUCHBASE_URL'),
  USERNAME: getOrThrow(Bun.env.COUCHBASE_USERNAME, 'COUCHBASE_USERNAME'),
  PASSWORD: getOrThrow(Bun.env.COUCHBASE_PASSWORD, 'COUCHBASE_PASSWORD'),
  BUCKET: getOrThrow(Bun.env.COUCHBASE_BUCKET, 'COUCHBASE_BUCKET'),
  SCOPE: getOrThrow(Bun.env.COUCHBASE_SCOPE, 'COUCHBASE_SCOPE'),
  COLLECTION: getOrThrow(Bun.env.COUCHBASE_COLLECTION, 'COUCHBASE_COLLECTION'),
};


const config: Config = {
  couchbase: couchbaseConfig,
};

export default config;