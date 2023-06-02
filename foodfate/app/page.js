"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import Map from '../app/map';

export default function Home() {
  const [address, setAddress] = useState('1600 Amphitheatre Parkway, Mountain View, CA');
  const [isSubmitted, setIsSubmitted] = useState(false); // Track the submit state
  const [nearbyPlaces, setNearbyPlaces] = useState([]); // Store the nearby food places
  const [selectedPlace, setSelectedPlace] = useState(null); // Store the randomly selected place
  const inputRef = useRef(null); // Reference to the input element

  useEffect(() => {
    // Load the Google Maps JavaScript API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAFY09CwJBA_uW3jdsFJU3BOtw_wyS286g&libraries=places`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Initialize the autocomplete
    script.onload = () => {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.addListener('place_changed', () => {
        const selectedPlace = autocomplete.getPlace();
        setAddress(selectedPlace.formatted_address);
      });
    };

    return () => {
      // Clean up the script tag when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (event) => {
    setAddress(event.target.value);
  };

  const handleSubmit = () => {
    setIsSubmitted(true); // Update submit state
    console.log("Submitted address:", address);

    // Fetch nearby food places
    fetchNearbyFoodPlaces();
  };

  const fetchNearbyFoodPlaces = () => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      location: { lat: 0, lng: 0 }, // Set the location dynamically based on the saved address
      radius: 5000, // Set the desired radius for nearby search (in meters)
      type: 'restaurant', // Specify the type of place to search (e.g., restaurant, cafe, etc.)
    };

    // Use the Geocoding API to convert the address to coordinates
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        const location = results[0].geometry.location;
        request.location = location;

        // Perform the nearby search
        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setNearbyPlaces(results);

            // Randomly select a place from the results
            const randomIndex = Math.floor(Math.random() * results.length);
            setSelectedPlace(results[randomIndex]);
          }
        });
      }
    });
  };

  const renderMainContent = () => {
    if (isSubmitted) {
      return (
        <div className={styles.wholeBox}>
          <h1>Submitted!</h1>
          <p>Your address: {address}</p>

          {selectedPlace && (
            <div className={styles.fateBox}>
              <h2>Fate has decided that you eat at:</h2>
              <p>Name: {selectedPlace.name}</p>
              <p>Address: {selectedPlace.vicinity}</p>
              <p>Rating: {selectedPlace.rating} /5.0</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedPlace.vicinity)}`} target="_blank" rel="noopener noreferrer">View on Map</a>
               </div>
          )}

          <h2>All Nearby Food Places:</h2>
          <ul>
            {nearbyPlaces.map(place => (
              <li key={place.place_id}>{place.name}</li>
            ))}
          </ul>
        </div>
      );
    } else {
      return (
        <div className={styles.mapcontainer}>
          <h1>Map</h1>
          <Map className={styles.map} address={address} />
        </div>
      );
    }
  };

  return (
    <>
      <div className={styles.container}>
        <img className={styles.logo} src="/images/foodfate.png" alt="Food Fate" />
        <h1 className={styles.title}> FoodFate </h1>
      </div>

      <main className={styles.main}>
        <div className={ `${styles.main} ${isSubmitted ? styles.heightani : ''}`}>
        <h1 className={styles.maintitle}> Can't decide where to eat? <br />Enter your address and let FoodFate decide! </h1>
        <input className={styles.input} type="text" placeholder="Enter your address" ref={inputRef} onChange={handleInputChange} />
        <button className={styles.button} onClick={handleSubmit}>Submit</button>
        </div>
        {renderMainContent()} {/* Render the appropriate content based on the submit state */}
      </main>
    </>
  );
}
