import {
  Navigate,
} from "react-router-dom";

import { verifySession } from "@shared/lib/auth";
import { useEffect, useState } from "react";
import PageLoader from "@shared/components/ui/PageLoader";

import type {
  ReactNode,
} from "react";

type AuthStatus =
  | "checking"
  | "valid"
  | "missing"
  | "expired"
  | "invalid";

function ProtectedRoute({
  children,
}: {
  children:
    ReactNode;
}) {
  const [
    authStatus,
    setAuthStatus,
  ] = useState<AuthStatus>(
    "checking"
  );

  /* =========================
      TOKEN VALIDATION
  ========================= */

  useEffect(() => {
    const validateToken = async () => {
      const isValid = await verifySession();
      if (isValid) {
        setAuthStatus("valid");
      } else {
        // We use "invalid" for both missing and expired here because 
        // the global api interceptor handles the actual /logout redirection
        // if it was a refresh failure. We just need to catch the fallback state.
        setAuthStatus("invalid");
      }
    };

    validateToken();

    /* =========================
        TAB FOCUS
    ========================= */

    window.addEventListener(
      "focus",
      validateToken
    );

    /* =========================
        TAB VISIBILITY
    ========================= */

    document.addEventListener(
      "visibilitychange",
      validateToken
    );

    /* =========================
        CLEANUP
    ========================= */

    return () => {

      window.removeEventListener(
        "focus",
        validateToken
      );

      document.removeEventListener(
        "visibilitychange",
        validateToken
      );
    };

  }, []);

  if (
    authStatus === "checking"
  ) {
    return <PageLoader />;
  }

  /* =========================
      NO TOKEN
  ========================= */

  if (
    authStatus === "missing" ||
    authStatus === "invalid"
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (authStatus === "expired") {
    return (
      <Navigate
        to="/login?expired=true"
        replace
      />
    );
  }

  /* =========================
      VALID TOKEN
  ========================= */

  return children;
}

export default ProtectedRoute;
