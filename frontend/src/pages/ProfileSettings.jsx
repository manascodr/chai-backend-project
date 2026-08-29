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
 * ProfileSettings Component (Obsidian & Sunset Amber Studio Edition)
 * 
 * Account management control center:
 * 1. Channel Identity: Live avatar and cover banner photo update triggers.
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      <header className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">Studio & Account Settings</h1>
        <p className="text-sm text-zinc-400 mt-1 m-0">Customize your public channel profile, account details, and security.</p>
      </header>

      {/* Section 1: Channel Branding (Banner & Avatar) */}
      <section className="bg-[#121215] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-xl">
        <div className="flex flex-col gap-1 pb-4 border-b border-white/[0.08]">
          <h2 className="text-lg font-bold text-white tracking-tight m-0">Channel Branding</h2>
          <span className="text-xs text-zinc-400">Updates appear immediately across your channel page.</span>
        </div>

        {/* Cover Banner */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Cover Banner</label>
          <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-950 via-[#16161c] to-zinc-950 border border-white/[0.08] group">
            {user?.coverImage ? (
              <img
                className="w-full h-full object-cover"
                src={user.coverImage}
                alt="Cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#09090b] via-[#141418] to-[#09090b]" />
            )}
            <label
              className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/90 hover:bg-zinc-900 text-white text-xs font-bold border border-white/10 hover:border-amber-500/40 backdrop-blur-md cursor-pointer transition-all shadow-lg"
              htmlFor="coverInput"
            >
              <FiCamera className="text-amber-400" /> Change Banner
            </label>
            <input
              id="coverInput"
              className="hidden"
              type="file"
              accept="image/*"
              onChange={onCoverChange}
              disabled={busy}
            />
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Profile Photo</label>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-zinc-900 shrink-0">
              {user?.avatar ? (
                <img
                  className="w-full h-full object-cover"
                  src={user.avatar}
                  alt={user?.fullname || "Avatar"}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-400 text-2xl font-bold">
                  <FiUser />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 border border-white/10 hover:border-amber-500/40 text-xs font-bold cursor-pointer transition-all shadow-sm"
                htmlFor="avatarInput"
              >
                <FiCamera className="text-amber-400" /> Change Avatar Photo
              </label>
              <input
                id="avatarInput"
                className="hidden"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                disabled={busy}
              />
              <span className="text-xs text-zinc-500">Recommended: Square JPG or PNG, at least 400x400px.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Account details */}
      <section className="bg-[#121215] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-xl">
        <div className="pb-4 border-b border-white/[0.08]">
          <h2 className="text-lg font-bold text-white tracking-tight m-0">Personal Information</h2>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onUpdateAccount)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="fullname">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="fullname"
                  className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all"
                  autoComplete="name"
                  {...register("fullname", {
                    required: "Full name is required",
                    minLength: { value: 3, message: "Full name must be at least 3 characters" },
                  })}
                  disabled={busy}
                />
              </div>
              {errors.fullname && (
                <span className="text-xs text-rose-400">{errors.fullname.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="email"
                  className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                  })}
                  disabled={busy}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-rose-400">{errors.email.message}</span>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
              type="submit"
              disabled={busy || !isAccountDirty}
            >
              <FiSave /> {busy ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Section 3: Change password */}
      <section className="bg-[#121215] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-xl">
        <div className="flex flex-col gap-1 pb-4 border-b border-white/[0.08]">
          <h2 className="text-lg font-bold text-white tracking-tight m-0">Security & Password</h2>
          <span className="text-xs text-zinc-400">Ensure your account uses a secure password.</span>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmitPassword(onChangePassword)}
        >
          <div className="flex flex-col gap-2 max-w-md">
            <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="oldPassword">
              Current password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="oldPassword"
                className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all"
                type="password"
                autoComplete="current-password"
                {...registerPassword("oldPassword", {
                  required: "Current password is required",
                })}
                disabled={busy}
              />
            </div>
            {passwordErrors.oldPassword && (
              <span className="text-xs text-rose-400">
                {passwordErrors.oldPassword.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="newPassword">
                New password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="newPassword"
                  className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all"
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
                <span className="text-xs text-rose-400">
                  {passwordErrors.newPassword.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase font-bold text-zinc-300 tracking-wider" htmlFor="confirmNewPassword">
                Confirm new password
              </label>
              <div className="relative">
                <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="confirmNewPassword"
                  className="w-full bg-[#09090b] text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition-all"
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
                <span className="text-xs text-rose-400">
                  {passwordErrors.confirmNewPassword.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#141418] hover:bg-[#1c1c22] text-zinc-200 border border-white/10 hover:border-amber-500/30 text-sm font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50"
              type="submit"
              disabled={busy}
            >
              <FiLock className="text-amber-400" /> {busy ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProfileSettings;



