import { useEffect, useState } from "react";

import StudentLayout from "../../components/StudentLayout";
import api from "../../services/api";

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("studentToken");

        const response = await api.get(
          "/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setUser(response.data.user);

      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
        <div className="student-profile-error">
          {error}
        </div>
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

            <p>
              View your account information and
              personalize your profile.
            </p>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="student-profile-card">

          {/* LEFT PROFILE AREA */}
          <div className="student-profile-left">

            <div className="student-profile-avatar">
              {getInitials(user?.name)}
            </div>

            <h2>
              {user?.name || "Student"}
            </h2>

            <p className="student-profile-email">
              {user?.email}
            </p>

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

            <ProfileRow
              label="Full Name"
              value={user?.name}
            />

            <ProfileRow
              label="Email"
              value={user?.email}
            />

            <ProfileRow
              label="Role"
              value={user?.role}
            />

            <ProfileRow
              label="Account Status"
              value={user?.status}
            />

          </div>
        </div>

        {/* AVATAR PLACEHOLDER SECTION */}
        <div className="student-avatar-section">

          <h3>Profile Avatar</h3>

          <p>
            Your profile currently uses your initials.
            Soon you can choose from preset avatars.
          </p>

          <div className="student-avatar-preview">
            {getInitials(user?.name)}
          </div>

        </div>

      </div>
    </StudentLayout>
  );
};

const ProfileRow = ({
  label,
  value
}) => {
  return (
    <div className="student-profile-row">

      <span>
        {label}
      </span>

      <strong>
        {value || "-"}
      </strong>

    </div>
  );
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