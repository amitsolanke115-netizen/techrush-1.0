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
