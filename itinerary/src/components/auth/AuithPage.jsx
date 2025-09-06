"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Plane,
  MapPin,
  Calendar,
  Star,
  Camera,
  Heart,
} from "lucide-react";
import JSConfetti from "js-confetti";
import api from "@/utils/axios";
import Cookies from "js-cookie";
import { checkAuth } from "@/utils/isLoggedIn";
import { useRouter } from "next/navigation";
// import { checkAuth } from "@/utils/isLoggedIn";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const auth = await checkAuth();
      console.log("Auth status:", auth);
      setIsAuthenticated(auth.loggedIn);
      if(auth.loggedIn){
        router.push("/planner");
      }
    })();
  }, []);

  // Initialize JSConfetti
  const jsConfettiRef = useRef(null);
  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();
    return () => {
      jsConfettiRef.current = null;
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      setLoading(false);
      return;
    }

    try {
      let response;

      if (isLogin) {
        // Login API call
        response = await api.post("/user/login", {
          email: formData.email,
          password: formData.password,
        });
      } else {
        // Register API call
        response = await api.post("/user/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      console.log("API Response:", response.data);

      // Handle successful authentication
      if (response.data.success) {
        // Store token if provided
        console.log("response.data.data:", response.data.data);

        let accessToken, refreshToken;

        // Signup response -> inside createToken
        if (response.data.data.createToken) {
          accessToken = response.data.data.createToken.accessToken;
          refreshToken = response.data.data.createToken.refreshToken;
        }

        // Login response -> top-level
        else if (
          response.data.data.accessToken &&
          response.data.data.refreshToken
        ) {
          accessToken = response.data.data.accessToken;
          refreshToken = response.data.data.refreshToken;
        }

        if (accessToken && refreshToken) {
          Cookies.set("accessToken", accessToken, {
            expires: 7,
            secure: true,
            sameSite: "Lax",
            path: "/",
          });
          Cookies.set("refreshToken", refreshToken, {
            expires: 7,
            secure: true,
            sameSite: "Lax",
            path: "/",
          });
        }

        // Success animation for signup
        if (!isLogin && jsConfettiRef.current) {
          jsConfettiRef.current.addConfetti({
            emojis: ["🎉", "✨", "🎊", "✈️", "🌴", "🧳"],
            confettiNumber: 10,
          });
        }

        // Redirect to dashboard or main app
        window.location.href = "/planner"; // or use Next.js router
        console.log(isLogin ? "Login successful" : "Signup successful");
      } else {
        setError(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);

      // Handle different error types
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.message || "Authentication failed");
      } else if (error.request) {
        // Network error
        setError("Network error. Please check your connection.");
      } else {
        // Other error
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
  };

  return (
    <div className="h-screen w-full bg-gradient-to-r from-black to-blue-900 flex items-center justify-center p-1 md:p-3 font-sans relative overflow-hidden">
      {/* Background decorative elements - smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-5 md:top-20 left-3 md:left-10 opacity-10">
          <Plane className="w-8 h-8 md:w-24 md:h-24 text-white rotate-12" />
        </div>
        <div className="absolute top-10 md:top-40 right-5 md:right-20 opacity-10">
          <MapPin className="w-6 h-6 md:w-20 md:h-20 text-white" />
        </div>
        <div className="absolute bottom-5 md:bottom-20 left-5 md:left-20 opacity-10">
          <Calendar className="w-7 h-7 md:w-24 md:h-24 text-white -rotate-12" />
        </div>
        <div className="absolute bottom-10 md:bottom-40 right-3 md:right-10 opacity-10">
          <Star className="w-6 h-6 md:w-16 md:h-16 text-white" />
        </div>
      </div>

      {/* Main auth container - no scroll, ultra compact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-xs md:max-w-md relative z-10 mx-auto"
      >
        <div className="p-3 md:p-6">
          {/* Header - very compact */}
          <div className="text-center mb-2 md:mb-3">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-blue-600 rounded-full mb-1 md:mb-2"
            >
              <Plane className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl font-bold text-white mb-0.5 md:mb-1"
            >
              Travel Planner
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-xs"
            >
              {isLogin ? "Welcome back!" : "Start your journey"}
            </motion.p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-xs text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Auth toggle buttons - very compact */}
          <div className="flex bg-white/10 rounded-lg p-0.5 mb-2 md:mb-3">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-1 px-2 rounded-md transition-all duration-300 text-xs ${
                isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-1 px-2 rounded-md transition-all duration-300 text-xs ${
                !isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form - ultra compact spacing */}
          <form onSubmit={handleSubmit} className="space-y-1.5 md:space-y-2">
            <AnimatePresence mode="wait">
              {/* Name field (signup only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <User className="h-3 w-3 text-white/50" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full pl-7 pr-3 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                    required={!isLogin}
                  />
                </motion.div>
              )}

              {/* Email field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Mail className="h-3 w-3 text-white/50" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full pl-7 pr-3 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                  required
                />
              </motion.div>

              {/* Password field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Lock className="h-3 w-3 text-white/50" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full pl-7 pr-8 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </button>
              </motion.div>

              {/* Confirm password field (signup only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Lock className="h-3 w-3 text-white/50" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    className="w-full pl-7 pr-8 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password (login only) */}
            {isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-right"
              >
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  Forgot password?
                </button>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs mt-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </span>
                </>
              ) : (
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
              )}
            </motion.button>
          </form>

          {/* Divider - compact */}
          <div className="my-2 md:my-3 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-2 text-white/50 text-xs">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Social login buttons - compact */}
          <div className="space-y-1.5">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 md:py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20 text-xs"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 md:py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20 text-xs"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
              <span>Twitter</span>
            </motion.button>
          </div>

          {/* Footer - compact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-2 text-center text-white/70 text-xs"
          >
            <span>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              onClick={toggleAuthMode}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </motion.div>

          {/* Terms and privacy (signup only) - compact */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1 text-center text-xs text-white/50"
            >
              By signing up, you agree to our{" "}
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                Terms
              </button>{" "}
              and{" "}
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Global styles */}
      <style jsx global>{`
        html,
        body {
          overflow: hidden;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.1) inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
