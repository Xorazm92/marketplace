const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 24}
    height={props.height ?? 24}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color || "#000"}
      strokeLinejoin="round"
      d="M14.25 10.356c0 1.21-1.007 2.192-2.25 2.192s-2.25-.981-2.25-2.192c0-1.211 1.007-2.193 2.25-2.193s2.25.982 2.25 2.193Z"
    />
    <path
      stroke="#000"
      strokeLinejoin="round"
      d="M17.625 10.187c0 4.62-5.625 8.938-5.625 8.938s-5.625-4.318-5.625-8.938c0-2.934 2.518-5.312 5.625-5.312s5.625 2.378 5.625 5.312Z"
    />
  </svg>
);
export default SvgComponent;
