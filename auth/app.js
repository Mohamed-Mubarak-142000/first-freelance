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
document.getElementById("btnLogin").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  let statusPerson = [];

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    showMessage("Login success!", "signMessage");
    const user = userCredential.user;

    const userDocRef = doc(db, "employees", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.passwordUpdated) {
        if (userData.departments && Array.isArray(userData.departments)) {
          statusPerson = userData.departments.slice().sort();
        }
        await setDoc(
          doc(db, "users", user.uid),
          {
            statusPerson: statusPerson,
            email: user.email,
            lastLogin: new Date(),
          },
          { merge: true }
        );
        // Redirect based on department
        if (userData.departments.includes("Admin")) {
          window.location.replace("../admin/newemployees.html");
        } else if (userData.departments.includes("Accounting")) {
          window.location.replace("../accountong/accounting.html");
        } else if (userData.departments.includes("Sales")) {
          window.location.replace("../sales/sales.html");
        } else if (userData.departments.includes("Marketing")) {
          window.location.replace("../marketing/marketing.html");
        } else if (userData.departments.includes("Operations")) {
          window.location.replace("../operations/operations.html");
        } else {
          window.location.replace("../allProducts/allProducts.html");
        }
      } else {
        window.location.href = "./firsttimelogin.html";
        showMessage("You need to update your password.", "signMessage");
      }
    } else {
      showMessage("User data not found!", "signMessage");
    }

    resetInputs();
  } catch (error) {
    const errorCode = error.code;
    const message =
      errorCode === "auth/invalid-credential"
        ? "Incorrect email or password!"
        : "Account does not exist!";
    showMessage(message, "signMessage");
  }
});
