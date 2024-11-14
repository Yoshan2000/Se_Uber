import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/clerk-expo";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton"; // Assuming you have a custom button component

const Profile = () => {
  const { user } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.primaryPhoneNumber?.phoneNumber || "",
  );
  const [profileImage, setProfileImage] = useState(
    user?.externalAccounts[0]?.imageUrl || user?.imageUrl || "",
  );

  const toggleEditMode = () => setEditMode(!editMode);

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri); // Update local image state with the selected URI
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Mocked update function – replace this with actual API or Clerk SDK call to save user details
      await updateUserProfile({
        firstName,
        lastName,
        phoneNumber,
        profileImage,
      });
      Alert.alert("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  // Mock function for updating user profile, replace this with actual API call
  const updateUserProfile = async (updatedData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profileImage: string;
  }) => {
    // Here, you would send `updatedData` to your server or Clerk API to update the user's profile
    console.log("Updating profile with data:", updatedData);
    // Example: return await clerkClient.users.updateUser(user.id, updatedData);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">My Profile</Text>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{ uri: profileImage }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className="rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
          {editMode && (
            <TouchableOpacity onPress={handleImageUpload} className="mt-3">
              <Text style={{ color: "#1E90FF" }}>Change Profile Picture</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="First name"
              placeholder="First Name"
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={editMode}
              value={firstName}
              onChangeText={setFirstName}
            />

            <InputField
              label="Last name"
              placeholder="Last Name"
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={editMode}
              value={lastName}
              onChangeText={setLastName}
            />

            <InputField
              label="Email"
              placeholder="Email"
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
              value={user?.primaryEmailAddress?.emailAddress || ""}
            />

            <InputField
              label="Phone"
              placeholder="Phone Number"
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={editMode}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </View>

        <View className="flex flex-row justify-end mt-5">
          {!editMode ? (
            <CustomButton title="Edit" onPress={toggleEditMode} />
          ) : (
            <>
              <CustomButton
                title="Cancel"
                onPress={toggleEditMode}
                style={{ marginRight: 10 }}
              />
              <CustomButton title="Save" onPress={handleSaveChanges} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
