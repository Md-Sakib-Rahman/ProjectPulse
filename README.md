
# ProjectPulse


A sleek project management dashboard that surfaces project health, team assignments, and role-based dashboards. Built with Next.js + React and styled with Tailwind / DaisyUI to deliver a fast, accessible UI for managers, clients, and team members.




## Key Features

- Role-based Dashboards: Specific interfaces for Admin, Client, and Employee roles with automatic routing via middleware proxy.
- Dynamic Project Health: Automated calculation of project status (On Track, At Risk, Critical) based on multi-source data points.
- Risk Management: Proactive risk logging with severity-based impact on project health and a streamlined resolution process.
- Feedback Loops: Integrated system for employees to submit weekly check-ins and clients to provide satisfaction ratings.
- Team Management: Admin tools to add or remove employees from specific projects with real-time UI updates.
- Authentication UX: Professional login experience featuring field validation, loading states, and SweetAlert2 feedback.









## Tech Stack
**Framework:** Next.js 16 (App Router).

**Styling:** Tailwind CSS + DaisyUI

**Database:** MongoDB

**State/Forms:** React Hook Form

**Interactivity:** SweetAlert2 & React Icons

**Logic:** Next.js Server Actions


## Getting Started

Clone the repo git clone "< repourl >"

Install dependencies npm install

Create environment variables Copy .env.example to .env and set required keys (MongoDB URI, Auth Secret, etc.).

Run in development npm run dev Open http://localhost:3000

Development Notes

    Routing: Handled by proxy.js which redirects users based on their verified JWT role (Admin, Client, or Employee).

    Health Updates: The updateProjectHealth utility is triggered automatically during check-in submissions, risk logging, risk resolution, and client feedback.

    Check-in Frequency: The Employee dashboard flags projects as "Pending" if the lastCheckinDate is more than 7 days old.
## Project Health Calculation Method
The Health Score (0–100%) is a logic-based metric that accurately reflects the "pulse" of a project by weighing sentiment against technical risks.

**Base Activity:**  Score (Sentiment)
The system calculates a base score from the three most recent interaction cycles:

- Employee Confidence (50%): Average confidenceLevel (1–5 scale) from the last three check-ins.

- Client Satisfaction (50%): Average of satisfactionRating and communicationRating (1–5 scale) from the last three feedbacks.

- Normalization: The combined average is multiplied by 10 to convert the 1–10 combined scale into a 0–100 baseline percentage.


**Risk Penalties (Deductions):**  The base score is then penalized for every "Open" risk item currently associated with the project:

- High Severity: -15 points per item.

- Medium Severity: -8 points per item.

- Low Severity: -3 points per item.

**Final Status Mapping:**  The resulting score is clamped between 0 and 100 and mapped to a project status:

- On Track: 80% – 100%.

- At Risk: 60% – 79%.

- Critical: Below 60%.