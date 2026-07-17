// src/features/admin/settings/pages/AdminSettings.jsx
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider.jsx";
import { supabase } from "@/lib/supabase.js";
import AdminPageHeader from "@/features/admin/shared/components/AdminPageHeader.jsx";
import Button from "@/components/ui/Button.jsx";

export default function AdminSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    platform_name: "Covenant Learning",
    platform_description: "Built for marriage preparation and restoration.",
    default_course_price: 97,
    enable_registration: true,
    enable_partner_linking: true,
    enable_certificates: true,
    maintenance_mode: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save settings to database
      const { error } = await supabase
        .from("settings")
        .upsert({
          key: "platform_settings",
          value: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      showToast("Settings saved successfully!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast(error.message || "Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Settings"
        title="Platform settings"
        description="Manage system-wide settings, platform behavior, and operational preferences."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">General Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Basic platform information and branding.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platform_name}
                onChange={(e) =>
                  setSettings({ ...settings, platform_name: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Platform Description
              </label>
              <textarea
                value={settings.platform_description}
                onChange={(e) =>
                  setSettings({ ...settings, platform_description: e.target.value })
                }
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </section>

        {/* Course Settings */}
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Course Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Default course configuration.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Default Course Price (GBP)
              </label>
              <input
                type="number"
                value={settings.default_course_price}
                onChange={(e) =>
                  setSettings({ ...settings, default_course_price: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </section>

        {/* Feature Toggles */}
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Feature Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enable or disable platform features.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">User Registration</p>
                <p className="text-sm text-slate-500">
                  Allow new users to create accounts.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_registration}
                  onChange={(e) =>
                    setSettings({ ...settings, enable_registration: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Partner Linking</p>
                <p className="text-sm text-slate-500">
                  Allow users to link with partners.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_partner_linking}
                  onChange={(e) =>
                    setSettings({ ...settings, enable_partner_linking: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Certificates</p>
                <p className="text-sm text-slate-500">
                  Issue completion certificates.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_certificates}
                  onChange={(e) =>
                    setSettings({ ...settings, enable_certificates: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Maintenance Mode</p>
                <p className="text-sm text-slate-500">
                  Put the platform in maintenance mode.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) =>
                    setSettings({ ...settings, maintenance_mode: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}