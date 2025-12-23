import { useEffect } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, initializeAuth, setAuthState } from "@/store";
import { supabase } from "@/config/supabase";

interface StoreProviderProps {
  children: React.ReactNode;
}

// Inner component that uses Redux hooks
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth state on mount
    dispatch(initializeAuth());

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            dispatch(
              setAuthState({
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                },
                session,
              })
            );
          }
        } else if (event === "SIGNED_OUT") {
          dispatch(setAuthState({ user: null, session: null }));
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}

// Main provider component
export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
