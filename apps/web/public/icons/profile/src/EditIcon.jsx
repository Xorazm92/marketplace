const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 25}
    height={props.height ?? 24}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color || "#4E46B4"}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.962 19.125H5.125v-3.844l7.947-7.962m-4.11 11.806h10.413m-10.413 0 7.947-7.963M13.072 7.32l1.644-1.648a2.71 2.71 0 0 1 3.837 0 2.722 2.722 0 0 1 0 3.844l-1.644 1.647M13.072 7.32l3.837 3.843"
    />
  </svg>
);
export default SvgComponent;
