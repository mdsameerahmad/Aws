const axios = require("axios");

// src/index.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// income-service/index.js
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const { evaluateRankUpgrade } = require("./utils/rankUtils");
const { resetAllCarryMatchedToday } = require("./utils/resetCarryForNewDay");
const { expireUnclaimedRewards } = require("./utils/expireUnclamedAmounts");


dotenv.config();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`📝 Request Body:`, req.body);
  next();
});

// Mount routes
app.use("/", require("./routes/businessRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));
app.use(require('./routes/rankRoutes'));
app.use(require('./routes/internalRoutes'));
app.use('/test', require('./routes/testRoutes')); // Test routes


// Add a direct route for topup-trigger for testing
const { handleTopupTrigger } = require('./controllers/incomeController');
app.post('/direct-topup-trigger', (req, res) => {
  console.log('🔄 Direct topup-trigger route hit');
  handleTopupTrigger(req, res);
});

app.get("/ping", (req, res) => res.send("💸 Income Service is Alive"));

cron.schedule("0 0 * * *", async () => {
  console.log("🌅 Running midnight carry reset cron...");
  await resetAllCarryMatchedToday();

   console.log("🕐 Checking for expired rank rewards...");
  await expireUnclaimedRewards();
}, {
  timezone: "Asia/Kolkata"
});



cron.schedule("0 0 */15 * *", async () => {
  try {
    console.log("📆 Running rank evaluation for all users (every 15 days)...");

    const { data } = await axios.get(`${USER_SERVICE_URL}/api/admin/users`);
    const users = data || [];

    for (const user of users) {
      console.log(`🔍 Evaluating rank for: ${user.name} (${user._id})`);
      await evaluateRankUpgrade(user._id);
    }

    console.log("✅ 15-day rank evaluation complete.");
  } catch (err) {
    console.error("❌ Error in 15-day rank cron:", err.message);
  }
}, {
  timezone: "Asia/Kolkata"
});


// app.post("/test/expire-rewards", async (req, res) => {
//   await expireUnclaimedRewards();
//   res.send("✅ Expired checked");
// });



const PORT = process.env.PORT || 5004;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 
  })
  .then(() => {
    console.log("✅ Income Service DB Connected");
    app.listen(PORT, () =>
      console.log(`💸 Income Service running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB connection failed", err));
