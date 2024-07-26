// Import Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDB78tlZWKr8lINpHm5YL7jlL2vqrLAwk",
  authDomain: "mange-employee-d708f.firebaseapp.com",
  projectId: "mange-employee-d708f",
  storageBucket: "mange-employee-d708f.appspot.com",
  messagingSenderId: "685680132196",
  appId: "1:685680132196:web:cb630982b2de54964a1f71",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Show message function
function showMessage(message, divId) {
  const signMessage = document.getElementById(divId);
  signMessage.style.display = "block";
  signMessage.innerHTML = message;
  signMessage.style.opacity = 1;
  setTimeout(() => {
    signMessage.style.opacity = 0;
  }, 5000);
}

// Reset Inputs function
function resetInputs() {
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}

// Login handler
document.getElementById("btnLogin").addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      showMessage("Login success!", "signMessage");
      const user = userCredential.user;
      localStorage.setItem("loggedInUserId", user.uid);

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          lastLogin: new Date(),
        },
        { merge: true }
      );

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role) {
          window.location.href = "./newemployees.html";
        } else {
          showMessage("You do not have access to this page.", "signMessage");
        }
        resetInputs();
      } else {
        console.error("No such document!");
        showMessage("User data not found!", "signMessage");
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const message =
        errorCode === "auth/invalid-credential"
          ? "Incorrect email or password!"
          : "Account does not exist!";
      showMessage(message, "signMessage");
    });
});
