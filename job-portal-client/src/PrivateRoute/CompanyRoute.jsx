/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const CompanyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && user.role === "company") {
    return children;
  }

  return <Navigate to="/company/login" state={{ from: location }} replace />;
};

export default CompanyRoute;
