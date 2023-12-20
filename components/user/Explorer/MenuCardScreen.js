import React, { useState, useEffect } from 'react';
import { ImageBackground } from 'react-native';

// Import images
import image1 from "../../../assets/Menucards/MenuCard1.png";
import image2 from "../../../assets/Menucards/MenuCard2.jpeg";
import image3 from "../../../assets/Menucards/MenuCard3.jpeg";
import image4 from '../../../assets/Menucards/MenuCard4.jpeg';
import image5 from '../../../assets/Menucards/MenuCard5.webp';
import image6 from '../../../assets/Menucards/MenuCard6.jpeg';

// Create an array of images
const images = [image1, image2, image3, image4, image5, image6];

// Create a component
const MenuCardScreen = () => {
  const [randomImage, setRandomImage] = useState(null);

  // Generate a random image from the array of images
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setRandomImage(images[randomIndex]);
  }, []);

  return (
    <ImageBackground source={randomImage} style={{ flex: 1 }} />
  );
};

export default MenuCardScreen;