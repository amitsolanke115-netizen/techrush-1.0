# techrush-1.0

# MallPark — Smart Mall Parking Dashboard

> A responsive, real-time-simulated dashboard that helps mall visitors find available parking instantly — floor-wise layouts, live sensor updates, dynamic pricing, and an at-a-glance analytics panel.

Built for : **Techrush Hackathon 2026** in Domain : **Frontend Web Development** by Team : **The Crew**

---

🎯Problem Statement

Develop a web application that helps visitors quickly find available parking spaces in a 
shopping mall. The dashboard should provide floor-wise parking availability, occupancy 
statistics, and interactive parking layouts to enhance the overall parking experience. 
Additional Requirements 
● Design a responsive and user-friendly interface. 
● Display floor-wise parking layouts with available and occupied slots. 
● Allow users to search and filter parking spaces by floor or vehicle type. 
● Include parking analytics such as occupancy rate and available spaces. 
● Simulate live parking updates using mock data. 
● Parking reservation UI, EV charging station indicators, parking fee estimation, 
dark mode, or interactive floor navigation.  

---

**Solution**

**MallPark** is a smart, sensor-driven parking system with a clean, mobile-friendly dashboard — showing exactly which floor, and which slot, is free right now.

**✨Features**

- **Floor-wise parking layout** — visually distinct floors (Basement, Ground, Level 1, Level 2) with per-slot status
- **Live status grid** — every slot shows Available / Occupied / Reserved via color-coded sensor indicators
- **Search & filter** — find a slot by ID, or filter by vehicle type (Car / Two-Wheeler / EV / Accessible)
- **Occupancy analytics** — live donut chart + stat cards (Available, Occupied, Total, EV-free) per floor
- **Simulated live updates** — slot statuses change automatically every few seconds to mimic real sensor feeds, with toast notifications when a spot frees up
- **Reservation UI** — tap any available slot to hold it, with a confirmation modal
- **EV charging indicators** — dedicated badge on EV-enabled slots
- **Dynamic fee estimator** — per-vehicle hourly rate, scales with duration
- **Premium floor pricing** — Basement (B1) carries a real-time surcharge, calculated live when you select a slot there — modeling how real multi-tier mall parking pricing works
- **Dark / light theme toggle**
- **Staggered entrance animation** — slots "power on" one after another when a floor loads, instead of appearing all at once

---

**🖼️ Preview**
<img width="1895" height="983" alt="dashboard_1" src="https://github.com/user-attachments/assets/44a64499-cd29-4b2d-933d-971a038f46f1" />
<img width="1892" height="974" alt="dashboard_2" src="https://github.com/user-attachments/assets/3fe2cc0f-daed-43f0-aecd-486af3491eca" />
<img width="1919" height="989" alt="vehicle_search_filter" src="https://github.com/user-attachments/assets/4fcf2099-648d-490a-a52d-d7af4ebd3817" />
<img width="564" height="929" alt="fee_estimator" src="https://github.com/user-attachments/assets/4149eeb9-70e2-4225-8548-9439df73d589" />
<img width="1915" height="992" alt="theme_toggle" src="https://github.com/user-attachments/assets/c2bac535-e3d1-4aa5-8e8a-da53bc110434" />
<img width="1891" height="1005" alt="parking_slot_reservation" src="https://github.com/user-attachments/assets/5128aafd-c9eb-4fae-8256-68a0c6990bab" />

---

**🛠️Tech Stack**

- **HTML5** — semantic structure
- **CSS3** — custom properties (CSS variables) for theming, Grid & Flexbox layout, keyframe animations
- **Vanilla JavaScript (ES6+)** — no frameworks, no build step — DOM rendering, state management, and the live-update simulation are all hand-written
- **Google Fonts** — Outfit, Plus Jakarta Sans, Space Mono

No frameworks, no dependencies to install — it runs by opening a single file.

---

**📁Project Structure**

```
mallpark/
├── index.html
├── style.css
├── script.js
├── README.md
└── screenshots/
    ├── dashboard_1.png
    ├── dashboard_2.png
    ├── vehicle_search_filter.png
    ├── fee_estimator.png
    ├── theme_toggle.png
    └── parking_slot_reservation.png
```

---

**🚀Running Locally**

No installation needed.

1. Clone or download this repository
2. Open `index.html` directly in any modern browser (Chrome/Edge/Firefox)

That's it.

---

**🧠How It Works**

- All parking data is generated as **mock data** on page load (`makeFloorSlots()` in `script.js`), simulating what a real backend/sensor API would return.
- The UI is fully **state-driven**: `state` in `script.js` holds the current floor, filters, and slot data, and every UI element is re-rendered from that single source of truth whenever something changes — the same pattern real frontend frameworks (React, Vue) are built around, just done by hand.
- `setInterval(simulateLiveUpdate, 4000)` mimics live IoT sensor feeds by randomly flipping a few slots every 4 seconds — this is what makes the dashboard feel "live" without an actual backend.
- Pricing logic in `openReserveModal()` and `updateFee()` demonstrates conditional business logic (e.g., the Basement premium surcharge), not just static display.

---

**👥Team**

Member 1 -> Name : Parth Vijaykumar Somani

Member 2 -> Name : Amit Datta Solanke

Member 3 -> Name : Kartik Ganesh Telore

---

**📌Future Scope**

- Connect to a real backend / IoT sensor API instead of mock data
- Persist reservations with a login system
- Turn-by-turn indoor navigation to the reserved slot
- Admin/mall-manager view with revenue and peak-hour analytics

---

**📄License**

This project was built for **Techrush Hackathon 2026** organized by **IEEE Student Branch @PICT** in August 2026. Free to use for educational purposes.
