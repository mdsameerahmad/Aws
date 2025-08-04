// income-service/src/constants/statusTiers.js
const STATUS_TIERS = [
  {
    name: "Consumer",
    requiredTopup: 300,
    requiredChildren: 0,
    requiredStatus: null,
    levelDepth: 3,
    dailyMatchingCap: 0,
  },
  {
    name: "One Star",
    requiredTopup: 1000,
    requiredChildren: 2,
    requiredStatus: "Consumer",
    levelDepth: 5,
    dailyMatchingCap: 5000,
  },
  {
    name: "Two Star",
    requiredTopup: 5000,
    requiredChildren: 2,
    requiredStatus: "One Star",
    levelDepth: 10,
    dailyMatchingCap: 10000,
  },
  {
    name: "Three Star",
    requiredTopup: 15000,
    requiredChildren: 3,
    requiredStatus: "Two Star",
    levelDepth: 15,
    dailyMatchingCap: 20000,
  },
  {
    name: "Four Star",
    requiredTopup: 30000,
    requiredChildren: 5,
    requiredStatus: "Three Star",
    levelDepth: 20,
    dailyMatchingCap: 100000,
  },
  {
    name: "Five Star",
    requiredTopup: 50000,
    requiredChildren: 7,
    requiredStatus: "Four Star",
    levelDepth: 30,
    dailyMatchingCap: 300000,
  },
];

module.exports = STATUS_TIERS;
