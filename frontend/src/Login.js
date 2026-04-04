import React, { useState } from "react";
import "./Login.css";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";

const Login = () => {
  const { loginWithRedirect } = useAuth0();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(null); // null = unknown, true = new, false = returning

  const handleSendCode = async () => {
    if (!email) return setError("Please enter your email.");
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/passwordless/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          connection: "email",
          email,
          send: "code",
        }),
      });

      if (res.ok) {
        setCodeSent(true);
        // Auth0 doesn't tell us if user is new, so we infer after code is sent
        // replace this with a real check from backend
        setIsNewUser(null);
      }
    } catch (err) {
      setError("Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!code) return setError("Please enter the code.");
    loginWithRedirect({
      authorizationParams: {
        connection: "email",
        login_hint: email,
        otp: code,
        redirect_uri: `${window.location.origin}/vibe`,
      },
    });
  };

  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
        redirect_uri: `${window.location.origin}/vibe`,
      },
    });
  };

  return (
    <motion.main
      className="login"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <section className="login__card">
        <header className="login__header">
          <span className="login__logo" aria-hidden="true"></span>
          <h1 className="login__title">KuduDash</h1>
        </header>

        <p className="login__tagline">Less waiting. More eating.</p>
        <p className="login__description">Skip the line. Eat well. Study better.</p>

        {!codeSent ? (
          <>
            <input
              className="login__input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsNewUser(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
            />

            <p className="login__context-message">
              {email ? "We'll send a code — new or returning, we got you." : ""}
            </p>

            <button
              className="login__button"
              onClick={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Code"}
            </button>

            <p className="login__hint">
              Already a member? Login.
            </p>
          </>
        ) : (
          <>
            <p className="login__description">
              Code sent to <strong>{email}</strong>
            </p>
            <input
              className="login__input"
              type="text"
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
            />
            <button
              className="login__button"
              onClick={handleVerifyCode}
            >
              Verify Code
            </button>
            <button
              className="login__button--link"
              onClick={() => { setCodeSent(false); setError(""); }}
            >
              Use a different email
            </button>
          </>
        )}

        {error && <p className="login__error">{error}</p>}

        <p className="login__divider" aria-hidden="true">or</p>

        <button className="login__button" onClick={handleGoogleLogin}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            alt=""
            aria-hidden="true"
            className="login__button-icon"
          />
          Sign up with Google
        </button>

        <footer className="login__footer">
          <p>New here? We got you.</p>
        </footer>
      </section>
    </motion.main>
  );
};

export default Login;