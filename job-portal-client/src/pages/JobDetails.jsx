import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa6";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import axios from "axios";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(false);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/all-jobs/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch(() => toast.error("Failed to load job details."));
  }, [id]);

  useEffect(() => {
    const fetchApplyStatus = async () => {
      if (!user || user.role === "company") {
        setHasApplied(false);
        return;
      }

      const token = localStorage.getItem("genius-token");
      if (!token) {
        setHasApplied(false);
        return;
      }

      setCheckingApplied(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/apply-job-status/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHasApplied(Boolean(response.data?.applied));
      } catch {
        setHasApplied(false);
      } finally {
        setCheckingApplied(false);
      }
    };

    fetchApplyStatus();
  }, [id, user]);

  const handleJobApply = async () => {
    if (!user) {
      toast.error("You need to login first to apply for this job.");
      navigate("/login", { state: { from: location } });
      return;
    }

    // console.log("btn clicked")
    const { value: url } = await Swal.fire({
      input: "url",
      inputLabel: "CV or Resume URL address",
      inputPlaceholder: "Enter the URL",
    });

    if (url) {
      try {
        const token = localStorage.getItem("genius-token");
        if (!token) {
          toast.error("Please login again to apply.");
          navigate("/login", { state: { from: location } });
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/apply-job/${id}`,
          { resumeUrl: url.trim() },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHasApplied(true);
        Swal.fire(response.data.message || "Application submitted successfully.", "", "success");
      } catch (error) {
        const message = error?.response?.data?.message;
        if (error?.response?.status === 409) {
          setHasApplied(true);
        }
        Swal.fire(message || "Failed to submit application.", "", "error");
      }
    }
  };
  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
      <PageHeader title={"Job Details Page"} path={"Single Job"} />

      <div className="mt-10">
        <h3 className="font-semibold mb-2">Job ID: {parseInt(id)}</h3>

        <div className="my-4">
          <h2 className="text-2xl font-medium text-blue">Job details</h2>
          <p className="text-primary/75 md:w-1/3 text-sm italic my-1">
            Here<span>&apos;</span>s how the job details align with your job
            preferences. Manage job preferences anytime in your profile.
          </p>
        </div>

        <div className="my-4 space-y-2">
          <div className="flex items-center gap-2">
            <FaBriefcase />
            <p className="text-xl font-medium mb-2">
              Job type :
              <span className=" ml-2 text-gray-700 ">
                {job.employmentType}
              </span>
            </p>
          </div>
          <button className="bg-blue px-6 py-1 text-white rounded-sm">
            {job.jobTitle}
          </button>
          {!checkingApplied && hasApplied ? (
            <button
              className="bg-gray-500 px-6 py-1 text-white rounded-sm ms-2 cursor-not-allowed"
              disabled
            >
              Applied
            </button>
          ) : (
            <button
              className="bg-indigo-700 px-6 py-1 text-white rounded-sm ms-2"
              onClick={handleJobApply}
            >
              Apply Now
            </button>
          )}
        </div>

        {/* job details */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mt-12">
          <div className="md:w-1/3">
            <h4 className="text-lg font-medium mb-3">Benefits</h4>
            <p className="text-sm text-primary/70 mb-2">
              Pulled from the full job description
            </p>
            <ul className="list-disc list-outside text-primary/90 space-y-2 text-base">
              <li>
                1. ${job.minPrice}-{job.maxPrice}k
              </li>
              <li>2. Disability insurance</li>
              <li>3. Employee discount</li>
              <li>4. Flexible spending account</li>
              <li>5. Health insurance</li>
              <li>6. Paid time off</li>
              <li>7. Vision insurance</li>
              <li>8. Volunteer time off</li>
              <li> 9. Dental insurance</li>
            </ul>
          </div>

          <div className="md:w-1/3">
            <h4 className="text-lg font-medium mb-3">Role Overview</h4>
            <p className="text-primary/90">
              As a {job.jobTitle}, you will work with product, design, and
              engineering teams to build reliable features that improve the
              hiring experience for candidates and employers.
              <br />
              <br />
              You will contribute to planning, implementation, testing, and
              release cycles while keeping performance, security, and code
              quality as top priorities.
            </p>
          </div>
          <div className="md:w-1/3">
            <h4 className="text-lg font-medium mb-3">Future Growth</h4>
            <p className="text-primary/90">
              This role offers a clear growth path from individual contributor
              to senior engineer and technical lead roles.
              <br />
              <br />
              You will get opportunities to own features end-to-end, mentor
              junior developers, and influence architecture decisions as the
              product scales.
            </p>
          </div>
        </div>

        <div className="text-primary/75 my-5 space-y-6">
          <p>
            <span className="font-semibold">Key Responsibilities:</span> Build
            and maintain scalable web features, collaborate with cross-
            functional teams, write clean and testable code, and participate in
            code reviews and sprint planning.
          </p>
          <p>
            <span className="font-semibold">Required Qualifications:</span> Good
            understanding of {job.skills?.map((skill) => skill.label).join(", ") || "modern web technologies"},
            strong problem-solving skills, and the ability to communicate
            technical decisions clearly with team members and stakeholders.
          </p>
          <p>
            <span className="font-semibold">Work Setup:</span> {job.employmentType || "Full-time"} role based in {job.jobLocation || "our office"}.
            Compensation is {job.salaryType || "Yearly"} with a range of ${job.minPrice}
            -${job.maxPrice}k, based on experience and interview performance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
