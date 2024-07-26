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
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
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
const db = getFirestore();
const storage = getStorage();
const auth = getAuth(app);

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

document.addEventListener("DOMContentLoaded", checkedUser);
function checkedUser() {
  const isUserLogin = localStorage.getItem("loggedInUserId");
  if (!isUserLogin) {
    window.location.href = "./index.html";
  }
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
    const role = "employee";
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
        role,
        imageURL,
      });

      resetInputs();
      alert("Employee added successfully");
    } catch (error) {
      console.error("Error adding employee", error);
    }
  });

//logout handler
document.getElementById("logoutButton").addEventListener("click", logOutUser);
function logOutUser() {
  localStorage.removeItem("loggedInUserId");
  checkedUser();
}
