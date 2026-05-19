import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { SafeAreaView, StatusBar } from "react-native";
import { useEffect, useRef } from "react";

export interface IntroAnimationProps {

}

export default function IntroAnimationScreen(props: IntroAnimationProps) {
  const animationRef = useRef<LottieView>(null);
  const router = useRouter();
  useEffect(() => {
    // força a animação rodar até o final
    animationRef.current?.play();
  }, []);

  async function navigate() {
    router.replace("/loading");
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
      <StatusBar hidden backgroundColor={"#fff"} barStyle={"light-content"} />
      <LottieView
        ref={animationRef}
        onAnimationFinish={() => navigate()}
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
        source={require('../credits/lottie_citec.json')}
        autoPlay={false}
        loop={false}
      />
    </SafeAreaView>
  );
}