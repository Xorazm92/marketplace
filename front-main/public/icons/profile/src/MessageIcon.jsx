const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 25}
    height={props.height ?? 25}
    fill="none"
    {...props}
  >
    <path
      fill="#4E46B4"
      d="M7.75 8.895a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9ZM7 13.645a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75ZM7.75 16.895a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5Z"
    />
    <path
      fill="#4E46B4"
      fillRule="evenodd"
      d="M12.75 1.895C6.813 1.895 2 6.707 2 12.645v10c0 .414.336.75.75.75h10c5.937 0 10.75-4.813 10.75-10.75 0-5.938-4.813-10.75-10.75-10.75ZM3.5 12.645a9.25 9.25 0 1 1 9.25 9.25H3.5v-9.25Z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgComponent;
