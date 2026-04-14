const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9zobzpb.mongodb.net/?appName=Job-portal`;
const SEED_TAG = 'seed-v2';

const titles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'React Developer',
  'Node.js Developer',
  'MERN Stack Developer',
  'Software Engineer',
  'Senior Software Engineer',
  'QA Engineer',
  'DevOps Engineer'
];

const companies = [
  'TechNova',
  'CodeCraft',
  'ByteBridge',
  'CloudNest',
  'NextWave',
  'InnoSoft',
  'PixelWorks',
  'DataFleet',
  'StackSphere',
  'RapidLogic'
];

const locations = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Bangalore', 'Sydney'];
const salaryTypes = ['Yearly', 'Monthly'];
const experienceLevels = ['Fresher', 'Internship', 'Work remotely'];
const employmentTypes = ['Full-time', 'Part-time', 'Temporary'];
const perks = [
  'Health insurance',
  'Performance bonus',
  'Learning budget',
  'Paid time off',
  'Home office allowance',
  'Flexible working hours',
  'Annual team retreat',
  'Wellness stipend'
];
const responsibilities = [
  'Build and maintain production-grade web features with strong code quality.',
  'Collaborate with product managers and designers to deliver user-focused solutions.',
  'Write reusable components and backend APIs with clear documentation.',
  'Participate in code reviews, sprint planning, and release cycles.',
  'Investigate and fix bugs with attention to performance and reliability.',
  'Contribute to technical decisions and continuous improvement initiatives.'
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildJob(i) {
  const minPrice = randomInt(30, 90);
  const maxPrice = minPrice + randomInt(10, 80);
  const skillPool = ['JavaScript', 'React', 'Node', 'MongoDB', 'TypeScript', 'HTML', 'CSS', 'Redux'];
  const picked = skillPool.sort(() => 0.5 - Math.random()).slice(0, 4);
  const companyName = randomItem(companies);
  const title = randomItem(titles);
  const location = randomItem(locations);
  const employmentType = randomItem(employmentTypes);
  const salaryType = randomItem(salaryTypes);

  return {
    seedTag: SEED_TAG,
    jobTitle: `${title} ${i + 1}`,
    companyName,
    minPrice: String(minPrice),
    maxPrice: String(maxPrice),
    salaryType,
    jobLocation: location,
    postingDate: new Date().toISOString().split('T')[0],
    experienceLevel: randomItem(experienceLevels),
    employmentType,
    description: `${companyName} is hiring a ${title} to help build and scale our hiring platform. You will work in a collaborative engineering team and ship high-impact features for recruiters and job seekers. This is a ${employmentType.toLowerCase()} role based in ${location}.`,
    requirements: [
      '1+ years of hands-on experience in modern web development.',
      'Strong understanding of JavaScript fundamentals and API integration.',
      'Ability to write clean, maintainable, and testable code.',
      'Good communication and team collaboration skills.'
    ],
    responsibilities: responsibilities.sort(() => 0.5 - Math.random()).slice(0, 4),
    benefits: perks.sort(() => 0.5 - Math.random()).slice(0, 4),
    companyLogo: 'https://via.placeholder.com/120x120.png?text=Logo',
    skills: picked.map((s) => ({ value: s, label: s })),
    postedBy: `company${(i % 10) + 1}@jobportal.com`,
    createdAt: new Date()
  };
}

async function seed() {
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

    const deleteResult = await jobsCollection.deleteMany({
      $or: [
        { seedTag: { $in: ['seed-v1', 'seed-v2'] } },
        { postedBy: { $regex: '^company\\d+@jobportal\\.com$' } }
      ]
    });

    const jobs = Array.from({ length: 50 }, (_, i) => buildJob(i));
    const result = await jobsCollection.insertMany(jobs);

    console.log(`Deleted ${deleteResult.deletedCount} old seeded jobs.`);
    console.log(`Inserted ${result.insertedCount} upgraded jobs successfully.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
