import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import DashboardStudent from "@/components/dashboard-student"
import DashboardTeacher from "@/components/dashboard-teacher"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  // Get user role from database
  // For now, we'll simulate this with a mock role
  const userRole = "student" // This would come from your database

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{userRole === "student" ? <DashboardStudent /> : <DashboardTeacher />}</main>
    </div>
  )
}
