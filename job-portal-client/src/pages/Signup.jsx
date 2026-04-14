import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import toast from "react-hot-toast";

const SignUp = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const { createUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Simple validation for password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await createUser(email, password, name);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Failed to sign up.");
      setErrorMessage(error.message);
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
            <h3 className="text-2xl font-semibold text-primary">Sign Up</h3>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-blue hover:underline"
            >
              Back
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Create your account and start applying to jobs.</p>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue"
              id="name"
              type="text"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue"
              id="email"
              type="email"
              placeholder="name@email.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue"
              id="password"
              type="password"
              placeholder="******************"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue"
              id="confirmPassword"
              type="password"
              placeholder="******************"
              required
            />
            {/* Show error message */}
            {errorMessage && (
              <p className="text-red-500 text-xs italic">{errorMessage}</p>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white font-bold py-2 px-10 rounded-md focus:outline-none focus:ring focus:ring-violet-300 transition-colors"
              type="submit"
            >
              Sign Up
            </button>
          </div>
          <div className="text-center mt-4 text-sm">
            Already have an account? <Link to="/login" className="text-blue hover:underline">Login</Link>
          </div>
        </form>
        <p className="text-center text-sm mb-2">
          Company account? <Link to="/company/sign-up" className="text-blue hover:underline">Register company</Link>
        </p>
        <p className="text-center text-gray-500 text-xs">
          &copy;2023 JobPortal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignUp;
