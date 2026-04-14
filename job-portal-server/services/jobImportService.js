const DEFAULT_TIMEOUT_MS = 15000;

const safeArray = (value) => (Array.isArray(value) ? value : []);

const normalizeText = (value, fallback = "") => {
  if (!value || typeof value !== "string") return fallback;
  return value.trim();
};

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

async function fetchExternalJobs({ perSourceLimit = 100 }) {
  const remotiveUrl = "https://remotive.com/api/remote-jobs";
  const arbeitnowUrl = "https://www.arbeitnow.com/api/job-board-api";

  const [remotiveData, arbeitnowData] = await Promise.all([
    fetchJson(remotiveUrl),
    fetchJson(arbeitnowUrl),
  ]);

  const remotiveJobs = safeArray(remotiveData.jobs)
    .slice(0, perSourceLimit)
    .map(mapRemotiveJob)
    .filter((job) => job.sourceJobId);

  const arbeitnowJobs = safeArray(arbeitnowData.data)
    .slice(0, perSourceLimit)
    .map(mapArbeitnowJob)
    .filter((job) => job.sourceJobId);

  return [...remotiveJobs, ...arbeitnowJobs];
}

async function upsertImportedJobs({ jobsCollection, jobs }) {
  if (!jobs.length) {
    return { importedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  }

  const operations = jobs.map((job) => {
    const { createdAt, ...rest } = job;
    return {
      updateOne: {
        filter: {
          source: job.source,
          sourceJobId: job.sourceJobId,
        },
        update: {
          $set: {
            ...rest,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: createdAt || new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  const result = await jobsCollection.bulkWrite(operations, { ordered: false });
  return {
    importedCount: jobs.length,
    modifiedCount: result.modifiedCount || 0,
    upsertedCount: result.upsertedCount || 0,
  };
}

module.exports = {
  fetchExternalJobs,
  upsertImportedJobs,
};
