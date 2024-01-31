import React, { useState, useEffect } from "react";
import { useParams, useNavigate,Link } from "react-router-dom";
import styles from "./EditProfile.module.css";
import DeleteIcon from '@mui/icons-material/Delete';
import RealmLogo from "./RealmLogo";

const EditProfileForm = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    isChildProfile: false,
    pin: "",
    profilePhoto: null,
  });
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false); // New state for displaying the popup

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://192.168.30.118:8800/profile-details/${profileId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        if (data.success) {
          const fetchedProfile = data.profile;
          setProfileData({
            name: fetchedProfile.name,
            isChildProfile: fetchedProfile.isChildProfile,
            pin: fetchedProfile.pin,
            profilePhoto: fetchedProfile.profilePhotoPath,
          });

          // Determine if the delete button should be disabled based on the server response
          setIsDeleteButtonDisabled(data.isDeleteButtonDisabled);
        } else {
          throw new Error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    fetchProfile();
  }, [profileId]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this profile?");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://192.168.30.118:8800/edit-profile/${profileId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to delete profile");
        }

        console.log("Profile deleted successfully:", data.message);
        setShowDeletePopup(true); // Set the state to display the popup

        setTimeout(() => {
          setShowDeletePopup(false); // Hide the popup after 3 seconds
          navigate("/profiles");
        }, 1500);
      } catch (error) {
        console.error("Error deleting profile:", error.message);
        // Handle error (e.g., show an error message)
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("isChildProfile", profileData.isChildProfile ? 1 : 0);
      formData.append("pin", profileData.pin);
      formData.append("profilePhoto", profileData.profilePhoto);

      const response = await fetch(
        `http://192.168.30.118:8800/edit-profile/${profileId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      console.log("Profile updated successfully:", data.message);
      navigate("/profiles");
      // Optionally, perform actions after successful update (e.g., show success message, redirect, etc.)
    } catch (error) {
      console.error("Error updating profile:", error.message);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div>
      <Link to="/profiles"><RealmLogo /></Link> 
   
    <div className={styles.editprofilecontainer}>
      <h2>Edit Profile</h2>
      {showDeletePopup && (
        <div className={styles.deletePopup}>
          <h4> ✅ Profile Deleted successfully </h4>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={profileData.name}
          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
          required
        />

        <label>Is Child Profile:</label>
        <input
          type="checkbox"
          name="isChildProfile"
          checked={profileData.isChildProfile}
          onChange={(e) => setProfileData({ ...profileData, isChildProfile: e.target.checked })}
        />

        <label>PIN:</label>
        <input
          type="text"
          name="pin"
          value={profileData.pin}
          onChange={(e) => setProfileData({ ...profileData, pin: e.target.value })}
        />

        <label>Profile Photo:</label>
        <input
          type="file"
          name="profilePhoto"
          onChange={(e) => setProfileData({ ...profileData, profilePhoto: e.target.files[0] })}
          accept="image/*"
        />

        <button type="submit">Update Profile</button>
        <button type="button" onClick={handleDelete} className={styles.deletebutton} disabled={isDeleteButtonDisabled}>
          <DeleteIcon />
        </button>
      </form>
    </div>
    </div>
  );
};

export default EditProfileForm;
