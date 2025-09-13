const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 24}
    height={props.height ?? 24}
    fill="none"
    {...props}
  >
    <path
      stroke={props.color || "#999CA0"}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.125 14.192v2.74c0 1.212-.982 2.193-2.192 2.193H7.067a2.192 2.192 0 0 1-2.192-2.192v-2.74M12 15.835V4.875m0 0L8.712 8.163M12 4.875l3.289 3.288"
    />
  </svg>
);
export default SvgComponent;
