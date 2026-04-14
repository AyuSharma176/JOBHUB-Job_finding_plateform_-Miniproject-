const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { fetchExternalJobs, upsertImportedJobs } = require('./services/jobImportService');
require('dotenv').config();

const port = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true
}));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9zobzpb.mongodb.net/?appName=Job-portal`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const verifyCompany = (req, res, next) => {
  if (req.user?.role !== "company") {
    return res.status(403).json({ message: "Company access required" });
  }
  next();
};

async function run() {
  try {
    await client.connect();
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    const usersCollection = db.collection("users");
    const applicationsCollection = db.collection("applications");

    const isSmtpConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    const mailTransporter = isSmtpConfigured
      ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
      : null;

    if (!mailTransporter) {
      console.warn('Email notifications are disabled. Configure SMTP_* variables in .env to enable them.');
    } else {
      try {
        await mailTransporter.verify();
        console.log('SMTP connection verified successfully.');
      } catch (smtpError) {
        console.error('SMTP verification failed:', smtpError.message);
      }
    }

    const sendSubscriptionEmail = async ({ email, name }) => {
      if (!mailTransporter || !email) return;

      try {
        await mailTransporter.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Subscription confirmed - Job Portal',
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Welcome to Job Portal</h2>
              <p>Hi ${name || 'there'},</p>
              <p>Your email subscription for job updates is now active.</p>
              <p>You will receive notifications when companies post new jobs or update existing ones.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Failed to send subscription email:', mailError.message);
      }
    }

    const sendJobApplicationConfirmationEmail = async ({ email, name, job }) => {
      if (!mailTransporter || !email || !job) return;

      try {
        const jobTitle = job.jobTitle || job.title || 'the selected role';
        const companyName = job.companyName || 'the company';
        const location = job.jobLocation || job.location || 'Not specified';
        const detailsUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/all-jobs/${job._id || ''}`;

        await mailTransporter.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER,
          to: email,
          subject: `Application received: ${jobTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Application received</h2>
              <p>Hi ${name || 'there'},</p>
              <p>We have received your application for <strong>${jobTitle}</strong>.</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p>Our team will review your profile and contact you if your application is shortlisted.</p>
              <p><a href="${detailsUrl}">View job details</a></p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Failed to send application confirmation email:', mailError.message);
      }
    }

    const sendJobUpdateEmails = async ({ type, job }) => {
      if (!mailTransporter) return;

      try {
        const userDocs = await usersCollection
          .find(
            { role: { $ne: 'company' }, jobAlertsSubscribed: true },
            { projection: { email: 1, _id: 0 } }
          )
          .toArray();

        const recipients = [...new Set(
          userDocs
            .map((user) => user.email)
            .filter((email) => typeof email === 'string' && email.includes('@'))
        )];

        if (!recipients.length) return;

        const jobTitle = job.jobTitle || job.title || 'New Opportunity';
        const companyName = job.companyName || 'a company';
        const location = job.jobLocation || job.location || 'Not specified';
        const salary = job.salary || job.minPrice || 'Not specified';
        const detailsUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/all-jobs/${job._id || ''}`;

        const subject =
          type === 'created'
            ? `New Job Posted: ${jobTitle}`
            : `Job Updated: ${jobTitle}`;

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>${type === 'created' ? 'New job posted' : 'A job was updated'}</h2>
            <p><strong>Title:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Salary:</strong> ${salary}</p>
            <p><a href="${detailsUrl}">View job details</a></p>
          </div>
        `;

        await mailTransporter.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER,
          to: process.env.MAIL_FROM || process.env.SMTP_USER,
          bcc: recipients,
          subject,
          html,
        });
      } catch (mailError) {
        console.error('Failed to send job update emails:', mailError.message);
      }
    };

    const indexKeys = { title: 1, category: 1 };
    const indexOptions = { name: "titleCategory" };
    await jobsCollection.createIndex(indexKeys, indexOptions);
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
    await applicationsCollection.createIndex(
      { jobId: 1, applicantEmail: 1 },
      { unique: true, name: 'jobApplicantUnique' }
    );

    // ==================== USER AUTHENTICATION ROUTES ====================

    // Register route (job seeker)
    app.post("/register", async (req, res) => {
      try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
          return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create new user
        const newUser = {
          name,
          email,
          role: "jobseeker",
          jobAlertsSubscribed: false,
          password: hashedPassword,
          createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);

        // Generate JWT token
        const token = jwt.sign(
          { userId: result.insertedId, email, name, role: "jobseeker" },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: "User registered successfully",
          token,
          user: {
            id: result.insertedId,
            email,
            name,
            role: "jobseeker",
            jobAlertsSubscribed: false,
          }
        });

        sendSubscriptionEmail({ email, name }).catch((err) => {
          console.error('Async subscription email error:', err.message);
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed" });
      }
    });

    // Register route (company)
    app.post("/company/register", async (req, res) => {
      try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
          return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const newCompanyUser = {
          name,
          email,
          role: "company",
          jobAlertsSubscribed: false,
          password: hashedPassword,
          createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newCompanyUser);

        const token = jwt.sign(
          { userId: result.insertedId, email, name, role: "company" },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: "Company registered successfully",
          token,
          user: {
            id: result.insertedId,
            email,
            name,
            role: "company",
            jobAlertsSubscribed: false,
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Company registration failed" });
      }
    });

    // Login route (job seeker)
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await usersCollection.findOne({ email });
        if (!user || user.role === "company") {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email, name: user.name, role: user.role || "jobseeker" },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(200).json({
          message: "Login successful",
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role || "jobseeker",
            jobAlertsSubscribed: Boolean(user.jobAlertsSubscribed),
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
      }
    });

    // Login route (company)
    app.post("/company/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await usersCollection.findOne({ email });
        if (!user || user.role !== "company") {
          return res.status(401).json({ message: "Invalid company credentials" });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid company credentials" });
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email, name: user.name, role: "company" },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(200).json({
          message: "Company login successful",
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: "company",
            jobAlertsSubscribed: Boolean(user.jobAlertsSubscribed),
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Company login failed" });
      }
    });

    // Verify token route
    app.get("/verify-token", verifyToken, async (req, res) => {
      try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.user.userId) });
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        res.status(200).json({
          message: "Token verified",
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role || "jobseeker",
            jobAlertsSubscribed: Boolean(user.jobAlertsSubscribed),
          }
        });
      } catch (error) {
        res.status(500).json({ message: "Verification failed" });
      }
    });

    app.post('/test-email', verifyToken, async (req, res) => {
      try {
        const email = req.user?.email;
        if (!email) {
          return res.status(400).json({ message: 'No email found for authenticated user' });
        }

        await sendSubscriptionEmail({ email, name: req.user?.name });
        res.status(200).json({ message: `Test email sent to ${email}` });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send test email' });
      }
    });

    app.post('/subscribe-job-alerts', verifyToken, async (req, res) => {
      try {
        const userId = req.user?.userId;
        const email = req.user?.email;

        if (!userId || !email) {
          return res.status(400).json({ message: 'Invalid authenticated user data' });
        }

        const filter = { _id: new ObjectId(userId) };
        const update = {
          $set: {
            jobAlertsSubscribed: true,
            jobAlertsSubscribedAt: new Date(),
          },
        };

        await usersCollection.updateOne(filter, update);
        await sendSubscriptionEmail({ email, name: req.user?.name });

        res.status(200).json({
          message: 'You are subscribed to job alerts. A confirmation email has been sent.',
          subscribed: true,
          email,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to subscribe to job alerts' });
      }
    });

    app.post('/apply-job/:id', verifyToken, async (req, res) => {
      try {
        if (req.user?.role === 'company') {
          return res.status(403).json({ message: 'Companies cannot apply to jobs.' });
        }

        const jobId = req.params.id;
        if (!ObjectId.isValid(jobId)) {
          return res.status(400).json({ message: 'Invalid job id.' });
        }

        const job = await jobsCollection.findOne({ _id: new ObjectId(jobId) });
        if (!job) {
          return res.status(404).json({ message: 'Job not found.' });
        }

        const resumeUrl = (req.body?.resumeUrl || '').trim();
        if (!resumeUrl) {
          return res.status(400).json({ message: 'Resume URL is required.' });
        }

        const applicationDoc = {
          jobId: new ObjectId(jobId),
          jobTitle: job.jobTitle || job.title || '',
          companyName: job.companyName || '',
          applicantId: new ObjectId(req.user.userId),
          applicantEmail: req.user.email,
          applicantName: req.user.name || '',
          resumeUrl,
          appliedAt: new Date(),
        };

        await applicationsCollection.insertOne(applicationDoc);
        await sendJobApplicationConfirmationEmail({
          email: req.user.email,
          name: req.user.name,
          job,
        });

        res.status(201).json({
          message: 'Application submitted successfully. A confirmation email has been sent.',
          applied: true,
        });
      } catch (error) {
        if (error?.code === 11000) {
          return res.status(409).json({ message: 'You have already applied for this job.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Failed to submit application.' });
      }
    });

    app.get('/apply-job-status/:id', verifyToken, async (req, res) => {
      try {
        if (req.user?.role === 'company') {
          return res.status(200).json({ applied: false });
        }

        const jobId = req.params.id;
        if (!ObjectId.isValid(jobId)) {
          return res.status(400).json({ message: 'Invalid job id.' });
        }

        const existingApplication = await applicationsCollection.findOne({
          jobId: new ObjectId(jobId),
          applicantEmail: req.user.email,
        });

        res.status(200).json({ applied: Boolean(existingApplication) });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch application status.' });
      }
    });

    app.get('/my-applications', verifyToken, async (req, res) => {
      try {
        if (req.user?.role === 'company') {
          return res.status(200).json([]);
        }

        const applications = await applicationsCollection
          .find({ applicantEmail: req.user.email })
          .sort({ appliedAt: -1 })
          .toArray();

        res.status(200).json(applications);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch applications.' });
      }
    });

    // ==================== JOB ROUTES ====================

    app.post('/import-jobs', verifyToken, verifyCompany, async (req, res) => {
      try {
        const perSourceLimit = Number(req.body?.perSourceLimit || 100);
        const sanitizedLimit = Number.isFinite(perSourceLimit)
          ? Math.min(Math.max(perSourceLimit, 1), 300)
          : 100;

        const jobs = await fetchExternalJobs({ perSourceLimit: sanitizedLimit });
        const importStats = await upsertImportedJobs({ jobsCollection, jobs });

        res.status(200).json({
          message: 'External jobs imported successfully.',
          ...importStats,
        });
      } catch (error) {
        console.error('Import jobs failed:', error.message);
        res.status(500).json({ message: 'Failed to import external jobs.' });
      }
    });

    app.post("/post-job", verifyToken, verifyCompany, async (req, res) => {
      const body = req.body;
      console.log(body)
      body.createdAt = new Date();
      body.postedBy = req.user.email; // Add the user email who posted the job
      const result = await jobsCollection.insertOne(body);
      if (result?.insertedId) {
        const createdJob = { ...body, _id: result.insertedId };
        sendJobUpdateEmails({ type: 'created', job: createdJob }).catch((err) => {
          console.error('Async email error after job creation:', err.message);
        });
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again later",
          status: false,
        });
      }
    });

    app.get("/all-jobs", async (req, res) => {
      const jobs = await jobsCollection.find({}).sort({ createdAt: -1 }).toArray();
      res.send(jobs);
    });

    // get single job using id
    app.get("/all-jobs/:id", async (req, res) => {
      const job = await jobsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(job);
    });

    // get jobs based on email for my job listing 
    app.get("/myJobs/:email", verifyToken, verifyCompany, async (req, res) => {
      const jobs = await jobsCollection.find({ postedBy: req.params.email, }).toArray();
      res.send(jobs);
    });

    // delete a job
    app.delete("/job/:id", verifyToken, verifyCompany, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(filter);
      res.send(result);
    })

    // update a job
    app.patch("/update-job/:id", verifyToken, verifyCompany, async (req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...jobData
        },
      };
      const result = await jobsCollection.updateOne(filter, updateDoc);

      if (result.matchedCount > 0) {
        const updatedJob = await jobsCollection.findOne(filter);
        if (updatedJob) {
          sendJobUpdateEmails({ type: 'updated', job: updatedJob }).catch((err) => {
            console.error('Async email error after job update:', err.message);
          });
        }
      }

      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

app.use(express.static(path.join(__dirname, "../../job-portal-server/dist")));

app.get('/', (req, res) => {
  res.send('Hello developer!');
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
