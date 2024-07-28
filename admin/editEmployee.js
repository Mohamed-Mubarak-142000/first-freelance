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
const storage = getStorage(app);

// Modal elements
const modal = document.getElementById("editModal");
const closeModal = document.getElementsByClassName("close")[0] || null;
const editEmployeeForm = document.getElementById("editEmployeeForm");

// Close the modal
closeModal.onclick = () => {
  modal.style.display = "none";
};
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Search employees by name
document.getElementById("searchEmployee").addEventListener("input", (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();
  fetchEmployees(searchTerm);
});

// Fetch and display employees from Firestore
export async function fetchEmployees(queryString = "") {
  const employeeList = document.getElementById("employeeList");
  const loadingIndicator = document.getElementById("loading");
  employeeList.innerHTML = ""; // Clear the list
  loadingIndicator.classList.remove("hidden");
  console.log("Loading indicator shown"); // Debug line

  let employeesQuery = collection(db, "employees");
  if (queryString) {
    const endString = queryString.replace(/.$/, (c) =>
      String.fromCharCode(c.charCodeAt(0) + 1)
    );
    employeesQuery = query(
      employeesQuery,
      orderBy("firstName"),
      startAt(queryString),
      endAt(endString)
    );
  }

  try {
    const querySnapshot = await getDocs(employeesQuery);
    loadingIndicator.classList.add("hidden");
    console.log("Loading indicator hidden"); // Debug line

    if (querySnapshot.empty) {
      console.log("No matching documents.");
      employeeList.innerHTML = "<p>No employees found.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const employee = doc.data();
      console.log("Employee data:", employee);
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center bg-white p-4 shadow rounded";
      li.innerHTML = `
        <div>
          <p><strong>Name:</strong> ${employee.firstName} ${
        employee.lastName
      }</p>
          <p><strong>Email:</strong> ${employee.email}</p>
          <p><strong>Job Title:</strong> ${employee.jobTitle}</p>
          ${
            employee.profileImageURL
              ? `<img src="${employee.profileImageURL}" alt="Profile Image" class="w-16 h-16 object-cover rounded-full" />`
              : ""
          }
        </div>
        <div>
          <button class="edit-btn bg-blue-500 text-white py-1 px-2 rounded mr-2" data-id="${
            doc.id
          }">Edit</button>
          <button class="delete-btn bg-red-500 text-white py-1 px-2 rounded" data-id="${
            doc.id
          }">Delete</button>
        </div>
      `;
      employeeList.appendChild(li);
    });

    // Add event listeners to the buttons
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        openEditModal(id);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        await deleteDoc(doc(db, "employees", id));
        fetchEmployees(); // Refresh the list after deletion
      });
    });
  } catch (error) {
    loadingIndicator.classList.add("hidden");
    console.error("Error fetching employees:", error);
    employeeList.innerHTML = "<p>Error loading employees.</p>";
  }
}

// Open modal and populate form with employee data
async function openEditModal(id) {
  const employeeDocRef = doc(db, "employees", id);
  const employeeDoc = await getDoc(employeeDocRef);
  if (employeeDoc.exists()) {
    const employee = employeeDoc.data();
    document.getElementById("employeeId").value = id;
    document.getElementById("firstName").value = employee.firstName;
    document.getElementById("lastName").value = employee.lastName;
    document.getElementById("email").value = employee.email;
    document.getElementById("jobTitle").value = employee.jobTitle;
    document.getElementById("phoneNumber").value = employee.phoneNumber;
    document.getElementById("state").value = employee.state;
    document.getElementById("startDate").value = employee.startDate;

    // Populate checkboxes for authorization
    const departments = [
      "adminAccess",
      "accountingAccess",
      "marketingAccess",
      "salesAccess",
      "operationsAccess",
      "uploadProductsAccess",
    ];
    departments.forEach((department) => {
      document.getElementById(department).checked =
        employee.authorization?.includes(
          document.getElementById(department).value
        );
    });

    // Display the current profile image if available
    if (employee.profileImageURL) {
      const img = document.createElement("img");
      img.src = employee.profileImageURL;
      img.alt = "Profile Image";
      img.className = "w-16 h-16 object-cover rounded-full";
      document.querySelector(".modal-content").appendChild(img);
    }

    modal.style.display = "flex";
  } else {
    console.log("No such document!");
  }
}

// Save edited employee data
editEmployeeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("employeeId").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const jobTitle = document.getElementById("jobTitle").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const state = document.getElementById("state").value;
  const startDate = document.getElementById("startDate").value;
  const profileImage = document.getElementById("profileImage").files[0];

  const authorization = [];
  document
    .querySelectorAll('input[name="department"]:checked')
    .forEach((checkbox) => {
      authorization.push(checkbox.value);
    });

  try {
    if (profileImage) {
      // Get the current employee data
      const employeeDocRef = doc(db, "employees", id);
      const employeeDoc = await getDoc(employeeDocRef);

      if (employeeDoc.exists()) {
        const oldImageURL = employeeDoc.data().profileImageURL;

        // If there's an existing image, delete it
        if (oldImageURL) {
          const oldImageRef = ref(storage, oldImageURL);
          await deleteObject(oldImageRef);
        }

        // Upload new image
        const imageRef = ref(
          storage,
          `employee_images/${id}/${profileImage.name}`
        );
        await uploadBytes(imageRef, profileImage);

        // Get the new image URL
        const newImageURL = await getDownloadURL(imageRef);

        // Update employee document with new image URL
        await updateDoc(employeeDocRef, {
          firstName,
          lastName,
          email,
          jobTitle,
          phoneNumber,
          state,
          startDate,
          authorization,
          profileImageURL: newImageURL,
        });
      }
    } else {
      // Update employee document without changing image
      await updateDoc(doc(db, "employees", id), {
        firstName,
        lastName,
        email,
        jobTitle,
        phoneNumber,
        state,
        startDate,
        authorization,
      });
    }

    modal.style.display = "none";
    fetchEmployees(); // Refresh the employee list
  } catch (error) {
    console.error("Error updating employee:", error);
  }
});

// Logout handler
document.getElementById("logoutButton").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("loggedInUserId");
      window.location.href = "auth/index.html";
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
            console.log("ADMIN - All items displayed", item);
          });
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
