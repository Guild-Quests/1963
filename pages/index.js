import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, set, push} from "firebase/database";

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


const API_KEY = 'AIzaSyBE9ikpCz88OCjs-f9bjJjyiYmWYOoR-_Q';

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return <Spinner />;
    case Status.FAILURE:
      return <ErrorComponent />;
    case Status.SUCCESS:
      return <MyMapComponent  />;
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
  

  const center = { lat: 32.77915961445464, lng: -96.80878205735175};
  const zoom = 19;
  const mapType = 'satellite';

  const mapRef = useRef();

  useEffect(() => {
    let map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: mapType
    });

    map.addListener('click', (event) => {
      console.log(event.latLng);
      // Add a marker to the map
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
          map,
        });

        marker.addListener('click', () => {
          console.log(child.val());

          // Infowindow with lat and lng displayed
          let infowindow = new window.google.maps.InfoWindow({
            content: `Latitude: ${child.val().lat}<br>Longitude: ${child.val().lng}`
          });

          infowindow.open(map, marker);
          
        });

      });
    });

  }, []);

  // onClick, add a marker at the click location and zoom in
  const onClick = (e) => {
    console.log(e);
    // const lat = e.latLng.lat();
    // const lat = e.latLng.lat();
    // const lng = e.latLng.lng();
    // const newCenter = { lat, lng };
    // new window.google.maps.Map(ref.current, {
    //   center: newCenter,
    //   zoom: zoom + 1,
    // });

    // // add a marker at the click location
    // new window.google.maps.Marker({
    //   position: newCenter,
    //   map: ref.current,
    // });

    // Add marker to firebase
    // set(db.ref('/markers'), {
    //   lat,
    //   lng,
    // });

  };
  

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
  return (
    <div className={styles.container}>
      <Head>
        <title>1963 Top Down Map</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Wrapper apiKey={API_KEY} render={render} />
    </div>
  )
}
