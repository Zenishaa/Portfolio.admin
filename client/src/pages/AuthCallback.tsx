import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import PageLoader from "../components/ui/PageLoader";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const accessToken =
      params.get("accessToken");

    const refreshToken =
      params.get("refreshToken");

    const user = params.get("user");

    if (
      !accessToken ||
      !refreshToken
    ) {
      navigate(
        "/login?error=github",
        {
          replace: true,
        }
      );

      return;
    }

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    localStorage.setItem(
      "refreshToken",
      refreshToken
    );

    if (user) {
      localStorage.setItem(
        "user",
        user
      );
    }

    navigate("/dashboard", {
      replace: true,
    });
  }, [navigate]);

  return <PageLoader />;
}

export default AuthCallback;
