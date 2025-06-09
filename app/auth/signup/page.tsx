import SignUp from "@/components/auth/Signup"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Sign up - Healthcare Platform",
    description: "Welcome to our healthcare platform, where you can find the best doctors, hospitals, and labs tailored to your needs.",
}

export default function Page() {
    return <SignUp />
}