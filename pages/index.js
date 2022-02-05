import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, set, push } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_SFyioC74x0YgA2CwI6myAs5CBMEuovA",
  authDomain: "project-4683290386206299015.firebaseapp.com",
  databaseURL: "https://project-4683290386206299015-default-rtdb.firebaseio.com",
  projectId: "project-4683290386206299015",
  storageBucket: "project-4683290386206299015.appspot.com",
  messagingSenderId: "251722380373",
  appId: "1:251722380373:web:285c5e2df4165b3d8bd0dc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();


const API_KEY = 'AIzaSyBE9ikpCz88OCjs-f9bjJjyiYmWYOoR-_Q';

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return <Spinner />;
    case Status.FAILURE:
      return <ErrorComponent />;
    case Status.SUCCESS:
      return <MyMapComponent />;
  }
};

const ErrorComponent = () => {
  return (
    <div>
      <p>Error loading data</p>
    </div>
  );
}

const Spinner = () => {
  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}

const MyMapComponent = () => {
  const markersRef = ref(db, 'markers');
  const center = { lat: 32.77915961445464, lng: -96.80878205735175 };
  const zoom = 19;
  const mapType = 'satellite';
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

  const mapRef = useRef();

  useEffect(() => {
    let map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: mapType
    });

    map.addListener('click', (event) => {
      // Add a circular marker to the map
      let marker = new window.google.maps.Marker({
        position: event.latLng,
        map,
      });

      const newMarkersRef = push(markersRef);

      // Add marker to firebase in the markers collection
      set(newMarkersRef, {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
      
    });



    onValue(markersRef, (snapshot) => {
      snapshot.forEach((child) => {
        let marker = new window.google.maps.Marker({
          position: {
            lat: child.val().lat,
            lng: child.val().lng,
          },
          draggable:true,
          title: child.key,
          map,
        });

        marker.addListener('click', () => {
          setIsInfoWindowOpen(true);
          infowindow.open(map, marker);
        });

        let infowindow = new window.google.maps.InfoWindow({
          content: `
              <div>
              <p>Latitude: ${child.val().lat}</p>
              <p>Longitude: ${child.val().lng}</p>
              <p>Id: ${child.key}</p>
            </div>
          `
        });

        // On hover, show the info window
        marker.addListener('mouseover', () => {
          infowindow.open(map, marker);
          // Make the marker bigger with a bounce animation
          marker.setAnimation(window.google.maps.Animation.BOUNCE);
        })

        // Toggle infowindow on mouseout
        marker.addListener('mouseout', () => {
          if (!isInfoWindowOpen) {
            infowindow.close();
            marker.setAnimation(null);
          }
        });

      });
    });

  }, []);

  return (
    <div className={styles.map}>
      <div
        ref={mapRef}
        className={styles.map}
      />
    </div>
  );
}


export default function Home() {
  const [myLocation, setMyLocation] = useState(null);


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    }
  }, []);





  useEffect(() => {
    // Update the location in the database of the user

    // Get the user's uid with anonymous Firebase auth
    signInAnonymously(auth)
      .then(() => {
        const uid = auth.currentUser.uid;
        // Get the reference to the user's location in the database
        const userLocationRef = ref(db, `users/${uid}/location`);

        // Update the user's location in the database
        set(userLocationRef, {
          lat: myLocation.lat,
          lng: myLocation.lng
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ...
      });



    // if (myLocation) {
    //   set(ref(db, 'users/' + 'user1'), {
    //     lat: myLocation.lat,
    //     lng: myLocation.lng
    //   });
    // }
  }, [myLocation]);


  return (
    <div className={styles.container}>
      <Head>
        <title>1963 Top Down Map</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Wrapper apiKey={API_KEY} render={render} myLocation={myLocation} />

      {/* Get current location of device */}
      <button
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setMyLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.log(error);
            }
          );
        }}>
        Get Current Location
      </button>
    </div>
  )
}
