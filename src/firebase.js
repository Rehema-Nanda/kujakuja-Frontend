// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
const firebaseConfig = {
    apiKey: "AIzaSyBZguhuBn2hn0IIKttBBQ2DAZILoIpf2iw",
    authDomain: "kuja-kuja-survey.firebaseapp.com",
    projectId: "kuja-kuja-survey",
    storageBucket: "kuja-kuja-survey.appspot.com",
    messagingSenderId: "430422560230",
    appId: "1:430422560230:web:442c342083ff473e52da27",
    measurementId: "G-LKPQD9FQL1"  
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export default storage;
