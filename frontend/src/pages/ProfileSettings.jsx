import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  changePassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../api/user.api";
import { useAuthStore } from "../stores/auth.store";
import { FiCamera, FiSave, FiLock, FiUser, FiMail, FiShield } from "react-icons/fi";

/**
 * ProfileSettings Component
 * 
 * Account management control center:
 * 1. Channel Identity: Live avatar and panoramic cover banner photo update triggers.
 * 2. Personal Information: Fullname and Email modifications.
 * 3. Security: Password renewal with confirmation matching.
 */
const ProfileSettings = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty: isAccountDirty },
  } = useForm({
    defaultValues: {
      fullname: user?.fullname || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const [busy, setBusy] = useState(false);

  /**
   * Change password
   */
  const onChangePassword = async (data) => {
    if (busy) return;
    setBusy(true);

    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      resetPasswordForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Update fullname & email
   */
  const onUpdateAccount = async (data) => {
    if (busy) return;
    setBusy(true);

    try {
      const res = await updateAccountDetails({
        fullname: data.fullname.trim(),
        email: data.email.trim(),
      });

      setUser(res.data.data);
      toast.success("Account details saved!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setBusy(false);
    }
  };

  /**
   * Update avatar photo
   */
  const onAvatarChange = async (e) => {
    if (busy) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);

    try {
      const res = await updateUserAvatar(file);
      setUser(res.data.data);
      toast.success("Avatar image updated!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update avatar",
      );
    } finally {
      setBusy(false);
    }
  };

  /**
   * Update banner cover image
   */
  const onCoverChange = async (e) => {
    if (busy) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);

    try {
      const res = await updateUserCoverImage(file);
      setUser(res.data.data);
      toast.success("Channel banner updated!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update banner",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page profile-settings">
      <header className="page__header">
        <div>
          <h1 className="page__title">Account & Channel Settings</h1>
          <p className="page__subtitle">Customize your public channel profile, account details, and security.</p>
        </div>
      </header>

      {/* Section 1: Channel Branding (Banner & Avatar) */}
      <section className="profile-settings__section" aria-label="Channel Branding">
        <div className="profile-settings__sectionHeader">
          <h2 className="profile-settings__sectionTitle">Channel Branding</h2>
          <span className="profile-settings__hint">Updates appear immediately across your channel page.</span>
        </div>

        {/* Cover Banner */}
        <div className="profile-settings__coverBlock">
          <label className="field__label">Cover Banner</label>
          <div className="profile-settings__cover">
            {user?.coverImage ? (
              <img
                className="profile-settings__coverImg"
                src={user.coverImage}
                alt="Cover"
                loading="lazy"
              />
            ) : (
              <div className="profile-settings__coverPlaceholder" />
            )}
            <label className="btn btn-secondary profile-settings__changeCoverBtn" htmlFor="coverInput">
              <FiCamera /> Change Banner
            </label>
            <input
              id="coverInput"
              className="profile-settings__fileInput"
              type="file"
              accept="image/*"
              onChange={onCoverChange}
              disabled={busy}
            />
          </div>
        </div>

        {/* Avatar */}
        <div className="profile-settings__avatarBlock">
          <label className="field__label">Profile Photo</label>
          <div className="profile-settings__avatarRow">
            <div className="profile-settings__avatar">
              {user?.avatar ? (
                <img
                  className="profile-settings__avatarImg"
                  src={user.avatar}
                  alt={user?.fullname || "Avatar"}
                  loading="lazy"
                />
              ) : (
                <div className="profile-settings__avatarImg profile-settings__avatarImg--placeholder">
                  <FiUser />
                </div>
              )}
            </div>

            <div className="profile-settings__avatarMeta">
              <label className="btn btn-secondary" htmlFor="avatarInput">
                <FiCamera /> Change Avatar Photo
              </label>
              <input
                id="avatarInput"
                className="profile-settings__fileInput"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                disabled={busy}
              />
              <span className="profile-settings__fileHint">Recommended: Square JPG or PNG, at least 400x400px.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Account details */}
      <section className="profile-settings__section" aria-label="Account details">
        <div className="profile-settings__sectionHeader">
          <h2 className="profile-settings__sectionTitle">Personal Information</h2>
        </div>

        <form className="form profile-settings__form" onSubmit={handleSubmit(onUpdateAccount)}>
          <div className="field__grid">
            <div className="field">
              <label className="field__label" htmlFor="fullname">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <FiUser className="auth-input-icon" />
                <input
                  id="fullname"
                  className="input auth-input"
                  autoComplete="name"
                  {...register("fullname", {
                    required: "Full name is required",
                    minLength: { value: 3, message: "Full name must be at least 3 characters" },
                  })}
                  disabled={busy}
                />
              </div>
              {errors.fullname && (
                <span className="field__error">{errors.fullname.message}</span>
              )}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  id="email"
                  className="input auth-input"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                  })}
                  disabled={busy}
                />
              </div>
              {errors.email && (
                <span className="field__error">{errors.email.message}</span>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary profile-settings__submitBtn"
            type="submit"
            disabled={busy || !isAccountDirty}
          >
            <FiSave /> {busy ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Section 3: Change password */}
      <section className="profile-settings__section" aria-label="Change password">
        <div className="profile-settings__sectionHeader">
          <h2 className="profile-settings__sectionTitle">Security & Password</h2>
          <span className="profile-settings__hint">Ensure your account uses a secure password.</span>
        </div>

        <form
          className="form profile-settings__form"
          onSubmit={handleSubmitPassword(onChangePassword)}
        >
          <div className="field">
            <label className="field__label" htmlFor="oldPassword">
              Current password
            </label>
            <div className="auth-input-wrapper">
              <FiLock className="auth-input-icon" />
              <input
                id="oldPassword"
                className="input auth-input"
                type="password"
                autoComplete="current-password"
                {...registerPassword("oldPassword", {
                  required: "Current password is required",
                })}
                disabled={busy}
              />
            </div>
            {passwordErrors.oldPassword && (
              <span className="field__error">
                {passwordErrors.oldPassword.message}
              </span>
            )}
          </div>

          <div className="field__grid">
            <div className="field">
              <label className="field__label" htmlFor="newPassword">
                New password
              </label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  id="newPassword"
                  className="input auth-input"
                  type="password"
                  autoComplete="new-password"
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: { value: 6, message: "Must be at least 6 characters" },
                  })}
                  disabled={busy}
                />
              </div>
              {passwordErrors.newPassword && (
                <span className="field__error">
                  {passwordErrors.newPassword.message}
                </span>
              )}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="confirmNewPassword">
                Confirm new password
              </label>
              <div className="auth-input-wrapper">
                <FiShield className="auth-input-icon" />
                <input
                  id="confirmNewPassword"
                  className="input auth-input"
                  type="password"
                  autoComplete="new-password"
                  {...registerPassword("confirmNewPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === watchPassword("newPassword") || "Passwords do not match",
                  })}
                  disabled={busy}
                />
              </div>
              {passwordErrors.confirmNewPassword && (
                <span className="field__error">
                  {passwordErrors.confirmNewPassword.message}
                </span>
              )}
            </div>
          </div>

          <button
            className="btn btn-secondary profile-settings__submitBtn"
            type="submit"
            disabled={busy}
          >
            <FiLock /> {busy ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>
    </section>
  );
};

export default ProfileSettings;
