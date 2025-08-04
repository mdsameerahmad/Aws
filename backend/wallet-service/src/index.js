const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose"); 
dotenv.config();
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const internalRoutes = require("./routes/internalRoutes");
const productRoutes = require("./routes/productRoutes");


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(internalRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);

// app.use("/temp", tempRoutes);

app.get("/ping", (req, res) => {
  res.send("Wallet Service is alive 🚀");
});


const PORT = process.env.PORT || 5003; // or any wallet port like 5003
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("💰 Wallet-Service DB connected");
  app.listen(PORT, () => {
    console.log(`⚡ Wallet-Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Wallet-Service DB connection failed", err);
});


