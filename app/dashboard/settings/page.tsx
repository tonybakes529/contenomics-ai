import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile, uploadAvatar } from "./actions";

export const metadata = { title: "Settings — Contenomics" };
export const dynamic = "force-dynamic";

type SearchParams = { error?: string; saved?: string };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const initials =
    (profile?.display_name ?? profile?.username ?? "?")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your profile and how your public bio page looks.
        </p>
      </div>

      {searchParams.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {searchParams.error}
        </div>
      ) : null}
      {searchParams.saved ? (
        <div
          role="status"
          className="border-border bg-muted/50 rounded-md border px-4 py-3 text-sm"
        >
          Changes saved.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Avatar</CardTitle>
          <CardDescription>
            PNG or JPG, square crop, under 2 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-muted size-16 shrink-0 overflow-hidden rounded-full">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center text-lg font-semibold">
                  {initials}
                </div>
              )}
            </div>
            <form action={uploadAvatar} className="flex flex-1 items-center gap-2">
              <Input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                required
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Upload
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>
            How you appear on your public bio page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-sm">
                  /
                </span>
                <Input
                  id="username"
                  name="username"
                  defaultValue={profile?.username ?? ""}
                  pattern="[a-z0-9_]{3,30}"
                  required
                  minLength={3}
                  maxLength={30}
                  className="font-mono"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                3–30 characters, lowercase letters, numbers, and underscores.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile?.display_name ?? ""}
                placeholder="Your name as you want it to appear"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio ?? ""}
                rows={3}
                maxLength={500}
                placeholder="One or two sentences about you"
              />
              <p className="text-muted-foreground text-xs">
                Up to 500 characters.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>Email is fixed for now.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium">{user.email}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
