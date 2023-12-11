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

export default function App() {
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocationPermission = async () => {
    await Location.requestForegroundPermissionsAsync().then((item) => {
      setlocationPermission(item.granted);
    });
  };

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
          <Marker
            coordinate={{ latitude: 55.676195, longitude: 12.569419 }}
            title="Rådhuspladsen"
            description="blablabal"
          />
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
});
