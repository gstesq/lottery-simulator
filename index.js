const element = document.getElementById("app");

// Configuration Constants
const MAIN_NUMBERS_TOTAL = 50;
const MAIN_NUMBERS_PICK = 5;
const STAR_NUMBERS_TOTAL = 12;
const STAR_NUMBERS_PICK = 2;
const MAX_ATTEMPTS = 150000000; // ~150M for reasonable jackpot chance
const TICKET_PRICE = 2.5;
const TYPICAL_TICKETS_PER_DRAW = 116000000; // Typical EuroMillions tickets sold per draw
const JACKPOT_ODDS = 139838160; // 1 in 139,838,160 odds of winning jackpot
const UI_UPDATE_INTERVAL = 10000; // Update UI every 10k draws (once per chunk)
const HEATMAP_UPDATE_THRESHOLD = 100000; // Update heatmap every 100k draws
const MINIMAL_UPDATE_INTERVAL = 3000; // Update matches/financials every 3 seconds

// Modern CSS-in-JS styles with financial theme
const styles = `
  * {
    box-sizing: border-box;
  }

  .lotto-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: white;
    overflow-x: hidden;
  }

  .header {
    text-align: center;
    margin-bottom: 30px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header h1 {
    font-size: 2.5rem;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .header .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 10px 0;
  }

  .financial-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }

  .financial-item {
    text-align: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .financial-value {
    font-size: 1.4rem;
    font-weight: bold;
    color: #ffdd59;
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 12px;
    border-radius: 8px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .financial-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .profit { 
    color: #7bed9f;
  }
  
  .loss { 
    color: #ff6b6b;
  }
  
  .neutral { 
    color: #70a1ff;
  }

  .simulation-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 30px;
  }

  @media (max-width: 1024px) {
    .simulation-area {
      gap: 20px;
    }
  }

  @media (max-width: 900px) {
    .simulation-area {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  @media (max-width: 768px) {
    .simulation-area {
      grid-template-columns: 1fr;
    }
    
    .lotto-container {
      padding: 10px;
    }
    
    .header h1 {
      font-size: 1.8rem;
    }
    
    .header .subtitle {
      font-size: 0.95rem;
    }
    
    .financial-summary {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .financial-item {
      padding: 10px;
    }
    
    .financial-value {
      font-size: 1.1rem;
    }
    
    .financial-label {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .header h1 {
      font-size: 1.5rem;
    }
    
    .financial-summary {
      grid-template-columns: 1fr;
    }
  }

  .ticket-section, .current-draw-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    min-width: 0;
    overflow: hidden;
  }

  @media (max-width: 1024px) {
    .ticket-section, .current-draw-section {
      padding: 18px;
    }
  }

  @media (max-width: 900px) {
    .ticket-section, .current-draw-section {
      padding: 20px;
    }
  }

  @media (max-width: 768px) {
    .ticket-section, .current-draw-section {
      padding: 20px;
    }
  }

  @media (max-width: 480px) {
    .ticket-section, .current-draw-section {
      padding: 15px;
    }
  }

  .section-title {
    font-size: 1.3rem;
    margin-bottom: 20px;
    text-align: center;
    font-weight: 600;
    word-wrap: break-word;
  }

  @media (max-width: 1024px) {
    .section-title {
      font-size: 1.15rem;
    }
  }

  @media (max-width: 480px) {
    .section-title {
      font-size: 1.1rem;
    }
  }

  .balls-container {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin: 20px 0;
    max-width: 100%;
    min-height: 60px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    align-items: center;
  }

  .balls-container:empty {
    min-height: 40px;
    background: rgba(255, 255, 255, 0.02);
  }

  @media (max-width: 1024px) {
    .balls-container {
      gap: 10px;
      margin: 15px 0;
      padding: 8px;
    }
  }

  @media (max-width: 768px) {
    .balls-container {
      gap: 8px;
      min-height: 55px;
      padding: 8px;
    }
  }

  @media (max-width: 600px) {
    .balls-container {
      gap: 7px;
      min-height: 50px;
    }
  }

  @media (max-width: 480px) {
    .balls-container {
      gap: 6px;
      padding: 6px;
      min-height: 48px;
    }
  }

  .ball {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    will-change: transform;
    transform: translateZ(0);
  }

  @media (max-width: 1024px) {
    .ball {
      width: 48px;
      height: 48px;
      font-size: 1.05rem;
    }
  }

  @media (max-width: 900px) {
    .ball {
      width: 50px;
      height: 50px;
      font-size: 1.1rem;
    }
  }

  @media (max-width: 768px) {
    .ball {
      width: 45px;
      height: 45px;
      font-size: 1rem;
    }
  }

  @media (max-width: 600px) {
    .ball {
      width: 42px;
      height: 42px;
      font-size: 0.95rem;
    }
  }

  @media (max-width: 480px) {
    .ball {
      width: 40px;
      height: 40px;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 380px) {
    .ball {
      width: 38px;
      height: 38px;
      font-size: 0.85rem;
    }
  }

  .ball:hover {
    transform: scale(1.1);
  }

  @media (hover: none) {
    .ball:hover {
      transform: none;
    }
    
    .ball:active {
      transform: scale(0.95);
    }
  }

  .ball.selected {
    animation: pulse 1s infinite;
    box-shadow: 0 0 20px #00ff00;
    border: 2px solid #00ff00;
  }

  .main-ball {
    background: linear-gradient(145deg, #ff6b6b, #ee5a24);
    border: 2px solid #ff9ff3;
  }

  .star-ball {
    background: linear-gradient(145deg, #54a0ff, #2e86de);
    border: 2px solid #48dbfb;
  }

  .ball.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .matched {
    animation: pulse 1s infinite;
    box-shadow: 0 0 20px #00ff00;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .number-picker {
    margin: 20px 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  @media (max-width: 1024px) {
    .number-picker {
      margin: 15px 0;
    }
  }

  .number-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 8px;
    margin: 15px 0;
    width: 100%;
    max-width: 100%;
    justify-items: center;
  }

  @media (max-width: 1400px) {
    .number-grid {
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }
  }

  @media (max-width: 900px) {
    .number-grid {
      grid-template-columns: repeat(10, 1fr);
      gap: 7px;
    }
  }

  @media (max-width: 768px) {
    .number-grid {
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
    }
  }

  @media (max-width: 600px) {
    .number-grid {
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }
  }

  @media (max-width: 480px) {
    .number-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    }
  }

  @media (max-width: 380px) {
    .number-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }
  }

  .picker-title {
    text-align: center;
    margin-bottom: 10px;
    font-weight: 600;
    color: #ffdd59;
  }

  .selection-status {
    text-align: center;
    margin: 10px 0;
    font-style: italic;
    color: #70a1ff;
  }

  .quick-select-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 15px 0;
    flex-wrap: wrap;
  }

  .quick-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    .quick-btn {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
  }

  .quick-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  @media (hover: none) {
    .quick-btn:hover {
      transform: none;
    }
    
    .quick-btn:active {
      background: rgba(255, 255, 255, 0.4);
      transform: scale(0.98);
    }
  }

  /* Heat Map Styles */
  .heatmap-section {
    margin: 25px 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  @media (max-width: 1024px) {
    .heatmap-section {
      margin: 20px 0;
    }
  }

  .heatmap-container {
    display: grid;
  // grid-template-columns: repeat(10, 1fr);
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
    gap: 6px;
    margin: 15px 0;
    justify-items: center;
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 1400px) {
    .heatmap-container {
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }
  }

  @media (max-width: 900px) {
    .heatmap-container {
      grid-template-columns: repeat(10, 1fr);
      gap: 5px;
    }
  }

  @media (max-width: 768px) {
    .heatmap-container {
      grid-template-columns: repeat(8, 1fr);
      gap: 5px;
    }
  }

  @media (max-width: 600px) {
    .heatmap-container {
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
  }

  @media (max-width: 480px) {
    .heatmap-container {
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    }
  }

  @media (max-width: 380px) {
    .heatmap-container {
      grid-template-columns: repeat(5, 1fr);
      gap: 3px;
    }
  }

  .heatmap-number {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
    transition: all 0.5s ease;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    will-change: transform, background-color;
    transform: translateZ(0);
  }

  @media (max-width: 768px) {
    .heatmap-number {
      width: 32px;
      height: 32px;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 480px) {
    .heatmap-number {
      width: 28px;
      height: 28px;
      font-size: 0.75rem;
    }
  }

  @media (max-width: 380px) {
    .heatmap-number {
      width: 26px;
      height: 26px;
      font-size: 0.7rem;
    }
  }

  /* Statistical deviation-based coloring */
  .heatmap-number.normal {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .heatmap-number.slightly-cold {
    background: linear-gradient(145deg, #74b9ff, #a29bfe);
    transform: scale(1.02);
  }

  .heatmap-number.cold {
    background: linear-gradient(145deg, #0984e3, #6c5ce7);
    transform: scale(1.05);
    box-shadow: 0 0 8px #74b9ff;
    color: white;
  }

  .heatmap-number.slightly-hot {
    background: linear-gradient(145deg, #ffeaa7, #fdcb6e);
    transform: scale(1.02);
    color: #2d3436;
  }

  .heatmap-number.hot {
    background: linear-gradient(145deg, #ff7675, #d63031);
    transform: scale(1.08);
    box-shadow: 0 0 15px #ff7675;
    animation: pulse 2s infinite;
    color: white;
  }

  /* Legacy classes for backward compatibility */
  .heatmap-number.rare {
    background: #ff9ff3;
    transform: scale(1.05);
  }

  .heatmap-number.common {
    background: #f368e0;
    transform: scale(1.1);
    box-shadow: 0 0 10px #f368e0;
  }

  .heatmap-number.frequent {
    background: #ff6b6b;
    transform: scale(1.15);
    box-shadow: 0 0 15px #ff6b6b;
    animation: pulse 2s infinite;
  }

  .heatmap-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 15px;
    font-size: 0.8rem;
    flex-wrap: wrap;
    padding: 0 10px;
  }

  @media (max-width: 768px) {
    .heatmap-legend {
      gap: 12px;
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .heatmap-legend {
      gap: 8px;
      font-size: 0.7rem;
      justify-content: flex-start;
    }
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    .legend-item {
      gap: 3px;
    }
  }

  .legend-color {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    .legend-color {
      width: 12px;
      height: 12px;
    }
  }

  .current-draw-stream {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    margin: 15px 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  @media (max-width: 1024px) {
    .current-draw-stream {
      padding: 12px;
    }
  }

  @media (max-width: 480px) {
    .current-draw-stream {
      padding: 10px;
    }
  }

  .draw-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 15px 0;
  }

  @media (max-width: 600px) {
    .draw-stats {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  .draw-stats-row-label {
    grid-column: 1 / -1;
    text-align: center;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 8px 0 4px 0;
    opacity: 0.9;
    letter-spacing: 0.5px;
  }

  .draw-stats-row-label.hot {
    color: #ff4757;
    text-shadow: 0 0 8px rgba(255, 71, 87, 0.4);
  }

  .draw-stats-row-label.cold {
    color: #70a1ff;
    text-shadow: 0 0 8px rgba(112, 161, 255, 0.4);
  }

  .draw-stat-item {
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 480px) {
    .draw-stat-item {
      padding: 10px;
      gap: 6px;
    }
  }

  .draw-stat-visual {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.4rem;
  }

  .draw-stat-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .hot-icon {
    color: #ff4757;
    text-shadow: 0 0 10px #ff4757;
  }

  .cold-icon {
    color: #70a1ff;
    text-shadow: 0 0 10px #70a1ff;
  }

  .draw-stat-ball {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    .draw-stat-ball {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }

  .draw-stat-percentage {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.9;
  }

  .draw-stat-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ffdd59;
  }

  .draw-stat-label {
    font-size: 0.85rem;
    opacity: 0.8;
    font-weight: 500;
  }

  .progress-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 30px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .progress-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    .progress-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  @media (max-width: 480px) {
    .progress-stats {
      grid-template-columns: 1fr;
      gap: 8px;
    }
  }

  .stat-item {
    text-align: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffdd59;
    word-break: break-all;
  }

  @media (max-width: 480px) {
    .stat-value {
      font-size: 1.2rem;
    }
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  @media (max-width: 480px) {
    .stat-label {
      font-size: 0.8rem;
    }
  }

  .progress-bar-container {
    width: 100%;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    overflow: hidden;
    margin: 20px 0;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ff9ff3, #f368e0);
    transition: width 0.3s ease;
    border-radius: 10px;
  }

  .controls {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    min-width: 140px;
  }

  @media (max-width: 768px) {
    .btn {
      padding: 10px 20px;
      font-size: 0.9rem;
      min-width: 120px;
    }
  }

  @media (max-width: 480px) {
    .btn {
      padding: 8px 16px;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      min-width: 100px;
    }
  }

  .btn-primary {
    background: linear-gradient(145deg, #00d2d3, #54a0ff);
    color: white;
  }

  .btn-danger {
    background: linear-gradient(145deg, #ff6b6b, #ee5a24);
    color: white;
  }

  .btn-warning {
    background: linear-gradient(145deg, #ff9ff3, #f368e0);
    color: white;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .matches-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 30px;
  }

  .matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }

  .match-item.jackpot-item {
    grid-column: 1 / -1;
  }

  .match-item.jackpot-item.highlight {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15));
    border: 2px solid rgba(255, 215, 0, 0.4);
  }

  @media (max-width: 768px) {
    .matches-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  @media (max-width: 600px) {
    .matches-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  .match-item {
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 480px) {
    .match-item {
      padding: 12px;
    }
  }

  .match-item.highlight {
    background: rgba(255, 215, 0, 0.15);
    border: 1px solid rgba(255, 215, 0, 0.4);
  }

  .match-label-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .match-balls {
    display: flex;
    gap: 4px;
    justify-content: center;
  }

  .match-ball-mini {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .match-ball-mini.star {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .match-ball-mini.jackpot {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    animation: pulse 2s ease-in-out infinite;
  }

  .match-label {
    font-size: 0.9rem;
    opacity: 0.9;
    text-align: center;
  }

  @media (max-width: 480px) {
    .match-label {
      font-size: 0.85rem;
    }
  }

  .match-count {
    font-size: 1.4rem;
    font-weight: bold;
    color: #ffdd59;
    text-align: center;
    margin: 8px 0;
  }

  @media (max-width: 480px) {
    .match-count {
      font-size: 1.2rem;
    }
  }

  .match-prize {
    font-size: 1rem;
    font-weight: bold;
    color: #7bed9f;
    text-align: center;
    margin: 5px 0;
  }

  @media (max-width: 480px) {
    .match-prize {
      font-size: 0.95rem;
    }
  }

  .match-total {
    font-size: 1.05rem;
    color: #fff;
    text-align: center;
    margin-top: 5px;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    font-weight: 500;
  }

  @media (max-width: 480px) {
    .match-total {
      font-size: 0.95rem;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .financial-details {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .detail-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 15px;
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    align-items: center;
    font-size: 0.95rem;
  }

  @media (max-width: 768px) {
    .detail-row {
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 8px;
      padding: 8px;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 600px) {
    .detail-row {
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 5px;
      padding: 6px;
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .detail-row {
      grid-template-columns: 1fr;
      gap: 5px;
      padding: 10px;
      font-size: 0.9rem;
      text-align: center;
    }
    
    .detail-row > div {
      padding: 3px 0;
    }
  }

  .detail-header {
    font-weight: bold;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
  }

  .jackpot-animation {
    animation: jackpot 2s ease-in-out;
  }

  @keyframes jackpot {
    0% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(1.1); }
    75% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .win-message {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #667eea;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .jackpot-content {
    text-align: center;
    z-index: 10001;
    animation: jackpotEntrance 1s ease-out;
  }

  @keyframes jackpotEntrance {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    50% { transform: scale(1.2) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  .jackpot-title {
    font-size: 5rem;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 0 20px #ffd700, 0 0 40px #ff6b6b, 0 0 60px #ee5a24;
    margin: 0 0 20px 0;
    animation: jackpotGlow 1.5s ease-in-out infinite;
  }

  @keyframes jackpotGlow {
    0%, 100% { text-shadow: 0 0 20px #ffd700, 0 0 40px #ff6b6b, 0 0 60px #ee5a24; }
    50% { text-shadow: 0 0 30px #ffd700, 0 0 60px #ff6b6b, 0 0 90px #ee5a24; }
  }

  .jackpot-prize {
    font-size: 3rem;
    font-weight: bold;
    color: #00ff00;
    text-shadow: 0 0 10px #00ff00;
    margin: 10px 0;
  }

  .jackpot-attempts {
    font-size: 1.5rem;
    color: white;
    margin: 10px 0 30px 0;
  }

  .jackpot-balls {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin: 30px 0;
    flex-wrap: wrap;
  }

  .jackpot-balls .ball {
    animation: ballBounce 0.6s ease-in-out infinite;
    width: 60px;
    height: 60px;
    font-size: 1.3rem;
    color: white;
  }

  @keyframes ballBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  .firework {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    animation: fireworkExplode 1s ease-out forwards;
  }

  @keyframes fireworkExplode {
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
  }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    animation: confettiFall 3s linear forwards;
  }

  @keyframes confettiFall {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }

  @media (max-width: 768px) {
    .jackpot-title {
      font-size: 3rem;
    }
    .jackpot-prize {
      font-size: 2rem;
    }
    .jackpot-attempts {
      font-size: 1.2rem;
    }
  }

  @keyframes winPulse {
    0% { border-color: gold; box-shadow: 0 0 20px gold; }
    50% { border-color: #ffdd59; box-shadow: 0 0 40px #ffdd59; }
    100% { border-color: gold; box-shadow: 0 0 20px gold; }
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
    backdrop-filter: blur(5px);
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #FFD700;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    margin-top: 20px;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .loading-subtext {
    margin-top: 10px;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  /* Touch-optimized mobile styles */
  @media (hover: none) and (pointer: coarse) {
    .ball {
      min-height: 44px;
      min-width: 44px;
    }
    
    .heatmap-number {
      min-height: 36px;
      min-width: 36px;
    }
    
    .quick-btn {
      padding: 10px 20px;
      min-height: 44px;
    }
    
    .btn {
      padding: 14px 28px;
      min-width: 160px;
      min-height: 48px;
    }
    
    .ball:active {
      transform: scale(0.95);
    }
    
    .btn:active {
      transform: scale(0.98);
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Updated payout data with jackpot and calculated ratios
const PAYOUT_DATA = {
	"5+2": { prize: 156646223, label: "Match 5 + 2 Stars" },
	"5+1": { prize: 133980.1, label: "Match 5 + 1 Star" },
	"5+0": { prize: 26094.4, label: "Match 5" },
	"4+2": { prize: 812.7, label: "Match 4 + 2 Stars" },
	"4+1": { prize: 85.2, label: "Match 4 + 1 Star" },
	"3+2": { prize: 31.7, label: "Match 3 + 2 Stars" },
	"4+0": { prize: 30.0, label: "Match 4" },
	"2+2": { prize: 7.2, label: "Match 2 + 2 Stars" },
	"3+1": { prize: 7.4, label: "Match 3 + 1 Star" },
	"3+0": { prize: 6.7, label: "Match 3" },
	"1+2": { prize: 3.4, label: "Match 1 + 2 Stars" },
	"2+1": { prize: 3.5, label: "Match 2 + 1 Star" },
	"2+0": { prize: 2.7, label: "Match 2" },
	millionaire: { prize: 1000000.0, label: "UK Millionaire Maker" },
};

// Initialize the UI
element.innerHTML = `
  <div class="lotto-container">
    <div class="header">
      <h1>💰 Lottery Financial Simulator</h1>
      <div class="subtitle">Track your returns, profits, and losses in real-time • Max Jackpot: £${PAYOUT_DATA[
				"5+2"
			].prize.toLocaleString()} (shared among winners)</div>
      <div class="financial-summary">
        <div class="financial-item">
          <div class="financial-value" id="totalSpent">£0.00</div>
          <div class="financial-label">Total Spent</div>
        </div>
        <div class="financial-item">
          <div class="financial-value" id="totalWon">£0.00</div>
          <div class="financial-label">Total Won</div>
        </div>
        <div class="financial-item">
          <div class="financial-value" id="netProfit">£0.00</div>
          <div class="financial-label">Net Profit/Loss</div>
        </div>
        <div class="financial-item">
          <div class="financial-value" id="roi">0%</div>
          <div class="financial-label">Return on Investment</div>
        </div>
      </div>
    </div>

    <div class="simulation-area">
      <div class="ticket-section">
        <div class="section-title">Your Ticket • £${TICKET_PRICE} per play</div>
        
        <div class="number-picker">
          <div class="picker-title">Select 5 Main Numbers (1-50)</div>
          <div class="number-grid" id="mainNumberGrid"></div>
          <div class="selection-status" id="mainSelectionStatus">0/5 selected</div>
          <div class="quick-select-buttons">
            <button class="quick-btn" id="quickPickMain">Quick Pick Main</button>
            <button class="quick-btn" id="clearMain">Clear Main</button>
          </div>
        </div>

        <div class="number-picker">
          <div class="picker-title">Select 2 Star Numbers (1-12)</div>
          <div class="number-grid" id="starNumberGrid"></div>
          <div class="selection-status" id="starSelectionStatus">0/2 selected</div>
          <div class="quick-select-buttons">
            <button class="quick-btn" id="quickPickStar">Quick Pick Star</button>
            <button class="quick-btn" id="clearStar">Clear Star</button>
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid rgba(255, 255, 255, 0.2);">
          <div class="picker-title" style="margin-bottom: 10px;">Your Selected Ticket</div>
          <div style="text-align: center; font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px;">Main Numbers</div>
          <div class="balls-container" id="ticketMainBalls"></div>
          <div style="text-align: center; font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px; margin-top: 15px;">Star Numbers</div>
          <div class="balls-container" id="ticketStarBalls"></div>
        </div>
      </div>

      <div class="current-draw-section">
        <div class="section-title">Live Draw & Frequency Heatmap</div>
        
        <div class="current-draw-stream">
          <div class="picker-title">Current Draw</div>
          <div style="text-align: center; font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px;">Main Numbers</div>
          <div class="balls-container" id="currentMainBalls"></div>
          <div style="text-align: center; font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px; margin-top: 15px;">Star Numbers</div>
          <div class="balls-container" id="currentStarBalls"></div>
        </div>
        
        <div class="heatmap-section">
          <div class="picker-title">Statistical Deviation Heatmap</div>
          <div style="text-align: center; font-size: 0.85rem; opacity: 0.9; margin-bottom: 10px;">
            Colors show relative ranking: bottom 20% = coldest, top 20% = hottest
          </div>
          <div class="heatmap-container" id="mainHeatmap"></div>
          <div class="heatmap-container" id="starHeatmap"></div>
          
          <div class="heatmap-legend">
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(145deg, #0984e3, #6c5ce7); border: 1px solid white"></div>
              <span>Very Cold (0-20%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(145deg, #74b9ff, #a29bfe); border: 1px solid white"></div>
              <span>Slightly Cold (20-40%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(255, 255, 255, 0.15); border: 1px solid white"></div>
              <span>Average (40-60%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(145deg, #ffeaa7, #fdcb6e); border: 1px solid #aaa"></div>
              <span>Slightly Hot (60-80%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(145deg, #ff7675, #d63031); border: 1px solid white"></div>
              <span>Very Hot (80-100%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #00ff00; border: 1px solid white"></div>
              <span>Just Drawn</span>
            </div>
          </div>
        </div>
        
        <div class="draw-stats">
          <div class="draw-stats-row-label hot">🔥 HOTTEST</div>
          <div class="draw-stat-item">
            <div class="draw-stat-visual">
              <div class="draw-stat-ball main-ball" id="hotMainBall">-</div>
            </div>
            <div class="draw-stat-percentage" id="hotMainPercentage">-</div>
            <div class="draw-stat-label">Main Number</div>
          </div>
          <div class="draw-stat-item">
            <div class="draw-stat-visual">
              <div class="draw-stat-ball star-ball" id="hotStarBall">-</div>
            </div>
            <div class="draw-stat-percentage" id="hotStarPercentage">-</div>
            <div class="draw-stat-label">Star Number</div>
          </div>
          
          <div class="draw-stats-row-label cold">❄️ COLDEST</div>
          <div class="draw-stat-item">
            <div class="draw-stat-visual">
              <div class="draw-stat-ball main-ball" id="coldMainBall">-</div>
            </div>
            <div class="draw-stat-percentage" id="coldMainPercentage">-</div>
            <div class="draw-stat-label">Main Number</div>
          </div>
          <div class="draw-stat-item">
            <div class="draw-stat-visual">
              <div class="draw-stat-ball star-ball" id="coldStarBall">-</div>
            </div>
            <div class="draw-stat-percentage" id="coldStarPercentage">-</div>
            <div class="draw-stat-label">Star Number</div>
          </div>
        </div>
        
        <div id="matchStatus" style="text-align: center; margin-top: 15px; font-style: italic;"></div>
      </div>
    </div>

    <div class="progress-section">
      <div class="section-title">Simulation Progress</div>
      <div class="progress-stats">
        <div class="stat-item">
          <div class="stat-value" id="attemptsCount">0</div>
          <div class="stat-label">Attempts</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="progressPercent">0%</div>
          <div class="stat-label">Progress</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="speedCount">0</div>
          <div class="stat-label">Attempts/Sec</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="timeLapsed">--</div>
          <div class="stat-label">Time Elapsed</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="timeRemaining">--</div>
          <div class="stat-label">Est. Time Left</div>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="progressBar" style="width: 0%"></div>
      </div>
      <div class="controls">
        <button class="btn btn-primary" id="startBtn" disabled>Start Simulation</button>
        <button class="btn btn-danger" id="stopBtn" disabled>Stop Simulation</button>
        <button class="btn btn-warning" id="resetBtn">Reset All</button>
        <button class="btn" id="testJackpotBtn" style="background: linear-gradient(135deg, #ffd700, #ff6b6b); color: white; border: none;">🎰 Test Jackpot</button>
        <button class="btn" id="exportDataBtn" style="background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none;">💾 Export Data</button>
      </div>
    </div>

    <div class="matches-section">
      <div class="section-title">Winnings Breakdown</div>
      <div class="matches-grid" id="matchesGrid"></div>
    </div>

    <div class="financial-details">
      <div class="section-title">Detailed Financial Summary</div>
      <div class="detail-row detail-header">
        <div>Match Type</div>
        <div>Count</div>
        <div>Prize Each</div>
        <div>Total Won</div>
      </div>
      <div id="financialDetails"></div>
    </div>
  </div>
`;

// Game logic
const generateBalls = (totalBalls) => {
	const ballsArr = [];
	for (let i = 1; i <= totalBalls; i++) {
		ballsArr.push(i);
	}
	return ballsArr;
};

const shuffled = (array) => {
	const shuffledArray = [...array];
	for (let i = shuffledArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
	}
	return shuffledArray;
};

const mainBalls = generateBalls(MAIN_NUMBERS_TOTAL);
const starBalls = generateBalls(STAR_NUMBERS_TOTAL);

const machine = (balls, count) => {
	const shuffledBalls = shuffled(balls);
	return shuffledBalls.slice(0, count).sort((a, b) => a - b);
};

// Ticket Selection State
let userTicket = {
	mainNumbers: [],
	starNumbers: [],
};

// Heat Map Data
let frequencyData = {
	main: Array(MAIN_NUMBERS_TOTAL).fill(0),
	star: Array(STAR_NUMBERS_TOTAL).fill(0),
	totalDraws: 0,
	lastDraw: null,
};

// Memory management for long simulations
let frequencyDataArchive = {
	segments: [],
	totalArchivedDraws: 0,
};

function archiveFrequencyData() {
	if (frequencyData.totalDraws > 0) {
		frequencyDataArchive.segments.push({
			main: [...frequencyData.main],
			star: [...frequencyData.star],
			draws: frequencyData.totalDraws,
			timestamp: Date.now(),
		});
		frequencyDataArchive.totalArchivedDraws += frequencyData.totalDraws;

		// Keep only last 10 segments to prevent excessive memory usage
		if (frequencyDataArchive.segments.length > 10) {
			frequencyDataArchive.segments.shift();
		}

		console.log(
			`Archived frequency data. Total segments: ${
				frequencyDataArchive.segments.length
			}, Total archived draws: ${frequencyDataArchive.totalArchivedDraws.toLocaleString()}`
		);
	}
}

// Performance monitoring
const performanceMetrics = {
	drawsPerSecond: 0,
	lastDrawCount: 0,
	lastUpdateTime: Date.now(),
	averageDrawTime: 0,
	totalDrawTime: 0,
};

// UI Components
function createBall(number, type = "main") {
	const ball = document.createElement("div");
	ball.className = `ball ${type}-ball`;
	ball.textContent = number;
	return ball;
}

function createNumberButton(number, type = "main") {
	const button = document.createElement("div");
	button.className = `ball ${type}-ball`;
	button.textContent = number;
	button.dataset.number = number;
	button.dataset.type = type;
	button.setAttribute("role", "button");
	button.setAttribute("tabindex", "0");
	button.setAttribute(
		"aria-label",
		`${type === "main" ? "Main" : "Star"} number ${number}`
	);

	// Check if this number is already selected
	const isSelected =
		type === "main"
			? userTicket.mainNumbers.includes(number)
			: userTicket.starNumbers.includes(number);

	if (isSelected) {
		button.classList.add("selected");
		button.setAttribute("aria-pressed", "true");
	} else {
		button.setAttribute("aria-pressed", "false");
	}

	// Update aria-pressed on selection
	if (button.classList.contains("selected")) {
		button.setAttribute("aria-pressed", "true");
	}

	// Check if selection is complete and disable unselected numbers
	const maxSelection = type === "main" ? MAIN_NUMBERS_PICK : STAR_NUMBERS_PICK;
	const currentSelection =
		type === "main"
			? userTicket.mainNumbers.length
			: userTicket.starNumbers.length;

	if (currentSelection >= maxSelection && !isSelected) {
		button.classList.add("disabled");
		button.setAttribute("aria-disabled", "true");
	}

	button.addEventListener("click", handleNumberSelection);
	button.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleNumberSelection(e);
		}
	});
	return button;
}

function handleNumberSelection(event) {
	const number = parseInt(event.target.dataset.number);
	const type = event.target.dataset.type;

	if (event.target.classList.contains("disabled")) return;

	const currentSelection =
		type === "main" ? userTicket.mainNumbers : userTicket.starNumbers;
	const maxSelection = type === "main" ? MAIN_NUMBERS_PICK : STAR_NUMBERS_PICK;

	if (currentSelection.includes(number)) {
		// Remove number
		if (type === "main") {
			userTicket.mainNumbers = userTicket.mainNumbers.filter(
				(n) => n !== number
			);
		} else {
			userTicket.starNumbers = userTicket.starNumbers.filter(
				(n) => n !== number
			);
		}
		event.target.classList.remove("selected");
	} else {
		// Add number if we have space
		if (currentSelection.length < maxSelection) {
			if (type === "main") {
				userTicket.mainNumbers.push(number);
			} else {
				userTicket.starNumbers.push(number);
			}
			event.target.classList.add("selected");
		}
	}

	// Update selection status and regenerate grids to update disabled states
	updateSelectionStatus();
	generateNumberGrids();
	updateTicketDisplay();
	checkTicketValidity();
}

function generateNumberGrids() {
	const mainGrid = document.getElementById("mainNumberGrid");
	const starGrid = document.getElementById("starNumberGrid");

	mainGrid.innerHTML = "";
	starGrid.innerHTML = "";

	// Generate main numbers
	for (let i = 1; i <= MAIN_NUMBERS_TOTAL; i++) {
		mainGrid.appendChild(createNumberButton(i, "main"));
	}

	// Generate star numbers
	for (let i = 1; i <= STAR_NUMBERS_TOTAL; i++) {
		starGrid.appendChild(createNumberButton(i, "star"));
	}
}

function updateSelectionStatus() {
	document.getElementById(
		"mainSelectionStatus"
	).textContent = `${userTicket.mainNumbers.length}/${MAIN_NUMBERS_PICK} selected`;
	document.getElementById(
		"starSelectionStatus"
	).textContent = `${userTicket.starNumbers.length}/${STAR_NUMBERS_PICK} selected`;
}

function updateTicketDisplay() {
	const ticketMainBalls = document.getElementById("ticketMainBalls");
	const ticketStarBalls = document.getElementById("ticketStarBalls");

	ticketMainBalls.innerHTML = "";
	ticketStarBalls.innerHTML = "";

	// Sort numbers for display
	const sortedMain = [...userTicket.mainNumbers].sort((a, b) => a - b);
	const sortedStar = [...userTicket.starNumbers].sort((a, b) => a - b);

	// Add main balls or placeholder
	if (sortedMain.length > 0) {
		sortedMain.forEach((num) => {
			ticketMainBalls.appendChild(createBall(num, "main"));
		});
	} else {
		ticketMainBalls.innerHTML =
			'<div style="color: rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;">Select 5 main numbers above</div>';
	}

	// Add star balls or placeholder
	if (sortedStar.length > 0) {
		sortedStar.forEach((num) => {
			ticketStarBalls.appendChild(createBall(num, "star"));
		});
	} else {
		ticketStarBalls.innerHTML =
			'<div style="color: rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;">Select 2 star numbers above</div>';
	}
}

function checkTicketValidity() {
	const startBtn = document.getElementById("startBtn");
	const isValid =
		userTicket.mainNumbers.length === MAIN_NUMBERS_PICK &&
		userTicket.starNumbers.length === STAR_NUMBERS_PICK;
	startBtn.disabled = !isValid;
	return isValid;
}

function quickPickNumbers(type) {
	const numbers =
		type === "main"
			? generateBalls(MAIN_NUMBERS_TOTAL)
			: generateBalls(STAR_NUMBERS_TOTAL);
	const count = type === "main" ? MAIN_NUMBERS_PICK : STAR_NUMBERS_PICK;

	const shuffledNumbers = shuffled(numbers);
	const selected = shuffledNumbers.slice(0, count);

	if (type === "main") {
		userTicket.mainNumbers = selected;
	} else {
		userTicket.starNumbers = selected;
	}

	updateSelectionStatus();
	generateNumberGrids();
	updateTicketDisplay();
	checkTicketValidity();
}

function clearNumbers(type) {
	if (type === "main") {
		userTicket.mainNumbers = [];
	} else {
		userTicket.starNumbers = [];
	}

	updateSelectionStatus();
	generateNumberGrids();
	updateTicketDisplay();
	checkTicketValidity();
}

function resetAll() {
	userTicket = { mainNumbers: [], starNumbers: [] };
	frequencyData = {
		main: Array(MAIN_NUMBERS_TOTAL).fill(0),
		star: Array(STAR_NUMBERS_TOTAL).fill(0),
		totalDraws: 0,
		lastDraw: null,
	};

	// Clear archived data
	frequencyDataArchive = {
		segments: [],
		totalArchivedDraws: 0,
	};

	updateSelectionStatus();
	generateNumberGrids();
	updateTicketDisplay();
	checkTicketValidity();
	updateHeatmap();

	// Reset simulation state
	stopSimulation();
	document.getElementById("startBtn").textContent = "▶ Start Simulation";
	const initialMatches = {
		"5+2": 0,
		"5+1": 0,
		"5+0": 0,
		"4+2": 0,
		"4+1": 0,
		"3+2": 0,
		"4+0": 0,
		"2+2": 0,
		"3+1": 0,
		"3+0": 0,
		"1+2": 0,
		"2+1": 0,
		"2+0": 0,
	};

	const initialFinancials = {
		totalSpent: 0,
		totalWon: 0,
		totalTickets: 0,
	};

	updateMatchesGrid(initialMatches, initialFinancials);
	updateFinancialDetails(initialMatches, initialFinancials);
	updateFinancialSummary(initialFinancials);

	document.getElementById("attemptsCount").textContent = "0";
	document.getElementById("progressPercent").textContent = "0%";
	document.getElementById("speedCount").textContent = "0";
	document.getElementById("timeLapsed").textContent = "--";
	document.getElementById("timeRemaining").textContent = "--";
	document.getElementById("progressBar").style.width = "0%";
	document.getElementById("hotMainBall").textContent = "-";
	document.getElementById("hotMainPercentage").textContent = "-";
	document.getElementById("hotStarBall").textContent = "-";
	document.getElementById("hotStarPercentage").textContent = "-";
	document.getElementById("coldMainBall").textContent = "-";
	document.getElementById("coldMainPercentage").textContent = "-";
	document.getElementById("coldStarBall").textContent = "-";
	document.getElementById("coldStarPercentage").textContent = "-";

	updateBallsDisplay("currentMainBalls", [], "main");
	updateBallsDisplay("currentStarBalls", [], "star");
	document.getElementById("matchStatus").innerHTML = "";
}

// Heat Map Functions
function updateHeatmap() {
	updateMainHeatmap();
	updateStarHeatmap();
	updateHeatmapStats();
}

// Calculate percentile-based thresholds for dynamic scaling
function calculatePercentileThresholds(frequencies) {
	if (frequencies.every((f) => f === 0)) {
		return { rare: 0, common: 0, frequent: 0 };
	}

	// Sort frequencies to find percentiles
	const sorted = [...frequencies].filter((f) => f > 0).sort((a, b) => a - b);

	if (sorted.length === 0) {
		return { rare: 0, common: 0, frequent: 0 };
	}

	// Use percentiles for dynamic thresholds
	const p33 = sorted[Math.floor(sorted.length * 0.33)] || sorted[0];
	const p66 =
		sorted[Math.floor(sorted.length * 0.66)] || sorted[sorted.length - 1];

	return {
		rare: p33, // Bottom 33%
		common: p66, // Middle 33%
		frequent: p66, // Top 33%
	};
}

// Calculate deviation from expected frequency (shows statistical anomalies)
function getFrequencyDeviation(frequency, totalDraws, totalNumbers) {
	if (totalDraws === 0) return 0;

	// Expected frequency for a fair distribution
	const expected = totalDraws / totalNumbers;

	// Calculate percentage deviation from expected
	const deviation = ((frequency - expected) / expected) * 100;

	return deviation;
}

// Get classification based on deviation with more realistic thresholds
function classifyByDeviation(deviation, totalDraws) {
	// For very early draws, everything is normal to avoid noise
	if (totalDraws < 100) {
		return "normal";
	}

	// For small sample sizes, use wider tolerance bands
	// As draws increase, the law of large numbers means deviations should narrow
	let normalThreshold = 20; // Base threshold
	let wideThreshold = 35; // Wide threshold

	// Adjust thresholds based on sample size (more draws = tighter expected distribution)
	if (totalDraws > 10000) {
		normalThreshold = 15;
		wideThreshold = 28;
	}
	if (totalDraws > 100000) {
		normalThreshold = 12;
		wideThreshold = 22;
	}
	if (totalDraws > 1000000) {
		normalThreshold = 8;
		wideThreshold = 16;
	}
	if (totalDraws > 5000000) {
		normalThreshold = 6;
		wideThreshold = 12;
	}

	// Classify based on adjusted thresholds
	if (Math.abs(deviation) < normalThreshold) {
		return "normal"; // Within normal range - expected variance
	} else if (deviation < -wideThreshold) {
		return "cold"; // Significantly below expected
	} else if (deviation > wideThreshold) {
		return "hot"; // Significantly above expected
	} else if (deviation < 0) {
		return "slightly-cold"; // Moderately below expected
	} else {
		return "slightly-hot"; // Moderately above expected
	}
}

// Alternative: Classify based on percentile ranking (ensures even distribution)
function classifyByPercentile(frequencies, currentFreq) {
	// Sort all frequencies to find percentiles
	const sorted = [...frequencies].sort((a, b) => a - b);
	const rank = sorted.filter((f) => f < currentFreq).length;
	const percentile = (rank / sorted.length) * 100;

	// Distribute evenly: bottom 20%, 20-40%, 40-60%, 60-80%, top 20%
	if (percentile < 20) {
		return "cold";
	} else if (percentile < 40) {
		return "slightly-cold";
	} else if (percentile < 60) {
		return "normal";
	} else if (percentile < 80) {
		return "slightly-hot";
	} else {
		return "hot";
	}
}

function updateMainHeatmap() {
	const mainHeatmap = document.getElementById("mainHeatmap");
	mainHeatmap.innerHTML = "";

	const totalDraws = frequencyData.totalDraws;
	const thresholds = calculatePercentileThresholds(frequencyData.main);

	for (let i = 1; i <= MAIN_NUMBERS_TOTAL; i++) {
		const num = document.createElement("div");
		num.textContent = i;

		const freq = frequencyData.main[i - 1];
		const deviation = getFrequencyDeviation(
			freq,
			totalDraws,
			MAIN_NUMBERS_TOTAL
		);

		// Use percentile-based classification for even distribution
		const classification =
			totalDraws >= 100
				? classifyByPercentile(frequencyData.main, freq)
				: "normal";

		// Base class
		num.className = "heatmap-number";

		// Add classification based on statistical deviation
		if (totalDraws > 0) {
			num.classList.add(classification);
			num.setAttribute("role", "status");
			num.setAttribute(
				"aria-label",
				`Main number ${i}, drawn ${freq} times, ${deviation.toFixed(1)}% ${
					deviation >= 0 ? "above" : "below"
				} expected`
			);
		} else {
			num.setAttribute("aria-label", `Main number ${i}, not yet drawn`);
		}

		// Highlight current draw numbers with green border
		if (frequencyData.lastDraw && frequencyData.lastDraw.main.includes(i)) {
			num.style.border = "2px solid #00ff00";
			num.style.boxShadow = "0 0 10px #00ff00";
		}

		mainHeatmap.appendChild(num);
	}
}

function updateStarHeatmap() {
	const starHeatmap = document.getElementById("starHeatmap");
	starHeatmap.innerHTML = "";

	const totalDraws = frequencyData.totalDraws;
	const thresholds = calculatePercentileThresholds(frequencyData.star);

	for (let i = 1; i <= STAR_NUMBERS_TOTAL; i++) {
		const num = document.createElement("div");
		num.textContent = i;

		const freq = frequencyData.star[i - 1];
		const deviation = getFrequencyDeviation(
			freq,
			totalDraws,
			STAR_NUMBERS_TOTAL
		);

		// Use percentile-based classification for even distribution
		const classification =
			totalDraws >= 100
				? classifyByPercentile(frequencyData.star, freq)
				: "normal";

		// Base class
		num.className = "heatmap-number";

		// Add classification based on statistical deviation
		if (totalDraws > 0) {
			num.classList.add(classification);
			num.setAttribute("role", "status");
			num.setAttribute(
				"aria-label",
				`Star number ${i}, drawn ${freq} times, ${deviation.toFixed(1)}% ${
					deviation >= 0 ? "above" : "below"
				} expected`
			);
		} else {
			num.setAttribute("aria-label", `Star number ${i}, not yet drawn`);
		}

		// Highlight current draw numbers with green border
		if (frequencyData.lastDraw && frequencyData.lastDraw.star.includes(i)) {
			num.style.border = "2px solid #00ff00";
			num.style.boxShadow = "0 0 10px #00ff00";
		}

		starHeatmap.appendChild(num);
	}
}

function updateHeatmapStats() {
	// Find hottest and coldest numbers based on deviation
	const totalDraws = frequencyData.totalDraws;

	if (totalDraws === 0) {
		document.getElementById("hotMainBall").textContent = "-";
		document.getElementById("hotMainPercentage").textContent = "-";
		document.getElementById("hotStarBall").textContent = "-";
		document.getElementById("hotStarPercentage").textContent = "-";
		document.getElementById("coldMainBall").textContent = "-";
		document.getElementById("coldMainPercentage").textContent = "-";
		document.getElementById("coldStarBall").textContent = "-";
		document.getElementById("coldStarPercentage").textContent = "-";
		return;
	}

	// Calculate deviations for all numbers
	const mainDeviations = frequencyData.main.map((freq, idx) => ({
		number: idx + 1,
		freq: freq,
		deviation: getFrequencyDeviation(freq, totalDraws, MAIN_NUMBERS_TOTAL),
	}));

	const starDeviations = frequencyData.star.map((freq, idx) => ({
		number: idx + 1,
		freq: freq,
		deviation: getFrequencyDeviation(freq, totalDraws, STAR_NUMBERS_TOTAL),
	}));

	// Sort to find hottest and coldest by actual frequency
	const sortedMainHot = [...mainDeviations].sort((a, b) => b.freq - a.freq);
	const sortedMainCold = [...mainDeviations].sort((a, b) => a.freq - b.freq);
	const sortedStarHot = [...starDeviations].sort((a, b) => b.freq - a.freq);
	const sortedStarCold = [...starDeviations].sort((a, b) => a.freq - b.freq);

	// Display hottest numbers as percentage difference from expected
	// Expected frequency accounts for picking multiple numbers per draw
	const hotMainExpected = (totalDraws * MAIN_NUMBERS_PICK) / MAIN_NUMBERS_TOTAL;
	const hotMainDiff = ((sortedMainHot[0].freq - hotMainExpected) / hotMainExpected) * 100;
	document.getElementById("hotMainBall").textContent = sortedMainHot[0].number;
	document.getElementById("hotMainPercentage").textContent = 
		hotMainDiff >= 0 ? `+${hotMainDiff.toFixed(1)}%` : `${hotMainDiff.toFixed(1)}%`;

	const hotStarExpected = (totalDraws * STAR_NUMBERS_PICK) / STAR_NUMBERS_TOTAL;
	const hotStarDiff = ((sortedStarHot[0].freq - hotStarExpected) / hotStarExpected) * 100;
	document.getElementById("hotStarBall").textContent = sortedStarHot[0].number;
	document.getElementById("hotStarPercentage").textContent = 
		hotStarDiff >= 0 ? `+${hotStarDiff.toFixed(1)}%` : `${hotStarDiff.toFixed(1)}%`;

	// Display coldest numbers as percentage difference from expected
	const coldMainDiff = ((sortedMainCold[0].freq - hotMainExpected) / hotMainExpected) * 100;
	document.getElementById("coldMainBall").textContent = sortedMainCold[0].number;
	document.getElementById("coldMainPercentage").textContent = 
		coldMainDiff >= 0 ? `+${coldMainDiff.toFixed(1)}%` : `${coldMainDiff.toFixed(1)}%`;

	const coldStarDiff = ((sortedStarCold[0].freq - hotStarExpected) / hotStarExpected) * 100;
	document.getElementById("coldStarBall").textContent = sortedStarCold[0].number;
	document.getElementById("coldStarPercentage").textContent = 
		coldStarDiff >= 0 ? `+${coldStarDiff.toFixed(1)}%` : `${coldStarDiff.toFixed(1)}%`;
}

function updateFrequencyData(drawnMain, drawnStar) {
	// Update frequency counts
	drawnMain.forEach((num) => frequencyData.main[num - 1]++);
	drawnStar.forEach((num) => frequencyData.star[num - 1]++);

	frequencyData.totalDraws++;
	frequencyData.lastDraw = { main: drawnMain, star: drawnStar };
}

function updateBallsDisplay(containerId, numbers, type = "main") {
	const container = document.getElementById(containerId);
	container.innerHTML = "";
	numbers.forEach((num) => {
		container.appendChild(createBall(num, type));
	});
}

function formatCurrency(amount) {
	return (
		"£" +
		amount.toLocaleString("en-GB", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	);
}

function updateFinancialSummary(financials) {
	const totalSpent = financials.totalSpent;
	const totalWon = financials.totalWon;
	const netProfit = totalWon - totalSpent;
	const roi = totalSpent > 0 ? (netProfit / totalSpent) * 100 : 0;

	document.getElementById("totalSpent").textContent =
		formatCurrency(totalSpent);
	document.getElementById("totalWon").textContent = formatCurrency(totalWon);

	const netProfitEl = document.getElementById("netProfit");
	netProfitEl.textContent = formatCurrency(netProfit);
	netProfitEl.className =
		netProfit >= 0 ? "financial-value profit" : "financial-value loss";

	const roiEl = document.getElementById("roi");
	roiEl.textContent = roi.toFixed(1) + "%";
	roiEl.className =
		roi >= 0 ? "financial-value profit" : "financial-value loss";
}

function updateMatchesGrid(matches, financials) {
	const grid = document.getElementById("matchesGrid");

	const matchTypes = [
		{ key: "5+2", label: "Jackpot", main: 5, stars: 2, jackpot: true },
		{ key: "5+1", label: "5 Main + 1 Star", main: 5, stars: 1 },
		{ key: "5+0", label: "5 Main", main: 5, stars: 0 },
		{ key: "4+2", label: "4 Main + 2 Stars", main: 4, stars: 2 },
		{ key: "4+1", label: "4 Main + 1 Star", main: 4, stars: 1 },
		{ key: "3+2", label: "3 Main + 2 Stars", main: 3, stars: 2 },
		{ key: "4+0", label: "4 Main", main: 4, stars: 0 },
		{ key: "2+2", label: "2 Main + 2 Stars", main: 2, stars: 2 },
		{ key: "3+1", label: "3 Main + 1 Star", main: 3, stars: 1 },
		{ key: "3+0", label: "3 Main", main: 3, stars: 0 },
		{ key: "1+2", label: "1 Main + 2 Stars", main: 1, stars: 2 },
		{ key: "2+1", label: "2 Main + 1 Star", main: 2, stars: 1 },
		{ key: "2+0", label: "2 Main", main: 2, stars: 0 },
	];

	grid.innerHTML = matchTypes
		.map((type) => {
			const count = matches[type.key] || 0;
			const prize = PAYOUT_DATA[type.key].prize;
			const total = count * prize;

			// Generate visual balls
			let ballsHTML = '<div class="match-balls">';
			for (let i = 0; i < type.main; i++) {
				ballsHTML += `<div class="match-ball-mini ${
					type.jackpot ? "jackpot" : ""
				}"></div>`;
			}
			for (let i = 0; i < type.stars; i++) {
				ballsHTML += '<div class="match-ball-mini star">★</div>';
			}
			ballsHTML += "</div>";

			return `
      <div class="match-item ${count > 0 ? "highlight" : ""} ${
				type.jackpot ? "jackpot-item" : ""
			}">
        <div class="match-label-row">
          ${ballsHTML}
          <span class="match-label">${type.label}</span>
        </div>
        <div class="match-count">${count.toLocaleString()}</div>
        <div class="match-prize">${formatCurrency(prize)}</div>
        <div class="match-total">Total: ${formatCurrency(total)}</div>
      </div>
    `;
		})
		.join("");
}

function updateFinancialDetails(matches, financials) {
	const container = document.getElementById("financialDetails");
	let html = "";

	Object.keys(PAYOUT_DATA).forEach((key) => {
		const count = matches[key] || 0;
		const prize = PAYOUT_DATA[key].prize;
		const total = count * prize;

		if (count > 0 || key === "5+2") {
			// Always show jackpot row
			html += `
        <div class="detail-row">
          <div>${PAYOUT_DATA[key].label}</div>
          <div>${count}</div>
          <div>${formatCurrency(prize)}</div>
          <div>${formatCurrency(total)}</div>
        </div>
      `;
		}
	});

	// Add totals row
	html += `
    <div class="detail-row" style="background: rgba(255, 255, 255, 0.2); font-weight: bold; margin-top: 10px;">
      <div>TOTALS</div>
      <div>${financials.totalTickets}</div>
      <div>--</div>
      <div>${formatCurrency(financials.totalWon)}</div>
    </div>
  `;

	container.innerHTML = html;
}

function updateMatchStatus(mainMatches, starMatches, prize = 0) {
	const statusEl = document.getElementById("matchStatus");
	if (mainMatches === 5 && starMatches === 2) {
		statusEl.innerHTML = `<span style="color: gold; font-weight: bold; font-size: 1.2em;">🎯 JACKPOT! £${PAYOUT_DATA[
			"5+2"
		].prize.toLocaleString()}!</span>`;
	} else if (prize > 0) {
		statusEl.innerHTML = `<span style="color: #7bed9f; font-weight: bold;">Winner! ${mainMatches} Main + ${starMatches} Stars - ${formatCurrency(
			prize
		)}</span>`;
	} else {
		statusEl.innerHTML = `<span style="color: #70a1ff;">${mainMatches} Main + ${starMatches} Stars</span>`;
	}
}

function highlightMatchedBalls(drawnNumbers, ticketNumbers, ballType) {
	const containerId =
		ballType === "main" ? "currentMainBalls" : "currentStarBalls";
	const container = document.getElementById(containerId);

	Array.from(container.children).forEach((ball, index) => {
		const ballNumber = drawnNumbers[index];
		if (ticketNumbers.includes(ballNumber)) {
			ball.classList.add("matched");
		} else {
			ball.classList.remove("matched");
		}
	});
}

function showJackpotAnimation(count, drawnMain, drawnStars) {
	const winMessage = document.createElement("div");
	winMessage.className = "win-message";
	winMessage.innerHTML = `
    <div class="jackpot-content">
      <div class="jackpot-title">🎉 JACKPOT! 🎉</div>
      <div class="jackpot-prize">£${PAYOUT_DATA[
				"5+2"
			].prize.toLocaleString()}</div>
      <div class="jackpot-attempts">Won after ${count.toLocaleString()} attempts!</div>
      <div class="jackpot-balls">
        ${drawnMain
					.map((num) => `<div class="ball main-ball matched">${num}</div>`)
					.join("")}
        ${drawnStars
					.map((num) => `<div class="ball star-ball matched">${num}</div>`)
					.join("")}
      </div>
      <button class="btn btn-primary" style="font-size: 1.2rem; padding: 15px 40px; margin-top: 20px;" onclick="this.parentElement.parentElement.remove()">
        🎊 AMAZING! Continue 🎊
      </button>
    </div>
  `;

	document.body.appendChild(winMessage);

	// Create fireworks
	const createFirework = (x, y) => {
		const colors = [
			"#ff0000",
			"#00ff00",
			"#0000ff",
			"#ffff00",
			"#ff00ff",
			"#00ffff",
			"#ffd700",
		];
		for (let i = 0; i < 30; i++) {
			const firework = document.createElement("div");
			firework.className = "firework";
			firework.style.left = x + "px";
			firework.style.top = y + "px";
			firework.style.background =
				colors[Math.floor(Math.random() * colors.length)];

			const angle = (Math.PI * 2 * i) / 30;
			const velocity = 100 + Math.random() * 100;
			firework.style.setProperty("--tx", Math.cos(angle) * velocity + "px");
			firework.style.setProperty("--ty", Math.sin(angle) * velocity + "px");

			winMessage.appendChild(firework);
			setTimeout(() => firework.remove(), 1000);
		}
	};

	// Launch fireworks at random positions
	const launchFireworks = () => {
		for (let i = 0; i < 5; i++) {
			setTimeout(() => {
				const x = Math.random() * window.innerWidth;
				const y = Math.random() * window.innerHeight * 0.6;
				createFirework(x, y);
			}, i * 200);
		}
	};

	// Launch initial fireworks
	launchFireworks();

	// Launch more fireworks every 1.5 seconds
	const fireworkInterval = setInterval(launchFireworks, 1500);

	// Create confetti
	const createConfetti = () => {
		const confettiColors = [
			"#ff0000",
			"#00ff00",
			"#0000ff",
			"#ffff00",
			"#ff00ff",
			"#ffd700",
		];
		for (let i = 0; i < 50; i++) {
			setTimeout(() => {
				const confetti = document.createElement("div");
				confetti.className = "confetti";
				confetti.style.left = Math.random() * 100 + "vw";
				confetti.style.top = "0";
				confetti.style.background =
					confettiColors[Math.floor(Math.random() * confettiColors.length)];
				confetti.style.animationDelay = Math.random() * 2 + "s";
				confetti.style.animationDuration = 2 + Math.random() * 2 + "s";
				winMessage.appendChild(confetti);
				setTimeout(() => confetti.remove(), 5000);
			}, i * 50);
		}
	};

	createConfetti();
	const confettiInterval = setInterval(createConfetti, 3000);

	// Clean up intervals when closed
	const closeButton = winMessage.querySelector("button");
	closeButton.addEventListener("click", () => {
		clearInterval(fireworkInterval);
		clearInterval(confettiInterval);
	});
}

// Initialize number grids and ticket display
generateNumberGrids();
updateTicketDisplay();
checkTicketValidity();
updateHeatmap();

// Initialize matches and financials
const initialMatches = {
	"5+2": 0,
	"5+1": 0,
	"5+0": 0,
	"4+2": 0,
	"4+1": 0,
	"3+2": 0,
	"4+0": 0,
	"2+2": 0,
	"3+1": 0,
	"3+0": 0,
	"1+2": 0,
	"2+1": 0,
	"2+0": 0,
};

const initialFinancials = {
	totalSpent: 0,
	totalWon: 0,
	totalTickets: 0,
};

updateMatchesGrid(initialMatches, initialFinancials);
updateFinancialDetails(initialMatches, initialFinancials);
updateFinancialSummary(initialFinancials);

// Simulation logic
let simulationRunning = false;
let simulationController = null;

function checkMatches(drawnMain, drawnStars, ticketMain, ticketStars) {
	const mainMatches = drawnMain.filter((num) =>
		ticketMain.includes(num)
	).length;
	const starMatches = drawnStars.filter((num) =>
		ticketStars.includes(num)
	).length;
	return { mainMatches, starMatches };
}

function determineMatchType(mainMatches, starMatches) {
	if (mainMatches === 5 && starMatches === 2) return "5+2";
	if (mainMatches === 5 && starMatches === 1) return "5+1";
	if (mainMatches === 5) return "5+0";
	if (mainMatches === 4 && starMatches === 2) return "4+2";
	if (mainMatches === 4 && starMatches === 1) return "4+1";
	if (mainMatches === 4) return "4+0";
	if (mainMatches === 3 && starMatches === 2) return "3+2";
	if (mainMatches === 3 && starMatches === 1) return "3+1";
	if (mainMatches === 3) return "3+0";
	if (mainMatches === 2 && starMatches === 2) return "2+2";
	if (mainMatches === 2 && starMatches === 1) return "2+1";
	if (mainMatches === 2) return "2+0";
	if (mainMatches === 1 && starMatches === 2) return "1+2";
	return null;
}

// Format time remaining adaptively
function formatTimeRemaining(seconds) {
	if (seconds < 60) {
		return seconds + "s";
	} else if (seconds < 3600) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins + "m " + secs + "s";
	} else {
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		return hours + "h " + mins + "m";
	}
}

function startSimulation() {
	if (simulationRunning) return;

	if (!checkTicketValidity()) {
		alert("Please select your numbers first!");
		return;
	}

	simulationRunning = true;
	document.getElementById("startBtn").disabled = true;
	document.getElementById("stopBtn").disabled = false;
	document.getElementById("stopBtn").textContent = "⏹ Stop Simulation";
	document.getElementById("resetBtn").disabled = true;

	let count = 0;
	const startTime = Date.now();
	let lastHeatmapUpdate = 0;
	let lastUIUpdate = 0;
	let lastMinimalUpdate = 0;

	const matches = { ...initialMatches };
	const financials = { ...initialFinancials };

	simulationController = new AbortController();

	// Batch updates - store current state
	let currentDrawMain = [];
	let currentDrawStar = [];
	let currentMainMatches = 0;
	let currentStarMatches = 0;
	let currentPrize = 0;

	// Run simulation in chunks to avoid blocking UI
	const runSimulationChunk = () => {
		try {
			const chunkSize = 10000; // Process 10k draws per chunk
			const chunkEnd = Math.min(count + chunkSize, MAX_ATTEMPTS);

			while (count < chunkEnd) {
				try {
					const drawnBallsMain = machine(mainBalls, MAIN_NUMBERS_PICK);
					const drawnBallsStar = machine(starBalls, STAR_NUMBERS_PICK);
					count++;

					// Update frequency data (lightweight - inline)
					drawnBallsMain.forEach((num) => frequencyData.main[num - 1]++);
					drawnBallsStar.forEach((num) => frequencyData.star[num - 1]++);
					frequencyData.totalDraws++;
					frequencyData.lastDraw = {
						main: drawnBallsMain,
						star: drawnBallsStar,
					};

					// Update financials (lightweight)
					financials.totalTickets = count;
					financials.totalSpent = count * TICKET_PRICE;

					// Check for matches (lightweight)
					const mainMatchesCount = drawnBallsMain.filter((num) =>
						userTicket.mainNumbers.includes(num)
					).length;
					const starMatchesCount = drawnBallsStar.filter((num) =>
						userTicket.starNumbers.includes(num)
					).length;

					// Store for UI update
					currentDrawMain = drawnBallsMain;
					currentDrawStar = drawnBallsStar;
					currentMainMatches = mainMatchesCount;
					currentStarMatches = starMatchesCount;

					// Check for wins and update matches
					const matchType = determineMatchType(
						mainMatchesCount,
						starMatchesCount
					);
					currentPrize = 0;

					if (matchType) {
						matches[matchType]++;

						// Calculate prize (with jackpot sharing for 5+2)
						if (matchType === "5+2") {
							// Calculate expected number of jackpot winners per draw
							const expectedWinners = Math.max(
								1,
								TYPICAL_TICKETS_PER_DRAW / JACKPOT_ODDS
							);
							currentPrize = PAYOUT_DATA[matchType].prize / expectedWinners;
						} else {
							currentPrize = PAYOUT_DATA[matchType].prize;
						}

						financials.totalWon += currentPrize; // Check for jackpot - immediate update
						if (matchType === "5+2") {
							updateBallsDisplay("currentMainBalls", drawnBallsMain, "main");
							updateBallsDisplay("currentStarBalls", drawnBallsStar, "star");
							highlightMatchedBalls(
								drawnBallsMain,
								userTicket.mainNumbers,
								"main"
							);
							highlightMatchedBalls(
								drawnBallsStar,
								userTicket.starNumbers,
								"star"
							);
							updateMatchStatus(
								mainMatchesCount,
								starMatchesCount,
								currentPrize
							);
							updateMatchesGrid(matches, financials);
							updateFinancialDetails(matches, financials);
							updateFinancialSummary(financials);
							showJackpotAnimation(count, drawnBallsMain, drawnBallsStar);
							break;
						}
					}

					const now = Date.now();

					// Fast UI updates - progress and current draw
					if (count % UI_UPDATE_INTERVAL === 0) {
						const elapsed = (now - startTime) / 1000;
						const speed = Math.round(count / elapsed);
						const progress = (count / MAX_ATTEMPTS) * 100;
						const remainingTime = Math.round((MAX_ATTEMPTS - count) / speed);
						const elapsedTime = Math.round(elapsed);

						document.getElementById("attemptsCount").textContent =
							count.toLocaleString();
						document.getElementById("progressPercent").textContent =
							progress.toFixed(1) + "%";
						document.getElementById("speedCount").textContent =
							speed.toLocaleString();
						document.getElementById("timeLapsed").textContent =
							formatTimeRemaining(elapsedTime);
						document.getElementById("timeRemaining").textContent =
							formatTimeRemaining(remainingTime);
						document.getElementById("progressBar").style.width = progress + "%";

						// Update current draw display
						updateBallsDisplay("currentMainBalls", currentDrawMain, "main");
						updateBallsDisplay("currentStarBalls", currentDrawStar, "star");
						highlightMatchedBalls(
							currentDrawMain,
							userTicket.mainNumbers,
							"main"
						);
						highlightMatchedBalls(
							currentDrawStar,
							userTicket.starNumbers,
							"star"
						);
						updateMatchStatus(
							currentMainMatches,
							currentStarMatches,
							currentPrize
						);

						lastUIUpdate = now;
					}

					// Heatmap updates - based on draw count for better performance
					if (count % HEATMAP_UPDATE_THRESHOLD === 0) {
						updateHeatmap();
					}

					// Heavy UI updates - very infrequent
					if (now - lastMinimalUpdate >= MINIMAL_UPDATE_INTERVAL) {
						updateMatchesGrid(matches, financials);
						updateFinancialDetails(matches, financials);
						updateFinancialSummary(financials);
						lastMinimalUpdate = now;
					}
				} catch (error) {
					console.error("Error during simulation iteration:", error);
				}
			}

			// Check if simulation is complete
			if (count >= MAX_ATTEMPTS) {
				// Final updates
				updateBallsDisplay("currentMainBalls", currentDrawMain, "main");
				updateBallsDisplay("currentStarBalls", currentDrawStar, "star");
				highlightMatchedBalls(currentDrawMain, userTicket.mainNumbers, "main");
				highlightMatchedBalls(currentDrawStar, userTicket.starNumbers, "star");
				updateMatchStatus(currentMainMatches, currentStarMatches, currentPrize);
				updateMatchesGrid(matches, financials);
				updateFinancialDetails(matches, financials);
				updateFinancialSummary(financials);
				updateHeatmap();

				// Stop simulation
				simulationRunning = false;
				document.getElementById("startBtn").disabled = false;
				document.getElementById("startBtn").textContent = "▶ Start Simulation";
				document.getElementById("stopBtn").disabled = true;
				document.getElementById("resetBtn").disabled = false;
			} else {
				// Schedule next chunk only if still running
				if (simulationRunning) {
					setTimeout(runSimulationChunk, 0);
				}
			}
		} catch (error) {
			console.error("Fatal error in simulation:", error);
			alert("An error occurred during the simulation. Please try again.");
			simulationRunning = false;
			document.getElementById("startBtn").disabled = false;
			document.getElementById("stopBtn").disabled = true;
			document.getElementById("resetBtn").disabled = false;
		}
	};

	// Start first chunk
	runSimulationChunk();
}

function stopSimulation() {
	simulationRunning = false;
	simulationController?.abort();
	document.getElementById("startBtn").disabled = false;
	document.getElementById("stopBtn").disabled = true;
	document.getElementById("resetBtn").disabled = false;
}

function exportSimulationData() {
	const data = {
		userTicket,
		frequencyData: {
			main: [...frequencyData.main],
			star: [...frequencyData.star],
			totalDraws: frequencyData.totalDraws,
		},
		frequencyDataArchive: {
			segments: frequencyDataArchive.segments,
			totalArchivedDraws: frequencyDataArchive.totalArchivedDraws,
		},
		performanceMetrics: {
			drawsPerSecond: performanceMetrics.drawsPerSecond,
			averageDrawTime: performanceMetrics.averageDrawTime,
		},
		timestamp: new Date().toISOString(),
		attempts:
			parseInt(
				document.getElementById("attemptsCount").textContent.replace(/,/g, "")
			) || 0,
		totalSpent: document.getElementById("totalSpent").textContent,
		totalWon: document.getElementById("totalWon").textContent,
		netProfit: document.getElementById("netProfit").textContent,
		roi: document.getElementById("roi").textContent,
	};

	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `lottery-simulation-${Date.now()}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

// Event delegation for better performance
function initializeEventDelegation() {
	document.addEventListener("click", (e) => {
		// Handle button clicks (balls have their own direct event listeners)
		if (e.target.id === "startBtn" || e.target.closest("#startBtn")) {
			startSimulation();
		} else if (e.target.id === "stopBtn" || e.target.closest("#stopBtn")) {
			stopSimulation();
		} else if (e.target.id === "resetBtn" || e.target.closest("#resetBtn")) {
			resetAll();
		} else if (
			e.target.id === "exportDataBtn" ||
			e.target.closest("#exportDataBtn")
		) {
			exportSimulationData();
		} else if (
			e.target.id === "testJackpotBtn" ||
			e.target.closest("#testJackpotBtn")
		) {
			const testMainNumbers =
				userTicket.mainNumbers.length === MAIN_NUMBERS_PICK
					? userTicket.mainNumbers
					: [7, 13, 21, 28, 42];
			const testStarNumbers =
				userTicket.starNumbers.length === STAR_NUMBERS_PICK
					? userTicket.starNumbers
					: [3, 9];
			showJackpotAnimation(123456, testMainNumbers, testStarNumbers);
		} else if (
			e.target.id === "quickPickMain" ||
			e.target.closest("#quickPickMain")
		) {
			quickPickNumbers("main");
		} else if (
			e.target.id === "quickPickStar" ||
			e.target.closest("#quickPickStar")
		) {
			quickPickNumbers("star");
		} else if (e.target.id === "clearMain" || e.target.closest("#clearMain")) {
			clearNumbers("main");
		} else if (e.target.id === "clearStar" || e.target.closest("#clearStar")) {
			clearNumbers("star");
		}
	});

	// Touch feedback for mobile
	if ("ontouchstart" in window) {
		document.addEventListener(
			"touchstart",
			(e) => {
				if (
					e.target.matches(".ball[data-number]") ||
					e.target.matches(".btn")
				) {
					e.target.style.transform = "scale(0.95)";
				}
			},
			{ passive: true }
		);

		document.addEventListener(
			"touchend",
			(e) => {
				if (
					e.target.matches(".ball[data-number]") ||
					e.target.matches(".btn")
				) {
					e.target.style.transform = "";
				}
			},
			{ passive: true }
		);
	}
}

// Initialize event delegation
initializeEventDelegation();

// Only keep listeners that aren't in event delegation
// (startBtn, stopBtn, resetBtn, exportDataBtn are handled by delegation)
document.getElementById("testJackpotBtn").addEventListener("click", () => {
	// Create a fake jackpot with user's ticket numbers
	const testMainNumbers =
		userTicket.mainNumbers.length === MAIN_NUMBERS_PICK
			? userTicket.mainNumbers
			: [7, 13, 21, 28, 42];
	const testStarNumbers =
		userTicket.starNumbers.length === STAR_NUMBERS_PICK
			? userTicket.starNumbers
			: [3, 9];

	showJackpotAnimation(123456, testMainNumbers, testStarNumbers);
});
document
	.getElementById("quickPickMain")
	.addEventListener("click", () => quickPickNumbers("main"));
document
	.getElementById("quickPickStar")
	.addEventListener("click", () => quickPickNumbers("star"));
document
	.getElementById("clearMain")
	.addEventListener("click", () => clearNumbers("main"));
document
	.getElementById("clearStar")
	.addEventListener("click", () => clearNumbers("star"));
