import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ file: "192.png" }, { file: "512.png" }, { file: "maskable-512.png" }];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const m = /^(maskable-)?(\d+)\.png$/.exec(file);
  if (!m) return new Response("Not found", { status: 404 });

  const maskable = Boolean(m[1]);
  const px = parseInt(m[2], 10);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #38bdf8, #0369a1)",
          borderRadius: maskable ? 0 : px * 0.22,
        }}
      >
        <div
          style={{
            width: px * 0.62,
            height: px * 0.62,
            borderRadius: "50%",
            background: "#f97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: px * 0.42,
            fontWeight: 700,
          }}
        >
          B
        </div>
      </div>
    ),
    { width: px, height: px }
  );
}