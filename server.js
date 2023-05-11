import axios from "axios";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

dotenv.config();
const API_URI = process.env.API_URI || "http://localhost:5000";
const dev = process.env.NODE_ENV === "dev";

const firebaseConfig = {
  apiKey: "AIzaSyDBLkM_3EkF9JQdgxEBea_qdSii7GypW4U",
  authDomain: "eribot-sub-plataform.firebaseapp.com",
  projectId: "eribot-sub-plataform",
  storageBucket: "eribot-sub-plataform.appspot.com",
  messagingSenderId: "523472517712",
  appId: "1:523472517712:web:20436c9353b0b6258d2f55",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findReadings = async () => {
  try {
    const response = await axios.get(`${API_URI}/api/readings?isInFirebase=false`);
    return response.data;
  } catch (error) {
    dev && console.error(error);
  }
};

const sendToFirestore = async (readings) => {
  try {
    readings.forEach(async (reading) => {
      addDoc(collection(db, "lecturas"), {
        cellBarcode: reading.cellBarcode,
        loadUnitsBarcodes: reading.loadUnitsBarcodes,
      });
      reading.isInFirebase = true;
      axios.put(`${API_URI}/api/readings/${reading._id}`, reading);
      await delay(2000);
    });
  } catch (error) {
    dev && console.error(error);
  }
};

console.log("Sync service is running");

setInterval(async () => {
  const readings = await findReadings();
  if (readings && readings.length > 0) {
    await sendToFirestore(readings);
  }
}, 2000);
