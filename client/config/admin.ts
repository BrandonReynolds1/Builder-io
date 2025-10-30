// Runtime-configurable admin credentials for development / seeding.
// These read from Vite env vars prefixed with VITE_. Set them in your environment
// or in an .env file at project root (e.g., VITE_ADMIN_EMAIL=you@example.com).

export const ADMIN_ID = (import.meta.env.VITE_ADMIN_ID as string) || "admin";
export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string) || "brandon@me.com";
export const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || "TheAdmin!0123";

// Helper that returns an admin user object shape consistent with UserProfile
export function makeAdminUser() {
  return {
    id: ADMIN_ID,
    email: ADMIN_EMAIL,
    displayName: "Administrator",
    role: "admin",
    createdAt: new Date().toISOString(),
    qualifications: [],
    yearsOfExperience: 0,
    vetted: true,
  } as any;
}
