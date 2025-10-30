// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  getAllUsers,
  saveAllUsers,
  addConnectionRequest,
  getConnections,
  acceptConnection,
  getConversationsForUser,
  addMessageBetween,
  getUserById,
  approveSponsor,
  declineSponsor,
  bulkApproveSponsors,
  getPendingSponsors,
  connectionIsAccepted,
} from "./relations";

beforeEach(() => {
  localStorage.clear();
});

describe("relations localStorage helpers", () => {
  it("should approve/decline sponsors and bulk approve", () => {
    const users = [
      { id: "s1", email: "s1@test", displayName: "S One", role: "sponsor", vetted: false },
      { id: "s2", email: "s2@test", displayName: "S Two", role: "sponsor", vetted: false },
      { id: "u1", email: "u1@test", displayName: "U One", role: "user" },
    ];
    saveAllUsers(users as any);

    expect(getPendingSponsors().length).toBe(2);

    approveSponsor("s1");
    let updated = getAllUsers();
    expect(updated.find((u) => u.id === "s1")!.vetted).toBe(true);

    declineSponsor("s2");
    updated = getAllUsers();
    expect(updated.find((u) => u.id === "s2")!.role).toBe("user");

    bulkApproveSponsors(["s2"]);
    updated = getAllUsers();
    // after bulk approve s2 becomes vetted true
    expect(updated.find((u) => u.id === "s2")!.vetted).toBe(true);
  });

  it("should create a connection request and accept it, then sync conversations and messages", () => {
    const users = [
      { id: "u1", email: "u1@test", displayName: "U One", role: "user" },
      { id: "s1", email: "s1@test", displayName: "S One", role: "sponsor", vetted: true },
    ];
    saveAllUsers(users as any);

    addConnectionRequest("u1", "s1");
    let conns = getConnections();
    expect(conns.length).toBe(1);
    expect(conns[0].status).toBe("pending");

    // sponsor accepts
    acceptConnection("u1", "s1");
    conns = getConnections();
    expect(conns[0].status).toBe("accepted");

    // conversations created for both
    const uConvs = getConversationsForUser("u1");
    const sConvs = getConversationsForUser("s1");
    expect(uConvs.length).toBe(1);
    expect(sConvs.length).toBe(1);

    // send message and ensure both sides get it
    addMessageBetween("u1", "s1", "Hello sponsor");
    const uConvsAfter = getConversationsForUser("u1");
    const sConvsAfter = getConversationsForUser("s1");
    expect(uConvsAfter[0].messages.length).toBe(1);
    expect(sConvsAfter[0].messages.length).toBe(1);
    expect(uConvsAfter[0].messages[0].message).toBe("Hello sponsor");
  });

  it("connectionIsAccepted returns false for pending and true for accepted", () => {
    const users = [
      { id: "u1", email: "u1@test", displayName: "U One", role: "user" },
      { id: "s1", email: "s1@test", displayName: "S One", role: "sponsor", vetted: true },
    ];
    saveAllUsers(users as any);

    addConnectionRequest("u1", "s1");
    expect(connectionIsAccepted("u1", "s1")).toBe(false);
    acceptConnection("u1", "s1");
    expect(connectionIsAccepted("u1", "s1")).toBe(true);
  });
});
