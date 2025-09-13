// components/MapComponent.tsx
"use client";

import dynamic from "next/dynamic";
import { JSX, SetStateAction, useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AddressData } from "../../../types/userData";
import { Dispatch } from "@reduxjs/toolkit";

// Dynamically import the Map component with SSR disabled
const MapWithNoSSR = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => (
    <p>
      Loading map... <AiOutlineLoading3Quarters />
    </p>
  ),
});

interface MapComponentProps {
  addressData: AddressData;
  setAddressData: React.Dispatch<React.SetStateAction<AddressData>>;
}
const MapComponent = ({
  addressData,
  setAddressData,
}: MapComponentProps): JSX.Element => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{
          height: "400px",
          width: "100px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading map... <AiOutlineLoading3Quarters />
      </div>
    );
  }

  return (
    <MapWithNoSSR addressData={addressData} setAddressData={setAddressData} />
  );
};

export default MapComponent;
