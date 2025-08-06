const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 32}
    height={props.height ?? 32}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m7 7 9 9m0 0-9 9m9-9 9 9m-9-9 9-9"
    />
  </svg>
);
export default SvgComponent;
