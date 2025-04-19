"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/user-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the form schema
const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z
    .string()
    .max(500, {
      message: "Bio must not exceed 500 characters.",
    })
    .optional(),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      bio: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Get profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);

        // Set form values
        form.reset({
          full_name: data.full_name || "",
          email: user.email || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, form]);

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);

      const supabase = createClient();

      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update avatar_url in form
      const avatarUrl = filePath;
      form.setValue("avatar_url", avatarUrl);

      toast({
        title: "Upload Successful",
        description: "Your avatar has been updated.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;

    try {
      const supabase = createClient();

      // Update the profile
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          bio: values.bio,
          avatar_url: values.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Refresh profile data
      setProfile((prev) => ({
        ...prev,
        full_name: values.full_name,
        bio: values.bio,
        avatar_url: values.avatar_url,
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <p>Please log in to view your profile.</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Log In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="view">View Profile</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          {profile?.role === "tutor" && (
            <TabsTrigger value="tutor">Tutor Info</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.full_name}
                size="xl"
              />
              <div>
                <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Role: {profile?.role || "Student"}</p>
                  <p>
                    Member since:{" "}
                    {new Date(profile?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">About</h3>
                  <p className="mt-2 text-muted-foreground">
                    {profile?.bio || "No bio provided."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information. Changes will be visible to
                others.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <UserAvatar
                      src={form.watch("avatar_url")}
                      name={form.watch("full_name")}
                      size="xl"
                    />
                    <div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("avatar-upload")?.click()
                        }
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Change Avatar"}
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormDescription>
                          Email cannot be changed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          You can @mention other users and organizations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Update Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {profile?.role === "tutor" && (
          <TabsContent value="tutor">
            <Card>
              <CardHeader>
                <CardTitle>Tutor Information</CardTitle>
                <CardDescription>
                  Manage your instructor profile and teaching credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Teaching Experience
                  </h3>
                  <Textarea
                    placeholder="Describe your teaching experience"
                    value={profile?.teaching_experience || ""}
                    onChange={async (e) => {
                      try {
                        const supabase = createClient();
                        await supabase
                          .from("profiles")
                          .update({ teaching_experience: e.target.value })
                          .eq("id", user?.id);

                        setProfile((prev) => ({
                          ...prev,
                          teaching_experience: e.target.value,
                        }));

                        toast({
                          title: "Updated",
                          description:
                            "Your teaching experience has been updated.",
                        });
                      } catch (error) {
                        console.error(
                          "Error updating teaching experience:",
                          error
                        );
                        toast({
                          title: "Update Failed",
                          description: "Failed to update teaching experience.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="resize-none h-24"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Credentials & Certifications
                  </h3>
                  <Textarea
                    placeholder="List your credentials and certifications"
                    value={profile?.credentials || ""}
                    onChange={async (e) => {
                      try {
                        const supabase = createClient();
                        await supabase
                          .from("profiles")
                          .update({ credentials: e.target.value })
                          .eq("id", user?.id);

                        setProfile((prev) => ({
                          ...prev,
                          credentials: e.target.value,
                        }));

                        toast({
                          title: "Updated",
                          description: "Your credentials have been updated.",
                        });
                      } catch (error) {
                        console.error("Error updating credentials:", error);
                        toast({
                          title: "Update Failed",
                          description: "Failed to update credentials.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="resize-none h-24"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Teaching Areas</h3>
                  <div className="grid gap-2">
                    <Input
                      placeholder="e.g., Web Development, Mathematics"
                      value={profile?.teaching_areas || ""}
                      onChange={async (e) => {
                        try {
                          const supabase = createClient();
                          await supabase
                            .from("profiles")
                            .update({ teaching_areas: e.target.value })
                            .eq("id", user?.id);

                          setProfile((prev) => ({
                            ...prev,
                            teaching_areas: e.target.value,
                          }));

                          toast({
                            title: "Updated",
                            description:
                              "Your teaching areas have been updated.",
                          });
                        } catch (error) {
                          console.error(
                            "Error updating teaching areas:",
                            error
                          );
                          toast({
                            title: "Update Failed",
                            description: "Failed to update teaching areas.",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Separate multiple areas with commas
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => router.push("/dashboard/courses/create")}
                  className="w-full"
                >
                  Create New Course
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
