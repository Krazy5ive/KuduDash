import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Vibe from "./Vibe";
import Admin from "./Dashboards/Admin";
import Student from "./Dashboards/Student";
import Vendor from "./Dashboards/Vendor";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/student" element={<Student />} />
        <Route path="/vibe" element={<Vibe />} />
        <Route path="/vendor" element={<Vendor />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;