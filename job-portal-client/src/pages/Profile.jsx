import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { AuthContext } from "../context/AuthProvider";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(Boolean(user?.jobAlertsSubscribed));

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setIsSubscribed(Boolean(user?.jobAlertsSubscribed));
  }, [user]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || user.role === "company") {
        setApplications([]);
        return;
      }

      const token = localStorage.getItem("genius-token");
      if (!token) return;

      setLoadingApplications(true);
      try {
        const response = await axios.get(`${API_URL}/my-applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApplications(Array.isArray(response.data) ? response.data : []);
      } catch {
        toast.error("Unable to load your applications right now.");
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [API_URL, user]);

  const handleSubscribeAlerts = async () => {
    if (!user || user.role === "company") {
      toast.error("Only job seekers can subscribe to alerts.");
      return;
    }

    const token = localStorage.getItem("genius-token");
    if (!token) {
      toast.error("Please login again to continue.");
      return;
    }

    setSubscribing(true);
    try {
      const response = await axios.post(
        `${API_URL}/subscribe-job-alerts`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsSubscribed(true);
      toast.success(response.data?.message || "Subscribed to job alerts.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to subscribe.");
    } finally {
      setSubscribing(false);
    }
  };

  const tabs = useMemo(
    () => [
      { key: "overview", label: "Overview" },
      { key: "applications", label: "My Applications" },
      { key: "alerts", label: "Job Alerts" },
      { key: "account", label: "Account" },
    ],
    []
  );

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 pb-12">
      <PageHeader title={"My Profile"} path={"Profile"} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white border rounded-lg p-4 h-fit">
          <h3 className="text-lg font-semibold mb-4">Profile Menu</h3>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-3 py-2 rounded ${
                  activeTab === tab.key
                    ? "bg-blue text-white"
                    : "bg-gray-50 text-primary hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="md:col-span-3 bg-white border rounded-lg p-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">Profile Overview</h2>
              <p className="text-primary/80 mb-6">
                Manage your applications, alerts, and account details from this dashboard.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <p className="text-sm text-primary/70">Name</p>
                  <p className="font-medium">{user?.name || "Not available"}</p>
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-primary/70">Email</p>
                  <p className="font-medium break-all">{user?.email || "Not available"}</p>
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-primary/70">Role</p>
                  <p className="font-medium capitalize">{user?.role || "jobseeker"}</p>
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-primary/70">Applications</p>
                  <p className="font-medium">{applications.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Applications</h2>
              {user?.role === "company" ? (
                <p className="text-primary/80">Applications are only available for job seekers.</p>
              ) : loadingApplications ? (
                <p className="text-primary/80">Loading applications...</p>
              ) : applications.length === 0 ? (
                <p className="text-primary/80">You have not applied to any jobs yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <div
                      key={String(application._id || application.jobId)}
                      className="border rounded p-4"
                    >
                      <p className="font-semibold text-lg">{application.jobTitle || "Job"}</p>
                      <p className="text-primary/80 mb-2">{application.companyName || "Company"}</p>
                      <p className="text-sm text-primary/70">
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex gap-3 flex-wrap">
                        <Link
                          to={`/jobs/${String(application.jobId)}`}
                          className="px-3 py-1 bg-blue text-white rounded"
                        >
                          View Job
                        </Link>
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 border rounded"
                        >
                          Resume Link
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "alerts" && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">Job Alerts</h2>
              <p className="text-primary/80 mb-4">
                Subscribe to receive email notifications when new jobs are posted or updated.
              </p>

              {user?.role === "company" ? (
                <p className="text-primary/80">Job alerts are available for job seekers only.</p>
              ) : (
                <div className="border rounded p-4">
                  <p className="mb-3">
                    Current status: <span className="font-medium">{isSubscribed ? "Subscribed" : "Not subscribed"}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleSubscribeAlerts}
                    disabled={isSubscribed || subscribing}
                    className="px-4 py-2 bg-blue text-white rounded disabled:opacity-70"
                  >
                    {isSubscribed ? "Subscribed" : subscribing ? "Subscribing..." : "Subscribe to Alerts"}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "account" && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">Account</h2>
              <p className="text-primary/80 mb-4">
                Keep your account secure and your profile information up to date.
              </p>
              <ul className="list-disc pl-5 text-primary/80 space-y-2">
                <li>Use a strong password and avoid sharing your login details.</li>
                <li>Review your email inbox regularly for application updates.</li>
                <li>Complete your resume and profile for better response rates.</li>
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
