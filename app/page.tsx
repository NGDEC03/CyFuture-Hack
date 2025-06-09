import Home from "@/components/Home/home"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to our healthcare platform, where you can find the best doctors, hospitals, and labs tailored to your needs.",
}

export default function Page() {
  return <Home />
}