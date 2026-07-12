/** Financials server functions. */
import { createServerFn } from "@tanstack/react-start";
import { financialsService, type FinancialsOverview } from "../services/financials.service";
import { requireSessionUser } from "../auth";

const FINANCE_VIEWERS = ["admin", "treasurer", "viewer"] as const;

/** Ledger, monthly cash-flow series and headline financial stats. */
export const getFinancialsOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<FinancialsOverview> => {
    await requireSessionUser([...FINANCE_VIEWERS]);
    return financialsService.overview();
  },
);
