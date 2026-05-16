// src/ProtectedRoute.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import API_BASE_URL from "./api";

/**
 * Wraps a dashboard route and enforces role-based access.
 *
 * If the authenticated user's actual role doesn't match `requiredRole`,
 * they are silently redirected to their own dashboard.
 *
 * Usage:
 *   <Route path="/dashboard/admin" element={
 *     <ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>
 *   } />
 */
const ProtectedRoute = ({ requiredRole, children }) => {
  const { isLoading, isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait until Auth0 has finished loading
    if (isLoading) return;

    // Not logged in at all — send to login
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    const checkRole = async () => {
      try {
        const token = await getAccessTokenSilently();

        const res = await fetch(`${API_BASE_URL}/api/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            sub:         user.sub,
            email:       user.email,
            given_name:  user.given_name  || user.name?.split(" ")[0] || "",
            family_name: user.family_name || user.name?.split(" ")[1] || "",
            picture:     user.picture     || "",
          }),
        });

        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          // Can't verify — safest to send home
          navigate("/", { replace: true });
          return;
        }

        const data = await res.json();
        const actualRole = data.role; // "student" | "vendor" | "admin"

        if (actualRole !== requiredRole) {
          // Wrong dashboard — redirect to their real one
          navigate(`/dashboard/${actualRole}`, {
            replace: true,
            state: {
              ownerFirstName: data.ownerFirstName || data.firstName || "",
              ownerLastName:  data.ownerLastName  || data.lastName  || "",
              vendorId:       data.userId || "",
            },
          });
          return;
        }

        // Role matches — allow render
        setChecking(false);

      } catch (err) {
        console.error("ProtectedRoute: role check failed", err);
        navigate("/", { replace: true });
      }
    };

    checkRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  if (isLoading || checking) {
    return (
      <p style={{ color: "#e2e8f0", fontSize: "16px", padding: "40px", textAlign: "center" }}>
        Loading...
      </p>
    );
  }

  return children;
};

export default ProtectedRoute;