import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "../../pages/Landing";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import Dashboard from "../../pages/Dashboard";
import Projects from "../../pages/Projects";
import CreateProject from "../../pages/CreateProject";
import Achievements from "../../pages/Achievements";
import CreateAchievement from "../../pages/CreateAchievement";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/achievements/create" element={<CreateAchievement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;