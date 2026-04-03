import React from "react";
import "./Login.css";

const Login = () => {
  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  return (
    <main className="login">
      <section className="login__card">

        <header className="login__header">
          <div className="login__logo" aria-hidden="true"></div>
          <h1 className="login__title">KuduDash</h1>
        </header>

        <p className="login__tagline">Less waiting. More eating.</p>

        <p className="login__description">
            Skip the line. Eat well. Study better.
        </p>

        <button
            className="login__button"
            onClick={handleGoogleLogin}
        >
            <img
            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
            alt=""
            aria-hidden="true"
            className="login__button-icon"
            />
            <span>Sign in with Google</span>
        </button>

        <footer className="login__footer">
            <p>New here or back again? We got you.</p>
        </footer>

        </section>
    </main>
    );
};

export default Login;