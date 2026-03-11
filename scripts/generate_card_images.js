import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 卡片颜色配置
const categoryColors = {
  emotion: '#e53e3e',    // 红色
  verb: '#3182ce',       // 蓝色
  noun: '#2f855a',       // 绿色
  adjective: '#805ad5',  // 紫色
  adverb: '#dd6b20',     // 橙色
  scene: '#2c7a7b',      // 青色
  supplement: '#4a5568', // 灰色
};

// 所有唯一的汉字
const uniqueChars = [
  // 情感核心字
  '我', '你', '爱', '家', '心',
  
  // 高频动词
  '吃', '说', '想', '看', '听', '走', '跑', '跳', '飞', '游', '唱', 
  '学', '工', '思', '创', '做', '打', '开', '关', '拿', '放', '买', '卖',
  
  // 日常名词
  '饭', '菜', '肉', '鱼', '蛋', '米', '面', '包', '饺', '汤', '水', 
  '茶', '酒', '牛', '咖', '桌', '椅', '窗', '门', '床', '灯', '书', 
  '笔', '纸', '钱', '衣', '鞋', '猫', '狗', '花', '草', '树', '山', 
  '海', '天', '日', '月', '风', '云',
  
  // 形容词
  '好', '美', '香', '甜', '快', '慢', '大', '小', '多', '少', '新', 
  '旧', '暖', '冷', '喜', '乐', '安', '康', '顺', '旺',
  
  // 副词+虚词+语气词
  '的', '了', '就', '也', '很', '太', '真', '都', '只', '还', '啊', 
  '呀', '吧', '吗', '呢',
  
  // 场景/方位字
  '家', '校', '店', '园', '厨', '厅', '房', '里', '外', '上', '下', 
  '左', '右', '前', '后', '东', '南', '西', '北',
  
  // 补充融合字
  '一', '二', '三', '不', '是'
];

// 去重
const chars = [...new Set(uniqueChars)];

// 生成SVG卡片
function generateCardSVG(char, color = '#000000') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="80" height="120" viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
  <!-- 卡片背景 -->
  <rect width="80" height="120" rx="6" ry="6" fill="#f0e6d6" stroke="#d4b886" stroke-width="2"/>
  
  <!-- 装饰边框 -->
  <rect x="4" y="4" width="72" height="112" rx="4" ry="4" fill="none" stroke="#e6d2b5" stroke-width="1"/>
  
  <!-- 汉字 -->
  <text x="40" y="55" font-family="Noto Serif SC, serif" font-size="48" font-weight="bold" text-anchor="middle" fill="${color}">${char}</text>
  
  <!-- 底部装饰 -->
  <line x1="10" y1="90" x2="70" y2="90" stroke="#d4b886" stroke-width="1"/>
</svg>`;
}

// 生成所有卡片
chars.forEach(char => {
  // 使用默认颜色
  const svgContent = generateCardSVG(char);
  const fileName = `${encodeURIComponent(char)}.svg`;
  const filePath = path.join(__dirname, '../public/assets/cards', fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated: ${fileName}`);
});

console.log(`\nGenerated ${chars.length} card images in public/assets/cards/`);
