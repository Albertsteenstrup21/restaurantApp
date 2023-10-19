import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { getDatabase, ref, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadString } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

const RestaurantSignUpForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState("");
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagesArr, setImagesArr] = useState([]);

  const handleSignUp = async () => {
    try {
      const db = getDatabase();
      const restaurantRef = ref(db, "restaurants/" + Date.now());
      const newRestaurant = {
        name,
        address,
        cuisine,
        phone_number: phoneNumber,
        price_range: priceRange,
        rating,
        menu,
        photos,
        videos,
      };
      await set(restaurantRef, newRestaurant);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setErrorMessage(errorMessage);
    }
  };

  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "All",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotos([...photos, result]);
      setImagesArr((imagesArr) => [result].concat(imagesArr));
    }
  };

  const handleVideoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
    }
  };

  const CameraGallery = () => {
    return (
      <View style={styles.gallery}>
        <ScrollView horizontal={true}>
          {imagesArr.length > 0 ? (
            imagesArr.map((media, index) => (
              <TouchableOpacity
                key={index}
                style={{ paddingHorizontal: 10 }}
                onPress={() =>
                  media.type === "video"
                    ? navigation.navigate("video", { video: media.uri })
                    : navigation.navigate("image", { image: media.uri })
                }
              >
                {media.type === "video" ? (
                  <Video
                    source={{ uri: media.uri }}
                    style={{ width: 150, height: 200 }}
                    resizeMode="cover"
                    shouldPlay={true}
                    isLooping={true}
                  />
                ) : (
                  <Image
                    source={{ uri: media.uri }}
                    style={{ width: 150, height: 200 }}
                  />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: "grey" }}> No media picked </Text>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.uploadContainer}>
        <Button title="Upload Media" onPress={handlePhotoUpload} />
        <CameraGallery />
      </View>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={(name) => setName(name)}
        style={styles.inputField}
      />
      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={(address) => setAddress(address)}
        style={styles.inputField}
      />
      <TextInput
        placeholder="Cuisine"
        value={cuisine}
        onChangeText={(cuisine) => setCuisine(cuisine)}
        style={styles.inputField}
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
        style={styles.inputField}
      />
      <TextInput
        placeholder="Price Range"
        value={priceRange}
        onChangeText={(priceRange) => setPriceRange(priceRange)}
        style={styles.inputField}
      />
      <TextInput
        placeholder="Rating"
        value={rating}
        onChangeText={(rating) => setRating(rating)}
        style={styles.inputField}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginVertical: 10,
  },
  errorMessage: {
    fontSize: 15,
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
  uploadContainer: {
    justifyContent: "space-between",
    marginVertical: 10,
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
});

export default RestaurantSignUpForm;
