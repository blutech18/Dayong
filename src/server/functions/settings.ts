/** Application settings server functions. */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { settingsService, type SettingsDTO } from "../services/settings.service";
import { requireSessionUser } from "../auth";

/** Current organization/app settings. */
export const getSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SettingsDTO> => {
    await requireSessionUser();
    return settingsService.get();
  },
);

/** Update settings (admin only). */
export const updateSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      orgName: z.string().trim().min(1).optional(),
      registrationNo: z.string().trim().optional(),
      contactEmail: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      address: z.string().trim().optional(),
      monthlyDues: z.number().nonnegative().optional(),
      receiptPrefix: z.string().trim().optional(),
    }),
  )
  .handler(async ({ data }): Promise<SettingsDTO> => {
    await requireSessionUser(["admin"]);
    return settingsService.update(data);
  });
