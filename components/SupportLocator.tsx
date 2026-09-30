import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { logEvent } from '../utils/analytics';

interface Station {
    id: string;
    name: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
    distance?: number; // in km
}

// Key Cyber Crime Stations across India (with Kerala as fallback)
const CYBER_STATIONS: Station[] = [
    // Kerala (Fallback / Original)
    {
        id: 'tvm',
        name: 'Cyber Crime Police Station, Thiruvananthapuram',
        address: 'Police Headquarters, Vazhuthacaud, Thiruvananthapuram, Kerala 695010',
        phone: '0471-2722500',
        lat: 8.5060,
        lng: 76.9567
    },
    {
        id: 'kochi',
        name: 'Cyber Crime Police Station, Kochi City',
        address: 'Revenue Tower, Park Avenue, Ernakulam, Kerala 682011',
        phone: '0484-2385006',
        lat: 9.9656,
        lng: 76.2961
    },
    {
        id: 'kozhikode',
        name: 'Cyber Crime Police Station, Kozhikode',
        address: 'District Police Office, Kozhikode City, Kerala 673001',
        phone: '0495-2721557',
        lat: 11.2588,
        lng: 75.7804
    },
    // Major Indian Cities
    {
        id: 'bangalore',
        name: 'CID Cyber Crime Police Station, Bengaluru',
        address: 'Carlton House, Palace Road, Bengaluru, Karnataka 560001',
        phone: '080-22094498',
        lat: 12.9833,
        lng: 77.5833
    },
    {
        id: 'chennai',
        name: 'Cyber Crime Cell, CCB, Chennai',
        address: 'Vepery, Chennai, Tamil Nadu 600007',
        phone: '044-23452348',
        lat: 13.0827,
        lng: 80.2707
    },
    {
        id: 'kolkata',
        name: 'Cyber Crime Police Station, Kolkata',
        address: 'Lalbazar, Kolkata, West Bengal 700001',
        phone: '033-22143000',
        lat: 22.5726,
        lng: 88.3639
    },
    {
        id: 'mumbai',
        name: 'Cyber Crime Investigation Cell, Mumbai',
        address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
        phone: '022-26504008',
        lat: 19.0650,
        lng: 72.8650
    },
    {
        id: 'delhi',
        name: 'Cyber Crime Unit (CyPAD), New Delhi',
        address: 'Sector 16C, Dwarka, New Delhi 110078',
        phone: '011-20892514',
        lat: 28.6010,
        lng: 77.0360
    },
    {
        id: 'hyderabad',
        name: 'Cyber Crimes Police Station, CCS, Hyderabad',
        address: 'Basheerbagh, Hyderabad, Telangana 500029',
        phone: '040-27852418',
        lat: 17.4018,
        lng: 78.4747
    }
];

interface SupportLocatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SupportLocator: React.FC<SupportLocatorProps> = ({ isOpen, onClose }) => {
    const [stations, setStations] = useState<Station[]>(CYBER_STATIONS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

    // Haversine formula to calculate distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    useEffect(() => {
        if (isOpen) {
            locateUser();
        }
    }, [isOpen]);

    const locateUser = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                setUserLocation({ lat: userLat, lng: userLng });

                const sortedStations = CYBER_STATIONS.map(station => ({
                    ...station,
                    distance: calculateDistance(userLat, userLng, station.lat, station.lng)
                })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

                setStations(sortedStations);
                setLoading(false);
            },
            (err) => {
                console.error("Error getting location:", err);
                setError("Unable to retrieve your location. Showing list alphabetically.");
                setLoading(false);
                // Fallback: Sort alphabetically if location fails
                setStations([...CYBER_STATIONS].sort((a, b) => a.name.localeCompare(b.name)));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#18201d] w-full max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-200 dark:border-green-900/30 overflow-hidden flex flex-col max-h-[85dvh] animate-slide-up sm:animate-fade-in">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-[#111816]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <i className="fa-solid fa-map-location-dot"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Nearby Support</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cyber Crime Stations</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            triggerHaptic('light');
                            onClose();
                        }}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-10 space-y-3 min-h-0 no-scrollbar">
                    
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-3 text-gray-400">
                            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-500"></i>
                            <p className="text-xs">Locating nearest stations...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 p-3 rounded-xl text-xs flex items-start gap-2 border border-amber-100 dark:border-amber-900/30">
                            <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && stations.map((station) => (
                        <div key={station.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 hover:border-emerald-500/30 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 pr-4">{station.name}</h3>
                                {station.distance !== undefined && (
                                    <span className="flex-shrink-0 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                        {station.distance.toFixed(1)} km
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                                <i className="fa-solid fa-location-dot mr-1.5 opacity-50"></i>
                                {station.address}
                            </p>

                            <div className="flex gap-2 mt-2">
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        logEvent('Support', 'Directions', station.name);
                                    }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    <i className="fa-solid fa-diamond-turn-right"></i> Directions
                                </a>
                                <a 
                                    href={`tel:${station.phone}`}
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        logEvent('Support', 'Call', station.name);
                                    }}
                                    className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    <i className="fa-solid fa-phone"></i> Call
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 dark:bg-[#111816] border-t border-gray-100 dark:border-white/5 text-center">
                    <p className="text-[10px] text-gray-400">
                        <i className="fa-solid fa-shield-halved mr-1"></i>
                        Official Cyber Crime Stations (India)
                    </p>
                </div>
            </div>
        </div>
    );
};
