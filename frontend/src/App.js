import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Vibe from "./Vibe";

import Student from "./Dashboards/Student";
import Vendor from "./Dashboards/Vendor";
import Admin from "./Dashboards/Admin";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/vibe" element={<Vibe />} />
        <Route path="/dashboard/student" element={<Student />} />
        <Route path="/dashboard/vendor" element={<Vendor />} />
        <Route path="/dashboard/admin" element={<Admin />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;