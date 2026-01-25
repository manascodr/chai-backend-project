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

const ProfileSettings = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      resetPasswordForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Update fullname
   */
  const onUpdateAccount = async (data) => {
    if (busy) return;
    setBusy(true);

    try {
      const res = await updateAccountDetails({
        fullname: data.fullname,
        email: data.email,
      });

      setUser(res.data.data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setBusy(false);
    }
  };

  /**
   * Update avatar
   */
  const onAvatarChange = async (e) => {
    if (busy) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);

    try {
      const res = await updateUserAvatar(file);
      setUser(res.data.data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update avatar"
      );
    } finally {
      setBusy(false);
    }
  };

  /**
   * Update cover image
   */
  const onCoverChange = async (e) => {
    if (busy) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);

    try {
      const res = await updateUserCoverImage(file);
      setUser(res.data.data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update cover image"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="profile-settings">
      <header className="profile-settings__header">
        <h1 className="profile-settings__title">Profile Settings</h1>
      </header>

      {/* Section 1: Cover image */}
      <section className="profile-settings__section">
        <div className="profile-settings__sectionHeader">
          <h2 className="profile-settings__sectionTitle">Cover image</h2>
        </div>

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
        </div>

        <div className="profile-settings__actions">
          <label className="profile-settings__button" htmlFor="coverInput">
            Change cover image
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
      </section>

      {/* Section 2: Avatar */}
      <section className="profile-settings__section">
        <div className="profile-settings__sectionHeader">
          <h2 className="profile-settings__sectionTitle">Avatar</h2>
        </div>

        <div className="profile-settings__avatar">
          {user?.avatar ? (
            <img
              className="profile-settings__avatarImg"
              src={user.avatar}
              alt="Avatar"
              loading="lazy"
            />
          ) : (
            <div className="profile-settings__avatarImg profile-settings__avatarImg--placeholder" />
          )}
        </div>

        <div className="profile-settings__actions">
          <label className="profile-settings__button" htmlFor="avatarInput">
            Change avatar
          </label>
          <input
            id="avatarInput"
            className="profile-settings__fileInput"
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            disabled={busy}
          />
        </div>
      </section>

      {/* Section 3: Account details */}
      <section className="profile-settings__section">
        <div className="profile-settings__sectionHeader">
          <h2 className="profile-settings__sectionTitle">Account details</h2>
        </div>

        <form className="profile-settings__form" onSubmit={handleSubmit(onUpdateAccount)}>
          <div className="profile-settings__field">
            <label className="profile-settings__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="profile-settings__input"
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
              })}
              disabled={busy}
            />
            {errors.email && (
              <span className="profile-settings__error">{errors.email.message}</span>
            )}
          </div>

          <div className="profile-settings__field">
            <label className="profile-settings__label" htmlFor="fullname">
              Full Name
            </label>
            <input
              id="fullname"
              className="profile-settings__input"
              autoComplete="name"
              {...register("fullname", {
                required: "Full name is required",
                minLength: { value: 3, message: "Too short" },
              })}
              disabled={busy}
            />
            {errors.fullname && (
              <span className="profile-settings__error">{errors.fullname.message}</span>
            )}
          </div>

          <button
            className="profile-settings__button profile-settings__button--primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      {/* Section 4: Change password */}
      <section className="profile-settings__section">
        <div className="profile-settings__sectionHeader">
          <h2 className="profile-settings__sectionTitle">Change password</h2>
        </div>

        <p className="profile-settings__hint">
          Use a strong password you don’t reuse elsewhere.
        </p>

        <form
          className="profile-settings__form"
          onSubmit={handleSubmitPassword(onChangePassword)}
        >
          <div className="profile-settings__field">
            <label className="profile-settings__label" htmlFor="oldPassword">
              Current password
            </label>
            <input
              id="oldPassword"
              className="profile-settings__input"
              type="password"
              autoComplete="current-password"
              {...registerPassword("oldPassword", {
                required: "Current password is required",
              })}
              disabled={busy}
            />
            {passwordErrors.oldPassword && (
              <span className="profile-settings__error">
                {passwordErrors.oldPassword.message}
              </span>
            )}
          </div>

          <div className="profile-settings__grid">
            <div className="profile-settings__field">
              <label className="profile-settings__label" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                className="profile-settings__input"
                type="password"
                autoComplete="new-password"
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Must be at least 6 characters" },
                })}
                disabled={busy}
              />
              {passwordErrors.newPassword && (
                <span className="profile-settings__error">
                  {passwordErrors.newPassword.message}
                </span>
              )}
            </div>

            <div className="profile-settings__field">
              <label className="profile-settings__label" htmlFor="confirmNewPassword">
                Confirm new password
              </label>
              <input
                id="confirmNewPassword"
                className="profile-settings__input"
                type="password"
                autoComplete="new-password"
                {...registerPassword("confirmNewPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === watchPassword("newPassword") || "Passwords do not match",
                })}
                disabled={busy}
              />
              {passwordErrors.confirmNewPassword && (
                <span className="profile-settings__error">
                  {passwordErrors.confirmNewPassword.message}
                </span>
              )}
            </div>
          </div>

          <button
            className="profile-settings__button profile-settings__button--primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>
    </section>
  );
};

export default ProfileSettings;
