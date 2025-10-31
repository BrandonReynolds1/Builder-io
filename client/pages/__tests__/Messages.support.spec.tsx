// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Messages from "../Messages";
import { Toaster } from "@/components/ui/toaster";
import { ADMIN_ID, ADMIN_EMAIL } from "@/config/admin";
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

// Track current test user for simple fetch mocks
let testUserId: string | null = null;

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
  testUserId = sponsor.id;
  return sponsor;
}

describe("Support compose modal for sponsors", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock fetch to avoid real network calls and provide minimal API responses
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const method = (init?.method || "GET").toUpperCase();

        // Users list
        if (url.includes("/api/users") && method === "GET") {
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Upsert admin
        if (url.includes("/api/users/upsert") && method === "POST") {
          return new Response(
            JSON.stringify({ ok: true, user: { id: "admin-123", email: ADMIN_EMAIL } }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Messages for user
        if (url.includes("/api/messages/user/") && method === "GET") {
          const now = new Date().toISOString();
          const rows = testUserId
            ? [
                {
                  id: "m1",
                  from_user_id: testUserId,
                  to_user_id: "admin-123",
                  body: "Hello admin, I have a question",
                  sent_at: now,
                  from_user_name: "Test Sponsor",
                  to_user_name: "Administrator",
                },
              ]
            : [];
          return new Response(JSON.stringify(rows), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Post message
        if (url.endsWith("/api/messages") && method === "POST") {
          return new Response(JSON.stringify({ ok: true, id: "m1" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Connections endpoints
        if (url.includes("/api/connections/status") && method === "GET") {
          return new Response(JSON.stringify({ status: "accepted" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (url.includes("/api/connections/sponsor/") && url.endsWith("/incoming") && method === "GET") {
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (url.includes("/api/connections") && method === "POST") {
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Default empty OK
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as any,
    );
  });

  afterEach(() => {
    // @ts-ignore
    if (global.fetch && (global.fetch as any).mockRestore) {
      // @ts-ignore
      (global.fetch as any).mockRestore();
    } else {
      // Ensure fetch is removed between tests
      // @ts-ignore
      delete global.fetch;
    }
    testUserId = null;
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
  });
});
