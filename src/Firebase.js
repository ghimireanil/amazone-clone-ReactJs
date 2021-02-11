import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyD0g_KQJ5QW2I45Cjc1FVmuHAGyW50Skzw',
  authDomain: 'clone-5a987.firebaseapp.com',
  databaseURL: 'https://clone-5a987.firebaseio.com',
  projectId: 'clone-5a987',
  storageBucket: 'clone-5a987.appspot.com',
  messagingSenderId: '1076992458954',
  appId: '1:1076992458954:web:e98e185aeee456b7d37433',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();

export { db, auth };
