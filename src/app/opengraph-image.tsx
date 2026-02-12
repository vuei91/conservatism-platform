import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "보수주의 강의 플랫폼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f1f33 100%)",
        position: "relative",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(37, 99, 235, 0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.1)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "#ffffff",
            margin: 0,
          }}
        >
          보수주의 강의 플랫폼
        </h1>
        <p
          style={{
            fontSize: 32,
            color: "#94a3b8",
            margin: 0,
          }}
        >
          보수주의 사상과 철학을 배우는 무료 교육 플랫폼
        </p>
        <div
          style={{
            marginTop: 32,
            padding: "16px 48px",
            background: "#3b82f6",
            borderRadius: 8,
            fontSize: 24,
            fontWeight: "bold",
            color: "#ffffff",
          }}
        >
          무료 강의
        </div>
      </div>

      {/* Bottom border */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 20,
          background: "#3b82f6",
        }}
      />
    </div>,
    { ...size },
  );
}
