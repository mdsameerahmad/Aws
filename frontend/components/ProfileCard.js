import { useEffect, useState, useRef } from "react";
// import api from "../../utils/api";
import Image from 'next/image';
import { useRouter } from "next/router";

import {
  fetchProfile,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  changePassword,
  changeTransactionPassword,
} from "../utils/profileService";

const ProfileCard = ({ user: propUser }) => {
  const router = useRouter();
  // Initial user data
  const initialUserData = {
    basicInfo: {
      name: propUser?.name || "",
      email: propUser?.email || "",
      country: propUser?.country || "India",
      phone: propUser?.phone || "",
      panNumber: propUser?.panNumber || "",
      aadharNumber: propUser?.aadharNumber || "",
      avatar: propUser?.avatar || null,
      referralCodeLeft: propUser?.referralCodeLeft || "",
      referralCodeRight: propUser?.referralCodeRight || "",
    },
    bankDetails: {
      accountNumber: propUser?.bankDetails?.accountNumber || "",
      ifscCode: propUser?.bankDetails?.ifscCode || "",
      bankName: propUser?.bankDetails?.bankName || "",
      accountHolderName: propUser?.bankDetails?.accountHolderName || "",
    },
    uiSettings: {
      profileViewState: "view",
    },
  };

  // State initialization
  const [user, setUser] = useState(initialUserData);
  const [formData, setFormData] = useState({
    ...initialUserData.basicInfo,
    bankDetails: { ...initialUserData.bankDetails },
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    currentTransactionPassword: "",
    newTransactionPassword: "",
    confirmTransactionPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Load saved data on component mount and when propUser changes  // Load profile data from backend
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profileData = await fetchProfile();

        if (profileData) {
          setUser({
            basicInfo: {
              name: profileData.basicInfo?.name || "",
              email: profileData.basicInfo?.email || "",
              country: profileData.basicInfo?.country || "India",
              phone: profileData.basicInfo?.phone || "",
              panNumber: profileData.basicInfo?.panNumber || "",
              aadharNumber: profileData.basicInfo?.aadharNumber || "",
              avatar: profileData.basicInfo?.avatar || null,
              referralCodeLeft: profileData.referralInfo?.referralCodeLeft || "",
              referralCodeRight: profileData.referralInfo?.referralCodeRight || "",
            },
            bankDetails: {
              accountNumber: profileData.bankDetails?.accountNumber || "",
              ifscCode: profileData.bankDetails?.ifscCode || "",
              bankName: profileData.bankDetails?.bankName || "",
              accountHolderName:
                profileData.bankDetails?.accountHolderName || "",
            },
            uiSettings: {
              profileViewState:
                profileData.uiSettings?.profileViewState || "view",
            },
          });

          setFormData({
            ...profileData.basicInfo,
            bankDetails: { ...profileData.bankDetails },
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            currentTransactionPassword: "",
            newTransactionPassword: "",
            confirmTransactionPassword: "",
          });

          setIsEditing(profileData.uiSettings?.profileViewState === "edit");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [propUser]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("bankDetails.")) {
      const fieldName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [fieldName]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle avatar image upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (e.g., PNG, JPEG).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const updatedUser = { ...user, avatar: reader.result };
        setUser(updatedUser);
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
        localStorage.setItem("userProfileData", JSON.stringify(updatedUser));
      };
      reader.onerror = () => {
        alert("Error reading the image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete avatar handler
  const handleDeleteAvatar = () => {
    const updatedUser = { ...user, avatar: null };
    setUser(updatedUser);
    setFormData((prev) => ({ ...prev, avatar: null }));
    localStorage.setItem("userProfileData", JSON.stringify(updatedUser));
  };

  // Trigger file input click
  const handleAvatarButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Handle password changes if provided
    if (formData.newPassword && formData.currentPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match!');
      }
      
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
    }

    // Handle transaction password changes if provided
    

    // Prepare profile data for update (excluding password fields)
    const profileUpdateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      panNumber: formData.panNumber,
      aadharNumber: formData.aadharNumber,
      bankDetails: {
        accountNumber: formData.bankDetails.accountNumber,
        ifscCode: formData.bankDetails.ifscCode,
        bankName: formData.bankDetails.bankName,
        accountHolderName: formData.bankDetails.accountHolderName
      }
    };

    // Update profile data
    const updatedUser = await updateProfile(profileUpdateData);

    // Update state with new data
    setUser(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        name: updatedUser.name || formData.name,
        email: updatedUser.email || formData.email,
        phone: updatedUser.phone || formData.phone,
        country: updatedUser.country || formData.country,
        panNumber: updatedUser.panNumber || formData.panNumber,
        aadharNumber: updatedUser.aadharNumber || formData.aadharNumber
      },
      bankDetails: updatedUser.bankDetails || formData.bankDetails,
      uiSettings: {
        profileViewState: 'view'
      }
    }));

    setIsEditing(false);
    window.dispatchEvent(new Event('profile-updated'));
  } catch (err) {
    setError(err.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};

  // Switch to edit mode
  const handleEdit = () => {
    // Reset form data to current user data when entering edit mode
    setFormData({
      ...user.basicInfo,
      bankDetails: { ...user.bankDetails },
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      currentTransactionPassword: "",
      newTransactionPassword: "",
      confirmTransactionPassword: "",
    });
    setIsEditing(true);
  };

  // Common input style
  const inputStyle = {
    border: "2px solid #E0E0E0",
    borderRadius: "8px",
    color: "#0A2463",
    backgroundColor: "#F5F5F5",
    transition: "all 0.3s",
  };

  // Common button style
  const buttonStyle = {
    background: "linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)",
    color: "white",
    borderRadius: "8px",
    transition: "all 0.3s",
    border: "none",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(58, 134, 255, 0.4)",
  };

  return (
    <div
      className="card mb-4 shadow-sm"
      style={{
        borderRadius: "12px",
        border: "none",
        backgroundColor: "white",
        boxShadow: "0 10px 25px rgba(58, 134, 255, 0.2)",
      }}
    >
      <div className="card-body p-4">
        {/* Avatar Section */}
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "#3A86FF",
                color: "white",
                fontSize: "40px",
              }}
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                user.basicInfo.name?.charAt(0) || "U"
              )}
            </div>
          </div>

          <h5
            className="fw-bold mb-1"
            style={{
              color: "#0A2463",
              textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
            }}
          >
            {user.basicInfo.name || "User Name"}
          </h5>
          <p className="text-muted mb-2">{user.basicInfo.country || "India"}</p>
          <p className="text-muted mb-3">
            {user.basicInfo.email || "user@example.com"}
          </p>

          <div className="d-flex gap-2 justify-content-center">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
            <button
              className="btn btn-sm px-4 py-2"
              style={{
                border: "2px solid #3A86FF",
                color: "#3A86FF",
                borderRadius: "8px",
                fontWeight: "500",
                transition: "all 0.3s",
                backgroundColor: "transparent",
              }}
              onClick={handleAvatarButtonClick}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#3A86FF";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#3A86FF";
              }}
            >
              Change Avatar
            </button>

            {user.avatar && (
              <button
                className="btn btn-sm px-4 py-2"
                style={{
                  border: "2px solid #dc3545",
                  color: "#dc3545",
                  borderRadius: "8px",
                  fontWeight: "500",
                  transition: "all 0.3s",
                  backgroundColor: "transparent",
                }}
                onClick={handleDeleteAvatar}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#dc3545";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#dc3545";
                }}
              >
                Delete Avatar
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center mb-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <h4
          className="fw-bold mb-4"
          style={{
            color: "#0A2463",
            textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
          }}
        >
          Profile Information
        </h4>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <h5
              className="fw-bold mb-3"
              style={{
                color: "#0A2463",
                textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
              }}
            >
              Personal Information
            </h5>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Full Name
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Email
              </label>
              <input
                type="email"
                className="form-control py-3"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Country
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                className="form-control py-3"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                PAN Number
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                style={inputStyle}
                placeholder="ABCDE1234F"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Enter valid PAN (e.g., ABCDE1234F)"
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Aadhar Number
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                style={inputStyle}
                placeholder="1234 5678 9012"
                pattern="[0-9]{12}"
                title="12-digit Aadhar number"
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Bank Details Section */}
            <h5
              className="fw-bold mb-3 mt-4"
              style={{
                color: "#0A2463",
                textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
              }}
            >
              Bank Details
            </h5>

            <div className="mb-3">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Account Holder Name
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="bankDetails.accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Account Number
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Bank Name
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                IFSC Code
              </label>
              <input
                type="text"
                className="form-control py-3"
                name="bankDetails.ifscCode"
                value={formData.bankDetails.ifscCode}
                onChange={handleChange}
                style={inputStyle}
                placeholder="ABCD0123456"
                pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                title="Enter valid IFSC code (e.g., ABCD0123456)"
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Section */}
            <hr
              className="my-4"
              style={{ borderColor: "rgba(10, 36, 99, 0.2)" }}
            />
            <h5
              className="fw-bold mb-4"
              style={{
                color: "#0A2463",
                textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
              }}
            >
              Change Password
            </h5>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Current Password
              </label>
              <input
                type="password"
                className="form-control py-3"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                New Password
              </label>
              <input
                type="password"
                className="form-control py-3"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control py-3"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Transaction Password Section */}
            <hr
              className="my-4"
              style={{ borderColor: "rgba(10, 36, 99, 0.2)" }}
            />
            <h5
              className="fw-bold mb-4"
              style={{
                color: "#0A2463",
                textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
              }}
            >
              Change Transaction Password
            </h5>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Current Transaction Password
              </label>
              <input
                type="password"
                className="form-control py-3"
                name="currentTransactionPassword"
                value={formData.currentTransactionPassword}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                New Transaction Password
              </label>
              <input
                type="password"
                className="form-control py-3"
                name="newTransactionPassword"
                value={formData.newTransactionPassword}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label fw-medium"
                style={{ color: "#0A2463" }}
              >
                Confirm New Transaction Password
              </label>
              <input
                type="password"
                className="form-control py-3"
                name="confirmTransactionPassword"
                value={formData.confirmTransactionPassword}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3A86FF";
                  e.target.style.boxShadow =
                    "0 0 0 0.25rem rgba(58, 134, 255, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E0E0E0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              className="btn w-100 py-3 fw-bold"
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = "0 6px 20px rgba(58, 134, 255, 0.6)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "0 4px 15px rgba(58, 134, 255, 0.4)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Update Profile
            </button>
          </form>
        ) : (
          <div className="profile-view">
            {/* Personal Information View */}
            <h5
              className="fw-bold mb-3"
              style={{
                color: "#0A2463",
                textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
              }}
            >
              Personal Information
            </h5>

            <div className="mb-4">
              <h6 className="text-muted mb-1">Full Name</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.name || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">Email</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.email || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">Country</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.country || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">Phone Number</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.phone || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">PAN Number</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.panNumber || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">Aadhar Number</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.aadharNumber || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">Left Referral Code</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.referralCodeLeft || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">Right Referral Code</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.basicInfo.referralCodeRight || "Not provided"}
              </p>
            </div>

            {/* Bank Details View */}
            <h5
              className="fw-bold mb-3 mt-4"
              style={{
                color: "#0A2463",
                textShadow: "1px 1px 2px rgba(58, 134, 255, 0.2)",
              }}
            >
              Bank Details
            </h5>

            <div className="mb-3">
              <h6 className="text-muted mb-1">Account Holder Name</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.bankDetails.accountHolderName || "Not provided"}
              </p>
            </div>

            <div className="mb-3">
              <h6 className="text-muted mb-1">Account Number</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.bankDetails.accountNumber || "Not provided"}
              </p>
            </div>

            <div className="mb-3">
              <h6 className="text-muted mb-1">Bank Name</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.bankDetails.bankName || "Not provided"}
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-muted mb-1">IFSC Code</h6>
              <p
                className="fw-medium"
                style={{ color: "#0A2463", fontSize: "1.1rem" }}
              >
                {user.bankDetails.ifscCode || "Not provided"}
              </p>
            </div>

            <button
              onClick={handleEdit}
              className="btn w-100 py-3 fw-bold mt-4"
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = "0 6px 20px rgba(58, 134, 255, 0.6)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "0 4px 15px rgba(58, 134, 255, 0.4)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 992px) {
          .card-body {
            padding: 1.5rem !important;
          }
          .form-control {
            font-size: 0.9rem !important;
            padding: 0.5rem 0.75rem !important;
          }
          .btn {
            font-size: 0.9rem !important;
          }
        }
        @media (max-width: 576px) {
          .card-body {
            padding: 1rem !important;
          }
          .form-control {
            font-size: 0.85rem !important;
          }
          .btn {
            font-size: 0.85rem !important;
            padding: 0.4rem 0.75rem !important;
          }
          h4,
          h5 {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileCard;
