const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 25}
    height={props.height ?? 24}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color || "#fff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m5.56 17.086 3.149-4.291a.99.99 0 0 1 1.283-.275l3.194 1.811 5.142-6.92m-3.892.12 4.3-.602.733 4.116"
    />
  </svg>
);
export default SvgComponent;
