import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "@features/landing/pages/Landing";

import Login from "@features/auth/pages/Login";

import Logout from "@features/auth/pages/Logout";

import AuthCallback from "@features/auth/pages/AuthCallback";

import Dashboard from "@features/dashboard/pages/Dashboard";

import Profile from "@features/profile/pages/Profile";

import Projects from "@features/projects/pages/Projects";

import CreateProject from "@features/projects/pages/CreateProject";

import EditProject from "@features/projects/pages/EditProject";

import Certificates from "@features/certificates/pages/Certificates";

import CreateCertificate from "@features/certificates/pages/CreateCertificate";

import EditCertificate from "@features/certificates/pages/EditCertificate";

import ApiKeys from "@features/apiKeys/pages/ApiKeys";

import ProtectedRoute from "@app/routes/ProtectedRoute";

import NotFound from "@app/pages/NotFound";

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
          path="/logout"
          element={<Logout />}
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
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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

        <Route
          path="/projects/:slug/edit"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificates/create"
          element={
            <ProtectedRoute>
              <CreateCertificate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificates/:slug/edit"
          element={
            <ProtectedRoute>
              <EditCertificate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <ApiKeys />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
