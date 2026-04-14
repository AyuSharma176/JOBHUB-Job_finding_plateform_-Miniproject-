import React from "react";
import { Link } from "react-router-dom";

const CompanyPortal = () => {
  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-10">
      <h1 className="text-3xl font-bold text-primary">Company Portal</h1>
      <p className="text-primary/70 mt-2 mb-8">
        Manage your job postings with the same backend and database.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/company/post-job"
          className="border rounded p-6 bg-white shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-blue">Post A New Job</h2>
          <p className="text-primary/70 mt-2">Create and publish a new vacancy.</p>
        </Link>

        <Link
          to="/company/my-jobs"
          className="border rounded p-6 bg-white shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-blue">Manage My Jobs</h2>
          <p className="text-primary/70 mt-2">Edit or delete jobs posted by your company.</p>
        </Link>
      </div>
    </div>
  );
};

export default CompanyPortal;
