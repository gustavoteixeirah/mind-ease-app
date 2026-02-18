import { useAuth } from "@/context/auth-context";
import TabNavigator from "@/Navigation";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, isLoading, router]);

  return (
    <>
      <TabNavigator />
    </>
  );
}
