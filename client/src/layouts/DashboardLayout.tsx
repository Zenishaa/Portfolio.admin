import type { ReactNode } from "react";
import { useState } from "react";

import Navbar   from "@shared/components/navigation/Navbar";
import Sidebar  from "@shared/components/navigation/Sidebar";

function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Navbar */}
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
