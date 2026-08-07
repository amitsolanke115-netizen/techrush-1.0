(function () {
    "use strict";

    /*ICONS & CONFIGURATION*/
    const ICONS = {
        car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13l1.5-4.5A2 2 0 016.4 7h11.2a2 2 0 011.9 1.5L21 13"/><rect x="2" y="13" width="20" height="6" rx="1.5"/><circle cx="7" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>',
        bike: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M5.5 17.5L9 9h5l3 4.5M9 9L7 6h3"/></svg>',
        ev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
        accessible: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4.5" r="1.8"/><path d="M12 8v5l4 3M12 13H7M9 21l3-8"/></svg>'
    }; 
    const TYPE_LABEL = { car: 'Car', bike: 'Two-Wheeler', ev: 'EV', accessible: 'Accessible' };
    
    /*FIXED PARKING CHARGES PER HOUR*/
    const RATE = { car: 20, bike: 10, ev: 20, accessible: 20 };

    /*RANDOM DATA GENERATION*/
    const FLOORS = [
        { id: 'B1', label: 'Basement 1 (Premium)', count: 28 },
        { id: 'G', label: 'Ground Floor', count: 32 },
        { id: 'L1', label: 'Level 1', count: 36 },
        { id: 'L2', label: 'Level 2', count: 36 }
    ];

    /*HELPER TO PICK RANDOM STATES BASED ON PROBABILITY WEIGHTS*/
    function pick(weights) {
        const r = Math.random();
        let acc = 0;
        for (const [key, w] of Object.entries(weights)) {
            acc += w;
            if (r <= acc) return key;
        }
        return Object.keys(weights)[0];
    }

    /*GENERATES UNIQUE PARKING SLOTS FOR EACH FLOOR*/
    function makeFloorSlots(floor) {
        const slots = [];
        for (let i = 1; i <= floor.count; i++) {
            const type = pick({ car: 0.60, bike: 0.20, ev: 0.12, accessible: 0.08 });
            let status = pick({ occupied: 0.55, available: 0.38, reserved: 0.07 });
            slots.push({
                id: `${floor.id}-${String(i).padStart(3, '0')}`,
                floor: floor.id,
                type: type,
                status: status,
                ev: type === 'ev'
            });
        }
        return slots;
    }

    /*CENTRAL APPLICATION STATE*/
    const state = {
        floors: FLOORS,
        slots: {},
        activeFloor: FLOORS[0].id,
        vehicleFilter: 'all',
        searchTerm: '',
        pendingSlot: null,
        theme: 'dark'
    };
    
    /*INITIALISES DATA*/
    FLOORS.forEach(f => { state.slots[f.id] = makeFloorSlots(f); });
    
    /*DOM HELPERS & STAT CALCULATION*/
    const $ = sel => document.querySelector(sel);
    const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

    function allSlotsFlat() {
        return state.floors.flatMap(f => state.slots[f.id]);
    }

    function computeStats(list) {
        const total = list.length;
        const available = list.filter(s => s.status === 'available').length;
        const occupied = list.filter(s => s.status === 'occupied').length;
        const reserved = total - available - occupied;
        const evFree = list.filter(s => s.ev && s.status === 'available').length;
        const rate = total ? Math.round(((occupied + reserved) / total) * 100) : 0;
        return { total, available, occupied, reserved, evFree, rate };
    }


    /*UI RENDERING ENGINES*/
    
    /*RENSER THE FLOOR SELECTION BUTTON*/
    function renderFloorTabs() {
        const wrap = $('#floorTabs');
        wrap.innerHTML = '';
        
        state.floors.forEach(f => {
            const stats = computeStats(state.slots[f.id]);
            const isActive = f.id === state.activeFloor;
            
            const tab = el('button', `floor-tab ${isActive ? 'active' : ''}`);
            tab.style.cssText = `
                background: ${isActive ? 'var(--primary)' : 'var(--bg-panel)'};
                color: ${isActive ? '#fff' : 'var(--text)'};
                border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border)'};
                border-radius: 8px; padding: 12px 18px; font-weight: bold;
                display: flex; flex-direction: column; align-items: center; transition: 0.2s;
            `;
            
            tab.innerHTML = `
                <span style="font-family:'Outfit'; font-size:18px;">${f.id}</span>
                <span style="font-size:10px; opacity:0.8;">${stats.available} Free</span>
            `;
            
            tab.addEventListener('click', () => { 
                state.activeFloor = f.id; 
                renderAll(); 
            });
            wrap.appendChild(tab);
        });
    }

    /*INJECT DYNAMIC CSS FOR THE STAGGER ANIMATION*/
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes popIn {
            0% { opacity: 0; transform: scale(0.8) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);

    /*RENDER THE ACTUAL PARTKING SLOT GRID*/
    function renderSlotGrid() {
        const floor = state.floors.find(f => f.id === state.activeFloor);
        $('#floorTitle').textContent = floor.label;
        const grid = $('#slotGrid');
        grid.innerHTML = '';

        const term = state.searchTerm.trim().toLowerCase();
        const list = state.slots[floor.id];
        let visibleCount = 0;

        list.forEach((slot) => {
            const matchesVehicle = state.vehicleFilter === 'all' || slot.type === state.vehicleFilter;
            const matchesSearch = !term || slot.id.toLowerCase().includes(term);
            
            if (!matchesVehicle || !matchesSearch) return;

            const card = el('div', `slot ${slot.status}`);
            card.dataset.id = slot.id;
            
            /*STAGGER ANIMATION BASED ON INDEX*/
            card.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
            card.style.animationDelay = `${visibleCount * 0.015}s`;
            card.style.opacity = '0';
            visibleCount++;

            card.innerHTML = `
                <div class="sensor_dot" data-dot="${slot.id}"></div>
                <div class="slot_id">${slot.id}</div>
                <div class="slot_type">${ICONS[slot.type]} ${TYPE_LABEL[slot.type]}</div>
                ${slot.ev ? '<div class="ev_badge" title="EV Charging Available">⚡</div>' : ''}
            `;

            if (slot.status === 'available') {
                card.addEventListener('click', () => openReserveModal(slot));
            }
            grid.appendChild(card);
        });

        if (visibleCount === 0) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: var(--text-muted);">No slots match your criteria.</div>`;
        }
    }


    /*UPDATE SIDEBAR ANALYTICS & DONUT CHART BAR*/
    function renderAnalytics() {
        const floorStats = computeStats(state.slots[state.activeFloor]);
        
        $('#statAvailable').textContent = floorStats.available;
        $('#statOccupied').textContent = floorStats.occupied;
        $('#statTotal').textContent = floorStats.total;
        $('#statEV').textContent = floorStats.evFree;

        //DONUT CHART MATH
        const circumference = 314.16; // 2 * pi * r (r=50)
        const offset = circumference * (1 - floorStats.rate / 100);
        $('#donutFill').style.strokeDashoffset = offset.toFixed(2);
        $('#donutPercentage').textContent = floorStats.rate + '%';
    }

    /*UPDATE THE MAIN TOP HERO BOARD*/
    function renderBoard() {
        const all = allSlotsFlat();
        const stats = computeStats(all);
        
        $('#slotAvailability').textContent = stats.available;
        $('#slotOccupied').textContent = stats.occupied + stats.reserved;
        $('#slotOccupancy').textContent = stats.rate + '%';
    }

    function renderAll() {
        renderFloorTabs();
        renderSlotGrid();
        renderAnalytics();
        renderBoard();
    }

    /*INTERACTIVITY (FILTERS, CLOCK, THEME)*/
    $('#searchInput').addEventListener('input', e => {
        state.searchTerm = e.target.value;
        renderSlotGrid();
    });

    $('#vehicleFilter').addEventListener('change', e => {
        state.vehicleFilter = e.target.value;
        renderSlotGrid();
    });

    // THEME SETTINGS
    const SUN_SVG = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    const MOON_SVG = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
    
    $('#themeToggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('theme', state.theme);
        $('#themeToggle').innerHTML = state.theme === 'dark' ? SUN_SVG : MOON_SVG;
    });

    /*TOTAL PARKING CHARGES ESTIMATOR*/
    function updateFee() {
        const vehicle = $('#vehicleFee').value;
        const hours = parseInt($('#feeHours').value, 10);
        
        $('#hoursLable').textContent = `${hours} hr${hours > 1 ? 's' : ''}`;
        
        let total = RATE[vehicle] * hours; 
        
        if (vehicle === 'ev') total += (10 * hours);
        if (vehicle === 'accessible') total = RATE.accessible * Math.max(0, hours - 1); 
        
        $('#feeAmount').textContent = total;

        let disclaimer = document.getElementById('premiumDisclaimer');
        if (!disclaimer) {
            disclaimer = el('div');
            disclaimer.id = 'premiumDisclaimer';
            disclaimer.style.cssText = 'font-size: 10px; color: var(--amber); margin-top: 8px; text-align: right;';
            disclaimer.textContent = '* VIP Basement (B1) adds ₹30/hr surcharge';
            document.querySelector('.total_fee').parentNode.appendChild(disclaimer);
        }
    }
    
    $('#vehicleFee').addEventListener('change', updateFee);
    $('#feeHours').addEventListener('input', updateFee);

    //LIVE DIGITAL CLOCK LOOP
    function tickClock() {
        const now = new Date();
        $('#clock').textContent = now.toLocaleTimeString('en-IN', { hour12: false });
    }
    setInterval(tickClock, 1000);
    tickClock();
    /*MODAL & NOTIFICATION SYSTEMS*/
    function openReserveModal(slot) {
        state.pendingSlot = slot;
        $('#modalSlotId').textContent = `Reserve ${slot.id}`;
        $('#modalType').textContent = TYPE_LABEL[slot.type];
        
        const floor = state.floors.find(f => f.id === slot.floor);
        $('#modalFloor').textContent = floor.label;
        
        /*PRICING FOR PREMIUM PARKING SECTION*/
        const isPremium = slot.floor === 'B1';
        let hourlyRate = RATE[slot.type];
        
        if (isPremium) hourlyRate += 30; 
        
        let rateString = `₹${hourlyRate}/hr`;
        if (isPremium) rateString += ' (Premium)';
        if (slot.type === 'ev') rateString += ' + ₹10/hr charging';
        if (slot.type === 'accessible') rateString = `₹${hourlyRate}/hr (1st hr free)`;
        
        $('#modalRate').textContent = rateString;
        $('#modalOverlay').classList.add('show');
    }

    function closeModal() {
        $('#modalOverlay').classList.remove('show');
        state.pendingSlot = null;
    }

    $('#cancelButton').addEventListener('click', closeModal);
    $('#modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
    
    $('#confirmButton').addEventListener('click', () => {
        const slot = state.pendingSlot;
        if (!slot) return;
        
        slot.status = 'reserved'; 
        closeModal();
        
        const card = document.querySelector(`.slot[data-id="${slot.id}"]`);
        if (card) {
            card.className = `slot ${slot.status}`;
            const clone = card.cloneNode(true);
            card.parentNode.replaceChild(clone, card);
        }

        renderFloorTabs();
        renderAnalytics();
        renderBoard();
        
        showToast(`Success! ${slot.id} reserved for 15 minutes.`, 'info');
    });

    function showToast(message, kind) {
        const t = el('div', `toast ${kind || ''}`);
        t.textContent = message;
        $('#toastContainer').appendChild(t);
        setTimeout(() => t.remove(), 3800);
    }




    /*LIVE DATA SIMULATOR (Stable Screen Update)*/
    function simulateLiveUpdate() {
        const changesCount = 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < changesCount; i++) {
            const floor = state.floors[Math.floor(Math.random() * state.floors.length)];
            const list = state.slots[floor.id];
            
            const flippable = list.filter(s => s.status !== 'reserved');
            if (!flippable.length) continue;
            
            const slot = flippable[Math.floor(Math.random() * flippable.length)];
            const wasAvailable = slot.status === 'available';
            
            slot.status = wasAvailable ? 'occupied' : 'available';

            if (slot.floor === state.activeFloor) {
                const card = document.querySelector(`.slot[data-id="${slot.id}"]`);
                if (card) {
                    card.className = `slot ${slot.status}`;
                    
                    const clone = card.cloneNode(true);
                    card.parentNode.replaceChild(clone, card);
                    
                    if (slot.status === 'available') {
                        clone.addEventListener('click', () => openReserveModal(slot));
                    }
                }
            }
            
            if (!wasAvailable && slot.floor === state.activeFloor) {
                showToast(`Sensor Update: ${slot.id} just became available`, null);
            }
        }
        
        renderFloorTabs();
        renderAnalytics();
        renderBoard();
    }
    
    //SIMULATOR INTERVAL
    setInterval(simulateLiveUpdate, 5000);

    
    
    /*INITIALIZE APPLICATION*/
    updateFee();
    renderAll();

})();


