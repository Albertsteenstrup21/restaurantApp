//config.js

//config fil til firebase
import { getApp } from '@firebase/app';
import firebase from 'firebase/compat/app';
import { getDatabase } from 'firebase/database';
import {getStorage} from 'firebase/storage';



// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC76xlw_lpWmT1vuWXAYopD3nBtmp_Tf3A",
    authDomain: "restauranttinder-e8829.firebaseapp.com",
    projectId: "restauranttinder-e8829",
    storageBucket: "restauranttinder-e8829.appspot.com",
    messagingSenderId: "226570833851",
    appId: "1:226570833851:web:81fa0bc9da274a864d7e9e",
    databaseURL: "https://restauranttinder-e8829-default-rtdb.europe-west1.firebasedatabase.app/",
};

//initialize firebase if its not already initialized and return app 
if (!firebase.apps.length) {
    const app = firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized");
}

const db = getDatabase();
const app = getApp();
const storage = getStorage(app);

export {db, app, storage };
