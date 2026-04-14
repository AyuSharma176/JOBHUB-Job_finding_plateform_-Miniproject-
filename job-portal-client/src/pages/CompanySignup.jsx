import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import toast from "react-hot-toast";

const CompanySignup = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const { createCompanyUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await createCompanyUser(email, password, name);
      toast.success("Company account created successfully!");
      navigate("/company/portal");
    } catch (error) {
      toast.error("Failed to create company account.");
      setErrorMessage("Failed to create company account.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white mx-auto container flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <form
          onSubmit={handleSignUp}
          className="bg-white shadow-lg rounded-xl border border-blue-100 px-8 pt-8 pb-8 mb-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-primary">Company Sign Up</h3>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-blue hover:underline"
            >
              Back
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Create a company account to publish jobs and manage hiring.</p>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Company Name</label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue"
              id="name"
              type="text"
              placeholder="Acme Inc"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue"
              id="email"
              type="email"
              placeholder="hr@company.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue"
              id="password"
              type="password"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue"
              id="confirmPassword"
              type="password"
              required
            />
            {errorMessage && <p className="text-red-500 text-xs italic">{errorMessage}</p>}
          </div>
          <div className="flex items-center justify-center mb-4">
            <button className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-10 rounded-md transition-colors" type="submit">
              Sign Up
            </button>
          </div>
          <div className="text-center text-sm">
            <p>
              Already have company account? <Link className="text-blue" to="/company/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySignup;
