// src/app/page.js
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import LandingHeader from "../components/LandingHeader";
import LandingFeature from "../components/LandingFeature";
import LandingScreenshots from "../components/LandingScreenshots";
import LandingFooter from "../components/LandingFooter";
import { checkAuth } from "@/utils/isLoggedIn";
// console.log("LandingHeader:", LandingHeader);
// console.log("LandingFeature:", LandingFeature);
// console.log("LandingScreenshots:", LandingScreenshots);
// console.log("LandingFooter:", LandingFooter);

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  // Enable smooth scrolling behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);
  const router = useRouter();
   useEffect(() => {
    (async () => {
      const auth = await checkAuth();
      console.log("Auth status:", auth);
      setIsAuthenticated(auth.loggedIn);
    })();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/planner");
    } else {
      router.push("/auth");
    }
  }



  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-300 dark:bg-indigo-700 opacity-20"
              style={{
                width: `${Math.random() * 400 + 50}px`,
                height: `${Math.random() * 400 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <LandingHeader />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Interactive Itinerary Board
            </motion.h1>

            <motion.p
              className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Plan your perfect trip with our visual drag-and-drop itinerary
              planner. Organize activities by day, rearrange with ease, all in
              one beautiful interface.
            </motion.p>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <button
                onClick={handleSubmit}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Planning
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LandingFeatures Section */}
      <LandingFeature />

      {/* Screenshots Section */}
      <LandingScreenshots />

      {/* LandingFooter */}
      <LandingFooter />
    </main>
  );
}
