import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "../pages/Landing";

import Login from "../pages/Login";

import AuthCallback from "../pages/AuthCallback";

import Dashboard from "../pages/Dashboard";

import Projects from "../pages/Projects";

import CreateProject from "../pages/CreateProject";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/auth/github/callback"
          element={
            <AuthCallback />
          }
        />

        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/create"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;