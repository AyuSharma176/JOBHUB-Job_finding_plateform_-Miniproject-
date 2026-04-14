import React from "react";

import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import MyJobs from "../pages/MyJobs";
import SalaryPage from "../pages/SalaryPage";
import CreateJob from "../pages/CreateJob";
import UpdateJob from "../pages/UpdateJob";
import JobDetails from "../pages/JobDetails";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import CompanyRoute from "../PrivateRoute/CompanyRoute";
import CompanyLogin from "../pages/CompanyLogin";
import CompanySignup from "../pages/CompanySignup";
import CompanyPortal from "../pages/CompanyPortal";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Profile from "../pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/my-job",
        element: (
          <CompanyRoute>
            <MyJobs />
          </CompanyRoute>
        ),
      },
      {
        path: "/salary",
        element: <SalaryPage />,
      },
      {
        path: "/post-job",
        element: (
          <CompanyRoute>
            <CreateJob />
          </CompanyRoute>
        ),
      },
      {
        path: "edit-job/:id",
        element: (
          <CompanyRoute>
            <UpdateJob />
          </CompanyRoute>
        ),
        loader: ({ params }) =>
          fetch(`${import.meta.env.VITE_API_URL}/all-jobs/${params.id}`),
      },
      {
        path: "/jobs/:id",
        element: <JobDetails />,
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/company/portal",
        element: (
          <CompanyRoute>
            <CompanyPortal />
          </CompanyRoute>
        ),
      },
      {
        path: "/company/post-job",
        element: (
          <CompanyRoute>
            <CreateJob />
          </CompanyRoute>
        ),
      },
      {
        path: "/company/my-jobs",
        element: (
          <CompanyRoute>
            <MyJobs />
          </CompanyRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <Signup />,
  },
  {
    path: "/company/login",
    element: <CompanyLogin />,
  },
  {
    path: "/company/sign-up",
    element: <CompanySignup />,
  },
]);

export default router;
