import * as React from "react";
const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 16}
    height={props.width || 15}
    fill="none"
    {...props}
  >
    <path
      stroke="#999CA0"
      strokeLinecap="round"
      strokeWidth={1.333}
      d="m14.75 14.25-3.31-3.304m0 0a5.971 5.971 0 1 0-8.439-8.45 5.971 5.971 0 0 0 8.44 8.45Z"
    />
  </svg>
);
export default SvgComponent;
