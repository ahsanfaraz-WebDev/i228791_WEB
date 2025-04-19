"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Star } from "lucide-react"

export default function CoursesPage() {
  const [priceRange, setPriceRange] = useState([0, 200])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Mock data - in a real app, this would come from an API
  const courses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      thumbnail: "/placeholder.svg?height=200&width=350",
      tutor: "Sarah Johnson",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      price: 49.99,
      rating: 4.8,
      reviews: 128,
      category: "web",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      description: "Master advanced React concepts and patterns",
      thumbnail: "/placeholder.svg?height=200&width=350",
      tutor: "Michael Chen",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      price: 79.99,
      rating: 4.9,
      reviews: 86,
      category: "web",
    },
    {
      id: 3,
      title: "Data Structures & Algorithms",
      description: "Essential computer science concepts for interviews",
      thumbnail: "/placeholder.svg?height=200&width=350",
      tutor: "Emily Rodriguez",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      price: 89.99,
      rating: 4.7,
      reviews: 215,
      category: "cs",
    },
    {
      id: 4,
      title: "Machine Learning Fundamentals",
      description: "Introduction to machine learning concepts and applications",
      thumbnail: "/placeholder.svg?height=200&width=350",
      tutor: "David Kim",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      price: 99.99,
      rating: 4.6,
      reviews: 172,
      category: "ai",
    },
    {
      id: 5,
      title: "UX/UI Design Principles",
      description: "Learn to create beautiful and functional user interfaces",
      thumbnail: "/placeholder.svg?height=200&width=350",
      tutor: "Jessica Patel",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      price: 69.99,
      rating: 4.8,
      reviews: 94,
      category: "design",
    },
    {
      id: 6,
      title: "Python for Data Science",
      description: "Master Python for data analysis and visualization",
      thumbnail: "/placeholder.svg?height=200&width=350",
      tutor: "Robert Wilson",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      price: 59.99,
      rating: 4.7,
      reviews: 183,
      category: "data",
    },
  ]

  // Filter courses based on search, category, and price
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
    const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1]

    return matchesSearch && matchesCategory && matchesPrice
  })

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
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="ai">Artificial Intelligence</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
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
            <Select defaultValue="newest">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden flex flex-col">
                <div className="relative h-48 w-full">
                  <Image
                    src={course.thumbnail || "/placeholder.svg"}
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
                        src={course.tutorAvatar || "/placeholder.svg"}
                        alt={course.tutor}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm">{course.tutor}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="flex items-center mr-2">
                      <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                      <span>{course.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({course.reviews} reviews)</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <span className="font-bold">${course.price}</span>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/courses/${course.id}`}>View Course</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}
