/**
 * Meme Farm 🚜 - app.js
 * Single-Page Interactive Meme Generator (Vietnamese UI)
 * 100% Client-side, 0 external image dependencies.
 */

// ============================================================================
// 1. Built-in Data & State
// ============================================================================

const MEME_CAPTIONS = [
  {
    top: 'KHI SẾP NÓI: "TASK NÀY DỄ LẮM EM"',
    bottom: 'VÀ ĐÂY LÀ NGÀY THỨ 7 TÔI OT TỚI 2H SÁNG'
  },
  {
    top: 'TÔI TỰ HỨA TỐI NAY 10 GIỜ ĐI NGỦ SỚM',
    bottom: 'VẪN LÀ TÔI LÚC 3H45 SÁNG ĐANG LƯỚT TIKTOK'
  },
  {
    top: 'BUG CHẠY TRÊN MÁY TÔI THÌ RẤT MƯỢT',
    bottom: 'ĐẨY LÊN PRODUCTION THÌ NỔ BANH CHÀNH'
  },
  {
    top: 'VÍ TIỀN CỦA TÔI NGÀY ĐẦU THÁNG',
    bottom: 'VÀ VÍ TIỀN CỦA TÔI NGÀY MÙNG 5 TRẢ NỢ XONG'
  },
  {
    top: 'KHI CRUSH VÔ TÌNH THẢ TIM TIN NHẮN CŨ',
    bottom: 'TÔI NGHĨ NGAY ĐẾN TÊN 3 ĐỨA CON TRONG TƯƠNG LAI'
  },
  {
    top: 'LÚC PHỎNG VẤN NÓI GÌ CŨNG BIẾT LÀM',
    bottom: 'VÀO LÀM THÌ: "ỦA CÁI NÀY SEARCH GOOGLE SAO TA?"'
  },
  {
    top: 'ĐANG QUYẾT TÂM ĂN KIÊNG GIẢM CÂN RẤT KỶ LUẬT',
    bottom: 'CHO ĐẾN KHI ĐỒNG NGHIỆP RỦ ĐI TRÀ SỮA FULL TOPPING'
  },
  {
    top: 'MẸ BẢO: "CỨ NÓI THẬT ĐI MẸ KHÔNG ĐÁNH ĐÂU"',
    bottom: 'VÀ TÔI ĐÃ TIN VÀO CÂU NÓI DỐI KINH ĐIỂN ĐÓ...'
  },
  {
    top: 'KHI CODE CHẠY ĐƯỢC NHƯNG KHÔNG HIỂU VÌ SAO',
    bottom: 'ĐỪNG THỞ MẠNH, NÓ LÀ PHÉP THUẬT ĐẤY!'
  },
  {
    top: 'TÂM TRẠNG CHIỀU THỨ SÁU LÚC 5H TAN LÀM',
    bottom: 'SO VỚI NỖI KINH HOÀNG SÁNG THỨ HAI ĐẦU TUẦN'
  },
  {
    top: 'TIỀN KHÔNG MUA ĐƯỢC HẠNH PHÚC',
    bottom: 'NHƯNG NGHÈO THÌ CHẮC CHẮN LÀ KHÔNG VUI'
  },
  {
    top: 'THẤY BẠN BÈ ĐỒNG TRANG LỨA MUA NHÀ MUA XE',
    bottom: 'CÒN TÔI ĐANG NGỒI TẠO MEME NÀY NÈ'
  }
];

const TEMPLATES = [
  { id: 0, name: 'Mèo Ngơ Ngác', icon: '🐱', desc: 'Mèo cam ngơ ngác' },
  { id: 1, name: 'Ếch Trầm Cảm', icon: '🐸', desc: 'Pepe trầm tư u sầu' },
  { id: 2, name: 'Mặt Há Hốc', icon: '😲', desc: 'Sốc toàn tập há hốc' },
  { id: 3, name: 'Người Que Bất Lực', icon: '🤦', desc: 'Facepalm cạn lời' },
  { id: 4, name: 'Chó Vàng Hoang Mang', icon: '🐕', desc: 'Shiba Doge lườm nguýt' },
  { id: 5, name: 'Giác Ngộ Mắt Laze', icon: '⚡', desc: 'Laser eyes đỉnh nóc' }
];

const state = {
  sourceType: 'template', // 'template' | 'upload'
  currentTemplate: 0,
  uploadedImage: null,
  uploadedImageFit: 'cover', // 'cover' | 'contain'
  topText: 'KHI SẾP BẢO: "TASK NÀY DỄ LẮM EM"',
  bottomText: 'VÀ ĐÂY LÀ NGÀY THỨ 7 OT TỚI 2H SÁNG',
  fontSize: 68,
  fontFamily: 'impact', // 'impact' | 'arial' | 'comic'
  textColor: '#ffffff',
  strokeEnabled: true,
  strokeWidth: 10,
  isUppercase: true,
  lastRandomIndex: -1
};

// Canvas references
let canvas = null;
let ctx = null;
const CANVAS_SIZE = 1080;

// ============================================================================
// 2. Procedural Canvas Drawings for 6 Built-in Templates (No External Assets!)
// ============================================================================

/**
 * Template 0: Mèo Ngơ Ngác (Derp Orange Cat)
 */
function drawTemplate0(c, w, h) {
  // Background gradient
  const bgGrad = c.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#2d1b4e');
  bgGrad.addColorStop(0.5, '#4a154b');
  bgGrad.addColorStop(1, '#1b0d2a');
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, w, h);

  // Soft background circle glow
  const glow = c.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, 500);
  glow.addColorStop(0, 'rgba(251, 146, 60, 0.25)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = glow;
  c.fillRect(0, 0, w, h);

  // Cat Body
  c.save();
  c.fillStyle = '#ea580c';
  c.beginPath();
  c.ellipse(w / 2, h + 80, 420, 340, 0, 0, Math.PI * 2);
  c.fill();

  // White chest patch
  c.fillStyle = '#ffedd5';
  c.beginPath();
  c.ellipse(w / 2, h - 60, 220, 160, 0, 0, Math.PI * 2);
  c.fill();

  // Cat Ears
  // Left Ear
  c.fillStyle = '#ea580c';
  c.beginPath();
  c.moveTo(w / 2 - 250, h / 2 - 100);
  c.lineTo(w / 2 - 320, h / 2 - 360);
  c.lineTo(w / 2 - 90, h / 2 - 220);
  c.closePath();
  c.fill();

  // Inner Left Ear
  c.fillStyle = '#fda4af';
  c.beginPath();
  c.moveTo(w / 2 - 240, h / 2 - 120);
  c.lineTo(w / 2 - 295, h / 2 - 320);
  c.lineTo(w / 2 - 120, h / 2 - 210);
  c.closePath();
  c.fill();

  // Right Ear
  c.fillStyle = '#ea580c';
  c.beginPath();
  c.moveTo(w / 2 + 250, h / 2 - 100);
  c.lineTo(w / 2 + 320, h / 2 - 360);
  c.lineTo(w / 2 + 90, h / 2 - 220);
  c.closePath();
  c.fill();

  // Inner Right Ear
  c.fillStyle = '#fda4af';
  c.beginPath();
  c.moveTo(w / 2 + 240, h / 2 - 120);
  c.lineTo(w / 2 + 295, h / 2 - 320);
  c.lineTo(w / 2 + 120, h / 2 - 210);
  c.closePath();
  c.fill();

  // Cat Head
  c.fillStyle = '#f97316';
  c.beginPath();
  c.ellipse(w / 2, h / 2 - 40, 310, 260, 0, 0, Math.PI * 2);
  c.fill();

  // Forehead Tabby Stripes
  c.fillStyle = '#c2410c';
  for (let i = -1; i <= 1; i++) {
    c.beginPath();
    c.ellipse(w / 2 + i * 80, h / 2 - 220, 16, 45, (i * 12 * Math.PI) / 180, 0, Math.PI * 2);
    c.fill();
  }

  // Cheek Fluff / White Cheeks
  c.fillStyle = '#ffedd5';
  c.beginPath();
  c.ellipse(w / 2 - 110, h / 2 + 50, 110, 90, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(w / 2 + 110, h / 2 + 50, 110, 90, 0, 0, Math.PI * 2);
  c.fill();

  // Giant Derp Eyes (White)
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(w / 2 - 130, h / 2 - 70, 85, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 130, h / 2 - 70, 85, 0, Math.PI * 2);
  c.fill();

  // Eye Outlines
  c.lineWidth = 8;
  c.strokeStyle = '#1e293b';
  c.beginPath();
  c.arc(w / 2 - 130, h / 2 - 70, 85, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.arc(w / 2 + 130, h / 2 - 70, 85, 0, Math.PI * 2);
  c.stroke();

  // Derp Black Pupils (Pointing slightly in opposite goofy directions)
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.arc(w / 2 - 150, h / 2 - 70, 42, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 150, h / 2 - 70, 42, 0, Math.PI * 2);
  c.fill();

  // Sparkles
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(w / 2 - 165, h / 2 - 85, 14, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 135, h / 2 - 85, 14, 0, Math.PI * 2);
  c.fill();

  // Pink Nose
  c.fillStyle = '#f43f5e';
  c.beginPath();
  c.moveTo(w / 2 - 24, h / 2);
  c.lineTo(w / 2 + 24, h / 2);
  c.lineTo(w / 2, h / 2 + 24);
  c.closePath();
  c.fill();

  // Cute 'w' Mouth
  c.lineWidth = 7;
  c.strokeStyle = '#334155';
  c.beginPath();
  c.arc(w / 2 - 40, h / 2 + 34, 40, 0.1 * Math.PI, 0.9 * Math.PI);
  c.stroke();
  c.beginPath();
  c.arc(w / 2 + 40, h / 2 + 34, 40, 0.1 * Math.PI, 0.9 * Math.PI);
  c.stroke();

  // Whiskers
  c.strokeStyle = '#ffffff';
  c.lineWidth = 6;
  c.lineCap = 'round';
  // Left whiskers
  [-20, 0, 20].forEach((offset) => {
    c.beginPath();
    c.moveTo(w / 2 - 170, h / 2 + 40 + offset);
    c.lineTo(w / 2 - 360, h / 2 + 25 + offset * 1.6);
    c.stroke();
  });
  // Right whiskers
  [-20, 0, 20].forEach((offset) => {
    c.beginPath();
    c.moveTo(w / 2 + 170, h / 2 + 40 + offset);
    c.lineTo(w / 2 + 360, h / 2 + 25 + offset * 1.6);
    c.stroke();
  });

  // Sweat Drop 💧
  c.fillStyle = '#38bdf8';
  c.beginPath();
  c.moveTo(w / 2 + 260, h / 2 - 150);
  c.bezierCurveTo(w / 2 + 280, h / 2 - 130, w / 2 + 290, h / 2 - 100, w / 2 + 260, h / 2 - 85);
  c.bezierCurveTo(w / 2 + 230, h / 2 - 100, w / 2 + 240, h / 2 - 130, w / 2 + 260, h / 2 - 150);
  c.fill();

  c.restore();
}

/**
 * Template 1: Ếch Trầm Cảm (Pepe-style Chill / Melancholic Frog)
 */
function drawTemplate1(c, w, h) {
  // Melancholic background gradient
  const bgGrad = c.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#061720');
  bgGrad.addColorStop(0.5, '#0f2f3d');
  bgGrad.addColorStop(1, '#05131b');
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, w, h);

  // Soft atmospheric rain streaks in background
  c.save();
  c.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  c.lineWidth = 3;
  for (let x = 40; x < w; x += 90) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x - 120, h);
    c.stroke();
  }
  c.restore();

  // Torso / Blue Hoodie
  c.fillStyle = '#1d4ed8';
  c.beginPath();
  c.ellipse(w / 2, h + 90, 440, 360, 0, 0, Math.PI * 2);
  c.fill();

  // Frog Eye Sockets / Top Head Bulges
  c.fillStyle = '#65a30d';
  c.beginPath();
  c.ellipse(w / 2 - 150, h / 2 - 170, 160, 140, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(w / 2 + 150, h / 2 - 170, 160, 140, 0, 0, Math.PI * 2);
  c.fill();

  // Frog Main Head
  c.beginPath();
  c.ellipse(w / 2, h / 2 - 30, 340, 240, 0, 0, Math.PI * 2);
  c.fill();

  // Sad White Eyes (Large Sclera)
  c.fillStyle = '#f1f5f9';
  c.beginPath();
  c.ellipse(w / 2 - 140, h / 2 - 150, 95, 75, -0.15, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(w / 2 + 140, h / 2 - 150, 95, 75, 0.15, 0, Math.PI * 2);
  c.fill();

  // Eye Outlines
  c.lineWidth = 8;
  c.strokeStyle = '#1e293b';
  c.beginPath();
  c.ellipse(w / 2 - 140, h / 2 - 150, 95, 75, -0.15, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.ellipse(w / 2 + 140, h / 2 - 150, 95, 75, 0.15, 0, Math.PI * 2);
  c.stroke();

  // Pupils (Staring blankly down into existential void)
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.arc(w / 2 - 140, h / 2 - 130, 42, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 140, h / 2 - 130, 42, 0, Math.PI * 2);
  c.fill();

  // Heavy Drooping Eyelids (Pepe's signature look!)
  c.fillStyle = '#4d7c0f';
  // Left eyelid
  c.beginPath();
  c.moveTo(w / 2 - 240, h / 2 - 165);
  c.bezierCurveTo(w / 2 - 170, h / 2 - 140, w / 2 - 100, h / 2 - 110, w / 2 - 40, h / 2 - 125);
  c.bezierCurveTo(w / 2 - 100, h / 2 - 235, w / 2 - 220, h / 2 - 220, w / 2 - 240, h / 2 - 165);
  c.fill();
  c.strokeStyle = '#1e293b';
  c.lineWidth = 7;
  c.stroke();

  // Right eyelid
  c.beginPath();
  c.moveTo(w / 2 + 240, h / 2 - 165);
  c.bezierCurveTo(w / 2 + 170, h / 2 - 140, w / 2 + 100, h / 2 - 110, w / 2 + 40, h / 2 - 125);
  c.bezierCurveTo(w / 2 + 100, h / 2 - 235, w / 2 + 220, h / 2 - 220, w / 2 + 240, h / 2 - 165);
  c.fill();
  c.stroke();

  // Iconic Downturned Sad Pepe Lips
  c.lineWidth = 14;
  c.strokeStyle = '#365314';
  c.beginPath();
  c.moveTo(w / 2 - 240, h / 2 + 70);
  c.bezierCurveTo(w / 2 - 120, h / 2 + 30, w / 2 + 120, h / 2 + 30, w / 2 + 240, h / 2 + 70);
  c.stroke();

  c.lineWidth = 8;
  c.strokeStyle = '#1a2e05';
  c.beginPath();
  c.moveTo(w / 2 - 230, h / 2 + 65);
  c.lineTo(w / 2 - 255, h / 2 + 95);
  c.stroke();
  c.beginPath();
  c.moveTo(w / 2 + 230, h / 2 + 65);
  c.lineTo(w / 2 + 255, h / 2 + 95);
  c.stroke();

  // Webbed Frog Hand resting thoughtfully on chin
  c.fillStyle = '#65a30d';
  c.strokeStyle = '#365314';
  c.lineWidth = 8;
  c.beginPath();
  c.ellipse(w / 2 - 170, h / 2 + 140, 75, 45, -0.4, 0, Math.PI * 2);
  c.fill();
  c.stroke();

  // Steaming Mug of Coffee "ỔN MÀ..."
  c.fillStyle = '#e2e8f0';
  c.fillRect(w / 2 + 150, h / 2 + 160, 110, 120);
  c.fillStyle = '#94a3b8';
  c.fillRect(w / 2 + 140, h / 2 + 270, 130, 14);
  c.strokeStyle = '#1e293b';
  c.lineWidth = 6;
  c.strokeRect(w / 2 + 150, h / 2 + 160, 110, 120);

  // Mug handle
  c.beginPath();
  c.arc(w / 2 + 265, h / 2 + 220, 26, -Math.PI / 2, Math.PI / 2);
  c.stroke();

  // Text on Mug
  c.fillStyle = '#0f172a';
  c.font = 'bold 22px Arial, sans-serif';
  c.textAlign = 'center';
  c.fillText('ỔN MÀ', w / 2 + 205, h / 2 + 230);

  // Steam waves
  c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  c.lineWidth = 4;
  [-15, 10, 35].forEach((dx) => {
    c.beginPath();
    c.moveTo(w / 2 + 205 + dx, h / 2 + 145);
    c.bezierCurveTo(
      w / 2 + 195 + dx, h / 2 + 115,
      w / 2 + 215 + dx, h / 2 + 95,
      w / 2 + 205 + dx, h / 2 + 65
    );
    c.stroke();
  });
}

/**
 * Template 2: Mặt Há Hốc (Shocked Pikachu / Wow Emoji)
 */
function drawTemplate2(c, w, h) {
  // Vibrant anime shockburst background
  const bgGrad = c.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 600);
  bgGrad.addColorStop(0, '#581c87');
  bgGrad.addColorStop(1, '#1e1b4b');
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, w, h);

  // Radial speedlines
  c.save();
  c.fillStyle = 'rgba(250, 204, 21, 0.18)';
  const totalRays = 24;
  for (let i = 0; i < totalRays; i++) {
    const angle = (i * 2 * Math.PI) / totalRays;
    c.beginPath();
    c.moveTo(w / 2, h / 2);
    c.lineTo(w / 2 + Math.cos(angle - 0.05) * 800, h / 2 + Math.sin(angle - 0.05) * 800);
    c.lineTo(w / 2 + Math.cos(angle + 0.05) * 800, h / 2 + Math.sin(angle + 0.05) * 800);
    c.closePath();
    c.fill();
  }
  c.restore();

  // Pointy creature ears
  // Left ear
  c.fillStyle = '#facc15';
  c.beginPath();
  c.moveTo(w / 2 - 220, h / 2 - 120);
  c.lineTo(w / 2 - 380, h / 2 - 380);
  c.lineTo(w / 2 - 80, h / 2 - 250);
  c.closePath();
  c.fill();
  // Black ear tip
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.moveTo(w / 2 - 320, h / 2 - 290);
  c.lineTo(w / 2 - 380, h / 2 - 380);
  c.lineTo(w / 2 - 190, h / 2 - 300);
  c.closePath();
  c.fill();

  // Right ear
  c.fillStyle = '#facc15';
  c.beginPath();
  c.moveTo(w / 2 + 220, h / 2 - 120);
  c.lineTo(w / 2 + 380, h / 2 - 380);
  c.lineTo(w / 2 + 80, h / 2 - 250);
  c.closePath();
  c.fill();
  // Black ear tip
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.moveTo(w / 2 + 320, h / 2 - 290);
  c.lineTo(w / 2 + 380, h / 2 - 380);
  c.lineTo(w / 2 + 190, h / 2 - 300);
  c.closePath();
  c.fill();

  // Yellow Head
  c.fillStyle = '#facc15';
  c.beginPath();
  c.arc(w / 2, h / 2 - 10, 280, 0, Math.PI * 2);
  c.fill();
  c.lineWidth = 10;
  c.strokeStyle = '#ca8a04';
  c.stroke();

  // Giant Shocked Eyes
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.arc(w / 2 - 120, h / 2 - 80, 68, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 120, h / 2 - 80, 68, 0, Math.PI * 2);
  c.fill();

  // Sparkle in eyes
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(w / 2 - 140, h / 2 - 100, 24, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 100, h / 2 - 100, 24, 0, Math.PI * 2);
  c.fill();

  // Rosy Red Cheeks
  c.fillStyle = '#ef4444';
  c.beginPath();
  c.arc(w / 2 - 200, h / 2 + 40, 55, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 200, h / 2 + 40, 55, 0, Math.PI * 2);
  c.fill();

  // Cute little nose dot
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.arc(w / 2, h / 2 - 10, 8, 0, Math.PI * 2);
  c.fill();

  // Gigantic Shocked "O" Open Mouth
  c.fillStyle = '#450a0a';
  c.beginPath();
  c.ellipse(w / 2, h / 2 + 110, 75, 115, 0, 0, Math.PI * 2);
  c.fill();
  c.lineWidth = 8;
  c.strokeStyle = '#1e293b';
  c.stroke();

  // Pink Tongue Inside Mouth
  c.save();
  c.beginPath();
  c.ellipse(w / 2, h / 2 + 110, 75, 115, 0, 0, Math.PI * 2);
  c.clip();
  c.fillStyle = '#f43f5e';
  c.beginPath();
  c.ellipse(w / 2, h / 2 + 180, 60, 50, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // Shock Exclamation Marks ! ! !
  c.fillStyle = '#ef4444';
  c.strokeStyle = '#ffffff';
  c.lineWidth = 4;
  c.font = '900 80px "Montserrat", Arial, sans-serif';
  c.textAlign = 'center';
  c.strokeText('!', w / 2 - 320, h / 2 - 100);
  c.fillText('!', w / 2 - 320, h / 2 - 100);
  c.strokeText('!', w / 2 + 320, h / 2 - 100);
  c.fillText('!', w / 2 + 320, h / 2 - 100);
}

/**
 * Template 3: Người Que Bất Lực (Stickman Facepalm / Helpless Meme)
 */
function drawTemplate3(c, w, h) {
  // Chalkboard / Blueprint slate background
  const bgGrad = c.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#1e293b');
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, w, h);

  // Subtle chalkboard grid lines
  c.save();
  c.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  c.lineWidth = 2;
  for (let x = 60; x < w; x += 60) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, h);
    c.stroke();
  }
  for (let y = 60; y < h; y += 60) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
  }

  // Faint confused doodles in background
  c.fillStyle = 'rgba(255, 255, 255, 0.12)';
  c.font = 'bold 36px monospace';
  c.fillText('1 + 1 = 3 ?', 100, 220);
  c.fillText('404 NOT FOUND', w - 380, 240);
  c.fillText('WHY GOD WHY', 120, h - 180);
  c.restore();

  // Stick figure Body
  c.save();
  c.strokeStyle = '#f8fafc';
  c.lineWidth = 18;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  // Torso
  c.beginPath();
  c.moveTo(w / 2, h / 2 + 130);
  c.lineTo(w / 2, h / 2 + 400);
  c.stroke();

  // Right arm (Shrugging helplessly / waving hand)
  c.beginPath();
  c.moveTo(w / 2, h / 2 + 180);
  c.lineTo(w / 2 + 160, h / 2 + 160);
  c.lineTo(w / 2 + 250, h / 2 + 80);
  c.stroke();

  // Left arm (Reaching up to facepalm slap!)
  c.beginPath();
  c.moveTo(w / 2, h / 2 + 180);
  c.lineTo(w / 2 - 160, h / 2 + 140);
  c.lineTo(w / 2 - 90, h / 2 - 30);
  c.stroke();

  // Facepalm Hand flat over left eye
  c.fillStyle = '#f8fafc';
  c.beginPath();
  c.ellipse(w / 2 - 80, h / 2 - 30, 48, 28, 0.5, 0, Math.PI * 2);
  c.fill();

  // Head (Large White Circle)
  c.fillStyle = '#f8fafc';
  c.beginPath();
  c.arc(w / 2, h / 2 - 50, 180, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#0f172a';
  c.lineWidth = 14;
  c.stroke();

  // Facial Expression:
  // Right Eye (Squinting closed > in agony)
  c.lineWidth = 12;
  c.strokeStyle = '#0f172a';
  c.beginPath();
  c.moveTo(w / 2 + 50, h / 2 - 90);
  c.lineTo(w / 2 + 110, h / 2 - 60);
  c.lineTo(w / 2 + 50, h / 2 - 30);
  c.stroke();

  // Angled Frustrated Eyebrow
  c.beginPath();
  c.moveTo(w / 2 + 30, h / 2 - 130);
  c.lineTo(w / 2 + 130, h / 2 - 90);
  c.stroke();

  // Squiggly Wavy Mouth (Frustrated groan ~~~)
  c.beginPath();
  c.moveTo(w / 2 - 40, h / 2 + 40);
  c.quadraticCurveTo(w / 2 - 10, h / 2 + 20, w / 2 + 20, h / 2 + 45);
  c.quadraticCurveTo(w / 2 + 50, h / 2 + 70, w / 2 + 90, h / 2 + 40);
  c.stroke();

  // Giant Blue Sweat Drop flying off forehead 💧
  c.fillStyle = '#38bdf8';
  c.beginPath();
  c.moveTo(w / 2 + 180, h / 2 - 160);
  c.bezierCurveTo(w / 2 + 210, h / 2 - 130, w / 2 + 220, h / 2 - 90, w / 2 + 180, h / 2 - 70);
  c.bezierCurveTo(w / 2 + 140, h / 2 - 90, w / 2 + 150, h / 2 - 130, w / 2 + 180, h / 2 - 160);
  c.fill();

  // 3 Big Red Question Marks Floating Above ? ? ?
  c.fillStyle = '#ef4444';
  c.font = '900 84px Arial, sans-serif';
  c.fillText('?', w / 2 - 130, h / 2 - 260);
  c.fillText('?', w / 2, h / 2 - 280);
  c.fillText('?', w / 2 + 130, h / 2 - 250);

  c.restore();
}

/**
 * Template 4: Chó Vàng Hoang Mang (Cheems / Shiba Doge)
 */
function drawTemplate4(c, w, h) {
  // Warm golden sunset background
  const bgGrad = c.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#78350f');
  bgGrad.addColorStop(0.5, '#b45309');
  bgGrad.addColorStop(1, '#451a03');
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, w, h);

  // Floating comic clouds
  c.save();
  c.fillStyle = 'rgba(254, 240, 138, 0.15)';
  c.beginPath();
  c.arc(220, 240, 90, 0, Math.PI * 2);
  c.arc(320, 220, 110, 0, Math.PI * 2);
  c.arc(410, 250, 80, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // Shiba Fluffy Body
  c.fillStyle = '#d97706';
  c.beginPath();
  c.ellipse(w / 2, h + 60, 420, 320, 0, 0, Math.PI * 2);
  c.fill();

  // Shiba Pointy Ears
  // Left Ear
  c.fillStyle = '#b45309';
  c.beginPath();
  c.moveTo(w / 2 - 220, h / 2 - 120);
  c.lineTo(w / 2 - 290, h / 2 - 340);
  c.lineTo(w / 2 - 80, h / 2 - 220);
  c.closePath();
  c.fill();
  // Inner Ear
  c.fillStyle = '#ffedd5';
  c.beginPath();
  c.moveTo(w / 2 - 210, h / 2 - 140);
  c.lineTo(w / 2 - 265, h / 2 - 300);
  c.lineTo(w / 2 - 110, h / 2 - 210);
  c.closePath();
  c.fill();

  // Right Ear
  c.fillStyle = '#b45309';
  c.beginPath();
  c.moveTo(w / 2 + 220, h / 2 - 120);
  c.lineTo(w / 2 + 290, h / 2 - 340);
  c.lineTo(w / 2 + 80, h / 2 - 220);
  c.closePath();
  c.fill();
  // Inner Ear
  c.fillStyle = '#ffedd5';
  c.beginPath();
  c.moveTo(w / 2 + 210, h / 2 - 140);
  c.lineTo(w / 2 + 265, h / 2 - 300);
  c.lineTo(w / 2 + 110, h / 2 - 210);
  c.closePath();
  c.fill();

  // Chubby Doge Head
  c.fillStyle = '#f59e0b';
  c.beginPath();
  c.ellipse(w / 2, h / 2 - 30, 290, 240, 0, 0, Math.PI * 2);
  c.fill();

  // Cheems Chubby Double Chin / Neck Rolls
  c.fillStyle = '#d97706';
  c.beginPath();
  c.ellipse(w / 2, h / 2 + 180, 260, 80, 0, 0, Math.PI * 2);
  c.fill();

  // White Snout & Cheek fluff
  c.fillStyle = '#fef3c7';
  c.beginPath();
  c.ellipse(w / 2, h / 2 + 40, 160, 120, 0, 0, Math.PI * 2);
  c.fill();

  // Adorable White Eyebrow Dots
  c.fillStyle = '#fef3c7';
  c.beginPath();
  c.arc(w / 2 - 110, h / 2 - 130, 26, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 110, h / 2 - 130, 26, 0, Math.PI * 2);
  c.fill();

  // Squinting Suspicious Doge Side-eyes
  c.fillStyle = '#0f172a';
  // Left eye
  c.beginPath();
  c.ellipse(w / 2 - 110, h / 2 - 60, 36, 18, 0.2, 0, Math.PI * 2);
  c.fill();
  // Right eye
  c.beginPath();
  c.ellipse(w / 2 + 110, h / 2 - 60, 36, 18, -0.2, 0, Math.PI * 2);
  c.fill();

  // Side-gazing pupils (looking sideways skeptically)
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(w / 2 - 120, h / 2 - 62, 7, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(w / 2 + 100, h / 2 - 62, 7, 0, Math.PI * 2);
  c.fill();

  // Shiny Black Dog Nose
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.ellipse(w / 2, h / 2 - 5, 34, 26, 0, 0, Math.PI * 2);
  c.fill();
  // Highlight
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(w / 2 - 8, h / 2 - 12, 6, 0, Math.PI * 2);
  c.fill();

  // Smug Smirk / Cheems Mouth
  c.lineWidth = 6;
  c.strokeStyle = '#0f172a';
  c.beginPath();
  c.moveTo(w / 2, h / 2 + 20);
  c.lineTo(w / 2, h / 2 + 45);
  c.stroke();

  c.beginPath();
  c.arc(w / 2 - 35, h / 2 + 45, 35, 0.1 * Math.PI, 0.8 * Math.PI);
  c.stroke();
  c.beginPath();
  c.arc(w / 2 + 35, h / 2 + 45, 35, 0.2 * Math.PI, 0.9 * Math.PI);
  c.stroke();

  // Floating Colorful Doge Thoughts
  const dogeThoughts = [
    { text: 'Ủa alo?', color: '#38bdf8', x: 120, y: 320, size: 40 },
    { text: 'Thật luôn á?', color: '#f43f5e', x: w - 240, y: 340, size: 36 },
    { text: 'Bủh bủh', color: '#22c55e', x: 140, y: h - 220, size: 44 },
    { text: 'Dảk dảk', color: '#eab308', x: w - 220, y: h - 210, size: 42 }
  ];

  dogeThoughts.forEach((item) => {
    c.fillStyle = item.color;
    c.font = `bold ${item.size}px "Comic Neue", "Comic Sans MS", cursive, sans-serif`;
    c.fillText(item.text, item.x, item.y);
  });
}

/**
 * Template 5: Giác Ngộ Mắt Laze (Cyber Laser Eyes / Galaxy Brain Chad)
 */
function drawTemplate5(c, w, h) {
  // Deep Cyberpunk Space Background
  const bgGrad = c.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(0.6, '#0f172a');
  bgGrad.addColorStop(1, '#1e1b4b');
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, w, h);

  // Neon Perspective Grid Floor
  c.save();
  c.strokeStyle = 'rgba(139, 92, 246, 0.35)';
  c.lineWidth = 3;
  const horizonY = h * 0.65;
  for (let x = -200; x <= w + 200; x += 120) {
    c.beginPath();
    c.moveTo(w / 2, horizonY);
    c.lineTo(x, h);
    c.stroke();
  }
  for (let y = horizonY + 20; y <= h; y += 45) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
  }
  c.restore();

  // Chad / Silhouette Head & Sunglasses
  c.fillStyle = '#090d16';
  c.beginPath();
  c.ellipse(w / 2, h / 2 - 20, 240, 290, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 6;
  c.stroke();

  // Strong jawline
  c.beginPath();
  c.moveTo(w / 2 - 200, h / 2 + 100);
  c.lineTo(w / 2 - 120, h / 2 + 250);
  c.lineTo(w / 2 + 120, h / 2 + 250);
  c.lineTo(w / 2 + 200, h / 2 + 100);
  c.fillStyle = '#090d16';
  c.fill();
  c.stroke();

  // Dark Cool Sunglasses
  c.fillStyle = '#020617';
  c.fillRect(w / 2 - 200, h / 2 - 100, 400, 90);
  c.strokeStyle = '#f43f5e';
  c.lineWidth = 5;
  c.strokeRect(w / 2 - 200, h / 2 - 100, 400, 90);

  // Left & Right Eye Laser Origins
  const leftEye = { x: w / 2 - 90, y: h / 2 - 55 };
  const rightEye = { x: w / 2 + 90, y: h / 2 - 55 };

  // Draw Massive Blazing Laser Beams!
  [leftEye, rightEye].forEach((eye, index) => {
    const angle = index === 0 ? -0.32 : 0.32;
    const targetX = eye.x + Math.sin(angle) * 1200;
    const targetY = eye.y + Math.cos(angle) * 1200;

    // Outer Red Glow Flare
    c.save();
    c.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    c.lineWidth = 140;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(eye.x, eye.y);
    c.lineTo(targetX, targetY);
    c.stroke();

    // Medium Laser Core
    c.strokeStyle = 'rgba(255, 30, 80, 0.85)';
    c.lineWidth = 60;
    c.beginPath();
    c.moveTo(eye.x, eye.y);
    c.lineTo(targetX, targetY);
    c.stroke();

    // White-Hot Intense Inner Core
    c.strokeStyle = '#ffffff';
    c.lineWidth = 22;
    c.beginPath();
    c.moveTo(eye.x, eye.y);
    c.lineTo(targetX, targetY);
    c.stroke();

    // Blinding Lens Flare Bloom at Origin
    const bloom = c.createRadialGradient(eye.x, eye.y, 10, eye.x, eye.y, 150);
    bloom.addColorStop(0, '#ffffff');
    bloom.addColorStop(0.25, '#f43f5e');
    bloom.addColorStop(0.65, 'rgba(239, 68, 68, 0.6)');
    bloom.addColorStop(1, 'rgba(239, 68, 68, 0)');
    c.fillStyle = bloom;
    c.beginPath();
    c.arc(eye.x, eye.y, 150, 0, Math.PI * 2);
    c.fill();

    c.restore();
  });

  // Glowing Neon Matrix Sparkles
  c.fillStyle = '#38bdf8';
  c.font = 'bold 24px monospace';
  for (let i = 0; i < 6; i++) {
    c.fillText('0101', 80 + i * 160, 180 + (i % 2) * 40);
  }
}

/**
 * Master dispatcher for drawing templates
 */
function drawTemplate(templateId, targetCtx, width, height) {
  switch (templateId) {
    case 0: drawTemplate0(targetCtx, width, height); break;
    case 1: drawTemplate1(targetCtx, width, height); break;
    case 2: drawTemplate2(targetCtx, width, height); break;
    case 3: drawTemplate3(targetCtx, width, height); break;
    case 4: drawTemplate4(targetCtx, width, height); break;
    case 5: drawTemplate5(targetCtx, width, height); break;
    default: drawTemplate0(targetCtx, width, height);
  }
}

// ============================================================================
// 3. User Uploaded Image Rendering (Cover vs Contain)
// ============================================================================

function drawUploadedImage(img, targetCtx, w, h, fitMode) {
  // Dark backdrop
  targetCtx.fillStyle = '#0b0f17';
  targetCtx.fillRect(0, 0, w, h);

  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const hRatio = w / imgW;
  const vRatio = h / imgH;

  if (fitMode === 'contain') {
    const ratio = Math.min(hRatio, vRatio);
    const renderW = imgW * ratio;
    const renderH = imgH * ratio;
    const offsetX = (w - renderW) / 2;
    const offsetY = (h - renderH) / 2;
    targetCtx.drawImage(img, offsetX, offsetY, renderW, renderH);
  } else {
    // Default 'cover'
    const ratio = Math.max(hRatio, vRatio);
    const renderW = imgW * ratio;
    const renderH = imgH * ratio;
    const offsetX = (w - renderW) / 2;
    const offsetY = (h - renderH) / 2;
    targetCtx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }
}

// ============================================================================
// 4. Classic Meme Text Layout & Word-Wrapping Engine
// ============================================================================

/**
 * Returns the CSS font-family string according to current setting
 */
function getFontFamilyString(fontChoice) {
  switch (fontChoice) {
    case 'impact':
      return '"Anton", "Impact", "Montserrat", "Arial Black", sans-serif';
    case 'arial':
      return '"Arial", "Be Vietnam Pro", -apple-system, sans-serif';
    case 'comic':
      return '"Comic Neue", "Comic Sans MS", "Chalkboard SE", cursive, sans-serif';
    default:
      return '"Anton", "Impact", sans-serif';
  }
}

/**
 * Splits a text into lines wrapping within maxWidth
 */
function wrapText(targetCtx, text, maxWidth) {
  if (!text) return [];

  const rawParagraphs = text.split('\n');
  const finalLines = [];

  rawParagraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      finalLines.push('');
      return;
    }
    const words = trimmed.split(/\s+/);
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = targetCtx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== '') {
        finalLines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      finalLines.push(currentLine);
    }
  });

  return finalLines;
}

/**
 * Renders Top & Bottom Meme Text on the Canvas
 */
function drawMemeText(targetCtx, w, h) {
  let topStr = state.topText.trim();
  let btmStr = state.bottomText.trim();

  if (state.isUppercase) {
    topStr = topStr.toUpperCase();
    btmStr = btmStr.toUpperCase();
  }

  if (!topStr && !btmStr) return;

  const fontFamily = getFontFamilyString(state.fontFamily);
  const fontWeight = state.fontFamily === 'comic' ? 'bold' : '900';
  targetCtx.font = `${fontWeight} ${state.fontSize}px ${fontFamily}`;
  targetCtx.textAlign = 'center';
  targetCtx.textBaseline = 'middle';

  const lineHeight = state.fontSize * 1.18;
  const strokeWidth = state.strokeEnabled ? state.strokeWidth : 0;
  const maxTextWidth = w - 100; // 50px margin each side

  targetCtx.lineJoin = 'round';
  targetCtx.miterLimit = 2;
  targetCtx.lineWidth = strokeWidth;
  targetCtx.strokeStyle = '#000000';
  targetCtx.fillStyle = state.textColor;

  // Helper to draw stroke then fill
  function renderLine(line, x, y) {
    if (state.strokeEnabled && strokeWidth > 0) {
      targetCtx.strokeText(line, x, y);
    }
    targetCtx.fillText(line, x, y);
  }

  // Draw Top Text
  if (topStr) {
    const topLines = wrapText(targetCtx, topStr, maxTextWidth);
    const startY = 70 + state.fontSize / 2;

    topLines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;
      renderLine(line, w / 2, lineY);
    });
  }

  // Draw Bottom Text
  if (btmStr) {
    const btmLines = wrapText(targetCtx, btmStr, maxTextWidth);
    const totalBlockHeight = btmLines.length * lineHeight;
    const startY = h - 60 - totalBlockHeight + lineHeight / 2;

    btmLines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;
      renderLine(line, w / 2, lineY);
    });
  }
}

// ============================================================================
// 5. Main Render Loop
// ============================================================================

let renderRequested = false;

function renderCanvas() {
  if (!canvas || !ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // 1. Draw Image Background (either chosen template or uploaded photo)
  if (state.sourceType === 'upload' && state.uploadedImage) {
    drawUploadedImage(state.uploadedImage, ctx, CANVAS_SIZE, CANVAS_SIZE, state.uploadedImageFit);
  } else {
    drawTemplate(state.currentTemplate, ctx, CANVAS_SIZE, CANVAS_SIZE);
  }

  // 2. Draw Meme Text Overlays
  drawMemeText(ctx, CANVAS_SIZE, CANVAS_SIZE);
}

function requestRender() {
  if (renderRequested) return;
  renderRequested = true;
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(() => {
      renderCanvas();
      renderRequested = false;
    });
  } else {
    renderCanvas();
    renderRequested = false;
  }
}

// ============================================================================
// 6. Template Thumbnails Generation
// ============================================================================

function generateTemplateThumbnails() {
  const container = document.getElementById('templates-grid');
  if (!container) return;

  container.innerHTML = '';

  TEMPLATES.forEach((tmpl) => {
    const card = document.createElement('div');
    card.className = `template-card ${tmpl.id === state.currentTemplate ? 'active' : ''}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-template-id', tmpl.id);
    card.setAttribute('title', `${tmpl.name} - ${tmpl.desc}`);

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.className = 'template-thumb';
    thumbCanvas.width = 160;
    thumbCanvas.height = 160;

    const tCtx = thumbCanvas.getContext('2d');
    if (tCtx) {
      drawTemplate(tmpl.id, tCtx, 160, 160);
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'template-name';
    nameSpan.textContent = `${tmpl.icon} ${tmpl.name}`;

    card.appendChild(thumbCanvas);
    card.appendChild(nameSpan);

    card.addEventListener('click', () => {
      selectTemplate(tmpl.id);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectTemplate(tmpl.id);
      }
    });

    container.appendChild(card);
  });
}

function selectTemplate(templateId) {
  state.sourceType = 'template';
  state.currentTemplate = templateId;

  // Update active UI cards
  const cards = document.querySelectorAll('.template-card');
  cards.forEach((c) => {
    const id = parseInt(c.getAttribute('data-template-id'), 10);
    if (id === templateId) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  // Switch tab if needed
  switchTab('templates');
  requestRender();
  showToast(`Đã chọn mẫu: ${TEMPLATES[templateId].name} 🎨`);
}

// ============================================================================
// 7. Inspiration Caption Pills
// ============================================================================

function setupCaptionPills() {
  const container = document.getElementById('caption-pills');
  if (!container) return;

  container.innerHTML = '';
  MEME_CAPTIONS.slice(0, 8).forEach((item, index) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'caption-pill';
    // Short preview
    const shortText = item.top.length > 25 ? `${item.top.slice(0, 25)}...` : item.top;
    pill.textContent = shortText;
    pill.title = `${item.top} / ${item.bottom}`;

    pill.addEventListener('click', () => {
      applyCaption(index);
    });

    container.appendChild(pill);
  });
}

function applyCaption(index) {
  const cap = MEME_CAPTIONS[index];
  if (!cap) return;

  state.topText = cap.top;
  state.bottomText = cap.bottom;
  state.lastRandomIndex = index;

  const topInput = document.getElementById('input-top-text');
  const btmInput = document.getElementById('input-bottom-text');
  if (topInput) topInput.value = cap.top;
  if (btmInput) btmInput.value = cap.bottom;

  requestRender();
  showToast('Đã áp dụng câu meme vui! 💡');
}

// ============================================================================
// 8. Toast Notification System
// ============================================================================

let toastTimeout = null;

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Clear previous
  container.innerHTML = '';
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  toastTimeout = setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 200);
  }, 2600);
}

// ============================================================================
// 9. File Upload & Drag-and-Drop Handling
// ============================================================================

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)!', 'info');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.uploadedImage = img;
      state.sourceType = 'upload';

      // Update UI elements
      const uploadOptions = document.getElementById('uploaded-options');
      if (uploadOptions) uploadOptions.style.display = 'flex';

      switchTab('upload');
      requestRender();
      showToast('Đã tải ảnh lên thành công! 🖼️');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setupDropzone() {
  const uploadDropzone = document.getElementById('upload-dropzone');
  const canvasDropzone = document.getElementById('canvas-dropzone');
  const fileInput = document.getElementById('file-input');
  const btnBrowse = document.getElementById('btn-browse-file');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });
  }

  if (btnBrowse && fileInput) {
    btnBrowse.addEventListener('click', () => {
      fileInput.click();
    });
  }

  // Handle drag and drop on dropzone card
  if (uploadDropzone) {
    uploadDropzone.addEventListener('click', (e) => {
      if (e.target !== btnBrowse && fileInput) {
        fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.classList.remove('drag-active');
      });
    });

    uploadDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Handle drag and drop directly onto the Canvas preview
  if (canvasDropzone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      canvasDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        canvasDropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      canvasDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        canvasDropzone.classList.remove('drag-over');
      });
    });

    canvasDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Fit mode buttons
  const fitBtns = document.querySelectorAll('#fit-mode-control .segment-btn');
  fitBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      fitBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.uploadedImageFit = btn.getAttribute('data-fit') || 'cover';
      requestRender();
    });
  });

  // Revert to template button
  const btnRevert = document.getElementById('btn-revert-template');
  if (btnRevert) {
    btnRevert.addEventListener('click', () => {
      selectTemplate(state.currentTemplate);
    });
  }
}

function switchTab(targetTab) {
  const tabTemplates = document.getElementById('tab-templates');
  const tabUpload = document.getElementById('tab-upload');
  const contentTemplates = document.getElementById('content-templates');
  const contentUpload = document.getElementById('content-upload');

  if (targetTab === 'templates') {
    tabTemplates?.classList.add('active');
    tabTemplates?.setAttribute('aria-selected', 'true');
    tabUpload?.classList.remove('active');
    tabUpload?.setAttribute('aria-selected', 'false');

    contentTemplates?.classList.remove('hidden');
    contentUpload?.classList.add('hidden');
    state.sourceType = 'template';
  } else {
    tabUpload?.classList.add('active');
    tabUpload?.setAttribute('aria-selected', 'true');
    tabTemplates?.classList.remove('active');
    tabTemplates?.setAttribute('aria-selected', 'false');

    contentUpload?.classList.remove('hidden');
    contentTemplates?.classList.add('hidden');
    if (state.uploadedImage) {
      state.sourceType = 'upload';
    }
  }
  requestRender();
}

// ============================================================================
// 10. Actions: Download, Share, Random, Clear
// ============================================================================

/**
 * Action 1: Tải ảnh xuống (Download PNG)
 */
function downloadMeme() {
  if (!canvas) return;

  try {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const fileName = `meme-farm-${timestamp}.png`;

    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) {
          fallbackDataUrlDownload(fileName);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        showToast('Đã tải ảnh meme thành công! 🚜🎉');
      }, 'image/png');
    } else {
      fallbackDataUrlDownload(fileName);
    }
  } catch (err) {
    console.error('Download error:', err);
    showToast('Lỗi khi tải ảnh. Vui lòng thử lại!', 'info');
  }
}

function fallbackDataUrlDownload(fileName) {
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Đã tải ảnh meme thành công! 🚜🎉');
}

/**
 * Action 2: Chia sẻ (Share)
 */
async function shareMeme() {
  if (!canvas) return;

  try {
    if (navigator.share && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          fallbackClipboardCopy();
          return;
        }

        const file = new File([blob], 'meme-farm.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Meme Farm 🚜',
              text: `${state.topText} - ${state.bottomText}`,
              files: [file]
            });
            showToast('Chia sẻ thành công! 🎉');
            return;
          } catch (shareErr) {
            if (shareErr.name === 'AbortError') return; // User closed share sheet
          }
        }

        // If file sharing not accepted, try basic text share or clipboard
        try {
          await navigator.share({
            title: 'Meme Farm 🚜',
            text: 'Xem meme tôi vừa tạo bằng Meme Farm!',
            url: window.location.href
          });
          showToast('Đã mở hộp thoại chia sẻ!');
        } catch (e) {
          fallbackClipboardCopy();
        }
      }, 'image/png');
    } else {
      fallbackClipboardCopy();
    }
  } catch (err) {
    fallbackClipboardCopy();
  }
}

/**
 * Fallback to Clipboard copy for sharing
 */
async function fallbackClipboardCopy() {
  try {
    if (navigator.clipboard && window.ClipboardItem && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            showToast('Đã sao chép ảnh meme vào khay nhớ tạm! 📋');
            return;
          } catch (e) {
            // Ignore and fall through to URL copy
          }
        }
        copyPageUrl();
      }, 'image/png');
    } else {
      copyPageUrl();
    }
  } catch (e) {
    copyPageUrl();
  }
}

function copyPageUrl() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Đã sao chép liên kết trang! 🔗');
    });
  } else {
    showToast('Hãy dùng nút "Tải ảnh xuống" để lưu meme! 💾');
  }
}

/**
 * Action 3: Ngẫu nhiên (Random Caption)
 */
function pickRandomCaption() {
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * MEME_CAPTIONS.length);
  } while (nextIdx === state.lastRandomIndex && MEME_CAPTIONS.length > 1);

  applyCaption(nextIdx);
  showToast('Đã chọn câu ngẫu nhiên siêu mặn! 🎲');
}

/**
 * Action 4: Xóa chữ (Clear Text)
 */
function clearAllText() {
  state.topText = '';
  state.bottomText = '';

  const topInput = document.getElementById('input-top-text');
  const btmInput = document.getElementById('input-bottom-text');
  if (topInput) topInput.value = '';
  if (btmInput) btmInput.value = '';

  requestRender();
  showToast('Đã xóa toàn bộ chữ! 🗑️');
}

// ============================================================================
// 11. Event Listeners & Binding
// ============================================================================

function setupEventListeners() {
  // Action Buttons
  document.getElementById('btn-download')?.addEventListener('click', downloadMeme);
  document.getElementById('btn-share')?.addEventListener('click', shareMeme);
  document.getElementById('btn-random')?.addEventListener('click', pickRandomCaption);
  document.getElementById('btn-clear')?.addEventListener('click', clearAllText);

  // Tab switching
  document.getElementById('tab-templates')?.addEventListener('click', () => switchTab('templates'));
  document.getElementById('tab-upload')?.addEventListener('click', () => switchTab('upload'));

  // Text inputs
  const topInput = document.getElementById('input-top-text');
  const btmInput = document.getElementById('input-bottom-text');

  if (topInput) {
    topInput.value = state.topText;
    topInput.addEventListener('input', (e) => {
      state.topText = e.target.value;
      requestRender();
    });
  }

  if (btmInput) {
    btmInput.value = state.bottomText;
    btmInput.addEventListener('input', (e) => {
      state.bottomText = e.target.value;
      requestRender();
    });
  }

  // Clear single inputs
  document.getElementById('btn-clear-top')?.addEventListener('click', () => {
    state.topText = '';
    if (topInput) topInput.value = '';
    requestRender();
  });

  document.getElementById('btn-clear-bottom')?.addEventListener('click', () => {
    state.bottomText = '';
    if (btmInput) btmInput.value = '';
    requestRender();
  });

  // Font family selector cards
  const fontCards = document.querySelectorAll('.font-card');
  fontCards.forEach((card) => {
    card.addEventListener('click', () => {
      fontCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      state.fontFamily = card.getAttribute('data-font') || 'impact';
      requestRender();
    });
  });

  // Font size slider & presets
  const sizeSlider = document.getElementById('slider-font-size');
  const sizeBadge = document.getElementById('badge-font-size');

  function updateFontSize(val) {
    const num = parseInt(val, 10);
    state.fontSize = num;
    if (sizeSlider) sizeSlider.value = num;
    if (sizeBadge) sizeBadge.textContent = `${num}px`;

    // Update active state on preset chips
    const chips = document.querySelectorAll('.quick-size-buttons .btn-chip');
    chips.forEach((ch) => {
      const chipVal = parseInt(ch.getAttribute('data-size'), 10);
      if (Math.abs(chipVal - num) < 6) {
        ch.classList.add('active');
      } else {
        ch.classList.remove('active');
      }
    });

    requestRender();
  }

  if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => {
      updateFontSize(e.target.value);
    });
  }

  const sizeChips = document.querySelectorAll('.quick-size-buttons .btn-chip');
  sizeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const sizeVal = chip.getAttribute('data-size');
      if (sizeVal) updateFontSize(sizeVal);
    });
  });

  // Color picker & Swatches
  const colorPicker = document.getElementById('color-picker');
  const colorHexLabel = document.getElementById('color-hex-label');
  const colorDots = document.querySelectorAll('.color-dot');

  function updateTextColor(hex) {
    state.textColor = hex;
    if (colorPicker) colorPicker.value = hex;
    if (colorHexLabel) colorHexLabel.textContent = hex.toUpperCase();

    colorDots.forEach((dot) => {
      if (dot.getAttribute('data-color')?.toLowerCase() === hex.toLowerCase()) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    requestRender();
  }

  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      updateTextColor(e.target.value);
    });
  }

  colorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const colorVal = dot.getAttribute('data-color');
      if (colorVal) updateTextColor(colorVal);
    });
  });

  // Stroke / Outline toggle & width slider
  const toggleStroke = document.getElementById('toggle-stroke');
  const strokeWidthSlider = document.getElementById('slider-stroke-width');
  const strokeWidthBadge = document.getElementById('badge-stroke-width');
  const strokeWidthGroup = document.getElementById('stroke-width-group');

  if (toggleStroke) {
    toggleStroke.addEventListener('change', (e) => {
      state.strokeEnabled = e.target.checked;
      if (strokeWidthGroup) {
        strokeWidthGroup.style.opacity = state.strokeEnabled ? '1' : '0.4';
        strokeWidthGroup.style.pointerEvents = state.strokeEnabled ? 'auto' : 'none';
      }
      requestRender();
    });
  }

  if (strokeWidthSlider) {
    strokeWidthSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.strokeWidth = val;
      if (strokeWidthBadge) strokeWidthBadge.textContent = `${val}px`;
      requestRender();
    });
  }

  // Uppercase toggle
  const toggleUpper = document.getElementById('toggle-uppercase');
  if (toggleUpper) {
    toggleUpper.addEventListener('change', (e) => {
      state.isUppercase = e.target.checked;
      requestRender();
    });
  }

  // Setup Dropzone
  setupDropzone();
}

// ============================================================================
// 12. App Initialization
// ============================================================================

function initMemeFarm() {
  canvas = document.getElementById('meme-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set crisp canvas dimensions
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  // Initialize UI components
  generateTemplateThumbnails();
  setupCaptionPills();
  setupEventListeners();

  // If Google Fonts are loading, re-render once fonts are ready
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      requestRender();
      generateTemplateThumbnails();
    });
  }

  // Initial draw
  requestRender();
}

// Safe bootstrap for browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMemeFarm);
  } else {
    initMemeFarm();
  }
}

// Export for node checking if required
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    state,
    drawTemplate,
    drawMemeText,
    wrapText,
    TEMPLATES,
    MEME_CAPTIONS
  };
}
