import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #804839 0%, #5c342a 100%)",
        borderRadius: 6,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#ffffff",
        }}
      >
        C
      </span>
    </div>,
    { ...size },
  );
}
