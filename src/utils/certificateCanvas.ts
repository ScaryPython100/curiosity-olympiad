/**
 * /src/utils/certificateCanvas.ts
 *
 * Generates an official, high-resolution Agastya Curiosity Olympiad Certificate
 * using native HTML5 Canvas and triggers an immediate download as PNG.
 * Works reliably across all browsers without external dependencies.
 */

export interface CertificateData {
  studentRealName: string;
  achievementType: string;
  awardDate: string;
  certificateId: string;
}

export function downloadCertificateAsPNG({
  studentRealName,
  achievementType,
  awardDate,
  certificateId,
}: CertificateData) {
  // 1. Create a high-resolution canvas (Standard Diploma Ratio 1920 x 1358)
  const width = 1920;
  const height = 1358;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    alert("Canvas rendering is not supported on this device.");
    return;
  }

  // 2. Background - Elegant Ivory Diploma Texture with Subtle Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#ffffff");
  bgGradient.addColorStop(0.5, "#fffcf7");
  bgGradient.addColorStop(1, "#fef8f0");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 3. Outer Navy Ornamental Border
  ctx.strokeStyle = "#143867";
  ctx.lineWidth = 18;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // 4. Inner Golden Decorative Border
  ctx.strokeStyle = "#f37021";
  ctx.lineWidth = 6;
  ctx.strokeRect(78, 78, width - 156, height - 156);

  // 5. Corner Flourish Embellishments (Geometric Gold/Navy Corners)
  const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dirY * 40);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dirX * 40, y);
    ctx.strokeStyle = "#d97706"; // Gold
    ctx.lineWidth = 8;
    ctx.stroke();
  };
  drawCorner(78, 78, 1, 1);
  drawCorner(width - 78, 78, -1, 1);
  drawCorner(78, height - 78, 1, -1);
  drawCorner(width - 78, height - 78, -1, -1);

  // 6. Header Top Text - Organization & Event
  ctx.fillStyle = "#64748b"; // Gray font
  ctx.font = "bold 26px 'Montserrat', sans-serif, Arial";
  ctx.textAlign = "center";
  ctx.fillText("AGASTYA INTERNATIONAL FOUNDATION • CURIOSITY OLYMPIAD 2026", width / 2, 170);

  // 7. Main Title - CERTIFICATE OF EXCELLENCE
  ctx.fillStyle = "#143867";
  ctx.font = "900 76px 'Georgia', 'Times New Roman', serif";
  ctx.fillText("CERTIFICATE OF EXCELLENCE", width / 2, 285);

  // Decorative Golden Divider Line
  ctx.beginPath();
  ctx.moveTo(width / 2 - 350, 330);
  ctx.lineTo(width / 2 + 350, 330);
  ctx.strokeStyle = "#f37021";
  ctx.lineWidth = 4;
  ctx.stroke();

  // 8. Presentation Text
  ctx.fillStyle = "#475569";
  ctx.font = "italic 32px 'Georgia', 'Times New Roman', serif";
  ctx.fillText("This formal Certificate of Merit is proudly presented to", width / 2, 420);

  // 9. RECIPIENT'S REAL NAME (Highlight with Gold Shadow / Navy Text)
  ctx.fillStyle = "#143867";
  ctx.font = "bold 88px 'Georgia', 'Times New Roman', serif";
  ctx.fillText(studentRealName || "Student Champion", width / 2, 545);

  // Underline for Name
  const nameWidth = ctx.measureText(studentRealName || "Student Champion").width;
  ctx.beginPath();
  ctx.moveTo(width / 2 - Math.max(nameWidth / 2, 300) - 20, 575);
  ctx.lineTo(width / 2 + Math.max(nameWidth / 2, 300) + 20, 575);
  ctx.strokeStyle = "#143867";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 10. Achievement Citation
  ctx.fillStyle = "#334155";
  ctx.font = "34px 'Montserrat', sans-serif, Arial";
  ctx.fillText("For demonstrating exceptional scientific inquiry, experiential problem-solving,", width / 2, 675);
  ctx.fillText("and achieving national top standing in the Agastya Curiosity Olympiad:", width / 2, 725);

  // 11. Highlighted Badge Box - ACHIEVEMENT TYPE
  const badgeText = `★ ${achievementType.toUpperCase()} ★`;
  ctx.font = "bold 44px 'Montserrat', sans-serif, Arial";
  const badgeWidth = ctx.measureText(badgeText).width + 120;
  ctx.fillStyle = "#fff7ed";
  ctx.strokeStyle = "#f37021";
  ctx.lineWidth = 5;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 800;
  const badgeHeight = 96;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f37021";
  ctx.fillText(badgeText, width / 2, badgeY + 63);

  // 12. Verification Footer & Signatures
  const footerY = 1120;

  // Left - Dr. Ramji Narayanan Signature Area
  ctx.textAlign = "left";
  ctx.fillStyle = "#143867";
  ctx.font = "bold 32px 'Georgia', 'Times New Roman', serif";
  ctx.fillText("Dr. Ramji Narayanan", 200, footerY);
  ctx.fillStyle = "#64748b";
  ctx.font = "24px 'Montserrat', sans-serif, Arial";
  ctx.fillText("Chief Mentor & Founder, Agastya Foundation", 200, footerY + 36);

  ctx.beginPath();
  ctx.moveTo(200, footerY - 40);
  ctx.lineTo(600, footerY - 40);
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Right - Award Date & Certificate ID
  ctx.textAlign = "right";
  ctx.fillStyle = "#143867";
  ctx.font = "bold 32px 'Montserrat', sans-serif, Arial";
  ctx.fillText(awardDate, width - 200, footerY);
  ctx.fillStyle = "#64748b";
  ctx.font = "24px 'Montserrat', sans-serif, Arial";
  ctx.fillText(`Certificate ID: ${certificateId}`, width - 200, footerY + 36);

  ctx.beginPath();
  ctx.moveTo(width - 600, footerY - 40);
  ctx.lineTo(width - 200, footerY - 40);
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 13. Official Seal Text at Bottom Center
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 22px 'Montserrat', sans-serif, Arial";
  ctx.fillText("VERIFIEDAGA STYA • LEARNING BY DOING • EXPERIENTIAL SCIENCE", width / 2, height - 120);

  // 14. Trigger File Download
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const sanitizedName = (studentRealName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedAward = achievementType.replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `Curiosity_Olympiad_Certificate_${sanitizedAward}_${sanitizedName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error("Failed to generate certificate PNG download:", e);
    alert("Unable to download image. You can use the Print / PDF option as fallback.");
  }
}
