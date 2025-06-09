import Home from "@/components/Home/home"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to our healthcare platform, where you can find the best doctors, hospitals, and labs tailored to your needs.",
  openGraph: {
    title: "Home",
    description: "Welcome to our healthcare platform, where you can find the best doctors, hospitals, and labs tailored to your needs.",
    url: "https://yourwebsite.com/home",
    siteName: "Healthcare Platform",
    images: [
      {
        url: "https://yourwebsite.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Healthcare Platform Home Page"
      }
    ],
    locale: "en_US",
    type: "website"
  }
}

export default function Page() {
  return <Home />
}