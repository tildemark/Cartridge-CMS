import { getSettings } from "@/lib/db/settings";
import SettingsForm from "@/components/admin/SettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  let settingsData = {
    site_name: "",
    site_description: "",
    site_url: "",
    posts_per_page: "10",
    active_theme: "clarity",
  };

  try {
    const fetched = await getSettings([
      "site_name",
      "site_description",
      "site_url",
      "posts_per_page",
      "active_theme",
    ]);

    settingsData = {
      site_name: fetched.site_name ?? "",
      site_description: fetched.site_description ?? "",
      site_url: fetched.site_url ?? "",
      posts_per_page: fetched.posts_per_page ?? "10",
      active_theme: fetched.active_theme ?? "clarity",
    };
  } catch {
    // DB not ready
  }

  return <SettingsForm initial={settingsData} />;
}
