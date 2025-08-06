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
      d="M25.5 13.077h-19m5.115-3.654V6.5m8.77 2.923V6.5M6.5 10.885v11.692A2.923 2.923 0 0 0 9.423 25.5h13.154a2.923 2.923 0 0 0 2.923-2.923V10.885a2.923 2.923 0 0 0-2.923-2.923H9.423A2.923 2.923 0 0 0 6.5 10.885Z"
    />
  </svg>
);
export default SvgComponent;
