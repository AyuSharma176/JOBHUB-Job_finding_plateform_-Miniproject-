// API request timeout in milliseconds
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Safely convert value to array
 * @param {*} value - Any value that might or might not be an array
 * @returns {Array} Empty array if value is not array, otherwise returns the array
 */
const safeArray = (value) => (Array.isArray(value) ? value : []);

/**
 * Normalize and clean text input
 * @param {string} value - The value to normalize
 * @param {string} fallback - Default fallback string if value is invalid
 * @returns {string} Trimmed text or fallback value
 */
const normalizeText = (value, fallback = "") => {
  if (!value || typeof value !== "string") return fallback;
  return value.trim();
};

/**
 * Map and standardize employment type from source data
 * @param {string} value - The employment type value from external source
 * @returns {string} Standardized employment type: "Full-time", "Part-time", or "Temporary"
 */
const mapEmploymentType = (value) => {
  const normalized = normalizeText(value, "Full-time").toLowerCase();
  if (normalized.includes("part")) return "Part-time";
  if (normalized.includes("contract") || normalized.includes("temporary")) return "Temporary";
  return "Full-time";
};

const mapExperienceLevel = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized.includes("intern")) return "Internship";
  if (normalized.includes("junior") || normalized.includes("entry")) return "Fresher";
  return "Work remotely";
};

const inferSalaryBand = (title = "") => {
  const lower = String(title).toLowerCase();
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("principal")) {
    return { minPrice: "90", maxPrice: "180" };
  }
  if (lower.includes("intern")) {
    return { minPrice: "20", maxPrice: "40" };
  }
  return { minPrice: "45", maxPrice: "120" };
};

const toSkills = (tags = []) =>
  safeArray(tags)
    .filter((tag) => typeof tag === "string" && tag.trim())
    .slice(0, 8)
    .map((tag) => {
      const clean = tag.trim();
      return { value: clean, label: clean };
    });

async function fetchJson(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.json();
}

function mapRemotiveJob(job) {
  const title = normalizeText(job.title, "Software Engineer");
  const salaryBand = inferSalaryBand(title);
  const dateValue = job.publication_date ? new Date(job.publication_date) : new Date();

  return {
    source: "remotive",
    sourceJobId: String(job.id || ""),
    jobTitle: title,
    companyName: normalizeText(job.company_name, "Unknown Company"),
    minPrice: salaryBand.minPrice,
    maxPrice: salaryBand.maxPrice,
    salaryType: "Yearly",
    jobLocation: normalizeText(job.candidate_required_location, "Remote"),
    postingDate: dateValue.toISOString().split("T")[0],
    experienceLevel: mapExperienceLevel(title),
    employmentType: mapEmploymentType(job.job_type),
    description: normalizeText(job.description, "No description provided."),
    requirements: ["Check full description for role requirements."],
    responsibilities: ["Collaborate with team and deliver project outcomes."],
    benefits: ["Competitive compensation"],
    companyLogo: normalizeText(job.company_logo_url),
    skills: toSkills(job.tags),
    postedBy: "external-source@jobportal.com",
    sourceUrl: normalizeText(job.url),
    createdAt: new Date(),
    updatedAt: new Date(),
    imported: true,
  };
}

function mapArbeitnowJob(job) {
  const title = normalizeText(job.title, "Software Engineer");
  const salaryBand = inferSalaryBand(title);
  const tags = safeArray(job.tags);
  const dateValue = job.created_at ? new Date(job.created_at) : new Date();

  return {
    source: "arbeitnow",
    sourceJobId: String(job.slug || title),
    jobTitle: title,
    companyName: normalizeText(job.company_name, "Unknown Company"),
    minPrice: salaryBand.minPrice,
    maxPrice: salaryBand.maxPrice,
    salaryType: "Yearly",
    jobLocation: normalizeText(job.location, "Remote"),
    postingDate: dateValue.toISOString().split("T")[0],
    experienceLevel: mapExperienceLevel(title),
    employmentType: mapEmploymentType(tags.join(" ")),
    description: normalizeText(job.description, "No description provided."),
    requirements: ["Review official listing for complete requirements."],
    responsibilities: ["Deliver work aligned with role and team goals."],
    benefits: ["Career growth opportunities"],
    companyLogo: "",
    skills: toSkills(tags),
    postedBy: "external-source@jobportal.com",
    sourceUrl: normalizeText(job.url),
    createdAt: new Date(),
    updatedAt: new Date(),
    imported: true,
  };
}

/**
 * Fetch jobs from multiple external job APIs in parallel
 * Combines normalized data from Remotive and Arbeitnow APIs
 * @param {Object} options - Configuration options
 * @param {number} options.perSourceLimit - Maximum jobs to fetch from each source (default: 100)
 * @returns {Promise<Array>} Array of normalized job objects from all sources
 */
async function fetchExternalJobs({ perSourceLimit = 100 }) {
  // External API endpoints for remote job listings
  const remotiveUrl = "https://remotive.com/api/remote-jobs";
  const arbeitnowUrl = "https://www.arbeitnow.com/api/job-board-api";

  // Fetch data from both sources in parallel for better performance
  const [remotiveData, arbeitnowData] = await Promise.all([
    fetchJson(remotiveUrl),
    fetchJson(arbeitnowUrl),
  ]);

  // Process Remotive API results and normalize to standard job format
  const remotiveJobs = safeArray(remotiveData.jobs)
    .slice(0, perSourceLimit)
    .map(mapRemotiveJob)
    .filter((job) => job.sourceJobId && job.sourceJobId.trim());

  // Process Arbeitnow API results and normalize to standard job format
  const arbeitnowJobs = safeArray(arbeitnowData.data)
    .slice(0, perSourceLimit)
    .map(mapArbeitnowJob)
    .filter((job) => job.sourceJobId && job.sourceJobId.trim());

  // Combine all jobs from both sources and return
  return [...remotiveJobs, ...arbeitnowJobs];
}

/**
 * Upsert (insert or update) imported jobs into MongoDB database
 * Efficiently batch processes jobs using bulk write operations
 * @param {Object} params - Parameters object
 * @param {Object} params.jobsCollection - MongoDB collection reference for jobs
 * @param {Array<Object>} params.jobs - Array of normalized job objects to sync to database
 * @returns {Promise<Object>} Result object with importedCount, modifiedCount, and upsertedCount
 * @description
 *   - Uses source + sourceJobId as unique identifier for deduplication
 *   - Preserves original createdAt for existing jobs, sets for new ones
 *   - Updates modifiedAt timestamp on every upsert operation
 *   - Performs unordered bulk write for maximum performance across large datasets
 */
async function upsertImportedJobs({ jobsCollection, jobs }) {
  // Return early if no jobs to process
  if (!jobs.length) {
    return { importedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  }

  // Build bulk operations for each job
  const operations = jobs.map((job) => {
    const { createdAt, ...rest } = job;
    return {
      updateOne: {
        // Identify job by source system and external ID
        filter: {
          source: job.source,
          sourceJobId: job.sourceJobId,
        },
        update: {
          // Replace all fields except timestamps on update
          $set: {
            ...rest,
            updatedAt: new Date(), // Always update modification timestamp
          },
          // Only set createdAt on new documents (insert operation)
          $setOnInsert: {
            createdAt: createdAt || new Date(),
          },
        },
        upsert: true, // Insert if not found, update if exists
      },
    };
  });

  // Execute bulk operations with unordered=true for better database performance
  const result = await jobsCollection.bulkWrite(operations, { ordered: false });
  return {
    importedCount: jobs.length, // Total jobs processed
    modifiedCount: result.modifiedCount || 0, // Existing jobs updated
    upsertedCount: result.upsertedCount || 0, // New jobs created
  };
}

module.exports = {
  fetchExternalJobs,
  upsertImportedJobs,
};
