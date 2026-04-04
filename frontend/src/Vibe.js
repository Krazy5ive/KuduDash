import React, { useState } from "react";
import "./Vibe.css";
import { motion, AnimatePresence } from "framer-motion";

const Vibe = () => {
  const [showAdminInput, setShowAdminInput] = useState(false);

  const handleAdminClick = () => setShowAdminInput(prev => !prev);

  return (
    <motion.main
      className="vibe"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <section className="vibe__card">
        <h1 className="vibe__title">Pick Your Vibe</h1>
        <p className="vibe__subtitle">What brings you to KuduDash?</p>

        <section className="vibe__options">
          <article className="vibe__option">
            <h2>Student</h2>
            <p>Order food, skip queues</p>
          </article>

          <article className="vibe__option">
            <h2>Vendor</h2>
            <p>Serve food, make bank</p>
          </article>

          <article className="vibe__option" onClick={handleAdminClick}>
            <h2>Admin</h2>
            <p>Run the show</p>

            <AnimatePresence>
              {showAdminInput && (
                <motion.input
                  type="text"
                  placeholder="Enter admin code"
                  className="vibe__admin-input"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 40, marginTop: 10 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={(e) => e.stopPropagation()} // Prevent closing when typing
                />
              )}
            </AnimatePresence>
          </article>
        </section>

        <button className="vibe__button">Let's Go!</button>
      </section>
    </motion.main>
  );
};

export default Vibe;