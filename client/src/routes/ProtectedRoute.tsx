import {
  Navigate,
} from "react-router-dom";

import { jwtDecode }
from "jwt-decode";

type JwtPayload = {
  exp: number;
};

function ProtectedRoute({
  children,
}: {
  children:
    React.ReactNode;
}) {

  const accessToken =
    localStorage.getItem(
      "accessToken"
    );

  /* =====================
      NO TOKEN
  ===================== */

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  try {

    /* =====================
        DECODE TOKEN
    ===================== */

    const decoded =
      jwtDecode<JwtPayload>(
        accessToken
      );

    /* =====================
        CHECK EXPIRY
    ===================== */

    const currentTime =
      Date.now() / 1000;

    if (
      decoded.exp <
      currentTime
    ) {

      /* =====================
          CLEAR TOKENS
      ===================== */

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      return (
        <Navigate
          to="/login?expired=true"
          replace
        />
      );
    }

    return children;

  } catch (error) {

    /* =====================
        INVALID TOKEN
    ===================== */

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }
}

export default ProtectedRoute;