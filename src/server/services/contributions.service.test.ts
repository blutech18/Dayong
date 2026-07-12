import { describe, it, expect, vi, beforeEach } from "vitest";

const contribInsert = vi.fn();
vi.mock("../repositories/contributions.repo", () => ({
  contributionsRepo: {
    maxReceiptSuffix: vi.fn().mockResolvedValue(50010),
    insert: (v: unknown) => {
      contribInsert(v);
      return Promise.resolve({
        id: "c1",
        memberId: "m1",
        amount: (v as any).amount,
        status: (v as any).status,
        method: (v as any).method,
        eventId: null,
        receiptNo: (v as any).receiptNo,
        paidAt: (v as any).paidAt,
        recordedByName: (v as any).recordedByName,
      });
    },
    listByMemberId: vi.fn().mockResolvedValue([]),
  },
}));

const memberUpdate = vi.fn().mockResolvedValue(undefined);
vi.mock("../repositories/members.repo", () => ({
  membersRepo: {
    findById: vi.fn().mockResolvedValue({
      id: "m1",
      firstName: "Juan",
      lastName: "Santos",
      memberNo: "DYG-1002",
      contributionsTotal: "1000",
    }),
    update: (id: string, patch: unknown) => memberUpdate(id, patch),
  },
}));

vi.mock("./notifications.service", () => ({
  notificationsService: { notify: vi.fn().mockResolvedValue(undefined) },
}));

import { contributionsService } from "./contributions.service";

const actor = { id: "staff1", name: "Admin Santos" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("contributionsService.record — receipts & ledger", () => {
  it("generates the next receipt number and updates the member total for paid", async () => {
    const dto = await contributionsService.record(
      { memberId: "m1", amount: 500, method: "cash", status: "paid" },
      actor,
    );

    expect(dto.receiptNo).toBe("OR-050011"); // maxReceiptSuffix 50010 + 1, padded to 6
    expect(dto.amount).toBe(500);
    // member running total 1000 + 500 = 1500
    expect(memberUpdate).toHaveBeenCalledWith(
      "m1",
      expect.objectContaining({ contributionsTotal: "1500" }),
    );
  });

  it("does not change the member total for an unpaid record", async () => {
    await contributionsService.record(
      { memberId: "m1", amount: 500, method: "cash", status: "unpaid" },
      actor,
    );
    expect(memberUpdate).not.toHaveBeenCalled();
  });

  it("throws when the member does not exist", async () => {
    const { membersRepo } = await import("../repositories/members.repo");
    (membersRepo.findById as any).mockResolvedValueOnce(null);
    await expect(
      contributionsService.record(
        { memberId: "missing", amount: 500, method: "cash", status: "paid" },
        actor,
      ),
    ).rejects.toThrow(/member not found/i);
  });
});
