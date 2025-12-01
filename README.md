# 🎰 EuroMillions Lottery Simulator

A high-performance lottery simulator that can process **500,000+ attempts per second**, capable of running up to 150 million draws to calculate realistic odds and financial outcomes.

## 🚀 Features

- **Ultra-Fast Performance**: 500k+ attempts/second using optimized chunked processing
- **Real-time Statistics**: Live updates of draws, matches, and financials
- **Interactive Number Selection**: Click to select your lucky numbers
- **Hot/Cold Analysis**: Visual representation of frequently/rarely drawn numbers
- **Heatmap Visualization**: Color-coded frequency distribution
- **Financial Tracking**: Complete ROI, profit/loss, and winning breakdown
- **Jackpot Celebration**: Epic full-page animation when you hit 5+2
- **Mobile Responsive**: Works on all devices
- **Export Functionality**: Save your simulation data as JSON

## 📊 Key Statistics Tracked

- Total attempts and time elapsed
- Match distribution (5+2, 5+1, 5+0, etc.)
- Total spent vs total won
- Net profit/loss and ROI percentage
- Number frequency analysis
- Hot/cold number ratios

## 🎯 How to Use

1. **Select Numbers**: Click 5 main numbers (1-50) and 2 star numbers (1-12)
2. **Start Simulation**: Click "Start Simulation" to begin
3. **Watch Results**: Real-time updates as the simulation runs
4. **Stop Anytime**: Click "Stop Simulation" to pause
5. **Reset**: Clear all data and start fresh
6. **Export**: Save your results for analysis

## 🔧 Technical Details

- **Vanilla JavaScript**: No frameworks, pure performance
- **Chunk Processing**: 10,000 draws per chunk with setTimeout
- **Optimized Updates**:
  - UI updates every 10k draws
  - Heatmap every 100k draws
  - Financials every 3 seconds
- **GPU Acceleration**: CSS transforms for animations
- **Event Delegation**: Efficient event handling

## 🎲 Odds Reference

- **Jackpot (5+2)**: 1 in 139,838,160
- **5+1**: 1 in 6,991,908
- **5+0**: 1 in 3,107,515
- **4+2**: 1 in 621,503
- And more...

## 🏗️ Performance Optimizations

- Inline frequency calculations
- Minimal DOM manipulation
- Batched state updates
- Efficient memory usage
- No performance monitoring overhead

## 📱 Browser Support

Works on all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## 🚀 Deployment

Simply host the three files on any static hosting:

- `index.html`
- `index.js`
- `styles.css`

Or use GitHub Pages for free hosting!

## 📄 License

Free to use and modify for personal or commercial projects.

## 🎉 Credits

Built with performance and user experience in mind. Features elegant animations, responsive design, and real-time statistical analysis.

---

**Note**: This is a simulation for educational and entertainment purposes. It demonstrates the mathematical reality of lottery odds. Remember: the lottery is statistically a negative expected value game!
