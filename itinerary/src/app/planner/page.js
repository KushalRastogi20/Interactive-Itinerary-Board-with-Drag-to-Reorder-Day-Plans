'use client';

import { useState, useEffect, useRef, use } from "react";
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { motion, AnimatePresence } from "framer-motion";
import JSConfetti from "js-confetti";
import api from "@/utils/axios";
import {
  Plus, Pencil, Trash2, Check, Calendar, MapPin, ChevronDown, ChevronUp, Save,
  ArrowRight, ChevronLeft, Map, Settings, Moon, Sun, X, Info, Clock, Plane,
  TrendingUp, Users, Star, Globe
} from "lucide-react";
import { checkAuth } from "@/utils/isLoggedIn";

// Mock popular destinations data
const popularDestinations = [
  {
    id: 1,
    name: "Paris, France",
    image: "🗼",
    rating: 4.8,
    price: "$1,200",
    duration: "5-7 days",
    description: "City of lights and romance"
  },
  {
    id: 2,
    name: "Tokyo, Japan",
    image: "🏯",
    rating: 4.9,
    price: "$1,500",
    duration: "6-8 days",
    description: "Modern meets traditional"
  },
  {
    id: 3,
    name: "Bali, Indonesia",
    image: "🏝️",
    rating: 4.7,
    price: "$800",
    duration: "4-6 days",
    description: "Tropical paradise"
  },
  {
    id: 4,
    name: "Rome, Italy",
    image: "🏛️",
    rating: 4.6,
    price: "$1,000",
    duration: "4-5 days",
    description: "Ancient history and cuisine"
  },
  {
    id: 5,
    name: "New York, USA",
    image: "🗽",
    rating: 4.5,
    price: "$1,300",
    duration: "5-7 days",
    description: "The city that never sleeps"
  },
  {
    id: 6,
    name: "Dubai, UAE",
    image: "🏢",
    rating: 4.8,
    price: "$1,400",
    duration: "4-6 days",
    description: "Luxury and innovation"
  },
  {
    id: 7,
    name: "Barcelona, Spain",
    image: "🏖️",
    rating: 4.7,
    price: "$900",
    duration: "4-5 days",
    description: "Art, architecture, and beaches"
  },
  {
    id: 8,
    name: "Iceland",
    image: "🏔️",
    rating: 4.9,
    price: "$1,600",
    duration: "7-10 days",
    description: "Northern lights and nature"
  }
];

const tripColors = [
  { id: "blue", bg: "bg-blue-500", light: "bg-blue-200", hoverBg: "bg-blue-900" },
  { id: "green", bg: "bg-green-500", light: "bg-green-200", hoverBg: "bg-green-900" },
  { id: "purple", bg: "bg-purple-500", light: "bg-purple-200", hoverBg: "bg-purple-900" },
  { id: "pink", bg: "bg-pink-500", light: "bg-pink-200", hoverBg: "bg-pink-900" },
  { id: "amber", bg: "bg-amber-500", light: "bg-amber-200", hoverBg: "bg-amber-900" },
  { id: "teal", bg: "bg-teal-500", light: "bg-teal-200", hoverBg: "bg-teal-900" },
];

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!startDate || !endDate || isNaN(start) || isNaN(end)) return 1;
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Dashboard Stats Component
function DashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-2"></div>
            <div className="h-8 bg-white/30 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Total Trips</p>
            <p className="text-white text-3xl font-bold">{stats.totalTrips || 0}</p>
          </div>
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Plane className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Active Trips</p>
            <p className="text-white text-3xl font-bold">{stats.activeTrips || 0}</p>
          </div>
          <div className="p-3 bg-green-500/20 rounded-full">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Countries Visited</p>
            <p className="text-white text-3xl font-bold">{stats.countriesVisited || 0}</p>
          </div>
          <div className="p-3 bg-purple-500/20 rounded-full">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">Total Activities</p>
            <p className="text-white text-3xl font-bold">{stats.totalActivities || 0}</p>
          </div>
          <div className="p-3 bg-amber-500/20 rounded-full">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Popular Destinations Component
function PopularDestinations({ onSelectDestination }) {
  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl font-bold mb-6">Popular Destinations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {popularDestinations.map((destination) => (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all"
            onClick={() => onSelectDestination(destination)}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{destination.image}</div>
              <h3 className="text-white font-bold text-lg mb-2">{destination.name}</h3>
              <p className="text-white/70 text-sm mb-3">{destination.description}</p>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>{destination.rating}</span>
                </div>
                <span className="text-white/80">{destination.duration}</span>
              </div>
              <div className="mt-2 text-white font-bold">{destination.price}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Existing components (SortableActivityCard, DayCard, TripCard) remain the same...
function SortableActivityCard({ activity, onEdit, onDelete, color }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const selectedColor = tripColors.find(tc => tc.id === color) || tripColors[0];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <motion.div
      ref={setNodeRef} style={style}
      {...attributes} {...listeners}
      className="bg-white/80 backdrop-blur rounded-xl p-4 mb-4 shadow-lg hover:shadow-xl transition duration-300 hover:scale-105 relative"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg">{activity.title}</h3>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(activity)} className="p-1 hover:bg-gray-200 rounded-full transition">
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
          <div className="relative group">
            <button
              onDoubleClick={() => onDelete(activity.id)}
              className="p-1 hover:bg-gray-200 rounded-full transition">
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
            <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              Double click to delete
            </span>
          </div>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition"
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
}

function DayCard({ day, isActive, onClick, onEdit, onDelete, tripColor }) {
  const selectedColor = tripColors.find(tc => tc.id === tripColor) || tripColors[0];

  return (
    <div className={`w-full rounded-lg py-3 px-4 mb-2 flex items-center justify-between transition cursor-pointer ${isActive
      ? `${selectedColor.bg} text-white font-bold`
      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
      }`}>
      <div className="flex-1" onClick={onClick}>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{day.name}</span>
        </div>
        {day.date && <div className="text-xs mt-1 opacity-80">{formatDate(day.date)}</div>}
      </div>
      <div className="flex items-center space-x-1">
        <span className="flex items-center justify-center w-6 h-6 text-xs bg-white/20 rounded-full mr-2">{day.activities?.length || 0}</span>
        <button onClick={e => { e.stopPropagation(); onEdit(day); }} className="p-1 hover:bg-white/20 rounded-full transition">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(day.id); }} className="p-1 hover:bg-white/20 rounded-full transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function TripCard({ trip, isActive, onClick, onEdit, onDelete, onActivate }) {
  const [expanded, setExpanded] = useState(false);
  const selectedColor = tripColors.find(tc => tc.id === trip.color) || tripColors[0];
  
  const getDaysLeft = () => {
    const today = new Date();
    const start = new Date(trip.startDate);
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Past trip";
    if (diffDays === 0) return "Today!";
    return `${diffDays} days left`;
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
      <div className={`${selectedColor.bg} p-5 cursor-pointer relative overflow-hidden`} onClick={onClick}>
        <div className="absolute top-0 right-0 opacity-10">
          <Plane className="w-48 h-48 -rotate-12 translate-x-12 -translate-y-12" />
        </div>
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
                onClick={e => { e.stopPropagation(); onActivate(trip.id); }}
                className="p-2 hover:bg-black/20 rounded-full transition flex items-center"
                title="Set as active trip"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={e => { e.stopPropagation(); onEdit(trip); }}
              className="p-2 hover:bg-white/20 rounded-full transition">
              <Pencil className="w-4 h-4 text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={e => { e.stopPropagation(); onDelete(trip.id); }}
              className="p-2 hover:bg-white/20 rounded-full transition">
              <Trash2 className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-xs font-medium bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-white/70 mb-1">Start</div>
            <div className="flex items-center text-white">
              <Calendar className="w-3 h-3 mr-1" />
              <div>{formatDate(trip.startDate)}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/70 mb-1">End</div>
            <div className="flex items-center text-white">
              <Calendar className="w-3 h-3 mr-1" />
              <div>{formatDate(trip.endDate)}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/70 mb-2">Duration</div>
            <div className="text-white font-bold">{getTripDuration(trip.startDate, trip.endDate)} days</div>
          </div>
        </div>
        <div className="absolute top-1 right-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-white"
          >
            {getDaysLeft()}
          </motion.div>
        </div>
      </div>
      
      {isActive && (
        <div className="bg-black/50 backdrop-blur-md p-3 text-white flex justify-between items-center">
          <div className="text-sm flex items-center">
            <motion.span
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-green-500 w-2 h-2 rounded-full mr-2"
            />
            <span className="font-medium">Active Trip</span>
          </div>
          <div className="text-sm font-medium">{trip.days?.length || 0} days planned</div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={e => { e.stopPropagation(); setExpanded(exp => !exp); }}
            className="flex items-center text-sm text-white/80 hover:text-white"
          >
            {expanded ? (<>Hide details <ChevronUp className="w-4 h-4 ml-1" /></>) :
              (<>Show details <ChevronDown className="w-4 h-4 ml-1" /></>)}
          </motion.button>
        </div>
      )}
      
      {isActive && expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} className="bg-gray-900/80 p-4 text-white/90">
          <div className="text-sm mb-3 font-medium">Trip Highlights</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trip.days?.slice(0, 2).map((day, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs font-bold mb-1 text-white/70">Day {index + 1}</div>
                <div className="text-sm">{day.name || 'Untitled'}</div>
                {day.activities && day.activities.length > 0 && (
                  <div className="mt-2 text-xs text-white/70">
                    {day.activities[0].title || 'Activity planned'}
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
}

// Main Component
export default function TravelItineraryPlanner() {
  const [trips, setTrips] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [activeTrip, setActiveTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser]=useState(null);

  
  // DND Sensors
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const currentTrip = trips.find(trip => trip.id === activeTrip);
  const currentDay = currentTrip?.days.find(day => day.id === activeDay);

  // Fetch dashboard data from backend
  useEffect(() => {
    authfunction();
    fetchDashboardStats();
    fetchTrips();
  }, []);
  // const authfucntion= useEffect(()=>{
  //   async()=>{
  //     const auth= await checkAuth();
  //     if(auth.loggedIn){
        
  //       setUser(auth.user);
  //       console.log("User data:",auth.user);
  //     }
  //   }
  // })
  const authfunction= async()=>{
    const auth= await checkAuth();
        if(auth.loggedIn){
          setUser(auth.user);
          console.log("User data:", auth.user);
        } 
        else{
          window.location.href="/auth";
        }
  }

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values on error
      setDashboardStats({
        totalTrips: 0,
        activeTrips: 0,
        countriesVisited: 0,
        totalActivities: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      // const user= await checkAuth();
  const userId= user?._id;

      // console.log("user id in fetchTrips:", userId);
      const response = await api.get('/trips/allTrips');
      if (response.data.success) {
        setTrips(response.data.data || []);
        // Set active trip if exists
        const activeTrip = response.data.data?.find(trip => trip.active);
        if (activeTrip) {
          setActiveTrip(activeTrip.id);
        }
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Set first day as activeDay on trip selection
  useEffect(() => {
    if (currentTrip && currentTrip.days?.length > 0 && !activeDay) {
      setActiveDay(currentTrip.days[0].id);
    }
  }, [activeTrip, currentTrip, activeDay]);

  // Modal helpers
  const openModal = (type, data = null) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  // Navigation
  const goToDashboard = () => { setActiveView("dashboard"); };
  const goToTrips = () => { setActiveView("trips"); };
  const selectTrip = tripId => {
    setActiveTrip(tripId);
    setActiveView("planning");
    const trip = trips.find(t => t.id === tripId);
    if (trip && trip.days?.length > 0) setActiveDay(trip.days[0].id);
    else setActiveDay(null);
  };

  const activateTrip = async (tripId) => {
    try {
      await api.patch(`/trips/${tripId}/activate`);
      setTrips(trips.map(trip => ({ ...trip, active: trip.id === tripId })));
      setActiveTrip(tripId);
      fetchDashboardStats(); // Refresh stats
    } catch (error) {
      console.error('Error activating trip:', error);
    }
  };

  // CRUD handlers
  const addTrip = async (tripData) => {
    try {
      console.log("user id in addTrip:", user?._id);
      tripData.userId=user?._id; // Attach user ID to trip data
      console.log("trip data id in addTrip:", tripData);

      const response = await api.post('/trips/create', tripData);
      if (response.data.success) {
        await fetchTrips();
        await fetchDashboardStats();
        selectTrip(response.data.data.id);
        closeModal();
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  const editTrip = async (tripData) => {
    try {
      const response = await api.patch(`/trips/${tripData.id}`, tripData);
      if (response.data.success) {
        setTrips(trips.map(trip => 
          trip.id === tripData.id ? { ...trip, ...tripData } : trip
        ));
        closeModal();
      }
    } catch (error) {
      console.error('Error editing trip:', error);
      alert('Failed to edit trip. Please try again.');
    }
  };

  const deleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    
    try {
      await api.delete(`/trips/${tripId}`);
      const newTrips = trips.filter(t => t.id !== tripId);
      setTrips(newTrips);
      
      if (tripId === activeTrip) {
        if (newTrips.length > 0) {
          setActiveTrip(newTrips[0].id);
        } else {
          setActiveTrip(null);
          setActiveDay(null);
          setActiveView("dashboard");
        }
      }
      await fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  // Handle destination selection
  const handleDestinationSelect = (destination) => {
    setModalData({ 
      destination: destination.name,
      name: `Trip to ${destination.name.split(',')[0]}`,
      color: 'blue'
    });
    openModal('trip');
  };

  // jsConfetti instance
  const jsConfettiRef = useRef(null);
  useEffect(() => {
    jsConfettiRef.current = new JSConfetti();
    return () => { jsConfettiRef.current = null; }
  }, []);

  const saveItinerary = () => {
    if (jsConfettiRef.current) {
      jsConfettiRef.current.addConfetti({ 
        emojis: ['🎉', '✨', '🎊', '✈️', '🌴', '🧳'], 
        confettiNumber: 40 
      });
    }
  };

  const toggleDarkMode = () => { setDarkMode(dm => !dm); };

  // Modal content render
const renderModalContent = () => {
  switch (modalType) {
    case "trip":
      return (
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-4xl mx-auto shadow-2xl overflow-hidden">
          {/* Modal Header with Close Button */}
          <div className="relative px-6 md:px-8 pt-6 md:pt-8">
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 group z-10"
            >
              <X className="w-5 h-5 text-white/70 group-hover:text-white" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Header & Illustration */}
            <div className="lg:w-2/5 px-6 md:px-8 pb-6 lg:pb-8 lg:pr-0">
              <div className="text-center lg:text-left">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4 md:mb-6 shadow-lg"
                >
                  <Plane className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {modalData?.id ? "Edit Your Journey" : "Plan Your Adventure"}
                </motion.h2>

                {/* Subtitle */}
                <motion.p 
                  className="text-white/70 text-sm md:text-base mb-6 md:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {modalData?.id 
                    ? "Update your trip details and make it perfect" 
                    : "Create unforgettable memories with your personalized itinerary"
                  }
                </motion.p>

                {/* Decorative Stats (Hidden on mobile to save space) */}
                <motion.div 
                  className="hidden lg:grid grid-cols-2 gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-blue-400 font-bold text-lg">195+</div>
                    <div className="text-white/60 text-xs">Countries</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-green-400 font-bold text-lg">50k+</div>
                    <div className="text-white/60 text-xs">Happy Travelers</div>
                  </div>
                </motion.div>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-3/5 px-6 md:px-8 pb-6 md:pb-8 lg:pl-8">
              <form onSubmit={e => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const tripData = {
                  id: modalData?.id,
                  name: fd.get("name"),
                  destination: fd.get("destination"),
                  startDate: fd.get("startDate"),
                  endDate: fd.get("endDate"),
                  color: fd.get("color"),
                  // userId: user?.id || null
                };
                modalData?.id ? editTrip(tripData) : addTrip(tripData);
              }} className="space-y-6 md:space-y-8">

                {/* Trip Name & Destination Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-white font-semibold mb-3 flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Trip Name
                    </label>
                    <div className="relative group">
                      <input 
                        name="name" 
                        defaultValue={modalData?.name || ""} 
                        placeholder="My Amazing Adventure"
                        className="w-full p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder-white/40 text-sm md:text-base group-hover:border-white/30" 
                        required 
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10"></div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-white font-semibold mb-3 flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                      Destination
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
                      <input 
                        name="destination" 
                        defaultValue={modalData?.destination || ""} 
                        placeholder="Paris, France"
                        className="w-full p-3 md:p-4 pl-10 md:pl-12 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder-white/40 text-sm md:text-base group-hover:border-white/30" 
                        required 
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10"></div>
                    </div>
                  </motion.div>
                </div>

                {/* Dates Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                >
                  <div>
                    <label className="block text-white font-semibold mb-3 flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Departure Date
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
                      <input 
                        type="date" 
                        name="startDate" 
                        defaultValue={modalData?.startDate || new Date().toISOString().split('T')[0]} 
                        className="w-full p-3 md:p-4 pl-10 md:pl-12 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-sm md:text-base group-hover:border-white/30" 
                        required 
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10"></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-3 flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      Return Date
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
                      <input 
                        type="date" 
                        name="endDate" 
                        defaultValue={modalData?.endDate || new Date().toISOString().split('T')[0]} 
                        className="w-full p-3 md:p-4 pl-10 md:pl-12 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all text-sm md:text-base group-hover:border-white/30" 
                        required 
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Color Theme Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-white font-semibold mb-4 flex items-center text-sm md:text-base">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    Choose Your Theme Color
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
                    {tripColors.map((color, index) => (
                      <motion.label 
                        key={color.id} 
                        className="cursor-pointer relative group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.05 }}
                      >
                        <input 
                          type="radio" 
                          name="color" 
                          value={color.id} 
                          defaultChecked={modalData?.color === color.id || (!modalData && color.id === "blue")} 
                          className="sr-only peer" 
                        />
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${color.bg} border-3 border-transparent peer-checked:border-white peer-checked:shadow-2xl peer-checked:shadow-${color.id}-500/30 group-hover:scale-105 transition-all duration-300 relative overflow-hidden flex items-center justify-center`}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                          >
                            <Check className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg" />
                          </motion.div>
                          
                          {/* Ripple Effect */}
                          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 peer-checked:opacity-100 peer-checked:animate-ping"></div>
                        </div>
                        
                        {/* Color Name Tooltip */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity capitalize whitespace-nowrap pointer-events-none">
                          {color.id}
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <motion.button 
                    type="button" 
                    onClick={closeModal} 
                    className="flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium border border-white/20 hover:border-white/30 text-sm md:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button 
                    type="submit" 
                    className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center space-x-2 text-sm md:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{modalData?.id ? "Update Journey" : "Start Planning"}</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </div>

          {/* Floating Animation Elements */}
          <div className="absolute top-8 right-8 md:top-12 md:right-12 opacity-10 pointer-events-none">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Globe className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 opacity-5 pointer-events-none">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
          </div>
        </div>
      );
    default: 
      return null;
  }
};



  // Render main component
  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-black to-blue-900'} flex items-center justify-center p-4 font-sans`}>
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-7xl w-full min-h-[85vh] flex overflow-hidden">
        
        {/* Dashboard view */}
        {activeView === "dashboard" && (
          <div className="w-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-white text-3xl font-bold">Travel Dashboard</h1>
              <div className="flex space-x-4">
                <button 
                  onClick={goToTrips} 
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
                >
                  <Plane className="w-5 h-5" />
                  <span>My Trips</span>
                </button>
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

            {/* Dashboard Stats */}
            <DashboardStats stats={dashboardStats} loading={statsLoading} />

            {/* Popular Destinations */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <PopularDestinations onSelectDestination={handleDestinationSelect} />
            </div>
          </div>
        )}

        {/* Trips view */}
        {activeView === "trips" && (
          <div className="w-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={goToDashboard} 
                  className="p-2 rounded-full bg-gray-800/50 text-white hover:bg-gray-700/60 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-white text-3xl font-bold">Your Travel Itineraries</h1>
              </div>
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
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : (
                <AnimatePresence>
                  {trips.filter(trip => trip.active).map(trip => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      isActive={true}
                      onClick={() => selectTrip(trip.id)}
                      onEdit={() => openModal("trip", trip)}
                      onDelete={() => deleteTrip(trip.id)}
                      onActivate={() => {}}
                    />
                  ))}
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
              )}
              
              {!loading && trips.length === 0 && (
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

        {/* Planning view - keeping existing structure */}
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
                {currentTrip.days?.length > 0 ? (
                  <div className="space-y-2">
                    {currentTrip.days.map(day => (
                      <DayCard 
                        key={day.id} 
                        day={day}
                        isActive={activeDay === day.id}
                        onClick={() => setActiveDay(day.id)}
                        onEdit={() => openModal("day", day)}
                        onDelete={(dayId) => {/* Add deleteDay handler */}}
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
                    {currentDay.activities?.length > 0 ? (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToParentElement]}>
                        <SortableContext items={currentDay.activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                          {currentDay.activities.map((activity) => (
                            <SortableActivityCard
                              key={activity.id} 
                              activity={activity}
                              onEdit={() => {/* Add editActivity handler */}}
                              onDelete={() => {/* Add deleteActivity handler */}}
                              color={currentTrip.color}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    ) : (
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
                {/* <X className="w-5 h-5" /> */}
              </button>
              {renderModalContent()}
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
        input[type="time"]::-webkit-calendar-picker-indicator,
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1);}
      `}</style>
    </div>
  );
}
