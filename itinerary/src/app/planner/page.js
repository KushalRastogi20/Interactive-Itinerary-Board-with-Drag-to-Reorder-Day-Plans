'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import JSConfetti from "js-confetti";
import { Check, Pencil, Trash2, Globe, Calendar, MapPin, ChevronDown, ChevronUp, Camera, Umbrella, Plane } from 'lucide-react';
import { CSS } from "@dnd-kit/utilities";
import PdfExporter from "@/components/PdfExp";
import axios from 'axios';
import api from '../../utils/axios'; // Adjust the import path as necessary
import {
  Plus,
  Info,
  Clock,
  FileText,
  Save,
  ArrowRight,
  ChevronLeft,
  Map,
  Settings,
  Moon,
  Sun,
  X,
} from "lucide-react";

// Initial sample trips data - declared at the top before any useState
const sampleTrips = [
  {
    id: "trip-1",
    name: "Paris Adventure",
    destination: "Paris, France",
    startDate: "2025-06-10",
    endDate: "2025-06-13",
    color: "blue",
    active: true,
    days: [
      {
        id: "day-1",
        name: "Day 1",
        date: "2025-06-10",
        activities: [
          { id: "activity-1", title: "Flight to Paris", time: "08:30 AM", description: "Air France, Terminal 2" },
          { id: "activity-2", title: "Check-in at Hotel", time: "12:00 PM", description: "Le Grand Paris, Room 505" },
          { id: "activity-3", title: "Lunch at Café de Flore", time: "01:30 PM", description: "Famous historic café" },
        ]
      },
      {
        id: "day-2",
        name: "Day 2",
        date: "2025-06-11",
        activities: [
          { id: "activity-4", title: "Visit Eiffel Tower", time: "10:00 AM", description: "Skip the line tickets" },
          { id: "activity-5", title: "Seine River Cruise", time: "03:00 PM", description: "1-hour scenic cruise" },
        ]
      },
      {
        id: "day-3",
        name: "Day 3",
        date: "2025-06-12",
        activities: [
          { id: "activity-6", title: "Louvre Museum", time: "09:00 AM", description: "Guided tour" },
          { id: "activity-7", title: "Shopping at Champs-Élysées", time: "02:00 PM", description: "Luxury shopping avenue" },
          { id: "activity-8", title: "Dinner at Le Jules Verne", time: "08:00 PM", description: "Michelin star restaurant" },
        ]
      }
    ]
  },
  {
    id: "trip-2",
    name: "Tokyo Exploration",
    destination: "Tokyo, Japan",
    startDate: "2025-07-15",
    endDate: "2025-07-20",
    color: "pink",
    active: false,
    days: [
      {
        id: "day-1",
        name: "Day 1",
        date: "2025-07-15",
        activities: [
          { id: "activity-1", title: "Arrival at Narita Airport", time: "10:30 AM", description: "Japan Airlines" },
          { id: "activity-2", title: "Train to Shinjuku", time: "01:00 PM", description: "Narita Express" },
        ]
      },
      {
        id: "day-2",
        name: "Day 2",
        date: "2025-07-16",
        activities: [
          { id: "activity-3", title: "Tokyo Skytree", time: "09:00 AM", description: "Panoramic views" },
          { id: "activity-4", title: "Asakusa Temple", time: "02:00 PM", description: "Historic temple district" },
        ]
      }
    ]
  }
];

// Trip colors - keeping the original colors as requested
const tripColors = [
  { id: "blue", bg: "bg-blue-500", light: "bg-blue-200", hoverBg: "bg-blue-900" },
  { id: "green", bg: "bg-green-500", light: "bg-green-200", hoverBg: "bg-green-900" },
  { id: "purple", bg: "bg-purple-500", light: "bg-purple-200", hoverBg: "bg-purple-900" },
  { id: "pink", bg: "bg-pink-500", light: "bg-pink-200", hoverBg: "bg-pink-900" },
  { id: "amber", bg: "bg-amber-500", light: "bg-amber-200", hoverBg: "bg-amber-900" },
  { id: "teal", bg: "bg-teal-500", light: "bg-teal-200", hoverBg: "bg-teal-900" },
];

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Calculate trip duration in days
const getTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// Sortable Activity Card component with drag and drop functionality
const SortableActivityCard = ({ activity, onEdit, onDelete, color }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const selectedColor = tripColors.find(tc => tc.id === color) || tripColors[0];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white/80 backdrop-blur rounded-xl p-4 mb-4 shadow-md hover:shadow-lg transition duration-300 hover:scale-105 relative"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg">{activity.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(activity)}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
          <div className="relative group">
            <button
              onClick={() => onDelete(activity.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 
                  bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              Double click to delete
            </div>
          </div>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <Info className="w-4 h-4 text-gray-600" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-8 w-48 p-2 bg-black text-white text-xs rounded-md z-10">
                {activity.description}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center mt-2 text-gray-500">
        <Clock className="w-4 h-4 mr-1" />
        <span className="text-sm">{activity.time}</span>
      </div>
      <div className={`absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-12 ${selectedColor.light} rounded-r-md`} />
    </motion.div>
  );
};

// Day card component for day list
const DayCard = ({ day, isActive, onClick, onEdit, onDelete, tripColor }) => {
  const selectedColor = tripColors.find(tc => tc.id === tripColor) || tripColors[0];

  return (
    <div
      className={`w-full rounded-lg py-3 px-4 mb-2 flex items-center justify-between transition cursor-pointer ${isActive
        ? `${selectedColor.bg} text-white font-bold`
        : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
        }`}
    >
      <div className="flex-1" onClick={onClick}>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{day.name}</span>
        </div>
        {day.date && (
          <div className="text-xs mt-1 opacity-80">{formatDate(day.date)}</div>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <span className="flex items-center justify-center w-6 h-6 text-xs bg-white/20 rounded-full mr-2">
          {day.activities.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(day); }}
          className="p-1 hover:bg-white/20 rounded-full transition"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(day.id); }}
          className="p-1 hover:bg-white/20 rounded-full transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Trip card component for trip list
const TripCard = ({ trip, isActive, onClick, onEdit, onDelete, onActivate }) => {
  const [expanded, setExpanded] = useState(false);

  const selectedColor = tripColors.find(tc => tc.id === trip.color) || tripColors[0];
  const daysLeft = () => {
    const today = new Date();
    const start = new Date(trip.startDate);
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Past trip";
    } else if (diffDays === 0) {
      return "Today!";
    } else {
      return `${diffDays} days left`;
    }
  };
  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`w-full rounded-xl overflow-hidden mb-4 shadow-lg transform transition-all duration-300 ${isActive ? 'ring-2 ring-white scale-102' : ''}`}
    >
      <div
        className={`${selectedColor.bg} p-5 cursor-pointer relative overflow-hidden`}
        onClick={onClick}
      >
        {/* Background pattern */}
        <div className="absolute top-0 right-0 opacity-10">
          <Plane className="w-48 h-48 -rotate-12 translate-x-12 -translate-y-12" />
        </div>

        {/* Header section */}
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="font-bold text-white text-xl">{trip.name}</h3>
            <div className="flex items-center mt-2 text-white/90">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{trip.destination}</span>
            </div>
          </div>

          <div className="flex space-x-1">
            {!isActive && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); onActivate(trip.id); }}
                className="p-2 hover:bg-black/20 rounded-full transition flex items-center"
                title="Set as active trip"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onEdit(trip); }}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <Pencil className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Trip stats */}
        <div className="flex justify-between mt-4 text-xs font-medium bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <motion.div
            whileHover={{ y: -2 }}
            className="text-center"
          >
            <div className="text-white/70 mb-1">Start</div>
            <div className="flex items-center text-white">
              <Calendar className="w-3 h-3 mr-1" />
              <div>{formatDate(trip.startDate)}</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="text-center"
          >
            <div className="text-white/70 mb-1">End</div>
            <div className="flex items-center text-white">
              <Calendar className="w-3 h-3 mr-1" />
              <div>{formatDate(trip.endDate)}</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="text-center"
          >
            <div className="text-white/70 mb-2">Duration</div>
            <div className="text-white font-bold">
              {getTripDuration(trip.startDate, trip.endDate)} days
            </div>
          </motion.div>
        </div>

        {/* Countdown badge */}
        <div className="absolute top-1 right-5 ">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-white"
          >
            {daysLeft()}
          </motion.div>
        </div>
      </div>

      {/* Active trip indicator */}
      {isActive && (
        <div className="bg-black/50 backdrop-blur-md p-3 text-white flex justify-between items-center">
          <div className="text-sm flex items-center">
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 2
              }}
              className="bg-green-500 w-2 h-2 rounded-full mr-2"
            />
            <span className="font-medium">Active Trip</span>
          </div>
          <div className="text-sm font-medium">
            {trip.days?.length || 0} days planned
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpand}
            className="flex items-center text-sm text-white/80 hover:text-white"
          >
            {expanded ? (
              <>Hide details <ChevronUp className="w-4 h-4 ml-1" /></>
            ) : (
              <>Show details <ChevronDown className="w-4 h-4 ml-1" /></>
            )}
          </motion.button>
        </div>
      )}

      {/* Expanded details section */}
      {isActive && expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gray-900/80 backdrop-blur-md p-4 text-white/90"
        >
          <div className="text-sm mb-3 font-medium">Trip Highlights</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trip.days?.slice(0, 2).map((day, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs font-bold mb-1 text-white/70">Day {index + 1}</div>
                <div className="text-sm">{day.title || 'Untitled'}</div>
                {day.activities && day.activities.length > 0 && (
                  <div className="mt-2 text-xs text-white/70">
                    {day.activities[0].name || 'Activity planned'}
                  </div>
                )}
              </div>
            ))}
            {(!trip.days || trip.days.length === 0) && (
              <div className="bg-white/10 rounded-lg p-3 text-sm text-white/70">
                No days planned yet. Click to add activities!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Main component
export default function TravelItineraryPlanner() {
  const [trips, setTrips] = useState(sampleTrips);
  const [activeView, setActiveView] = useState("trips");
  const [activeTrip, setActiveTrip] = useState(sampleTrips.find(trip => trip.active)?.id || null);
  const [activeDay, setActiveDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch trips using Axios
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trips/allTrips');
      console.log("response", response);

      if (response.data && response.data.data && response.data.data.length > 0) {
        setTrips(response.data.data);
        // Set active trip if none exists
        const activeExistingTrip = response.data.data.find(trip => trip.active);
        if (activeExistingTrip) {
          setActiveTrip(activeExistingTrip.id);
        } else if (response.data.data.length > 0) {
          setActiveTrip(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching trips: ", error);
      // Keep sample data on error
      console.log("Using sample data due to fetch error");
    } finally {
      setLoading(false);
    }
  };

  // Handle save trip
  const handleSaveTrip = async (tripData) => {
    try {
      const createTripData = await api.post('/trips/create', {
        name: tripData.name,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        color: tripData.color,
      });
      console.log("Trip created successfully:", createTripData);
      // Refresh trips after creating
      await fetchTrips();
    } catch (error) {
      console.error("Error Saving Trip:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Get current trip data
  const currentTrip = trips.find(trip => trip.id === activeTrip);

  // Get current day data
  const currentDay = currentTrip?.days.find(day => day.id === activeDay);

  // Set active day when changing trips
  useEffect(() => {
    if (currentTrip && currentTrip.days.length > 0 && !activeDay) {
      setActiveDay(currentTrip.days[0].id);
    }
  }, [activeTrip, currentTrip, activeDay]);

  // Initialize JSConfetti
  const jsConfettiRef = useRef(null);
  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();
    return () => {
      jsConfettiRef.current = null;
    };
  }, []);

  // Handle drag end for activities
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTrips(trips => {
        const currentTripObj = trips.find(trip => trip.id === activeTrip);
        if (!currentTripObj) return trips;

        const currentDayObj = currentTripObj.days.find(day => day.id === activeDay);
        if (!currentDayObj) return trips;

        const oldIndex = currentDayObj.activities.findIndex(activity => activity.id === active.id);
        const newIndex = currentDayObj.activities.findIndex(activity => activity.id === over.id);

        const newTrips = JSON.parse(JSON.stringify(trips));
        const tripIndex = newTrips.findIndex(trip => trip.id === activeTrip);
        const dayIndex = newTrips[tripIndex].days.findIndex(day => day.id === activeDay);

        const updatedActivities = [...newTrips[tripIndex].days[dayIndex].activities];
        const [movedItem] = updatedActivities.splice(oldIndex, 1);
        updatedActivities.splice(newIndex, 0, movedItem);

        newTrips[tripIndex].days[dayIndex].activities = updatedActivities;
        return newTrips;
      });
    }
  };

  // Open modal
  const openModal = (type, data = null) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  // Navigate back to trips view
  const goToTrips = () => {
    setActiveView("trips");
  };

  // Set a trip as active and enter planning view
  const selectTrip = (tripId) => {
    setActiveTrip(tripId);
    setActiveView("planning");

    const trip = trips.find(t => t.id === tripId);
    if (trip && trip.days.length > 0) {
      setActiveDay(trip.days[0].id);
    } else {
      setActiveDay(null);
    }
  };

  // Set a trip as the active trip
  const activateTrip = (tripId) => {
    setTrips(trips.map(trip => ({
      ...trip,
      active: trip.id === tripId
    })));
    setActiveTrip(tripId);
  };

  // Add new trip
  const addTrip = async (tripData) => {
    if (tripData.name && tripData.destination) {
      await handleSaveTrip(tripData);
    } else {
      const tripId = `trip-${Date.now()}`;
      const newTrip = {
        id: tripId,
        name: tripData.name || "New Trip",
        destination: tripData.destination || "Destination",
        startDate: tripData.startDate || new Date().toISOString().split('T')[0],
        endDate: tripData.endDate || new Date().toISOString().split('T')[0],
        color: tripData.color || "blue",
        active: false,
        days: []
      };

      setTrips([newTrip, ...trips]);
      selectTrip(tripId);
    }
    closeModal();
  };

  // Edit trip
  const editTrip = (tripData) => {
    setTrips(trips.map(trip =>
      trip.id === tripData.id ? { ...trip, ...tripData } : trip
    ));
    closeModal();
  };

  // Delete trip
  const deleteTrip = (tripId) => {
    if (confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      const newTrips = trips.filter(trip => trip.id !== tripId);
      setTrips(newTrips);

      if (tripId === activeTrip && newTrips.length > 0) {
        setActiveTrip(newTrips[0].id);
        newTrips[0].active = true;
      } else if (newTrips.length === 0) {
        setActiveTrip(null);
        setActiveDay(null);
        setActiveView("trips");
      }
    }
  };

  // Add new day
  const addDay = (dayData) => {
    if (!activeTrip) return;

    const dayCount = currentTrip.days.length + 1;
    const dayId = `day-${Date.now()}`;
    const newDay = {
      id: dayId,
      name: dayData?.name || `Day ${dayCount}`,
      date: dayData?.date || "",
      activities: []
    };

    setTrips(trips.map(trip => {
      if (trip.id === activeTrip) {
        return {
          ...trip,
          days: [...trip.days, newDay]
        };
      }
      return trip;
    }));

    setActiveDay(dayId);
    closeModal();
  };

  // Edit day
  const editDay = (dayData) => {
    setTrips(trips.map(trip => {
      if (trip.id === activeTrip) {
        return {
          ...trip,
          days: trip.days.map(day =>
            day.id === dayData.id ? { ...day, name: dayData.name, date: dayData.date } : day
          )
        };
      }
      return trip;
    }));
    closeModal();
  };

  // Delete day
  const deleteDay = (dayId) => {
    if (confirm("Are you sure you want to delete this day and all its activities?")) {
      setTrips(trips.map(trip => {
        if (trip.id === activeTrip) {
          const updatedDays = trip.days.filter(day => day.id !== dayId);

          if (dayId === activeDay && updatedDays.length > 0) {
            setActiveDay(updatedDays[0].id);
          } else if (updatedDays.length === 0) {
            setActiveDay(null);
          }

          return {
            ...trip,
            days: updatedDays
          };
        }
        return trip;
      }));
    }
  };

  // Add new activity
  const addActivity = (activityData) => {
    if (!activeTrip || !activeDay) return;

    const newActivity = {
      id: `activity-${Date.now()}`,
      title: activityData?.title || "New Activity",
      time: activityData?.time || "12:00 PM",
      description: activityData?.description || "Add description here"
    };

    setTrips(trips.map(trip => {
      if (trip.id === activeTrip) {
        return {
          ...trip,
          days: trip.days.map(day => {
            if (day.id === activeDay) {
              return {
                ...day,
                activities: [...day.activities, newActivity]
              };
            }
            return day;
          })
        };
      }
      return trip;
    }));

    closeModal();
  };

  // Edit activity
  const editActivity = (activityData) => {
    if (!activityData) {
      openModal("activity", activityData);
      return;
    }

    setTrips(trips.map(trip => {
      if (trip.id === activeTrip) {
        return {
          ...trip,
          days: trip.days.map(day => {
            if (day.id === activeDay) {
              return {
                ...day,
                activities: day.activities.map(activity =>
                  activity.id === activityData.id ? { ...activity, ...activityData } : activity
                )
              };
            }
            return day;
          })
        };
      }
      return trip;
    }));

    closeModal();
  };

  // Delete activity
  const deleteActivity = (activityId) => {
    setTrips(trips.map(trip => {
      if (trip.id === activeTrip) {
        return {
          ...trip,
          days: trip.days.map(day => {
            if (day.id === activeDay) {
              return {
                ...day,
                activities: day.activities.filter(activity => activity.id !== activityId)
              };
            }
            return day;
          })
        };
      }
      return trip;
    }));
  };

  // Save itinerary with confetti animation
  const saveItinerary = () => {
    if (jsConfettiRef.current) {
      jsConfettiRef.current.addConfetti({
        emojis: ['🎉', '✨', '🎊', '✈️', '🌴', '🧳'],
        confettiNumber: 50,
      });
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-r from-black to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your trips...</p>
        </div>
      </div>
    );
  }

  // Modal content
  const renderModalContent = () => {
    switch (modalType) {
      case "trip":
        return (
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">
              {modalData ? "Edit Trip" : "Create New Trip"}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const tripData = {
                id: modalData?.id,
                name: formData.get("name"),
                destination: formData.get("destination"),
                startDate: formData.get("startDate"),
                endDate: formData.get("endDate"),
                color: formData.get("color"),
              };
              modalData ? editTrip(tripData) : addTrip(tripData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm mb-1">Trip Name</label>
                  <input
                    name="name"
                    defaultValue={modalData?.name || ""}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Destination</label>
                  <input
                    name="destination"
                    defaultValue={modalData?.destination || ""}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-white text-sm mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={modalData?.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-white text-sm mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={modalData?.endDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Color Theme</label>
                  <div className="flex space-x-3 mt-2">
                    {tripColors.map(color => (
                      <label key={color.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="color"
                          value={color.id}
                          defaultChecked={modalData?.color === color.id || (!modalData && color.id === "blue")}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full ${color.bg} border-2 ${modalData?.color === color.id ? "border-white" : "border-transparent"} hover:border-white transition`}></div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                >
                  {modalData ? "Update Trip" : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        );

      case "day":
        return (
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">
              {modalData ? "Edit Day" : "Add New Day"}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const dayData = {
                id: modalData?.id,
                name: formData.get("name"),
                date: formData.get("date"),
              };
              modalData ? editDay(dayData) : addDay(dayData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm mb-1">Day Name</label>
                  <input
                    name="name"
                    defaultValue={modalData?.name || `Day ${currentTrip?.days.length + 1 || 1}`}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={modalData?.date || currentTrip?.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                >
                  {modalData ? "Update Day" : "Add Day"}
                </button>
              </div>
            </form>
          </div>
        );

      case "activity":
        return (
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">
              {modalData ? "Edit Activity" : "Add New Activity"}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const activityData = {
                id: modalData?.id,
                title: formData.get("title"),
                time: formData.get("time"),
                description: formData.get("description"),
              };
              modalData ? editActivity(activityData) : addActivity(activityData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm mb-1">Activity Title</label>
                  <input
                    name="title"
                    defaultValue={modalData?.title || ""}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Time</label>
                  <input
                    name="time"
                    type="time"
                    defaultValue={modalData?.time?.split(' ')[0] || "12:00"}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={modalData?.description || ""}
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 h-24"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                >
                  {modalData ? "Update Activity" : "Add Activity"}
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="itinerary-content">
      <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-black to-blue-900'} flex items-center justify-center p-4 font-sans`}>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-7xl w-full h-[85vh] flex overflow-hidden">
          {/* All trips view */}
          {activeView === "trips" && (
            <div className="w-full flex flex-col p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-white text-3xl font-bold">Your Travel Itineraries</h1>
                <div className="flex space-x-4">
                  <button
                    onClick={() => openModal("trip")}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Trip</span>
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/60 transition"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <AnimatePresence>
                  {/* Active trips */}
                  {trips.filter(trip => trip.active).map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      isActive={true}
                      onClick={() => selectTrip(trip.id)}
                      onEdit={() => openModal("trip", trip)}
                      onDelete={() => deleteTrip(trip.id)}
                      onActivate={() => { }}
                    />
                  ))}

                  {/* Other trips */}
                  {trips.filter(trip => !trip.active).map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      isActive={false}
                      onClick={() => selectTrip(trip.id)}
                      onEdit={() => openModal("trip", trip)}
                      onDelete={() => deleteTrip(trip.id)}
                      onActivate={activateTrip}
                    />
                  ))}
                </AnimatePresence>

                {trips.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-white/80">
                    <Plane className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-xl font-medium mb-2">No trips planned yet</p>
                    <p className="text-sm mb-6">Start by creating your first trip</p>
                    <button
                      onClick={() => openModal("trip")}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create New Trip</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trip planning view */}
          {activeView === "planning" && currentTrip && (
            <>
              {/* Sidebar */}
              <div className="w-64 bg-black/30 backdrop-blur p-6 flex flex-col">
                <div className="flex items-center mb-6">
                  <button
                    onClick={goToTrips}
                    className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/60 transition mr-3"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-white font-bold text-xl truncate">{currentTrip.name}</h2>
                </div>

                <div className="bg-white/10 rounded-lg p-3 mb-6">
                  <div className="text-white/80 text-sm mb-1">Destination</div>
                  <div className="text-white font-medium flex items-center">
                    <Map className="w-4 h-4 mr-2" />
                    {currentTrip.destination}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-white/80">
                    <div>
                      <div className="font-medium">From</div>
                      <div>{formatDate(currentTrip.startDate)}</div>
                    </div>
                    <div>
                      <div className="font-medium">To</div>
                      <div>{formatDate(currentTrip.endDate)}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-white font-bold">Days</h3>
                  <button
                    onClick={() => openModal("day")}
                    className="p-1 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/60 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {currentTrip.days.length > 0 ? (
                    <div className="space-y-2">
                      {currentTrip.days.map((day) => (
                        <DayCard
                          key={day.id}
                          day={day}
                          isActive={activeDay === day.id}
                          onClick={() => setActiveDay(day.id)}
                          onEdit={() => openModal("day", day)}
                          onDelete={deleteDay}
                          tripColor={currentTrip.color}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-white/60">
                      <p className="text-sm mb-4">No days added yet</p>
                      <button
                        onClick={() => openModal("day")}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800/70 hover:bg-gray-700/70 rounded-lg transition text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Day</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 flex flex-col space-y-2">
                  <button
                    onClick={() => openModal("trip", currentTrip)}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/10 text-white hover:bg-white/20 transition w-full"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Trip Settings</span>
                  </button>

                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/10 text-white hover:bg-white/20 transition w-full"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                </div>
              </div>

              {/* Main Board */}
              <div className="flex-1 p-8 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-white text-2xl font-bold">Trip Planner</h1>
                  <div className="flex gap-4">
                    <button
                      onClick={saveItinerary}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Itinerary</span>
                    </button>
                    <PdfExporter />
                  </div>
                </div>

                {currentDay ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-white text-xl font-semibold flex items-center">
                        <span>{currentDay.name} Activities</span>
                        {currentDay.date && (
                          <span className="ml-2 text-white/70 text-sm">
                            ({formatDate(currentDay.date)})
                          </span>
                        )}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToParentElement]}
                      >
                        <SortableContext
                          items={currentDay.activities.map(a => a.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {currentDay.activities.map((activity) => (
                            <SortableActivityCard
                              key={activity.id}
                              activity={activity}
                              onEdit={editActivity}
                              onDelete={deleteActivity}
                              color={currentTrip.color}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>

                      {currentDay.activities.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-white/60">
                          <p className="mb-2">No activities planned for this day yet</p>
                          <p className="text-sm">Use the Add Activity button to get started</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-white/60">
                    <Calendar className="w-12 h-12 mb-4 opacity-40" />
                    <p className="mb-2">Add a day to start planning your activities</p>
                    <button
                      onClick={() => openModal("day")}
                      className="mt-4 flex items-center gap-2 bg-gray-800/70 hover:bg-gray-700/70 text-white px-4 py-2 rounded-lg transition"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add First Day</span>
                    </button>
                  </div>
                )}

                {currentDay && (
                  <motion.button
                    onClick={() => openModal("activity")}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-6 h-6" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-400/50 animate-ping" />
                  </motion.button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="relative">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white transition z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                {renderModalContent()}
              </div>
            </motion.div>
          </div>
        )}

        <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
      </div>
    </div>
  );
}
