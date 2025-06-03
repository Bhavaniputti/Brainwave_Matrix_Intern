const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const pages = ["index", "login", "register", "dashboard", "learningcontent","career_path"];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, "public", `${page}.html`));
  });
});

app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "All fields are required" });

    try {
        const userRef = db.collection("users").doc(email);
        const doc = await userRef.get();
        if (doc.exists) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await userRef.set({ email, hashedPassword });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRef = db.collection("users").doc(email);
        const user = await userRef.get();

        if (!user.exists) {
            console.log("User not found:", email);
            return res.status(400).json({ error: "User not found" });
        }

        const userData = user.data();
        console.log("Fetched user data:", userData);

        if (!userData.hashedPassword) {
            console.log("No password stored for user:", email);
            return res.status(500).json({ error: "No password stored. Please re-register." });
        }

        const isMatch = await bcrypt.compare(password, userData.hashedPassword);
        console.log("Password match status:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);  // This will show the real error
        return res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
