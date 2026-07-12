/** Dashboard aggregate server function. */
import { createServerFn } from "@tanstack/react-start";
import { dashboardService, type DashboardData } from "../services/dashboard.service";
import { requireSessionUser } from "../auth";

const STAFF = ["admin", "treasurer", "collector", "secretary", "viewer"] as const;

/** All data needed to render the dashboard in a single round-trip. */
export const getDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardData> => {
    await requireSessionUser([...STAFF]);
    return dashboardService.overview();
  },
);
