import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { toast } from "react-hot-toast";
import { Plus, User, ImagePlus, ArrowLeft, X } from "lucide-react";
import DashboardLayout from "@layouts/DashboardLayout";
import PageLoader from "@shared/components/ui/PageLoader";
import { getProfile, updateProfile, type UserProfile } from "../services/profile.service";
import { useNavigate } from "react-router-dom";

const PLATFORM_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "website", label: "Website" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
];

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  // Local states for complex fields
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [links, setLinks] = useState<{ platform: string; url: string }[]>([
    { platform: "github", url: "" },
    { platform: "linkedin", url: "" },
  ]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      if (data?.success && data.user) {
        setProfile(data.user);
        if (data.user.avatar) setAvatarPreview(data.user.avatar);

        if (data.user.skills && Array.isArray(data.user.skills)) {
          setSkills(data.user.skills);
        }

        if (data.user.users_links && typeof data.user.users_links === "object") {
          const entries = Object.entries(data.user.users_links);
          if (entries.length > 0) {
            const linksArr = entries.map(([k, v]) => ({
              platform: k,
              url: v as string,
            }));
            setLinks(linksArr);
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      VALIDATION
  ========================= */

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /* =========================
      AVATAR
  ========================= */

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /* =========================
      SKILLS
  ========================= */

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  /* =========================
      LINKS
  ========================= */

  const addLink = () => setLinks([...links, { platform: "", url: "" }]);

  const handleLinkChange = (index: number, field: "platform" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  /* =========================
      SUBMIT
  ========================= */

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!profile.name?.trim()) {
      toast.error("Full name is required");
      return;
    }

    const invalidLink = links.find((link) => link.url && !isValidUrl(link.url));
    if (invalidLink) {
      toast.error(`Invalid URL for platform: ${invalidLink.platform || "unknown"}`);
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      if (profile.name) formData.append("name", profile.name);
      if (profile.bio) formData.append("bio", profile.bio);
      if (profile.headline !== undefined) formData.append("headline", profile.headline ?? "");
      if (profile.is_public !== undefined) formData.append("is_public", String(profile.is_public));
      if (avatarFile) formData.append("avatar", avatarFile);

      formData.append("skills", JSON.stringify(skills));

      const formattedLinks: Record<string, string> = {};
      links.forEach((l) => {
        if (l.platform && l.url) {
          formattedLinks[l.platform.trim()] = l.url.trim();
        }
      });
      formData.append("users_links", JSON.stringify(formattedLinks));

      const res = await updateProfile(formData);

      if (res?.success) {
        toast.success("Profile updated successfully");
        if (profile.name) localStorage.setItem("userName", profile.name);
        if (res.user?.avatar) localStorage.setItem("userAvatar", res.user.avatar);
      } else {
        throw new Error("Update failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <DashboardLayout>

      {/* =========================
          HEADER
      ========================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>

          <button
            onClick={() => navigate(-1)}
            className="
              mb-3
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-[var(--text-secondary)]
              transition-all
              duration-300
              hover:text-[var(--text-primary)]
            "
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 className="text-3xl font-bold">Profile Settings</h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Manage your personal information and public profile
          </p>

        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="
            rounded-2xl
            bg-[var(--button-primary)]
            px-5
            py-3
            font-medium
            text-white
            transition-all
            duration-300
            hover:bg-[var(--button-primary-hover)]
            disabled:opacity-50
            dark:text-black
          "
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

      </div>

      {/* =========================
          MAIN GRID
      ========================= */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-3
          pb-12
        "
      >
        {/* =========================
            LEFT
        ========================= */}

        <div className="xl:col-span-2">

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            {/* BASIC INFO */}

            <h2
              className="
                mb-6
                flex
                items-center
                gap-2
                text-xl
                font-semibold
              "
            >
              <User size={20} className="text-[var(--button-primary)]" />
              Basic Information
            </h2>

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium">Full Name *</label>
              <input
                required
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter full name"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  outline-none
                "
              />
            </div>

            {/* BIO */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Bio</label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={5}
                placeholder="Tell us about yourself..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  outline-none
                "
              />
            </div>

            {/* HEADLINE */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Headline
              </label>
              <input
                type="text"
                value={profile.headline || ""}
                onChange={(e) =>
                  setProfile({ ...profile, headline: e.target.value })
                }
                placeholder="e.g. Full-Stack Developer & AI Enthusiast"
                maxLength={255}
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  outline-none
                "
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Short tagline shown prominently on your public portfolio.
              </p>
            </div>


            {/* SKILLS */}

            <div className="mt-6">

              <label className="mb-3 block text-sm font-medium">
                Skills / Technologies
              </label>

              <div className="flex gap-3">

                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill (e.g. React)"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[var(--border-color)]
                    bg-[var(--bg-main)]
                    px-4
                    py-3
                    outline-none
                  "
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[var(--button-primary)]
                    px-5
                    text-white
                    dark:text-black
                  "
                >
                  <Plus size={18} />
                </button>

              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-[var(--bg-secondary)]
                      px-4
                      py-2
                      text-sm
                    "
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

            </div>

            {/* SOCIAL LINKS */}

            <div className="mt-6">

              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium">Social Links</label>
                <button
                  type="button"
                  onClick={addLink}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[var(--button-primary)]
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-white
                    dark:text-black
                  "
                >
                  <Plus size={16} />
                  Add Link
                </button>
              </div>

              <div className="space-y-4">

                {links.length === 0 && (
                  <p className="text-sm italic text-[var(--text-muted)]">No links added yet.</p>
                )}

                {links.map((link, idx) => {
                  const selectedPlatforms = links.map(l => l.platform);
                  
                  return (
                    <div
                      key={idx}
                      className="
                        grid
                        grid-cols-1
                        gap-4
                        rounded-2xl
                        border
                        border-[var(--border-color)]
                        bg-[var(--bg-main)]
                        p-4
                        md:grid-cols-12
                      "
                    >
                      {/* Platform */}
                      <div className="md:col-span-3">
                        <select
                          value={link.platform}
                          onChange={(e) => handleLinkChange(idx, "platform", e.target.value)}
                          className="
                            w-full
                            rounded-xl
                            border
                            border-[var(--border-color)]
                            bg-[var(--bg-card)]
                            px-4
                            py-3
                            outline-none
                          "
                        >
                          <option value="">Select</option>
                          {PLATFORM_OPTIONS.map((opt) => {
                            const isUsed = selectedPlatforms.includes(opt.value);
                            const isThis = link.platform === opt.value;
                            if (isUsed && !isThis) return null;
                            return (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* URL */}
                    <div className="md:col-span-8">
                      <input
                        type="url"
                        placeholder="URL (e.g. https://github.com/...)"
                        value={link.url}
                        onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                        className={`
                          w-full
                          rounded-xl
                          border
                          px-4
                          py-3
                          outline-none
                          bg-[var(--bg-card)]
                          ${link.url && !isValidUrl(link.url)
                            ? "border-red-400"
                            : "border-[var(--border-color)]"
                          }
                        `}
                      />
                      {link.url && !isValidUrl(link.url) && (
                        <p className="mt-2 text-xs text-red-500">Invalid URL format</p>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeLink(idx)}
                      className="
                        flex
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-red-200
                        text-red-500
                        transition-all
                        duration-300
                        hover:bg-red-50
                      "
                    >
                      <X size={18} />
                    </button>

                  </div>
                )})}

              </div>

            </div>

          </div>
        </div>

        {/* =========================
            RIGHT
        ========================= */}

        <div className="space-y-6">

          {/* AVATAR */}

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <h2 className="text-lg font-semibold">Avatar</h2>

            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <label
              htmlFor="avatar-upload"
              className="
                mt-5
                flex
                h-64
                cursor-pointer
                flex-col
                items-center
                justify-center
                overflow-hidden
                rounded-3xl
                border-2
                border-dashed
                border-[var(--border-color)]
                bg-[var(--bg-main)]
                transition-all
                duration-300
                hover:border-[var(--button-primary)]
              "
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <ImagePlus
                    size={42}
                    className="text-[var(--text-secondary)]"
                  />
                  <p className="mt-4 text-sm text-[var(--text-secondary)]">
                    Click to upload avatar
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    PNG, JPG, WEBP
                  </p>
                </>
              )}
            </label>

          </div>

          {/* ACCOUNT DETAILS */}

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <h2 className="text-lg font-semibold">Account Details</h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">Username</label>
              <input
                type="text"
                disabled
                value={profile.username || ""}
                className="
                  w-full
                  cursor-not-allowed
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  opacity-70
                  outline-none
                "
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                disabled
                value={profile.email || ""}
                className="
                  w-full
                  cursor-not-allowed
                  rounded-2xl
                  border
                  border-[var(--border-color)]
                  bg-[var(--bg-main)]
                  px-4
                  py-3
                  opacity-70
                  outline-none
                "
              />
            </div>

          </div>

          {/* VISIBILITY */}

          <div
            className="
              rounded-[32px]
              border
              border-[var(--border-color)]
              bg-[var(--bg-card)]
              p-6
            "
          >
            <h2 className="text-lg font-semibold">Visibility</h2>

            <div
              className="
                mt-6
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h3 className="font-medium">Public Profile</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Make your portfolio visible
                </p>
              </div>

              <button
                type="button"
                onClick={() => setProfile({ ...profile, is_public: !profile.is_public })}
                className={`
                  relative
                  h-7
                  w-12
                  rounded-full
                  transition-all
                  duration-300
                  ${profile.is_public ? "bg-[var(--button-primary)]" : "bg-gray-300"}
                `}
              >
                <div
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    transition-all
                    duration-300
                    ${profile.is_public ? "right-1" : "left-1"}
                  `}
                />
              </button>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Profile;
