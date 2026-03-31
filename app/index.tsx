import { useEffect } from "react";
import { useRouter } from "expo-router";

import LoadingScreen from "../src/screens/LoadingScreen";
import { getInitialRoute } from "../src/services/onboardingStorage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const resolveInitialRoute = async () => {
      const initialRoute = await getInitialRoute();

      if (isMounted) {
        router.replace(initialRoute);
      }
    };

    void resolveInitialRoute();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return <LoadingScreen />;
}