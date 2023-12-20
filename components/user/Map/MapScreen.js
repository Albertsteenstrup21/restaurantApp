import * as React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import Constants from "expo-constants";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Accuracy } from "expo-location";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

import AmericanIcon from "../../../assets/FoodIcons/American.png";
import AsianIcon from "../../../assets/FoodIcons/Asian.png";
import FrenchIcon from "../../../assets/FoodIcons/French.png";
import ItalianIcon from "../../../assets/FoodIcons/Italian.png";
import MediterraneanIcon from "../../../assets/FoodIcons/Mediterranean.png";
import NordicIcon from "../../../assets/FoodIcons/Nordic.png";
import OtherIcon from "../../../assets/FoodIcons/Other.png";
import Person1 from "../../../assets/People/Person1.png";
import Person2 from "../../../assets/People/Person2.png";
import Person3 from "../../../assets/People/Person3.png";
import Person4 from "../../../assets/People/Person4.png";

export default function MapScreen({ route }) {
  const [hasLocationPermission, setlocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState([]);

  const getLocationPermission = async () => {
    await Location.requestForegroundPermissionsAsync().then((item) => {
      setlocationPermission(item.granted);
    });
  };

  const cuisineIcons = {
    American: AmericanIcon,
    Asian: AsianIcon,
    French: FrenchIcon,
    Italian: ItalianIcon,
    Mediterranean: MediterraneanIcon,
    Nordic: NordicIcon,
    Other: OtherIcon,
  };

  const personIcons = [Person1, Person2, Person3, Person4];

  const maybeGetPersonIcon = () => {
    // Only return an icon with 50% chance
    if (Math.random() < 0.5) {
      return personIcons[Math.floor(Math.random() * personIcons.length)];
    } else {
      return null; // 50% chance to return no icon
    }
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

  // Update location
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
          showsUserLocation
          showsMyLocationButton
          region={region}
          customMapStyle={mapStyle}
          style={styles.map}
        >
          {restaurantData.map((item, index) => {
            const personIcon = maybeGetPersonIcon(); // This may be null or an icon
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: item.address.lat,
                  longitude: item.address.lng,
                }}
                title={item.name}
                description={item.cuisine}
              >
                {/* Random person icon, only shown 50% of the time */}
                {personIcon && (
                  <Image
                    source={personIcon}
                    style={{
                      width: 50,
                      height: 50,
                      position: "absolute",
                      marginTop: 15,
                    }} // Adjust size and position as needed
                    resizeMode="contain"
                  />
                )}
                {/* Cuisine icon */}
                <Image
                  source={cuisineIcons[item.cuisine] || OtherIcon}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </Marker>
            );
          })}
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

const mapStyle = [
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]