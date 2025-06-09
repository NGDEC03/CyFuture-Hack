import ForgotPassword from "@/components/auth/ForgotPassword"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Forgot Password - Healthcare Platform",
    description: "Welcome to our healthcare platform, where you can find the best doctors, hospitals, and labs tailored to your needs.",
}

export default function Page() {
    return <ForgotPassword />
}