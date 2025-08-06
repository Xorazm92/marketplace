const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 43}
    height={props.height ?? 40}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color || "#999CA0"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m26.028 22.5-5.833-5.833L14.36 22.5"
    />
  </svg>
);
export default SvgComponent;
