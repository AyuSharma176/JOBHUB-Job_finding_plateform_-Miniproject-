import React, { useContext, useEffect, useRef, useState } from "react";
import { FaEnvelopeOpenText, FaRocket } from "react-icons/fa6";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";

const Newsletter = () => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const API_URL = (import.meta.env.VITE_API_URL || "https://jobhub-job-finding-plateform-miniproject.onrender.com");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error("Please login first to subscribe for job alerts.");
      return;
    }

    if (user.role === "company") {
      toast.error("Job alerts are available for job seekers only.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("genius-token");
      if (!token) {
        toast.error("Please login again to continue.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/subscribe-job-alerts`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Subscribed successfully.");
    } catch (error) {
      const message = error?.response?.data?.message;
      if (message) {
        toast.error(message);
      } else {
        toast.error("Unable to subscribe right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailPattern.test((email || "").trim().toLowerCase());

  const isSubscribeDisabled =
    isSubmitting ||
    !user ||
    user?.role === "company" ||
    !isEmailValid;

  const subscribeButtonLabel = isSubmitting
    ? "Subscribing..."
    : !user
      ? "Login to Subscribe"
      : user?.role === "company"
        ? "Only for Job Seekers"
        : "Subscribe";

  const subscribeHint = !user
    ? "Login first, then click Subscribe to receive email job alerts."
    : user?.role === "company"
      ? "Companies cannot subscribe to seeker alerts."
      : "You will receive a confirmation email when you subscribe.";

  const handleEmailChange = (event) => {
    if (user?.email) {
      setEmail(user.email);
      return;
    }
    setEmail(event.target.value);
  };

  const handleEmailInputFocus = () => {
    if (user?.email) {
      toast("Subscription uses your logged-in email address.");
    }
  };

  const handleResumeUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    toast.success(`Resume uploaded: ${file.name}`);
    event.target.value = "";
  };

  return (
    <div>
      <div>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          {" "}
          <FaEnvelopeOpenText /> Email me for jobs
        </h3>
        <p className="text-primary/75 text-base mb-4">
          Subscribe to get timely updates when new jobs match your interests.
          We send practical alerts so you can apply early and stay ahead in your
          job search.
        </p>
        <form className="w-full space-y-4" onSubmit={handleSubscribe}>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            onFocus={handleEmailInputFocus}
            placeholder="name@mail.com"
            className="w-full block py-2 pl-3 border focus:outline-none"
            required
            readOnly={Boolean(user?.email)}
          />
          <p className="text-xs text-primary/70">{subscribeHint}</p>
          <button
            type="submit"
            disabled={isSubscribeDisabled}
            className="w-full block py-2 bg-blue rounded-sm text-white cursor-pointer font-semibold disabled:opacity-70"
          >
            {subscribeButtonLabel}
          </button>
        </form>
      </div>

      {/* 2nd section */}
      <div className="mt-20">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <FaRocket /> Get noticed faster
        </h3>
        <p className="text-primary/75 text-base mb-4">
          Upload your resume once to strengthen your profile and help employers
          discover you faster.
        </p>
        <div className="w-full space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleResumeUpload}
            className="w-full block py-2 bg-blue rounded-sm text-white cursor-pointer font-semibold"
          >
            Upload your resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
