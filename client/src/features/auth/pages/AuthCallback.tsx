import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PageLoader from "@shared/components/ui/PageLoader";
import { getProfile } from "@features/profile/services/profile.service";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");

    /*
    ====================
    GITHUB SUCCESS
    ====================
    */

    const handleGithubSuccess = async () => {
      if (accessToken) {
        // Store token first so the request interceptor picks it up automatically
        localStorage.setItem("accessToken", accessToken);

        try {
          // The request interceptor in api.ts will attach the Authorization header
          // automatically — no need to set it manually here.
          const res = await getProfile();

          if (res?.success && res.user) {
            localStorage.setItem(
              "userName",
              res.user.name || res.user.username
            );
            if (res.user.avatar) {
              localStorage.setItem("userAvatar", res.user.avatar);
            }
          }
        } catch (error) {
          // Non-fatal: user can still access the dashboard without cached name/avatar
          console.error("Failed to fetch user details during login", error);
        }

        navigate("/dashboard", { replace: true });
      }
    };

    if (accessToken) {
      handleGithubSuccess();
      return;
    }

    /*
    ====================
    ALREADY LOGGED IN
    ====================
    */

    const storedAccessToken = localStorage.getItem("accessToken");

    if (storedAccessToken) {
      navigate("/dashboard", { replace: true });
      return;
    }

    /*
    ====================
    LOGIN FAILED
    ====================
    */

    navigate("/login?error=github", { replace: true });
  }, [navigate]);

  return <PageLoader />;
}

export default AuthCallback;
