import * as React from "react";
const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={25}
    fill="none"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      d="M10.5 9.875a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 1 0-3 0m3 0h8.625m-11.625 0H4.875m8.625 6a1.5 1.5 0 0 1 3 0m-3 0a1.5 1.5 0 0 0 3 0m-3 0H4.875m11.625 0h2.625"
    />
  </svg>
);
export default SvgComponent;
