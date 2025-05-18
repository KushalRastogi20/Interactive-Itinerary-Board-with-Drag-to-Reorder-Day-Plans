// src/components/LandingHeader.js
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const firstMenuLinkRef = useRef(null);

  // Handle scroll event for navbar effect (optimized)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled((prev) => {
        const isScrolled = window.scrollY > 20;
        if (isScrolled !== prev) {
          return isScrolled;
        }
        return prev;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize theme from localStorage and set up listener
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    // Listen for system theme changes if no localStorage theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  // Focus first link when menu opens
  useEffect(() => {
    if (isMenuOpen && firstMenuLinkRef.current) {
      firstMenuLinkRef.current.focus();
    }
  }, [isMenuOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = "/planner";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md py-3"
            : "py-5"
        }`}
      >
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between" aria-label="Primary navigation">
            {/* Logo */}
            <div className="flex items-center">
              <a
                href="/"
                className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                <span className="flex items-center">
                  <svg
                    className="h-8 w-8 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  ItineraryBoard
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#screenshots"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Screenshots
              </a>
              <a
                href="#faq"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                FAQ
              </a>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center">
              {/* Theme Toggler */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {/* Get Started Button (Desktop) */}
              <button
                onClick={handleSubmit}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl ml-4"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {/* Mobile Menu Button */}
              <button
                className="ml-4 md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <motion.nav
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation menu"
          className={`md:hidden fixed top-[64px] right-0 left-0 z-50 origin-top bg-white dark:bg-gray-900 shadow-lg rounded-b-md overflow-hidden`}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-6 py-4 space-y-3">
            <a
              href="#features"
              ref={firstMenuLinkRef}
              role="menuitem"
              tabIndex={isMenuOpen ? 0 : -1}
              className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#screenshots"
              role="menuitem"
              tabIndex={isMenuOpen ? 0 : -1}
              className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Screenshots
            </a>
            <a
              href="#faq"
              role="menuitem"
              tabIndex={isMenuOpen ? 0 : -1}
              className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            <a
              href="/itinerary"
              role="menuitem"
              tabIndex={isMenuOpen ? 0 : -1}
              className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        </motion.nav>
      </header>
    </>
  );
}
