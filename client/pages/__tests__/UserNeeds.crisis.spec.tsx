// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserNeeds from "../UserNeeds";
import { vi } from "vitest";

// Mock the auth context to provide a stable user synchronously
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

function setTestUser() {
  const user = {
    id: "user_test",
    email: "user@test.local",
    displayName: "Test User",
    role: "user",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("sobrUsers", JSON.stringify([user]));
  localStorage.setItem("sobrUser", JSON.stringify(user));
  return user;
}

describe("Crisis modal flow in UserNeeds", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows modal on selecting crisis, requires acknowledgement, and records telemetry when opted-in", async () => {
    const user = setTestUser();

    render(
      <MemoryRouter>
        <UserNeeds />
      </MemoryRouter>,
    );

    // Select at least one goal to enable Next
    const goal = await screen.findByText(/Maintain sobriety/i);
    fireEvent.click(goal);

    // Click Next to go to urgency step
    const nextBtn = screen.getByText(/^Next$/i);
    fireEvent.click(nextBtn);

    // Ensure urgency step heading appears
    await screen.findByText(/How urgent is your need for support/i);

    // Click the Crisis option
    const crisisBtn = screen.getByText(/In Crisis - Need Help Now/i);
    fireEvent.click(crisisBtn);

    // Modal title should appear
    const modalTitle = await screen.findByText(/Resources & Immediate Help/i);
    expect(modalTitle).toBeTruthy();

    // Continue button should be present and disabled initially
    const continueBtn = screen.getByText(/^Continue$/i);
    expect(continueBtn).toBeTruthy();
    expect((continueBtn as HTMLButtonElement).disabled).toBe(true);

    // Opt-in telemetry checkbox
    const telemetryLabel = await screen.findByText(/Share an anonymous event/i);
    expect(telemetryLabel).toBeTruthy();
    const telemetryCheckbox = screen.getByLabelText(/Share an anonymous event/i);
    fireEvent.click(telemetryCheckbox);

    // Acknowledge resources checkbox
    const ackCheckbox = screen.getByLabelText(/I have read these resources and would like to continue/i);
    expect(ackCheckbox).toBeTruthy();
    fireEvent.click(ackCheckbox);

    // Continue should now be enabled
    expect((continueBtn as HTMLButtonElement).disabled).toBe(false);

    // Click Continue
    fireEvent.click(continueBtn);

    // Wait for modal to close (title removed)
    await waitFor(() => expect(screen.queryByText(/Resources & Immediate Help/i)).toBeNull());

    // Telemetry should be recorded in localStorage
    const raw = localStorage.getItem("sobrTelemetryEvents");
    expect(raw).toBeTruthy();
    const events = JSON.parse(raw || "[]");
    const found = events.find((e: any) => e.event === "crisis_selected" && e.userId === user.id);
    expect(found).toBeDefined();
  });
});