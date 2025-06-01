import React from "react";

import { View } from "react-native";
import Svg, { Path, Line, Circle } from "react-native-svg";

interface Props {
  icon?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconFillColor?: string;
  iconStrokeColor?: string;
  iconStrokeWidth?: number;
}

export default function FeatherIcons({
  icon,
  iconWidth = 24,
  iconHeight = 24,
  iconFillColor = "none",
  iconStrokeColor = "#000",
  iconStrokeWidth = 2,
}: Props) {
  const renderIcon = () => {
    switch (icon) {
      case "back-arrow":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M19 12H5" />
            <Path d="M12 19l-7-7 7-7" />
          </Svg>
        );

      case "wave":
        return (
          <svg
            width="393"
            height="359"
            viewBox="0 0 393 359"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="66.632"
              cy="126.854"
              rx="78.08"
              ry="80.13"
              transform="rotate(2.577 66.632 126.854)"
              fill="#fff"
            />
            <ellipse
              cx="163.482"
              cy="81.437"
              rx="80.964"
              ry="73.741"
              transform="rotate(2.577 163.482 81.437)"
              fill="#fff"
            />
            <ellipse
              cx="291.569"
              cy="115.613"
              rx="84.294"
              ry="89.302"
              transform="rotate(2.577 291.569 115.613)"
              fill="#fff"
            />
            <ellipse
              cx="373.075"
              cy="204.952"
              rx="90.749"
              ry="97.419"
              transform="rotate(2.577 373.075 204.952)"
              fill="#fff"
            />
            <path
              fill="#fff"
              d="m-5.389 116.637 428.387 19.28-10.941 243.107-428.388-19.281z"
            />
          </svg>
        );

      case "home":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <Path d="M9 22V12h6v10" />
          </Svg>
        );

      case "settings":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
            <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          </Svg>
        );

      case "image-upload":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2 5a3 3 0 013-3h14a3 3 0 013 3v14a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm5.5 5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm2.854 3.354L12.5 15.5l5.646-5.646a.5.5 0 01.854.353V19H5v-1l4.646-4.646a.5.5 0 01.708 0z"
              fill={iconStrokeColor}
            />
          </Svg>
        );

      case "plus-icon":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Line x1="4" y1="12" x2="20" y2="12" />
            <Line x1="12" y1="4" x2="12" y2="20" />
          </Svg>
        );

      case "camera-icon":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M8.75 3.5a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75z" />
            <Path d="M9.958 5.25h4.083c1.37 0 2.454 0 3.32.088.889.09 1.63.28 2.278.713.518.346.964.792 1.31 1.31.433.648.622 1.39.713 2.277.088.867.088 1.952.088 3.322v.082c0 1.369 0 2.454-.088 3.32-.09.888-.28 1.629-.712 2.277a4.8 4.8 0 0 1-1.311 1.31c-.648.434-1.39.623-2.277.713-.866.088-1.951.088-3.32.088H9.958c-1.369 0-2.454 0-3.32-.088-.888-.09-1.629-.28-2.277-.712a4.8 4.8 0 0 1-1.31-1.311c-.434-.648-.623-1.39-.713-2.277-.088-.866-.088-1.951-.088-3.32v-.085c0-1.369 0-2.453.088-3.32.09-.887.28-1.628.712-2.276a4.8 4.8 0 0 1 1.31-1.31c.65-.433 1.39-.622 2.278-.713.866-.088 1.951-.088 3.32-.088z" />
            <Path d="M12 10.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5z" />
            <Path d="M8.25 13a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0z" />
            <Path d="M16.75 10a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75z" />
          </Svg>
        );

      case "gallery-icon":
        return (
          <Svg
            viewBox="0 0 24 24"
            fill="none"
            width={iconWidth}
            height={iconHeight}
          >
            <Path
              d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"
              stroke={iconStrokeColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx="16"
              cy="8"
              r="2"
              stroke={iconStrokeColor}
              strokeWidth={1.5}
            />
            <Path
              d="M2 12.5l1.752-1.533a2.3 2.3 0 0 1 3.14.105l4.29 4.29a2 2 0 0 0 2.564.222l.299-.21a3 3 0 0 1 3.731.225L21 18.5"
              stroke={iconStrokeColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

      case "group-icon":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path
              d="M12 14c1.381 0 2.631-.56 3.536-1.465C16.44 11.631 17 10.381 17 9s-.56-2.631-1.464-3.535C14.631 4.56 13.381 4 12 4s-2.631.56-3.536 1.465C7.56 6.369 7 7.619 7 9s.56 2.631 1.464 3.535A4.985 4.985 0 0012 14zm8 1a2.495 2.495 0 002.5-2.5c0-.69-.279-1.315-.732-1.768A2.492 2.492 0 0020 10a2.495 2.495 0 00-2.5 2.5A2.496 2.496 0 0020 15zm0 .59c-1.331 0-2.332.406-2.917.968C15.968 15.641 14.205 15 12 15c-2.266 0-3.995.648-5.092 1.564C6.312 15.999 5.3 15.59 4 15.59c-2.188 0-3.5 1.09-3.5 2.182 0 .545 1.312 1.092 3.5 1.092.604 0 1.146-.051 1.623-.133l-.04.27c0 1 2.406 2 6.417 2 3.762 0 6.417-1 6.417-2l-.02-.255c.463.073.995.118 1.603.118 2.051 0 3.5-.547 3.5-1.092 0-1.092-1.373-2.182-3.5-2.182zM4 15c.69 0 1.315-.279 1.768-.732A2.492 2.492 0 006.5 12.5 2.495 2.495 0 004 10a2.496 2.496 0 00-2.5 2.5A2.495 2.495 0 004 15z"
              fill={iconStrokeColor}
            />
          </Svg>
        );

      case "color-icon":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 100 100"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path
              d="M44.55 10.526C18.234 10.526 0 31.58 0 42.106s5.263 18.42 15.79 18.42c10.526 0 15.789 2.632 15.789 10.527 0 10.526 7.895 18.42 18.421 18.42 34.21 0 50-18.42 50-36.841 0-31.58-23.87-42.106-55.45-42.106zm-7.024 10.527a6.58 6.58 0 110 13.158 6.58 6.58 0 010-13.158zm21.053 0a6.58 6.58 0 110 13.158 6.58 6.58 0 010-13.158zm19.053 10.526a6.579 6.579 0 110 13.158 6.579 6.579 0 010-13.158zm-58.527 1.263a6.58 6.58 0 110 13.158 6.58 6.58 0 010-13.158zM54 63.158a7.895 7.895 0 017.895 7.895c0 4.36-5.535 7.894-9.895 7.894a7.895 7.895 0 01-7.895-7.894c0-4.36 5.535-7.895 9.895-7.895z"
              fill={iconStrokeColor}
            />
          </Svg>
        );

      case "rules-icon":
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 32 32"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M9 16H23V18H9z" fill={iconStrokeColor} />
            <Path d="M9 10H23V12H9z" fill={iconStrokeColor} />
            <Path
              d="M26 2H6a2.002 2.002 0 00-2 2v13a10.981 10.981 0 005.824 9.707L16 30l6.176-3.293A10.981 10.981 0 0028 17V4a2.002 2.002 0 00-2-2zm-3 16H9v-2h14zm0-6H9v-2h14z"
              fill={iconStrokeColor}
            />
          </Svg>
        );

      case "rupee-icon":
        return (
          <Svg
          width={iconWidth}
          height={iconHeight}
          viewBox="0 0 32 32"
          fill={iconFillColor}
          stroke={iconStrokeColor}
          strokeWidth={iconStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path
            d="M6 4h4.5m0 0a4.5 4.5 0 110 9H6l7 7M10.5 4H18M6 8.5h12"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        );

      default:
        return (
          <Svg
            width={iconWidth}
            height={iconHeight}
            viewBox="0 0 24 24"
            fill={iconFillColor}
            stroke={iconStrokeColor}
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <Path d="M12 17h.01" />
          </Svg>
        );
    }
  };
  return <View>{renderIcon()}</View>;
}
