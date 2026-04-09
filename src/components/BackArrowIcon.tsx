import React from "react";
import Svg, { Path } from "react-native-svg";

type BackArrowIconProps = {
  width?: number;
  height?: number;
};

export default function BackArrowIcon({ width = 24, height = 24 }: BackArrowIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.9402 18.9047L4.9751 11.9397M4.9751 11.9397L11.9402 4.97461M4.9751 11.9397H18.9052"
        stroke="#01AB51"
        strokeWidth={1.99002}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}