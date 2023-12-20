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
} from "react-native";
import { getDatabase, ref, set, get } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { getAuth } from "firebase/auth";
//Importerer Ionicons til tab navigation
import Ionicons from "react-native-vector-icons/Ionicons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Picker } from "@react-native-picker/picker"; // Ensure this is imported at the top of your file
import YOUR_API_KEY from "../../../keys/keys";

const RestaurantSignUpForm = ({ navigation }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [website, setWebsite] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [expertRating, setExpertRating] = useState("");
  const [userRating, setUserRating] = useState("");
  const [media, setMedia] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [mediaArr, setMediaArr] = useState([]);
  const [isVideoUploaded, setIsVideoUploaded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploadSuccessful, setIsUploadSuccessful] = useState("");
  const [isVideoMaximized, setIsVideoMaximized] = useState(false);
  const [isPhotoMaximized, setIsPhotoMaximized] = useState(false);

  const handleSignUp = async () => {
    // Get the user ID of the currently logged in user
    const auth = getAuth();
    let userId = "";
    if (auth.currentUser) {
      userId = auth.currentUser.uid;
    }
    // Check if required fields are filled out
    if (!name || !address || !cuisine || !website || !priceRange) {
      setErrorMessage("Please fill out all required fields.");
      console.log("Please fill out all required fields.");
      return;
    }

    try {
      const db = getDatabase();
      const restaurantRef = ref(db, "restaurants/" + userId);

      // Check if the user ID already exists in the database, if it does, set the error message state
      const snapshot = await get(restaurantRef);
      if (snapshot.exists()) {
        setErrorMessage("User ID already exists.");
        console.log("User ID already exists.");
        return;
      } else {
        setIsUploadSuccessful("uploading");
        // Upload media to Firebase Storage
        const storage = getStorage();
        // Upload media to Firebase Storage and retrieve download URLs
        const downloadUrlPromises = mediaArr.map(async (item) => {
          const response = await fetch(item.uri);
          const blob = await response.blob();
          const mediaRef = storageRef(
            storage,
            "media/" + userId + "/" + item.fileName
          );
          let metadata =
            item.type === "video"
              ? { contentType: "video/mp4" }
              : { contentType: "image/jpeg" };

          // Upload the file and metadata 
          await uploadBytesResumable(mediaRef, blob, metadata);
          return getDownloadURL(mediaRef);
        });

        // Wait for all download URLs to be returned from Firebase Storage
        try {
          const downloadUrls = await Promise.all(downloadUrlPromises);
          const mediaWithDownloadUrls = downloadUrls.map((downloadUrl) => ({
            downloadUrl,
          }));

          // Create a new restaurant in database
          const newRestaurant = {
            name,
            address,
            cuisine,
            price_range: priceRange,
            website,
            media: mediaWithDownloadUrls,
          };
          console.log("newRestaurant: " + JSON.stringify(newRestaurant));
          await set(restaurantRef, newRestaurant);
        } catch (error) {
          console.error("Error during file upload:", error);
        }
        setIsUploadSuccessful("uploaded");
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setErrorMessage(errorMessage);
      console.log(error);
    }
  };

  // Access the device image library and retrieve a video
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
      videoExportPreset: ImagePicker.VideoExportPreset.H264_640x480,
    });

    if (!result.canceled && result.assets.length > 0) {
      setMedia([...media, ...result.assets]);
      setMediaArr((mediaArr) => [...result.assets, ...mediaArr]);
      setIsVideoUploaded(true);
    }
  };

  // Access the device image library and retrieve a photo
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
      UIImagePickerControllerQualityType:
        ImagePicker.UIImagePickerControllerQualityType.Low,
    });

    if (!result.canceled && result.assets.length > 0) {
      setMedia([...media, ...result.assets]);
      setMediaArr((mediaArr) => [...mediaArr, ...result.assets]);
    }
  };

  // Format the duration of the video
  const formatDuration = (duration) => {
    const totalSeconds = Math.ceil(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Remove media from the mediaArr
  const handleRemoveMedia = (index) => {
    const newMediaArr = [...mediaArr];
    const removedMedia = newMediaArr.splice(index, 1)[0];
    setMediaArr(newMediaArr);
    if (removedMedia.type === "video") {
      setIsVideoUploaded(false);
    }
  };

  // When a media item is pressed, set the selectedMedia state to the media item and set the isVideoMaximized or isPhotoMaximized state to true
  const handleMediaPress = (media) => {
    setSelectedMedia(media);
    if (media.type === "video") {
      setIsVideoMaximized(true);
      setIsPhotoMaximized(false);
    } else {
      setIsPhotoMaximized(true);
      setIsVideoMaximized(false);
    }
  };

  // When the minimize button is pressed, set the selectedMedia state to null and set the isVideoMaximized or isPhotoMaximized state to false
  const handleMinimize = () => {
    setSelectedMedia(null);
    setIsVideoMaximized(false);
    setIsPhotoMaximized(false);
  };

  // in useEffect we check if the selectedMedia is true and if isVideoMaximized or isPhotoMaximized is true, then we set the headerShown to false, else we set it to true
  useEffect(() => {
    if (selectedMedia && (isVideoMaximized || isPhotoMaximized)) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
  }, [isVideoMaximized, isPhotoMaximized, selectedMedia]);

  if (isUploadSuccessful === "uploading") {
    return (
      <View style={styles.container}>
        <Text>Uploading...</Text>
      </View>
    );
  } else if (isUploadSuccessful === "uploaded") {
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
          <View style={{ flex: 1 }}>
            <Image
              source={{ uri: selectedMedia.uri }}
              style={{ width: "100%", height: isPhotoMaximized ? "100%" : 300 }}
              resizeMode="contain"
            />
            {isPhotoMaximized && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleMinimize}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps="always">
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

        <GooglePlacesAutocomplete
          placeholder="Enter Location"
          minLength={2}
          autoFocus={false}
          returnKeyType={"default"}
          fetchDetails={true}
          disableScroll={true}
          listViewDisplayed={false}
          styles={{
            zIndex: 1,
            textInputContainer: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              height: 38,
              color: "#5d5d5d",
              fontSize: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#C9C9CE",
              marginTop: 10,
            },
            predefinedPlacesDescription: {
              color: "#1faadb",
            },
          }}
          query={{
            key: YOUR_API_KEY,
            language: "dk", // language of the results
          }}
          onPress={(data, details = null) => {
            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;
            const address = details.formatted_address;
            setAddress({ lat, lng, address });
          }}
          onFail={(error) => console.log(error)}
          onNotFound={() => console.log("no results")}
        />

        <Picker
          selectedValue={cuisine}
          onValueChange={(itemValue) => setCuisine(itemValue)}
          style={[styles.inputField, !cuisine && styles.requiredInput]}
        >
          <Picker.Item label="Nordic" value="Nordic" />
          <Picker.Item label="French" value="French" />
          <Picker.Item label="Italian" value="Italian" />
          <Picker.Item label="Mediterranean" value="Mediterranean" />
          <Picker.Item label="Asian" value="Asian" />
          <Picker.Item label="American" value="American" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
        <TextInput
          placeholder="Website"
          value={website}
          onChangeText={(website) => setWebsite(website)}
          style={[styles.inputField, !website && styles.requiredInput]}
          required
        />
        <TextInput
          placeholder="Price Range"
          value={priceRange}
          onChangeText={(priceRange) => setPriceRange(priceRange)}
          style={[styles.inputField, !priceRange && styles.requiredInput]}
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
    marginTop: 10,
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
