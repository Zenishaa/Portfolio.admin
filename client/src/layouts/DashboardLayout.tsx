import type { ReactNode } from "react";
import { useState } from "react";

import Navbar from "@shared/components/navigation/Navbar";
import Sidebar from "@shared/components/navigation/Sidebar";

function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  return (
    <div
      className="
        flex
        min-h-screen
        bg-[var(--bg-main)]
      "
    >
      {/* Sidebar */}

      <Sidebar
        sidebarOpen={sidebarOpen}
      />

      {/* Main */}

      <div className="flex flex-1 flex-col">
        {/* Navbar */}

        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Content */}

        <main
          className="
            flex-1
            p-6
            lg:p-8
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
