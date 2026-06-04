import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageLoader from "@shared/components/ui/PageLoader";
import { logoutUser } from "@features/auth/services/auth.service";

function Logout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Fire backend logout (fire-and-forget) — we don't await so the user
    // experiences no network delay. The refresh token cookie is invalidated
    // on the server asynchronously.
    logoutUser().catch((err) => {
      console.error("Failed to logout from backend", err);
    });

    // Brief pause for a smooth transition, then clear local auth state
    const timer = setTimeout(() => {
      // Clear specific auth items from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userAvatar");

      // Clear session storage just in case
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      const queryString = searchParams.toString();
      navigate(`/login${queryString ? `?${queryString}` : ""}`, {
        replace: true,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return <PageLoader />;
}

export default Logout;
