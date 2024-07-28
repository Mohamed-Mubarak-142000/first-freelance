// Import the functions you need from the SDKs you need
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { fetchEmployees } from "./editEmployee.js";

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
const storage = getStorage(app);

function resetInputs() {
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phoneNumber").value = "";
  document.getElementById("jobTitle").value = "";
  document.getElementById("state").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("password").value = "";
  document.getElementById("profileImage").value = "";

  Array.from(document.querySelectorAll("input[name='department']:checked")).map(
    (el) => (el.checked = false)
  );
}

//handle image
async function uploadImage(file) {
  const storageRef = ref(storage, `images/${file.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw error;
  }
}
// Employee form submit handler
document
  .getElementById("employeeForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const jobTitle = document.getElementById("jobTitle").value;
    const state = document.getElementById("state").value;
    const startDate = document.getElementById("startDate").value;
    const password = document.getElementById("password").value;
    const passwordUpdated = false;

    const departments = Array.from(
      document.querySelectorAll("input[name='department']:checked")
    ).map((el) => el.value);
    const fileInput = document.getElementById("profileImage");
    const file = fileInput.files[0];
    let imageURL = "";
    if (file) {
      try {
        imageURL = await uploadImage(file);
      } catch (error) {
        console.error("Error uploading image", error);
        return;
      }
    }
    try {
      const newEmployee = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const employee = newEmployee.user;
      await setDoc(doc(db, "employees", employee.uid), {
        firstName,
        lastName,
        email,
        phoneNumber,
        jobTitle,
        state,
        startDate,
        departments,
        uid: employee.uid,
        passwordUpdated,
        imageURL,
      });

      resetInputs();
      alert("Employee added successfully");
    } catch (error) {
      console.error("Error adding employee", error);
    }
  });

//logout handler
document.getElementById("logoutButton").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("loggedInUserId");
      window.location.replace("auth/index.html");
      console.log("logout");
    })
    .catch((error) => {
      console.error("Error logging out", error);
    });
});

// Check if a user is logged in
document.addEventListener("DOMContentLoaded", () => {
  const departmentItems = {
    Admin: document.getElementById("adminItem"),
    Marketing: document.getElementById("marketingItem"),
    Sales: document.getElementById("salesItem"),
    Accounting: document.getElementById("accoutingItem"),
    Operations: document.getElementById("operationsItem"),
    Logs: document.getElementById("logsItem"),
    Development: document.getElementById("developmentItem"),
  };

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await fetchEmployees();
      const userDocRef = doc(db, "employees", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User data:", userData.departments);

        // Check for Admin role first
        if (userData.departments.includes("Admin")) {
          Object.values(departmentItems).forEach((item) => {
            if (item) item.style.display = "block";
          });
          console.log("ADMIN - All items displayed");
        } else {
          // Display specific department items
          if (userData.departments) {
            userData.departments.forEach((department) => {
              const item = departmentItems[department];
              if (item) {
                item.style.display = "block";
                console.log(`${department} - Item displayed`);
              }
            });
          }
        }
      } else {
        console.log("User data not found!");
      }
    } else {
      window.location.href = "auth/index.html";
    }
  });
});
