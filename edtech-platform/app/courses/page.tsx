"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Star } from "lucide-react";
import { CourseService, type Course } from "@/lib/services/course-service";
import { toast } from "@/components/ui/use-toast";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function CoursesPage() {
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce price range to avoid too many requests
  const debouncedPriceRange = useDebounce(priceRange, 500);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // Map the sorting option to the API parameters
        let sort = "created_at";
        let order: "asc" | "desc" = "desc";

        switch (sortOption) {
          case "newest":
            sort = "created_at";
            order = "desc";
            break;
          case "popular":
            sort = "popular";
            break;
          case "price-low":
            sort = "price-low";
            break;
          case "price-high":
            sort = "price-high";
            break;
          case "rating":
            sort = "rating";
            break;
        }

        const coursesData = await CourseService.getFilteredCourses({
          category: categoryFilter === "all" ? undefined : categoryFilter,
          minPrice: debouncedPriceRange[0],
          maxPrice: debouncedPriceRange[1],
          sort,
          order,
        });

        // Client-side search filtering (since the API doesn't support search yet)
        const filteredBySearch = searchQuery
          ? coursesData.filter(
              (course) =>
                course.title
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                course.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
          : coursesData;

        setCourses(filteredBySearch);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [categoryFilter, debouncedPriceRange, searchQuery, sortOption]);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Browse Courses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm text-muted-foreground">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={200}
                  step={1}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4.5">4.5 & Above</SelectItem>
                    <SelectItem value="4.0">4.0 & Above</SelectItem>
                    <SelectItem value="3.5">3.5 & Above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden flex flex-col">
                  <div className="relative h-48 w-full">
                    <Image
                      src={
                        course.thumbnail_url ||
                        "/placeholder.svg?height=200&width=350"
                      }
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <div className="flex items-center mb-2">
                      <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                        <Image
                          src={
                            course.tutor?.avatar_url ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={course.tutor?.full_name || "Instructor"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm">
                        {course.tutor?.full_name || "Instructor"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="flex items-center mr-2">
                        <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                        <span>4.7</span>
                      </div>
                      <span className="text-muted-foreground">
                        (reviews coming soon)
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center border-t pt-4">
                    <span className="font-bold">${course.price}</span>
                    <Button
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Link href={`/courses/${course.id}`}>View Course</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && courses.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}
