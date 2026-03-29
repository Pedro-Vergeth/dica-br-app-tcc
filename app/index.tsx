import { useEffect } from "react";
import { useRouter } from "expo-router";

import LoadingScreen from "../src/screens/LoadingScreen";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/state");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return <LoadingScreen />;
}