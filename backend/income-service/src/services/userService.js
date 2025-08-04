// income-service/src/services/userService.js
const axios = require("axios");
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

exports.getUserById = async (userId) => {
  try {
    const { data } = await axios.get(`${USER_SERVICE_URL}/internal/user/${userId}`);
    return data;
  } catch (err) {
    console.error("getUserById error:", err.response?.data || err.message);
    throw err;
  }
};

exports.updateUserStatus = async (payload) => {
  try {
    const { data } = await axios.put(
      `${USER_SERVICE_URL}/internal/update-status`,
      payload
    );
    return data;
  } catch (err) {
    console.error("updateUserStatus error:", err.response?.data || err.message);
    throw err;
  }
};

exports.updateUserRank = async (userId, newRank) => {
  try {
    await axios.patch(`${USER_SERVICE_URL}/internal/update-rank/${userId}`, {
      rank: newRank,
    });
    console.log(`📌 User ${userId} rank updated to ${newRank} via user-service`);
  } catch (err) {
    console.error("❌ Failed to update user rank:", err.response?.data || err.message);
    throw err;
  }
};