// src/components/LandingFeatures.js
'use client';

import { motion } from 'framer-motion';
import { 
  DragDropIcon, 
  Calendar, 
  Users, 
  Clock, 
  Cloud, 
  Edit3, 
  Share2, 
  Smartphone, 
  Database 
} from 'lucide-react';

// Custom DragDropIcon as it's not available in Lucide by default
function DragDropCustomIcon(props) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M11 5h10"></path>
      <path d="M11 9h10"></path>
      <path d="M11 13h10"></path>
      <path d="M11 17h10"></path>
      <path d="M3 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0"></path>
      <path d="M3 13a2 2 0 1 0 4 0a2 2 0 1 0-4 0"></path>
    </svg>
  );
}

const features = [
  {
    icon: <DragDropCustomIcon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Drag & Drop",
    description: "Intuitively arrange and rearrange your daily activities by simply dragging items to reorganize your itinerary.",
    highlight: true
  },
  {
    icon: <Database className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Your Data, Yours",
    description: "All data is stored locally in your browser. No sign-up, no server, no database - just open and start planning!",
    highlight: true
  },
  {
    icon: <Calendar className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Day-wise Planning",
    description: "Organize your trip activities by day with a clear visual separation to better manage your time.",
    highlight: false
  },
  {
    icon: <Edit3 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Trip Visualizer Guide",
    description: "Focus on the planning experience with ready-to-use examples that help you visualize your trip immediately.",
    highlight: true
  },
  {
    icon: <Clock className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Time-Based Activities",
    description: "Plan your day down to the hour with time blocks that help you avoid overbooking or rushing through experiences.",
    highlight: false
  },
  {
    icon: <Smartphone className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Seamless Multi-Device Planning",
    description: "Plan your trip on any device - desktop, tablet, or mobile. Your itinerary looks great and works perfectly everywhere.",
    highlight: false
  }
];

export default function LandingFeatures() {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Planning Features
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need for visual trip planning, all in one intuitive interface
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className={`p-6 rounded-xl ${
                feature.highlight 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              } flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg`}
              variants={itemVariants}
            >
              <div className={`p-3 rounded-full mb-5 ${
                feature.highlight 
                  ? 'bg-indigo-100 dark:bg-indigo-800' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                {feature.title}
                {feature.highlight && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
                    Highlight
                  </span>
                )}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}