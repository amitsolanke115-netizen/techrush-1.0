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

