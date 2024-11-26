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
import { useDriverStore, useLocationStore } from "@/store";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
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
  const { selectedDriver, setDrivers } = useDriverStore(); // Access store for drivers

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [distance, setDistance] = useState(1); // default to 1 km
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch drivers based on radius and update store
  useEffect(() => {
    if (!userLatitude || !userLongitude) return;

    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/(api)/driver?radius=${distance}`, // Fetch drivers based on radius
        );
        const result = await response.json();

        if (response.ok) {
          const newMarkers = generateMarkersFromData({
            data: result.data,
            userLatitude,
            userLongitude,
            maxDistance: distance,
          });

          setMarkers(newMarkers);

          // Update driver store with filtered drivers
          setDrivers(newMarkers); // Store only drivers visible on the map
        } else {
          throw new Error(result.error || "Failed to fetch drivers");
        }
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setError("Failed to load drivers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [distance, userLatitude, userLongitude, setDrivers]); // Trigger on radius change

  // Update driver times when markers change
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
  }, [markers, destinationLatitude, destinationLongitude, selectedDriver]);

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
        <Text>{error}</Text>
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
            // Trigger fetch when button is pressed
            if (userLatitude && userLongitude) {
              const fetchDrivers = async () => {
                setLoading(true);
                try {
                  const response = await fetch(
                    `/(api)/driver?radius=${distance}`,
                  );
                  const result = await response.json();
                  const updatedMarkers = generateMarkersFromData({
                    data: result.data,
                    userLatitude,
                    userLongitude,
                    maxDistance: distance,
                  });

                  setMarkers(updatedMarkers);
                  setDrivers(updatedMarkers); // Update driver store
                } catch (err) {
                  setError("Failed to load drivers.");
                } finally {
                  setLoading(false);
                }
              };
              fetchDrivers();
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
        {markers.map((marker) => (
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
