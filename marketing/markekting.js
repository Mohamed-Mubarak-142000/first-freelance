// Import Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  startAt,
  endAt,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

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

// Check if a user is logged in
document.addEventListener("DOMContentLoaded", () => {
  const departmentItems = {
    Admin: document.getElementById("adminItem"),
    Marketing: document.getElementById("marketingItem"),
    Sales: document.getElementById("salesItem"),
    Accounting: document.getElementById("accountingItem"),
    Operations: document.getElementById("operationsItem"),
    Logs: document.getElementById("logsItem"),
    Development: document.getElementById("developmentItem"),
  };

  // Log to ensure elements are being found
  Object.entries(departmentItems).forEach(([key, value]) => {
    console.log(`${key} item:`, value);
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "employees", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User data:", userData.departments);

        // Check for Admin role first
        if (userData.departments.includes("Admin")) {
          Object.values(departmentItems).forEach((item) => {
            if (item) item.style.display = "block";
            console.log("ADMIN - All items displayed", item);
          });
        } else {
          // Display specific department items
          if (userData.departments) {
            userData.departments.forEach((department) => {
              const item = departmentItems[department];
              if (item) {
                item.style.display = "block";
                console.log(`${department} - Item displayed`, item);
              }
            });
          }
        }
      } else {
        console.log("User data not found!");
      }
    } else {
      window.location.href = "../auth/index.html";
    }
  });
});

// Logout handler
document.getElementById("logoutButton").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("loggedInUserId");
      window.location.href = "../auth/index.html";
    })
    .catch((error) => {
      console.error("Error logging out", error);
    });
});
