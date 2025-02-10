// ✅ Make sure Firebase is properly initialized
const firebaseConfig = {
    apiKey: "AIzaSyC-gBwCfYQoermL3UYKyI3ketIwOuz2kko",
    authDomain: "hospital-70b60.firebaseapp.com",
    projectId: "hospital-70b60",
    storageBucket: "hospital-70b60.appspot.com",
    messagingSenderId: "655001925306",
    appId: "1:655001925306:web:9a75b413a85d1cf26c7483",
    measurementId: "G-8RFLJ4MYBC"
};

// ✅ Initialize Firebase (Ensure this is before any auth or Firestore operations)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ✅ Signup Function
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const username = document.getElementById("signup-username").value;
    const errorMsg = document.getElementById("signup-error");

    try {
        // ✅ Create user in Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("User created successfully:", user);

        // ✅ Store user data in Firestore
        await db.collection("users").doc(user.uid).set({
            username: username,
            email: email,
            createdAt: new Date().toISOString(),
        });

        alert("Signup successful! User ID: " + user.uid);
        window.location.href = "login.html"; // Redirect after signup
    } catch (error) {
        console.error("Signup Error:", error.message);
        errorMsg.textContent = error.message;
    }
});

// ✅ Login Function
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorMsg = document.getElementById("login-error");

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("User logged in:", userCredential.user);

        alert("Login successful!");
        window.location.href = "dashboard.html"; // Redirect after login
    } catch (error) {
        console.error("Login Error:", error.message);
        errorMsg.textContent = error.message;
    }
});

