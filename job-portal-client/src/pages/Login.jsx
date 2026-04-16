// import React, { useContext, useState } from "react";
// import { AuthContext } from "../context/AuthProvider";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// const Login = () => {
//   const [errorMessage, setErrorMessage] = useState("");
//   const { login } = useContext(AuthContext);

//   const location = useLocation();
//   const navigate = useNavigate();

//   const from = location.state?.from?.pathname || "/";

//   const handleLogin = async (event) => {
//     event.preventDefault();
//     const form = event.target;
//     const email = form.email.value;
//     const password = form.password.value;
//     try {
//       await login(email, password);
//       toast.success("Login successful!");
//       navigate(from, { replace: true });
//     } catch (error) {
//       setErrorMessage("Please provide valid email & password!");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white mx-auto container flex items-center justify-center px-4">
//       <div className="w-full max-w-md mx-auto">
//         <form
//           onSubmit={handleLogin}
//           className="bg-white shadow-lg rounded-xl border border-blue-100 px-8 pt-8 pb-8 mb-4"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-2xl font-semibold text-primary">Please Login!</h3>
//             <button
//               type="button"
//               onClick={() => navigate(-1)}
//               className="text-sm text-blue hover:underline"
//             >
//               Back
//             </button>
//           </div>
//           <p className="text-sm text-gray-500 mb-6">Welcome back. Sign in to continue your job search.</p>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Email Address
//             </label>
//             <input
//               className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue"
//               id="email"
//               type="email"
//               placeholder="name@email.com"
//               required
//             />
//           </div>
//           <div className="mb-6">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Password
//             </label>
//             <input
//               className="shadow-sm appearance-none border rounded-md w-full py-2.5 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue"
//               id="password"
//               type="password"
//               placeholder="******************"
//               required
//             />

//             {/* show errors */}
//             {errorMessage && (
//               <p className="text-red-500 text-xs italic">
//                 Please provide a valid email and password.
//               </p>
//             )}
//           </div>
//           <div className="flex items-center justify-center mb-6 ">
//             <input
//               className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white font-bold py-2 px-10 rounded-md focus:outline-none focus:ring focus:ring-violet-300 transition-colors"
//               type="submit"
//               value="Sign in"
//             />
//           </div>
//           <div className="flex items-center justify-center gap-2 text-sm">
//             Or
//             <Link
//               to="/sign-up"
//               className="px-3 py-2 bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white font-bold rounded-md focus:outline-none focus:ring focus:ring-violet-300"
//             >
//               Sign Up
//             </Link>
//           </div>
//           <div className="text-center mt-3 text-sm">
//             <Link to="/company/login" className="text-blue hover:underline">Company login</Link>
//           </div>
//         </form>
//         <p className="text-center text-gray-500 text-xs">
//           &copy;2023 JobPortal. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;




import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage("Please provide valid email & password!");
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4">
      
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl border border-blue-100 px-8 py-8 transition-all duration-300 hover:shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-blue-600 tracking-wide">
              Welcome Back
            </h3>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-blue-500 hover:text-blue-700 transition"
            >
              ← Back
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Sign in to continue your job search journey.
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              className="w-full py-2.5 px-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              id="email"
              type="email"
              placeholder="name@email.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              className="w-full py-2.5 px-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              id="password"
              type="password"
              placeholder="••••••••••"
              required
            />

            {errorMessage && (
              <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Button */}
          <div className="flex items-center justify-center mb-5">
            <button
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              type="submit"
            >
              Sign In
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <span className="h-px w-16 bg-gray-300"></span>
            OR
            <span className="h-px w-16 bg-gray-300"></span>
          </div>

          {/* Signup */}
          <div className="flex items-center justify-center mb-3">
            <Link
              to="/sign-up"
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition"
            >
              Create Account
            </Link>
          </div>

          {/* Company Login */}
          <div className="text-center text-sm">
            <Link
              to="/company/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Company login
            </Link>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-4">
          ©2023 JobPortal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;