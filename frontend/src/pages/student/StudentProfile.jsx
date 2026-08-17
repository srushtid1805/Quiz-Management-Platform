import { useEffect, useState } from "react";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const response = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.user);
        setSelectedAvatar(response.data.user.avatar || "");
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      setAvatarMessage("Please select an avatar first.");
      return;
    }

    try {
      setSavingAvatar(true);
      setAvatarMessage("");

      const token = localStorage.getItem("studentToken");

      const response = await api.put(
        "/auth/profile/avatar",
        {
          avatar: selectedAvatar
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data.user);

      const storedUser = JSON.parse(
        localStorage.getItem("studentUser") || "{}"
      );

      localStorage.setItem(
        "studentUser",
        JSON.stringify({
          ...storedUser,
          avatar: response.data.user.avatar
        })
      );

      setAvatarMessage("Avatar updated successfully.");
    } catch (error) {
      setAvatarMessage(
        error.response?.data?.message || "Failed to update avatar"
      );
    } finally {
      setSavingAvatar(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <p>Loading profile...</p>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="student-profile-error">{error}</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="student-profile-page">
        {/* HEADER */}
        <div className="student-profile-heading">
          <div>
            <h1>My Profile</h1>

            <p>View your account information and personalize your profile.</p>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="student-profile-card">
          {/* LEFT PROFILE AREA */}
          <div className="student-profile-left">
            <div className="student-profile-avatar">
              {user?.avatar
                ? getAvatarEmoji(user.avatar)
                : getInitials(user?.name)}
            </div>

            <h2>{user?.name || "Student"}</h2>

            <p className="student-profile-email">{user?.email}</p>

            <span
              className={
                user?.status === "ACTIVE"
                  ? "student-status-active"
                  : "student-status-inactive"
              }
            >
              {user?.status}
            </span>
          </div>

          {/* RIGHT DETAILS */}
          <div className="student-profile-details">
            <h3>Account Information</h3>

            <ProfileRow label="Full Name" value={user?.name} />

            <ProfileRow label="Email" value={user?.email} />

            <ProfileRow label="Role" value={user?.role} />

            <ProfileRow label="Account Status" value={user?.status} />
          </div>
        </div>

        {/* AVATAR PLACEHOLDER SECTION */}
        {/* AVATAR SECTION */}
        <div className="student-avatar-section">
          <h3>Profile Avatar</h3>

          <p>Choose an avatar to personalize your profile.</p>

          <div className="student-avatar-options">
            {avatarOptions.map((avatar) => {
              const selected = selectedAvatar === avatar.value;

              return (
                <button
                  key={avatar.value}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(avatar.value);

                    setAvatarMessage("");
                  }}
                  className={
                    selected
                      ? "student-avatar-option selected"
                      : "student-avatar-option"
                  }
                >
                  {avatar.emoji}
                </button>
              );
            })}
          </div>

          <div className="student-selected-avatar-preview">
            <span>Selected Avatar</span>

            <div className="student-avatar-preview">
              {selectedAvatar
                ? getAvatarEmoji(selectedAvatar)
                : getInitials(user?.name)}
            </div>
          </div>

          {avatarMessage && (
            <p className="student-avatar-message">{avatarMessage}</p>
          )}

          <button
            type="button"
            onClick={handleSaveAvatar}
            disabled={
              savingAvatar || !selectedAvatar || selectedAvatar === user?.avatar
            }
            className="student-avatar-save-button"
          >
            {savingAvatar
              ? "Saving..."
              : selectedAvatar === user?.avatar
                ? "Avatar Saved"
                : "Save Avatar"}
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

const ProfileRow = ({ label, value }) => {
  return (
    <div className="student-profile-row">
      <span>{label}</span>

      <strong>{value || "-"}</strong>
    </div>
  );
};

const avatarOptions = [
  {
    value: "cat",
    emoji: "🐱"
  },
  {
    value: "panda",
    emoji: "🐼"
  },
  {
    value: "fox",
    emoji: "🦊"
  },
  {
    value: "bear",
    emoji: "🐻"
  },
  {
    value: "rabbit",
    emoji: "🐰"
  }
];

const getAvatarEmoji = (avatar) => {
  return avatarOptions.find((item) => item.value === avatar)?.emoji;
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default StudentProfile;
