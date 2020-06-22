import * as firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyDc-JzouXt3_-8U-KKHuHfZKqm0f8G47xM",
    authDomain: "wireless-libraryapp.firebaseapp.com",
    databaseURL: "https://wireless-libraryapp.firebaseio.com",
    projectId: "wireless-libraryapp",
    storageBucket: "wireless-libraryapp.appspot.com",
    messagingSenderId: "388251967062",
    appId: "1:388251967062:web:17936b13dc8e8652d6e5f7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();