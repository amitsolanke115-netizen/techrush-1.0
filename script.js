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

