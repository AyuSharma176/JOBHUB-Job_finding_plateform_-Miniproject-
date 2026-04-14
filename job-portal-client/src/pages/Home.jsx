import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import Sidebar from "../Sidebar/Sidebar";
import Jobs from "./Jobs";
import Card from "../components/Card";
import Newsletter from "../components/Newsletter";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthProvider";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/all-jobs`)
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load jobs. Please try again.");
        setIsLoading(false);
      });
  }, [user]);

  // ----------- Handle Filter Changes -----------
  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleClick = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // ----------- Filtering Logic -----------
  const getFilteredJobs = () => {
    let filteredJobs = jobs;

    // Filter by Position (query)
    if (query) {
      filteredJobs = filteredJobs.filter(
        (job) => job.jobTitle.toLowerCase().indexOf(query.toLowerCase()) !== -1
      );
    }

    // Filter by Location
    if (location) {
      filteredJobs = filteredJobs.filter(
        (job) => job.jobLocation.toLowerCase().indexOf(location.toLowerCase()) !== -1
      );
    }

    // Filter by Sidebar Category
    if (selectedCategory) {
      filteredJobs = filteredJobs.filter(
        ({
          jobLocation,
          salaryType,
          experienceLevel,
          maxPrice,
          postingDate,
          employmentType,
        }) => {
          const isLocationMatch = jobLocation?.toLowerCase() === selectedCategory.toLowerCase();
          const isSalaryTypeMatch = salaryType?.toLowerCase() === selectedCategory.toLowerCase();
          const isExperienceMatch = experienceLevel?.toLowerCase() === selectedCategory.toLowerCase();
          const isEmploymentMatch = employmentType?.toLowerCase() === selectedCategory.toLowerCase();
          
          // Numerical salary check: only if selectedCategory is a number and doesn't look like a date (yyyy-mm-dd)
          const isNumericalSelection = !isNaN(selectedCategory) && !selectedCategory.includes("-");
          const isSalaryRangeMatch = isNumericalSelection && parseInt(maxPrice) <= parseInt(selectedCategory);

          // Date check: show jobs posted on or after the selected date
          const isDateMatch = postingDate >= selectedCategory;

          return (
            isLocationMatch ||
            isSalaryTypeMatch ||
            isExperienceMatch ||
            isEmploymentMatch ||
            isSalaryRangeMatch ||
            isDateMatch
          );
        }
      );
    }

    return filteredJobs;
  };

  const filteredJobs = getFilteredJobs();

  // ----------- Pagination Logic -----------
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Map result to Card components
  const result = paginatedJobs.map((data, i) => <Card key={i} data={data} />);

  if (!user) {
    return (
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 pt-8 pb-12">
        <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-7 md:p-12 shadow-sm">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue/20 blur-2xl" />
          <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-violet-400/20 blur-2xl" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-blue/20 bg-white/70 px-4 py-1.5 text-xs md:text-sm font-semibold text-blue mb-5">
                Welcome to JobPortal
              </p>

              <h1 className="text-3xl md:text-5xl font-bold text-primary leading-tight mb-4">
                Find better jobs faster with a smarter hiring platform
              </h1>

              <p className="text-primary/80 text-base md:text-lg mb-8 max-w-xl">
                Explore trusted opportunities, compare compensation, and apply
                in minutes. Sign in to unlock your personalized dashboard and
                recommendations.
              </p>

              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link
                  to="/login"
                  className="bg-blue hover:opacity-95 text-white font-semibold px-6 py-2.5 rounded-sm"
                >
                  Login as User
                </Link>
                <Link
                  to="/sign-up"
                  className="border border-blue text-blue hover:bg-blue/5 font-semibold px-6 py-2.5 rounded-sm"
                >
                  Create User Account
                </Link>
                <Link
                  to="/company/login"
                  className="bg-violet-500 hover:bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-sm"
                >
                  Company Login
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
                <p className="text-3xl font-bold text-blue">10k+</p>
                <p className="text-sm text-primary/70 mt-1">Active job listings</p>
              </div>
              <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
                <p className="text-3xl font-bold text-violet-500">2.5k+</p>
                <p className="text-sm text-primary/70 mt-1">Partner companies</p>
              </div>
              <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm col-span-2">
                <p className="text-sm font-semibold text-primary mb-1">Why people choose us</p>
                <p className="text-sm text-primary/75">
                  Curated jobs, transparent salary bands, and a smooth
                  application process built for both candidates and recruiters.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-5 mt-8">
          <div className="bg-white border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-primary mb-2">Verified Roles</h3>
            <p className="text-sm text-primary/70">
              Browse jobs posted by authentic companies with clear job details.
            </p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-primary mb-2">Salary Insights</h3>
            <p className="text-sm text-primary/70">
              Compare compensation ranges and choose roles that match your goals.
            </p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-primary mb-2">Fast Applications</h3>
            <p className="text-sm text-primary/70">
              Save time with a simple application flow and track your progress.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <Banner
        query={query}
        handleInputChange={handleInputChange}
        location={location}
        handleLocationChange={handleLocationChange}
      />

      {/* main content */}
      <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
        <div className="bg-white p-4 rounded">
          <Sidebar handleChange={handleChange} handleClick={handleClick} />
        </div>
        <div className="col-span-2 bg-white p-4 rounded">
          {isLoading ? ( // Loading indicator
            <p className="font-medium">Loading...</p>
          ) : result.length > 0 ? (
            <Jobs result={result} />
          ) : (
            <>
              <h3 className="text-lg font-bold mb-2">{result.length} Jobs</h3>
              <p>No data found</p>
            </>
          )}

          {/* pagination block */}
          {result.length > 0 && (
            <div className="flex justify-center mt-4 space-x-8">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="hover:underline disabled:text-gray-400"
              >
                Previous
              </button>
              <span className="mx-2">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="hover:underline disabled:text-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded">
          <Newsletter />
        </div>
      </div>
    </div>
  );
};

export default Home;
