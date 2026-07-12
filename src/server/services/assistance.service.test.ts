import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (hoisted) ──────────────────────────────────────────────────────────
vi.mock("../repositories/assistance.repo", () => ({
  assistanceRepo: {
    findById: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
    addWorkflowStep: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("../repositories/members.repo", () => ({
  membersRepo: {
    findById: vi.fn().mockResolvedValue({ email: null, firstName: "Maria", lastName: "Cruz" }),
  },
}));
vi.mock("./notifications.service", () => ({
  notificationsService: { notify: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("../email", () => ({ sendEmail: vi.fn(), emailTemplate: vi.fn(() => "") }));

const insertValues = vi.fn().mockResolvedValue(undefined);
vi.mock("../db/client", () => ({
  getDb: () => ({ insert: () => ({ values: insertValues }) }),
}));

import { assistanceService } from "./assistance.service";
import { assistanceRepo } from "../repositories/assistance.repo";

type Status = "pending" | "under_review" | "approved" | "released" | "rejected";
const row = (status: Status) => ({
  id: "req1",
  requestNo: "AR-2026-0001",
  memberId: "m1",
  category: "medical" as const,
  amount: "5000",
  reason: "x",
  status,
  submittedAt: new Date(),
  reviewedByName: null,
  releasedAt: null,
  memberFirstName: "Maria",
  memberLastName: "Cruz",
  memberNo: "DYG-1001",
});
const actor = { id: "staff1", name: "Admin Santos" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("assistanceService.transition — workflow rules", () => {
  it("rejects an invalid transition (release while pending)", async () => {
    (assistanceRepo.findById as any).mockResolvedValueOnce(row("pending"));
    await expect(assistanceService.transition("req1", "release", undefined, actor)).rejects.toThrow(
      /cannot release/i,
    );
    expect(assistanceRepo.update).not.toHaveBeenCalled();
  });

  it("approves from under_review and records the reviewer + a workflow step", async () => {
    (assistanceRepo.findById as any)
      .mockResolvedValueOnce(row("under_review"))
      .mockResolvedValueOnce(row("approved"));

    const dto = await assistanceService.transition("req1", "approve", "ok", actor);

    expect(assistanceRepo.update).toHaveBeenCalledWith(
      "req1",
      expect.objectContaining({ status: "approved", reviewedByName: "Admin Santos" }),
    );
    expect(assistanceRepo.addWorkflowStep).toHaveBeenCalledWith(
      expect.objectContaining({ fromStatus: "under_review", toStatus: "approved" }),
    );
    expect(insertValues).not.toHaveBeenCalled(); // no ledger entry on approve
    expect(dto.status).toBe("approved");
  });

  it("posts a ledger expense when funds are released", async () => {
    (assistanceRepo.findById as any)
      .mockResolvedValueOnce(row("approved"))
      .mockResolvedValueOnce(row("released"));

    await assistanceService.transition("req1", "release", undefined, actor);

    expect(assistanceRepo.update).toHaveBeenCalledWith(
      "req1",
      expect.objectContaining({ status: "released", releasedAt: expect.any(Date) }),
    );
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ type: "expense", category: "assistance", amount: "5000" }),
    );
  });
});
