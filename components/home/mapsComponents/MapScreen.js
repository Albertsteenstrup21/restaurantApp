import * as React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Accuracy } from "expo-location";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

export default function MapScreen({route}) {
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState([]);
  const [directions, setDirections] = useState(null);

  const getLocationPermission = async () => {
    await Location.requestForegroundPermissionsAsync().then((item) => {
      setlocationPermission(item.granted);
    });
  };

  // Fetch data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const starCountRef = ref(db, "restaurants");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const newRestaurants = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      console.log(newRestaurants);
      setRestaurantData(newRestaurants);
    });
  }, []);

  useEffect(() => {
    getLocationPermission();
    updateLocation();
  }, []);

  const updateLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (route.params?.directions) {
      setDirections(route.params.directions);
      // TODO: Parse the directions and update the map markers or polylines
    }
  }, [route.params?.directions]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#E9E7D5" />
      ) : (
        <MapView
          provider="google"
          style={styles.map}
          showsUserLocation
          showsMyLocationButton
          region={region}
        >
          {restaurantData.map((item, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: item.address.lat,
                longitude: item.address.lng,
              }}
              View
              style={styles.marker}
              title={item.name}
              description={item.cuisine}
            />
          ))}
        </MapView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#E9E7D5",
    padding: 8,
  },
  map: { flex: 1 },
  infoText: {
    fontSize: 15,
  },
  marker: {
    backgroundColor: "#550bbc",
    padding: 5,
    borderRadius: 5,
  },
});
