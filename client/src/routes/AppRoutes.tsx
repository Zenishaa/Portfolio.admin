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

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Landing Page */}

        <Route
          path="/"
          element={<Landing />}
        />

        {/* Login */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/auth/github/callback"
          element={<AuthCallback />}
        />

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
            path="/projects"
            element={
                <Projects />
            }
        />

        <Route
            path="/projects/create"
            element={
                <CreateProject />
            }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;
