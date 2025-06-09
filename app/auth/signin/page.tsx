import SignIn from "@/components/auth/Signin"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Sign in - Healthcare Platform",
    description: "Welcome to our healthcare platform, where you can find the best doctors, hospitals, and labs tailored to your needs.",
}

export default function Page() {
    return <SignIn />
}