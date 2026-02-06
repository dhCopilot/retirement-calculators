# 💰 Retirement Calculators

A comprehensive web-based retirement planning tool that helps you project your pension growth and retirement income. Built with vanilla JavaScript, HTML, and CSS for simplicity and portability.

## 🌟 Features

### Current (v0.2)
- **Pension Projection Calculator**: Calculate projected pension pot value at retirement
  - Input current pension value, monthly contributions, and expected growth rate
  - **Customizable investment growth rate** (0-15% annually)
  - Instant calculation of final pension pot value
  - Clear display of projection results with growth rate assumptions
  
- **User-Friendly Interface**: Clean, intuitive design for easy data entry
- **Input Validation**: Ensures all inputs are valid before calculations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Income Projection**: Calculate annual income based on 4% safe withdrawal rate
- **Functionality Page**: View all features and project progress with automatic updates

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
│   ├── index.html                 # Main calculator page
│   ├── functionality.html         # Features overview page
│   ├── style.css                  # Main stylesheet
│   ├── functionality-style.css    # Functionality page styles
│   ├── app.js                     # Main application logic
│   ├── functionality.js           # Functionality page logic
│   ├── data/
│   │   └── user-stories.json      # User stories data (auto-updates page)
│   ├── calculators/
│   │   ├── pension-projection.js     # Pension calculation logic
│   │   └── income-projection.js      # Income calculation logic
│   ├── validation/
│   │   └── input-validator.js        # Input validation utilities
│   └── charts/
│       └── growth-chart.js           # Chart generation
├── user-stories/               # Feature specifications (markdown)
├── docs/                       # Technical documentation
└── README.md                   # This file
```

## 💡 How to Use

### Main Calculator
Navigate to `index.html` to use the pension projection calculator.

### View All Features
Click the **📋 View All Features** link on the calculator page (or visit `functionality.html` directly) to see:
- All implemented features organized by status
- Feature details and acceptance criteria
- Version information for each feature
- Project completion progress

### Pension Projection Calculator

1. **Enter Your Current Details**:
   - Current pension pot value (£)
   - Your current age
   - Target retirement age
   - Monthly contribution amount (£)
   - Expected annual growth rate (%) - customize from 0% to 15%

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

- **v0.2** (Current): Investment growth rate customization
  - User-configurable growth rate (0-15%)
  - Scenario modeling capability
- **v0.1** (Previous): Initial release with pension projection calculator
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

### Maintaining the Functionality Page

The Functionality Page automatically displays all features by reading from `src/data/user-stories.json`. To keep it updated:

1. **When adding a new user story:**
   - Create a markdown file in `user-stories/` (e.g., `US006-feature-name.md`)
   - Add corresponding entry to `src/data/user-stories.json` with:
     - `id`: Unique identifier (US006, US007, etc.)
     - `title`: Feature name
     - `description`: What user can do
     - `goal`: Why they want to do it
     - `status`: `completed`, `in-progress`, or `planned`
     - `version`: Semver (0.1.0, 0.2.0, etc.)
     - `features`: Array of acceptance criteria
     - `icon`: Emoji icon for visual identification

2. **When updating a feature status:**
   - Update the `status` field in `src/data/user-stories.json`
   - The Functionality Page will reflect changes automatically on next page load

3. **When completing a feature:**
   - Set `status` to `completed`
   - Update `version` to current release version
   - Project progress stats will update automatically

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
- [x] Income projection calculator

### Phase 2 (v0.2) ✅
- [x] Customizable investment growth rate
- [x] Scenario modeling (0-15% growth rates)
- [x] Display growth rate assumptions in results

### Phase 3 (v0.3) 🚧
- [ ] Tax calculations (UK tax bands)
- [ ] State pension integration

### Phase 4 (v0.4) 📅
- [ ] Interactive growth charts
- [ ] Multiple scenario comparison
- [ ] Save/load functionality

### Phase 5 (v0.5) 📅
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

**Version**: 0.2.0  
**Last Updated**: February 6, 2026  
**Maintained by**: dhCopilot
