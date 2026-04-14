const { MongoClient, ServerApiVersion } = require('mongodb');
const { fetchExternalJobs, upsertImportedJobs } = require('./services/jobImportService');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9zobzpb.mongodb.net/?appName=Job-portal`;

async function runImport() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    const db = client.db('mernJobPortal');
    const jobsCollection = db.collection('demoJobs');

    await jobsCollection.createIndex(
      { source: 1, sourceJobId: 1 },
      {
        unique: true,
        name: 'externalSourceUniqueJob',
        partialFilterExpression: {
          source: { $exists: true },
          sourceJobId: { $exists: true },
        },
      }
    );

    const perSourceLimit = Number(process.env.IMPORT_PER_SOURCE_LIMIT || 100);
    const jobs = await fetchExternalJobs({
      perSourceLimit: Number.isFinite(perSourceLimit) ? perSourceLimit : 100,
    });

    const stats = await upsertImportedJobs({ jobsCollection, jobs });
    console.log('Import finished:', stats);
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

runImport();
