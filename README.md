# 💰 Retirement Calculators

A comprehensive web-based retirement planning tool that helps you project your pension growth and retirement income. Built with vanilla JavaScript, HTML, and CSS for simplicity and portability.

## 🌟 Features

### Current (v0.1)
- **Pension Projection Calculator**: Calculate projected pension pot value at retirement
  - Input current pension value, monthly contributions, and expected growth rate
  - Instant calculation of final pension pot value
  - Clear display of projection results
  
- **User-Friendly Interface**: Clean, intuitive design for easy data entry
- **Input Validation**: Ensures all inputs are valid before calculations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Coming Soon
- Income projection calculator with tax considerations
- Interactive growth charts and visualizations
- Multiple scenario comparisons
- Export results to PDF
- Save/load calculation scenarios

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No additional software or dependencies required!

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dhCopilot/retirement-calculators.git
   cd retirement-calculators
   ```

2. **Open the calculator**:
   - Simply open `src/index.html` in your web browser
   - Or double-click the file in your file explorer

   **Windows**:
   ```powershell
   start src/index.html
   ```
   
   **Mac/Linux**:
   ```bash
   open src/index.html
   ```

That's it! No build process, no npm install, just open and use.

## 📁 Project Structure

```
retirement-calculators/
├── src/
│   ├── index.html              # Main HTML file
│   ├── style.css               # Stylesheet
│   ├── app.js                  # Main application logic
│   ├── calculators/
│   │   ├── pension-projection.js   # Pension calculation logic
│   │   └── income-projection.js    # Income calculation logic (coming soon)
│   ├── validation/
│   │   └── input-validator.js      # Input validation utilities
│   └── charts/
│       └── growth-chart.js         # Chart generation (coming soon)
├── user-stories/               # Feature specifications
├── docs/                       # Technical documentation
└── README.md                   # This file
```

## 💡 How to Use

### Pension Projection Calculator

1. **Enter Your Current Details**:
   - Current pension pot value (£)
   - Your current age
   - Target retirement age
   - Monthly contribution amount (£)
   - Expected annual growth rate (%)

2. **Calculate**:
   - Click the "Calculate" button
   - View your projected pension pot at retirement

3. **Adjust and Experiment**:
   - Try different contribution amounts
   - Test various growth rate scenarios
   - See how retirement age affects your final pot

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with responsive design
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Git**: Version control
- **GitHub**: Code hosting and collaboration

## 📊 Development

### Project Management

This project uses GitHub Issues to track user stories and features:

- **User Stories**: Located in `user-stories/` folder
- **Labels**: 
  - `user-story`: Feature requests from user perspective
  - `v0.1`, `v0.2`, etc.: Version milestones
  - `ui`: User interface changes
  - `calculator-core`: Core calculation logic
  - `completed`: Finished features

### Version History

- **v0.1** (Current): Initial release with pension projection calculator
- **v0.2** (Planned): Income projection with tax calculations
- **v0.3** (Planned): Interactive charts and visualizations

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

```bash
# Make changes to files
git add .

# Commit with descriptive message
git commit -m "feat: add new calculator feature"

# Push to GitHub
git push origin main
```

## 🧪 Testing

To test the calculator:
1. Open `src/index.html` in your browser
2. Enter test values:
   - Current pot: £50,000
   - Current age: 40
   - Retirement age: 67
   - Monthly contribution: £500
   - Growth rate: 5%
3. Verify the calculation is reasonable
4. Test edge cases (zero values, very large numbers, etc.)

## 📝 Roadmap

### Phase 1 (v0.1) ✅
- [x] Basic pension projection calculator
- [x] Input validation
- [x] Responsive UI design

### Phase 2 (v0.2) 🚧
- [ ] Income projection calculator
- [ ] Tax calculations (UK tax bands)
- [ ] State pension integration

### Phase 3 (v0.3) 📅
- [ ] Interactive growth charts
- [ ] Multiple scenario comparison
- [ ] Save/load functionality

### Phase 4 (v0.4) 📅
- [ ] PDF export
- [ ] Print-friendly views
- [ ] Advanced customization options

## 🤝 Support

If you encounter any issues or have questions:
- Check the [Issues](https://github.com/dhCopilot/retirement-calculators/issues) page
- Create a new issue with details about your problem
- Review the documentation in the `docs/` folder

## 📄 License

This project is private and for personal use.

## 🙏 Acknowledgments

- Built with care for personal retirement planning
- Inspired by the need for simple, transparent retirement calculations
- No tracking, no ads, no data collection - just calculations

---

**Note**: This calculator provides estimates only. For personalized financial advice, please consult a qualified financial advisor.

**Version**: 0.1.0  
**Last Updated**: February 2026  
**Maintained by**: dhCopilot
