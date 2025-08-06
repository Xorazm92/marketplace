const SvgComponent = (props) => (
  <svg
    width={props.width ?? 64}
    height={props.height ?? 64}
    fill="none"
    {...props}
  >
    <path
      fill={props.color || "#999CA0"}
      d="m32 56-4.8-4.4C14.4 40.32 6 32.72 6 23.5 6 16.42 11.42 11 18.5 11c3.74 0 7.41 1.81 9.5 4.09 2.09-2.28 5.76-4.09 9.5-4.09C44.58 11 50 16.42 50 23.5c0 9.22-8.4 16.82-21.2 28.1L32 56Z"
    />
  </svg>
);
export default SvgComponent;
