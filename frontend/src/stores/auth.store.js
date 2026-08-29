import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Creates and exports a Zustand authentication store enhanced with Redux DevTools support.
 *
 * @remarks
 * This store keeps a single piece of auth state:
 * - `user`: the currently authenticated user object, or `null` if not signed in.
 *
 * It also exposes two state updater actions:
 * - `setUser(user)`: updates `user` with the provided value.
 * - `clearUser()`: resets `user` back to `null`.
 *
 * Internally:
 * - `create(...)` initializes the store hook (`useAuthStore`) for React components.
 * - `devtools(...)` wraps the store so state changes can be inspected in browser Redux DevTools.
 * - `set(...)` is Zustand’s state setter used by actions to mutate store state.
 *
 * @example
 * const { user, setUser, clearUser } = useAuthStore();
 * setUser({ id: "123", name: "Alex" });
 * clearUser();
 */
export const useAuthStore = create(
    devtools((set) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
    }))
);