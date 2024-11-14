import { Alert, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { useOAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { googleOAuth } from "@/lib/auth";
import { router } from "expo-router";

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const result = await googleOAuth(startOAuthFlow);

      console.log("OAuth Result:", result);

      if (result.code === "success" && result.success) {
        Alert.alert("Success", "Redirecting to home screen.");
        router.replace("/(root)/(tabs)/home");
      } else if (result.code === "session_exists") {
        Alert.alert("Session exists", "You are already logged in.");
        router.replace("/(root)/(tabs)/home");
      } else if (result.code === "cancel") {
        Alert.alert("Login Canceled", "You canceled the login process.");
      } else {
        Alert.alert(
          "Login Failed",
          result.message || "OAuth process did not complete successfully.",
        );
      }
    } catch (err) {
      console.error("OAuth error", err);
      Alert.alert("OAuth Error", "An error occurred during the login process.");
    }
  }, []);

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
