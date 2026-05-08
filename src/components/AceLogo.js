import { useRef, useEffect } from "react";

export default function AceLogo({ size = 80, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0);
      try {
        const id = ctx.getImageData(0, 0, w, h);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (brightness < 35) {
            d[i + 3] = 0;
          } else if (brightness < 80) {
            d[i + 3] = Math.round(((brightness - 35) / 45) * 255);
          }
        }
        ctx.putImageData(id, 0, 0);
      } catch (_) {}
    };
    img.src = "/ace-logo.png";
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: "auto", display: "block" }}
    />
  );
}
