import { useEffect }
from "react";

import {
  useNavigate,
} from "react-router-dom";

import PageLoader
from "../components/ui/PageLoader";

function AuthCallback() {
  const navigate =
    useNavigate();

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const accessToken =
      params.get(
        "accessToken"
      );

    const refreshToken =
      params.get(
        "refreshToken"
      );

    /* =====================
        VALIDATION
    ===================== */

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

    /* =====================
        STORE TOKENS
    ===================== */

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    localStorage.setItem(
      "refreshToken",
      refreshToken
    );

    /* =====================
        CLEAN URL
    ===================== */

    window.history.replaceState(
      {},
      document.title,
      "/dashboard"
    );

    /* =====================
        REDIRECT
    ===================== */

    navigate(
      "/dashboard",
      {
        replace: true,
      }
    );

  }, [navigate]);

  return <PageLoader />;
}

export default AuthCallback;