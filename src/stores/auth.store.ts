import router, { useRouter } from "next/router";
import { createStore } from "zustand";

type AuthStore = {
  token: string;
  setToken: (token: string) => void;
};

export const useAuthStore = createStore<AuthStore>((set) => ({
  token: "",
  setToken: (token: string) => set({ token }),
  handleLogout: async () => {
    const router = useRouter();

    await auth.signOut();
    set({ token: "" });
    router.push("/");
  },
  handleLogin: async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential?.user) {
        const tokenFirebase = await userCredential.user.getIdToken();
        setToken(tokenFirebase);

        return true;
      }

      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  },
}));
