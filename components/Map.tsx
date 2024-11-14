import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    setUserLocation,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [distance, setDistance] = useState(0); // default to 1km radius

  // Real-time location tracking
  useEffect(() => {
    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: "Current Location",
          });
        },
      );
    };

    startLocationTracking();
  }, [setUserLocation]);

  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
        maxDistance: distance, // Use user-defined distance
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude, distance]); // re-run when distance changes

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <TextInput
        value={String(distance)}
        onChangeText={(value) => setDistance(Number(value))}
        keyboardType="numeric"
        placeholder="Enter distance in km"
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button
          title="Enter the range to see the drivers"
          onPress={() => {
            // Trigger an update to the driver markers based on new distance
            if (Array.isArray(drivers) && userLatitude && userLongitude) {
              const updatedMarkers = generateMarkersFromData({
                data: drivers,
                userLatitude,
                userLongitude,
                maxDistance: distance, // Update with new distance
              });
              setMarkers(updatedMarkers);
            }
          }}
          color="#4A90E2"
        />
      </View>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        tintColor="black"
        showsPointsOfInterest={false}
        initialRegion={region}
        showsUserLocation={true}
        followsUserLocation={true}
        userInterfaceStyle="light"
      >
        {markers.map((marker, index) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            image={
              selectedDriver === +marker.id
                ? icons.selectedMarker
                : icons.marker
            }
          />
        ))}

        {destinationLatitude && destinationLongitude && (
          <>
            <Marker
              key="destination"
              coordinate={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              title="Destination"
              image={icons.pin}
            />
            <MapViewDirections
              origin={{
                latitude: userLatitude!,
                longitude: userLongitude!,
              }}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F5F5F5",
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginBottom: 10,
    textAlign: "center",
    backgroundColor: "#FFF",
  },
  buttonContainer: {
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Map;
