# CalciVerse

CalciVerse is a comprehensive collection of web-based calculation and tracking utilities designed to help users compute everyday metrics across finance, time zones, personal health, and statistics.

## Project Structure

The project is structured with a central hub page linking out to individual sub-utilities:

- **Financial Calculators**
  - `/tools/interest/`: Computes simple and compound interest over custom periods.
  - `/tools/wealth/`: Forecasts savings growth and long-term asset accumulation.
  - `/tools/inflation/`: Adjusts historical currency values relative to modern purchasing power.
  - `/tools/tip/`: Calculates dining tip percentages and splits the bill among groups.

- **Time & Date Utilities**
  - `/tools/timezone/`: Compares and converts hours across worldwide time zones.
  - `/tools/duration/`: Measures the exact days, hours, and minutes between two times.
  - `/tools/between/`: Counts the inclusive duration separating calendar dates.
  - `/tools/leap/`: Evaluates specific calendar years to check for leap years.

- **Personal Tracking & Math**
  - `/tools/age/`: Computes precise chronological age down to the day.
  - `/tools/age-units/`: Expresses a life duration across alternative time units (e.g., total weeks or minutes).
  - `/tools/water/`: Recommends daily fluid intake goals based on standard user biometrics.
  - `/tools/percentage/`: Solves standard percentage increases, decreases, and fractions.

## Core Features

- **Static Architecture:** Lightweight and fast implementation structured strictly with standard, dependency-free HTML, CSS, and vanilla Javascript.
- **Stand-Alone Directory Structure:** Every tool operates inside its own nested subdirectory, containing an isolated `index.html` file that references global shared assets.
- **Mobile-Friendly Design:** Completely responsive layout optimization packaged cleanly through a global `styles.css` style sheet.
