// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Messages from "../Messages";
import { Toaster } from "@/components/ui/toaster";
import { ADMIN_ID } from "@/config/admin";
import { vi } from "vitest";

// Mock the auth context to provide a stable sponsor user synchronously
vi.mock("@/contexts/AuthContext", () => {
  return {
    useAuth: () => {
      const stored = JSON.parse(localStorage.getItem("sobrUser") || "null");
      return {
        user: stored,
        logout: () => {},
        isLoading: false,
        isAuthenticated: !!stored,
        login: async () => {},
        register: async () => {},
        updateUserProfile: () => {},
      };
    },
  };
});

// Helper to set localStorage user state before rendering
function setSponsorUser() {
  const sponsor = {
    id: "sponsor_test",
    email: "sponsor@test.local",
    displayName: "Test Sponsor",
    role: "sponsor",
    createdAt: new Date().toISOString(),
    qualifications: [],
    yearsOfExperience: 1,
    vetted: false,
  };
  localStorage.setItem("sobrUsers", JSON.stringify([sponsor]));
  localStorage.setItem("sobrUser", JSON.stringify(sponsor));
  return sponsor;
}

describe("Support compose modal for sponsors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens modal, disables send until text entered, sends message and creates admin conversation + shows toast", async () => {
    const sponsor = setSponsorUser();

    render(
      <MemoryRouter initialEntries={["/messages"]}>
        <Toaster />
        <Messages />
      </MemoryRouter>,
    );

    // Contact Support button should be visible
    const contactBtn = await screen.findByText(/Contact Support/i);
  expect(contactBtn).toBeTruthy();

    // Open modal
    fireEvent.click(contactBtn);

    // Send button should be disabled initially
    const sendBtn = await screen.findByText(/^Send$/i);
  expect(sendBtn).toBeTruthy();
  expect((sendBtn as HTMLButtonElement).disabled).toBe(true);

    // Enter message
    const textarea = screen.getByPlaceholderText(/Describe your question or concern/i);
    fireEvent.change(textarea, { target: { value: "Hello admin, I have a question" } });

    // Send button enabled
  expect((sendBtn as HTMLButtonElement).disabled).toBe(false);

    // Click send
    fireEvent.click(sendBtn);

    // Wait for toast to appear
  await waitFor(() => expect(screen.getByText(/Message sent/i)).toBeTruthy());

    // Verify conversation created in localStorage for sponsor
    const convsRaw = localStorage.getItem(`conversations_${sponsor.id}`);
    expect(convsRaw).toBeTruthy();
    const convs = JSON.parse(convsRaw || "[]");
  const adminConv = convs.find((c: any) => c.otherUserId === ADMIN_ID);
    expect(adminConv).toBeDefined();
    // The message should be present
    expect(adminConv.messages.length).toBeGreaterThan(0);
  });
});
