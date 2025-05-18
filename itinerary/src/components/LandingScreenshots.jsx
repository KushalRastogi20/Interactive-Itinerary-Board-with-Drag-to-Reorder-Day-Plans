// src/components/LandingScreenshots.js
'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

// Mock screenshots data
const screenshots = [
  {
    id: 1,
    title: "Drag & Drop Interface",
    description: "Easily rearrange activities by dragging them between days or reordering within a day.",
    imageUrl: "/SS1.png", // Placeholder for actual screenshot
    altText: "Screenshot of drag and drop functionality"
  },
  {
    id: 2,
    title: "Day-wise Planning View",
    description: "Organize your trip with a clean, visual day-by-day planning board.",
    imageUrl: "/SS2.png", // Placeholder for actual screenshot
    altText: "Screenshot of day-wise planning view"
  },
  {
    id: 3,
    title: "Mobile Responsive Design",
    description: "Plan your trip on any device with our fully responsive interface.",
    imageUrl: "/SS3.png", // Placeholder for actual screenshot
    altText: "Screenshot of mobile responsive design"
  },
  // {
  //   id: 4,
  //   title: "Light & Dark Mode",
  //   description: "Plan your trip comfortably day or night with automatic theme switching.",
  //   imageUrl: "/api/placeholder/800/500", // Placeholder for actual screenshot
  //   altText: "Screenshot of light and dark mode toggle"
  // }
];

export default function LandingScreenshots() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + screenshots.length) % screenshots.length);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="screenshots" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            See It In Action
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Discover how our visual itinerary planner helps you create the perfect trip
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Screenshot Carousel */}
          <div className="relative">
            {/* Main Image */}
            <motion.div 
              key={screenshots[currentIndex].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-900"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
                {/* Browser-like frame around the screenshot */}
                <div className="absolute inset-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Browser header */}
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="inline-block px-4 py-1 text-xs bg-white dark:bg-gray-700 rounded-full">
                        itineraryboard.app/planner
                      </div>
                    </div>
                  </div>
                  
                  {/* Screenshot content */}
                  <div className="h-[calc(100%-2rem)] p-4">
                    <img 
                      src={screenshots[currentIndex].imageUrl} 
                      alt={screenshots[currentIndex].altText}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {screenshots[currentIndex].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {screenshots[currentIndex].description}
                </p>
              </div>
            </motion.div>

            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-full shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors z-10"
              aria-label="Previous screenshot"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-full shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors z-10"
              aria-label="Next screenshot"
            >
              <ArrowRight className="h-6 w-6" />
            </button>

            {/* Dot indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex 
                      ? 'bg-indigo-600 dark:bg-indigo-400' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-indigo-400 dark:hover:bg-indigo-600'
                  }`}
                  aria-label={`Go to screenshot ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* CTA below screenshots */}
          <motion.div 
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <a 
              href="/itinerary" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try It Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              No sign-up required. Start planning immediately!
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}