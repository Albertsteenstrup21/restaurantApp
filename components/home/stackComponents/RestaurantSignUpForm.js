import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { getDatabase, ref, set, get } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { getAuth } from "firebase/auth";
//Importerer Ionicons til tab navigation
import Ionicons from "react-native-vector-icons/Ionicons";

const RestaurantSignUpForm = ({ navigation }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState("");
  const [media, setMedia] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [mediaArr, setMediaArr] = useState([]);
  const [isVideoUploaded, setIsVideoUploaded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
  const [isVideoMaximized, setIsVideoMaximized] = useState(false);

  const handleSignUp = async () => {
    // Get the user ID of the currently logged in user
    const auth = getAuth();
    let userId = "";
    if (auth.currentUser) {
      //userId = auth.currentUser.uid;
      userId = "test";
    }
    // Check if required fields are filled out
    if (
      !name ||
      !address ||
      !cuisine ||
      !phoneNumber ||
      !priceRange ||
      !rating
    ) {
      setErrorMessage("Please fill out all required fields.");
      console.log("Please fill out all required fields.");
      return;
    }

    try {
      const db = getDatabase();
      const restaurantRef = ref(db, "restaurants/" + userId);

      // Check if the user ID already exists in the database
      const snapshot = await get(restaurantRef);
      if (snapshot.exists()) {
        setErrorMessage("User ID already exists.");
        console.log("User ID already exists.");
        return;
      } else {
        // Upload media to Firebase Storage
        const storage = getStorage();
        const mediaUrls = await Promise.all(
          media.map(async (item) => {
            const response = await fetch(item.uri);
            const blob = await response.blob();
            console.log(userId);
            const mediaRef = storageRef(
              storage,
              "media/" + userId + "/" + item.fileName
            );
            await uploadBytes(mediaRef, blob);
            const downloadUrl = await getDownloadURL(mediaRef);
            return downloadUrl;
          })
        );
        // Create a new restaurant in database
        const newRestaurant = {
          name,
          address,
          cuisine,
          phone_number: phoneNumber,
          price_range: priceRange,
          rating,
          media: mediaUrls,
        };
        await set(restaurantRef, newRestaurant);
        setIsUploadSuccessful(true);
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setErrorMessage(errorMessage);
      console.log(errorMessage);
    }
  };

  const handleVideoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      console.log("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Videos",
      quality: 1,
      allowsEditing: true,
      videoMaxDuration: 20,
    });

    if (!result.canceled && result.assets.length > 0) {
      setMedia([...media, result]);
      setMediaArr((mediaArr) => [result].concat(mediaArr));
      setIsVideoUploaded(true);
    }
  };

  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      console.log("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setMedia([...media, ...result.assets]);
      setMediaArr((mediaArr) => [...result.assets, ...mediaArr].reverse());
    }
  };

  const formatDuration = (duration) => {
    const totalSeconds = Math.ceil(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleRemoveMedia = (index) => {
    const newMediaArr = [...mediaArr];
    const removedMedia = newMediaArr.splice(index, 1)[0];
    setMediaArr(newMediaArr);
    if (removedMedia.type === "video") {
      setIsVideoUploaded(false);
    }
  };

  const handleMediaPress = (media) => {
    setSelectedMedia(media);
    setIsVideoMaximized(media.type === "video");
  };

  const handleMinimize = () => {
    setSelectedMedia(null);
    setIsVideoMaximized(false);
  };

  useEffect(() => {
    if (selectedMedia && isVideoMaximized) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
  }, [isVideoMaximized, selectedMedia]);

  if (isUploadSuccessful) {
    return (
      <View style={styles.container}>
        <Text style={styles.successMessage}>Upload successful!</Text>
      </View>
    );
  }

  if (selectedMedia) {
    return (
      <View style={styles.container}>
        {selectedMedia.type === "video" ? (
          <View style={{ flex: 1 }}>
            <Video
              source={{ uri: selectedMedia.uri }}
              style={{ width: "100%", height: isVideoMaximized ? "100%" : 300 }}
              resizeMode="contain"
              useNativeControls={true}
              isMuted={false}
              shouldPlay={true}
            />
            {isVideoMaximized && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleMinimize}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Image
            source={{ uri: selectedMedia.uri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.uploadContainer}>
          <Button
            title={isVideoUploaded ? "Upload Photo" : "Upload Video"}
            onPress={isVideoUploaded ? handlePhotoUpload : handleVideoUpload}
          />
          <View style={styles.gallery}>
            <ScrollView horizontal={true}>
              {mediaArr.length > 0 ? (
                mediaArr.map((media, index) => (
                  <View key={index} style={{ paddingHorizontal: 10 }}>
                    <TouchableOpacity onPress={() => handleMediaPress(media)}>
                      {media.type === "video" ? (
                        <View>
                          <Video
                            source={{ uri: media.uri }}
                            style={{ width: 150, height: 200 }}
                            resizeMode="cover"
                            shouldPlay={true}
                            isLooping={true}
                            useNativeControls={false}
                            isMuted={true}
                          />
                          <Text
                            style={{
                              color: "white",
                              position: "absolute",
                              bottom: 10,
                              right: 10,
                            }}
                          >
                            {formatDuration(media.duration)}
                          </Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: media.uri }}
                          style={{ width: 150, height: 200 }}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ position: "absolute", top: 5, right: 12 }}
                      onPress={() => handleRemoveMedia(index)}
                    >
                      <Ionicons name="trash-outline" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text>No media uploaded</Text>
              )}
            </ScrollView>
          </View>
        </View>
        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={(name) => setName(name)}
          style={[styles.inputField, !name && styles.requiredInput]}
          required
        />
        <TextInput
          placeholder="Address"
          value={address}
          onChangeText={(text) => setAddress(text)}
          style={[styles.inputField, !address && styles.requiredInput]}
          required
        />
        <TextInput
          placeholder="Cuisine"
          value={cuisine}
          onChangeText={(cuisine) => setCuisine(cuisine)}
          style={[styles.inputField, !cuisine && styles.requiredInput]}
          required
        />
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
          style={[styles.inputField, !phoneNumber && styles.requiredInput]}
          required
        />
        <TextInput
          placeholder="Price Range"
          value={priceRange}
          onChangeText={(priceRange) => setPriceRange(priceRange)}
          style={[styles.inputField, !priceRange && styles.requiredInput]}
          required
        />
        <TextInput
          placeholder="Rating"
          value={rating}
          onChangeText={(rating) => setRating(rating)}
          style={[styles.inputField, !rating && styles.requiredInput]}
          required
        />
        <Button title="Next" onPress={handleSignUp} />
      </View>
    </ScrollView>
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
  requiredInput: {
    borderColor: "red",
  },
  errorMessage: {
    fontSize: 15,
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
  successMessage: {
    fontSize: 20,
    color: "green",
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
  minimizeButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "gray",
  },
  minimizeButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
});

export default RestaurantSignUpForm;
