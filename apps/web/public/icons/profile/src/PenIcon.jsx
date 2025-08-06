const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 16}
    height={props.height ?? 16}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color || "#999CA0"}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.808 12.75H3.25v-2.563L8.548 4.88m-2.74 7.871h6.942m-6.942 0 5.298-5.308M8.548 4.879l1.096-1.098a1.806 1.806 0 0 1 2.558 0 1.815 1.815 0 0 1 0 2.562l-1.096 1.099M8.548 4.879l2.558 2.563"
    />
  </svg>
);
export default SvgComponent;
