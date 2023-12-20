import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import reviewData from "./Reviews.json"; // make sure the path to your Reviews.json is correct
import StarRating from "react-native-star-rating";

const peopleImages = [
  require("../../../assets/People/Person1.png"),
  require("../../../assets/People/Person2.png"),
  require("../../../assets/People/Person3.png"),
  require("../../../assets/People/Person4.png"),
];

const animalImages = [
  require("../../../assets/Animals/animal1.png"),
  require("../../../assets/Animals/animal2.png"),
  require("../../../assets/Animals/animal3.png"),
  require("../../../assets/Animals/animal4.png"),
  require("../../../assets/Animals/animal5.png"),
  require("../../../assets/Animals/animal6.png"),
];

const ReviewScreen = () => {
  const [selectedReviewType, setSelectedReviewType] = useState("experts");

  // Function to get random image from animalImages
  const getRandomAnimalImage = () => {
    const randomIndex = Math.floor(Math.random() * animalImages.length);
    return animalImages[randomIndex];
  };

  // Add image and rating to each review
  const reviewsToShow = reviewData[selectedReviewType].map((review) => ({
    ...review,
    image:
      selectedReviewType === "experts"
        ? peopleImages[review.id % peopleImages.length]
        : getRandomAnimalImage(),
    rating: Number((Math.random() * 4 + 1).toFixed(1)),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedReviewType === "experts" && styles.activeTab,
          ]}
          onPress={() => setSelectedReviewType("experts")}
        >
          <Text style={styles.tabText}>Experts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedReviewType === "users" && styles.activeTab,
          ]}
          onPress={() => setSelectedReviewType("users")}
        >
          <Text style={styles.tabText}>Users</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContainer}>
        
        {/* Loop through the reviewsToShow array and display each review */}
        {reviewsToShow.map((review, index) => (
          <View key={review.id} style={styles.reviewCard}>
            <Image source={review.image} style={styles.profileImage} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>
                {review.name}
                {selectedReviewType === "users" && index < 3 && " (friend)"}
              </Text>
              {review.role && <Text style={styles.role}>{review.role}</Text>}
              <Text style={styles.date}>{review.date}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  {review.rating.toFixed(1)}
                </Text>
                <StarRating
                  disabled={true}
                  maxStars={5}
                  rating={review.rating}
                  fullStarColor={
                    selectedReviewType === "experts" ? "red" : "gold"
                  }
                  emptyStarColor={"#ccc"}
                  starSize={15}
                  containerStyle={styles.starRatingContainer}
                  starStyle={styles.starStyle}
                />
              </View>
              <Text style={styles.content}>{review.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#eee",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "blue",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "grey",
  },
  scrollContainer: {
    backgroundColor: "#fff",
  },
  reviewCard: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  role: {
    fontStyle: "italic",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  content: {
    marginTop: 10,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4, // Adjust space around the rating as needed
  },
  ratingText: {
    fontSize: 14,
    color: "grey",
    marginRight: 8, // Space between the text and stars
  },
  starRatingContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 0, // Remove any default padding
  },
  starStyle: {
    marginHorizontal: 2, // Reduce space between stars
  },
});

export default ReviewScreen;
