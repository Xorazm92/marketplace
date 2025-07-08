"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect, useCallback } from "react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AddressData } from "../../../types/userData";
// @ts-ignore
const GeoSearchControl = require("leaflet-geosearch").GeoSearchControl;

// Marker rasmi to'g'irlash
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({
  setPosition,
  updateAddress,
}: {
  setPosition: (pos: [number, number]) => void;
  updateAddress: (coords: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      updateAddress(coords);
    },
  });
  return null;
}

function AddSearchControl() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      autoClose: true,
      keepResult: true,
      updateMap: true,
      showMarker: false,
    });

    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

interface MapContentProps {
  addressData: {
    name: string;
    address: string;
    lat?: string | null;
    long?: string | null;
    [key: string]: any; // For any additional fields
  };
  setAddressData: (data: any) => void;
}

export default function MapContent({
  addressData,
  setAddressData,
}: MapContentProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    addressData?.lat && addressData?.long
      ? [parseFloat(addressData.lat), parseFloat(addressData.long)]
      : null,
  );
  const [address, setAddress] = useState<string>(
    addressData?.address || "Manzil yuklanmoqda...",
  );
  const [locationName, setLocationName] = useState<string>(
    addressData?.name || "",
  );

  // Function to get address from coordinates
  const getAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz&addressdetails=1`,
      );
      const data = await response.json();

      if (data.display_name) {
        // Format the address to a more readable format
        const addressParts = [];

        // Add road/house number if available
        if (data.address.road) {
          addressParts.push(data.address.road);
          if (data.address.house_number) {
            addressParts[
              addressParts.length - 1
            ] += ` ${data.address.house_number}`;
          }
        }

        // Add neighborhood/suburb if available
        if (data.address.neighbourhood || data.address.suburb) {
          addressParts.push(data.address.neighbourhood || data.address.suburb);
        }

        // Add district
        if (data.address.city_district) {
          addressParts.push(data.address.city_district);
        } else if (data.address.district) {
          addressParts.push(data.address.district);
        }

        // Add city
        if (data.address.city) {
          addressParts.push(data.address.city);
        }

        return addressParts.join(", ");
      }
      return "Manzil topilmadi";
    } catch (error) {
      console.error("Manzilni olishda xatolik:", error);
      return "Manzilni olishda xatolik";
    }
  }, []);

  const updateAddress = async (coords: [number, number]) => {
    setPosition(coords);

    // Get human-readable address
    const newAddress = await getAddressFromCoords(coords[0], coords[1]);
    setAddress(newAddress);

    // Update the parent component's address data
    setAddressData({
      ...addressData,
      lat: coords[0].toString(),
      long: coords[1].toString(),
      address: newAddress,
      // If name is not set, use the first part of the address as the default name
      name: addressData.name || newAddress.split(",")[0].trim(),
    });

    // Update local state for the name if it's not set
    if (!addressData.name) {
      setLocationName(newAddress.split(",")[0].trim());
    }
  };

  useEffect(() => {
    if (!position) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: [number, number] = [
              pos.coords.latitude,
              pos.coords.longitude,
            ];
            updateAddress(coords);
          },
          (err) => {
            console.error("Geolocation error:", err.message);
            // Fallback to Tashkent
            updateAddress([41.3111, 69.2797]);
          },
        );
      } else {
        console.warn("Geolocation is not supported");
        updateAddress([41.3111, 69.2797]);
      }
    }
  }, []);

  // Update address when position changes
  useEffect(() => {
    if (position) {
      getAddressFromCoords(position[0], position[1]).then((addr) => {
        setAddress(addr);
        // Update parent component if position was set from initial props
        if (addressData.lat && addressData.long) {
          setAddressData({
            ...addressData,
            address: addr,
          });
        }
      });
    }
  }, [position, getAddressFromCoords]);

  // Show loading state
  if (!position)
    return (
      <p>
        Xarita yuklanmoqda... <AiOutlineLoading3Quarters />
      </p>
    );

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", maxWidth: "777px", width: "100%", zIndex:"1" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker setPosition={setPosition} updateAddress={updateAddress} />
      <AddSearchControl />
      <Marker position={position}>
        <Popup>
          {/* <div className="mb-2">
            <input
              type="text"
              className="w-full p-1 border rounded mb-1"
              placeholder="Manzil nomi (masalan: Uy, Ofis)"
              value={locationName}
              onChange={(e) => {
                const newName = e.target.value;
                setLocationName(newName);
              }}
            />
          </div> */}
          <div className="text-sm">
            <div className="font-medium">Manzil:</div>
            <div className="mb-1">{address}</div>
            <div className="text-xs text-gray-500">
              Kenglik: {position[0].toFixed(6)}°N, Uzunlik:{" "}
              {position[1].toFixed(6)}°E
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
