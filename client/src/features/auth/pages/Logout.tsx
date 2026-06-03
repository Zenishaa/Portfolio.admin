import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLoader from "@shared/components/ui/PageLoader";
import api from "@shared/lib/api";

function Logout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Fire the backend logout API in the background (fire-and-forget)
    // We don't await this so the user doesn't experience any network delay.
    api.post("/api/auth/logout", {}, { withCredentials: true }).catch((err) => {
      console.error("Failed to logout from backend", err);
    });

    // Show loader briefly for smooth transition, then clear auth & redirect
      const timer = setTimeout(() => {
        // Clear specific auth items from local storage
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
      navigate(`/login${queryString ? `?${queryString}` : ""}`, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return <PageLoader />;
}

export default Logout;
