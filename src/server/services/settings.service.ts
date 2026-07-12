import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { appSettings, type AppSettings } from "../db/schema";

const SINGLETON = "singleton";

export interface SettingsDTO {
  orgName: string;
  registrationNo: string;
  contactEmail: string;
  phone: string;
  address: string;
  monthlyDues: number;
  receiptPrefix: string;
}

function toDTO(s: AppSettings): SettingsDTO {
  return {
    orgName: s.orgName,
    registrationNo: s.registrationNo ?? "",
    contactEmail: s.contactEmail ?? "",
    phone: s.phone ?? "",
    address: s.address ?? "",
    monthlyDues: Number(s.monthlyDues),
    receiptPrefix: s.receiptPrefix,
  };
}

export const settingsService = {
  async get(): Promise<SettingsDTO> {
    const db = getDb();
    const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SINGLETON)).limit(1);
    if (row) return toDTO(row);
    const [created] = await db.insert(appSettings).values({ id: SINGLETON }).returning();
    return toDTO(created);
  },

  async update(patch: Partial<SettingsDTO>): Promise<SettingsDTO> {
    const db = getDb();
    await this.get(); // ensure the singleton row exists
    const [updated] = await db
      .update(appSettings)
      .set({
        orgName: patch.orgName,
        registrationNo: patch.registrationNo,
        contactEmail: patch.contactEmail,
        phone: patch.phone,
        address: patch.address,
        monthlyDues: patch.monthlyDues !== undefined ? String(patch.monthlyDues) : undefined,
        receiptPrefix: patch.receiptPrefix,
        updatedAt: new Date(),
      })
      .where(eq(appSettings.id, SINGLETON))
      .returning();
    return toDTO(updated);
  },
};
