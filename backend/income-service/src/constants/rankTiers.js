module.exports = {
  RANK_TIERS: [
    {
      title: "ASSISTANT SUPERVISOR",
      type: "business",
      leftBusiness: 100000,
      rightBusiness: 100000,
      minStatus: "Two Star",
      reward: {
        cashAmount: 1000,
        trip: "NATIONAL"
      }
    },
    {
      title: "SUPERVISOR",
      type: "business",
      leftBusiness: 500000,
      rightBusiness: 500000,
      minStatus: "Two Star",
      reward: {
        cashAmount: 3000,
        trip: "NATIONAL"
      }
    },
    {
      title: "ASSISTANT MANAGER",
      type: "business",
      leftBusiness: 1000000,
      rightBusiness: 1000000,
      minStatus: "Two Star",
      reward: {
        cashAmount: 6000,
        trip: "NATIONAL"
      }
    },
    {
      title: "MANAGER",
      type: "subtree",
      leftUsers: 2,
      rightUsers: 2,
      requiredChildRank: "ASSISTANT MANAGER",
      minStatus: "Three Star",
      reward: {
        cashAmount: 25000,
        trip: "SPECIAL"
      }
    },
    {
      title: "SENIOR MANAGER",
      type: "subtree",
      leftUsers: 3,
      rightUsers: 3,
      requiredChildRank: "MANAGER",
      minStatus: "Four Star",
      reward: {
        cashAmount: 125000,
        trip: "SPECIAL"
      }
    },
    {
      title: "SOARING MANAGER",
      type: "subtree",
      leftUsers: 3,
      rightUsers: 3,
      requiredChildRank: "SENIOR MANAGER",
      minStatus: "Five Star",
      reward: {
        cashAmount: 1000000, // 10 lakh
        trip: "INTERNATIONAL"
      }
    },
    {
      title: "SAPPHIRE MANAGER",
      type: "subtree",
      leftUsers: 4,
      rightUsers: 4,
      requiredChildRank: "SOARING MANAGER",
      minStatus: "Five Star",
      reward: {
        cashAmount: 2500000, // 25 lakh
        trip: "INTERNATIONAL"
      }
    },
    {
      title: "DIAMOND SAPPHIRE MANAGER",
      type: "subtree",
      leftUsers: 5,
      rightUsers: 5,
      requiredChildRank: "SAPPHIRE MANAGER",
      minStatus: "Five Star",
      reward: {
        cashAmount: 6000000, // 60 lakh
        trip: "INTERNATIONAL"
      }
    },
    {
      title: "DIAMOND MANAGER",
      type: "subtree",
      leftUsers: 8,
      rightUsers: 8,
      requiredChildRank: "DIAMOND SAPPHIRE MANAGER",
      minStatus: "Five Star",
      reward: {
        cashAmount: 15000000, // 1.5 crore
        trip: "INTERNATIONAL"
      }
    }
  ]
};
