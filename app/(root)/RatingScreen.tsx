import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import { useLocationStore } from "@/store";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const RatingScreen = () => {
  const [rating, setRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const handleRatingSubmit = () => {
    setRatingSubmitted(true);
    console.log(`User rated ${rating} stars`);
    // Send rating to backend if necessary
  };

  return (
    <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
      <Text className="text-2xl text-center font-JakartaBold mt-5">
        Rate Your Ride
      </Text>
      <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
        Please rate your experience with your ride.
      </Text>

      {/* Map showing user's path to destination without driver markers */}
      <View className="mt-5 h-64 w-full rounded-xl overflow-hidden">
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: userLatitude || 37.78825,
            longitude: userLongitude || -122.4324,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {userLatitude &&
            userLongitude &&
            destinationLatitude &&
            destinationLongitude && (
              <>
                <Marker
                  coordinate={{
                    latitude: destinationLatitude,
                    longitude: destinationLongitude,
                  }}
                  title="Destination"
                />
                <MapViewDirections
                  origin={{ latitude: userLatitude, longitude: userLongitude }}
                  destination={{
                    latitude: destinationLatitude,
                    longitude: destinationLongitude,
                  }}
                  apikey={directionsAPI!}
                  strokeColor="#0286FF"
                  strokeWidth={2}
                />
              </>
            )}
        </MapView>
      </View>

      <View className="flex flex-row mt-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <FontAwesome
              name="star"
              size={30}
              color={star <= rating ? "#FFD700" : "#D3D3D3"}
            />
          </TouchableOpacity>
        ))}
      </View>

      {!ratingSubmitted ? (
        <CustomButton
          title="Submit Rating"
          onPress={handleRatingSubmit}
          className="mt-5"
        />
      ) : (
        <CustomButton
          title="Back Home"
          onPress={() => router.push("/(root)/(tabs)/home")}
          className="mt-5"
        />
      )}
    </View>
  );
};

export default RatingScreen;
