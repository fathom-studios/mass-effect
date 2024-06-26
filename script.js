const UNITS = [
    {
        name: 'Destiny Ascension',
        airAttack: 80,
        groundAttack: 20,
        fuelCost: -22,
    },
    {
        name: 'Normandy',
        airAttack: 30,
        groundAttack: 30,
        fuelCost: -7,
    },
    {
        name: 'Migrant Fleet',
        airAttack: 15,
        groundAttack: 12,
        fuelCost: -11,
    },
    {
        name: 'Alliance Fleet',
        airAttack: 18,
        groundAttack: 12,
        fuelCost: -9,
    },
    {
        name: 'Turian Battleship',
        airAttack: 14,
        groundAttack: 7,
        fuelCost: -7,
    },
    {
        name: 'Wing Fighters',
        airAttack: 8,
        groundAttack: 8,
        fuelCost: -3,
    },
    {
        name: 'Commander Shepard',
        airAttack: 4,
        groundAttack: 30,
        fuelCost: 0,
    },
    {
        name: 'N7 Soldiers',
        airAttack: 12,
        groundAttack: 22,
        fuelCost: -8,
    },
    {
        name: 'Aralakh Company',
        airAttack: 0,
        groundAttack: 25,
        fuelCost: -5,
    },
    {
        name: 'Biotics',
        airAttack: 0,
        groundAttack: 16,
        fuelCost: -3,
    },
    {
        name: 'AA Guns',
        airAttack: 20,
        groundAttack: 0,
        fuelCost: -8,
    },
    {
        name: 'Blood Pack',
        airAttack: 5,
        groundAttack: 5,
        fuelCost: -5,
    },
    {
        name: 'Blue Suns',
        airAttack: 5,
        groundAttack: 5,
        fuelCost: -5,
    },
    {
        name: 'Eclipse',
        airAttack: 5,
        groundAttack: 5,
        fuelCost: -5,
    },
    {
        name: 'Archangel',
        airAttack: 5,
        groundAttack: 18,
        fuelCost: -1,
    }
];

const REAPER_MAX = 32;
const ATTACK_SCALE_MIN = 0.85;
const ATTACK_SCALE_MAX = 1.1;
const ATTACK_SCALE_ATTENUATION = 0.05;
const ATTACK_SCALE_KEY = 'ATTACK_SCALE';
const ATTACK_SCALE_CURRENT = localStorage.getItem(ATTACK_SCALE_KEY) ? parseFloat(localStorage.getItem(ATTACK_SCALE_KEY)) : ATTACK_SCALE_MIN;
const DELAY = 800;

let deck; //[]
let hand; //[]
let grabbedIdx; //number | null
let discard; //{}[]

let airEmbattled; //boolean
let groundEmbattled; //boolean
let airDamage; //number
let groundDamage; //number
let fuel; //number

let scoreData; //{}

let introTimers = []; //number[]

function newGame() {
    deck = [];
    hand = [];
    grabbedIdx = null;
    discard = UNITS.slice();
    airEmbattled = true;

    groundEmbattled = true;
    airDamage = 20;
    groundDamage = 30;
    fuel = 100;

    setStatus();
    shuffle();
    drawCard(0);
    drawCard(1);
    update();

    scoreData = {};

    

    for (const timer of introTimers) {
        window.clearTimeout(timer);
    }
    introTimers = [];

    //Only show startup message when pages loads if they haven't jumped into playing yet
    let timer1 = window.setTimeout(() => {
        introTimers.splice(introTimers.indexOf(timer1), 1);
        if (discard.length == 0) {
            setStatus('The Reapers are approaching Earth!');
        }
    }, 2000);
    introTimers.push(timer1);

    let timer2 = window.setTimeout(() => {
        introTimers.splice(introTimers.indexOf(timer2), 1);
        if (discard.length == 0) {
            setStatus('You get to make the first attack...');
        }
    }, 5000);
    introTimers.push(timer2);
}

function setStatus(msg) {
    if (msg) {
        $('._status').text(msg).addClass('animate-pop');
        window.setTimeout(() => {
            $('._status').removeClass('animate-pop');
        }, 500)
    } else {
        $('._status').text('');
    }
}

function shuffle() {
    while (discard.length) {
        deck.push(discard.splice(Math.floor(Math.random() * discard.length), 1)[0]);
    }
}

function drawCard(slotIdx) {
    const newCard = deck.splice(0, 1)[0];
    hand.splice(slotIdx, 0, newCard);
    
    const slots = $('._slot');
    slots.eq(slotIdx).find('._card-bg').css('backgroundImage', `url('images/${newCard.name}.jpg')`);
    slots.eq(slotIdx).find('._name').text(newCard.name);
    slots.eq(slotIdx).find('._air-attack').text(newCard.airAttack);
    slots.eq(slotIdx).find('._ground-attack').text(newCard.groundAttack);
    slots.eq(slotIdx).find('._fuel-cost').text(newCard.fuelCost);

    if (deck.length == 0) {
        shuffle();
    }
}

function playCard(target) {
    $('._map').addClass('animate-shake');
    $('._card-bg').eq(grabbedIdx).css('display', 'none');
    $('._card-bg').draggable('disable');
    setStatus();

    const card = hand[grabbedIdx];

    if (target == 'air' && !airEmbattled || card.airAttack == 0) {
        target = 'ground';
    } else if (target == 'ground' && !groundEmbattled || card.groundAttack == 0) {
        target = 'air';
    }

    if (target == 'air') {
        airDamage -= card.airAttack;
    } else {
        groundDamage -= card.groundAttack;
    }
    fuel += card.fuelCost;

    window.setTimeout(() => {
        hand.splice(grabbedIdx, 1);
        discard.push(card);
        drawCard(grabbedIdx);
        $('._card-bg').eq(grabbedIdx).css('display', 'block');
        $('._map').removeClass('animate-shake');
        $('._card-bg').draggable('enable');
    }, DELAY);

    if (update()) {
        reaperAttack();
    }
}

function reaperAttack() {
    window.setTimeout(() => {
        if (airEmbattled && (!groundEmbattled || Math.random() < 0.5)) {
            airDamage += Math.max(1, Math.min(REAPER_MAX, Math.round(Math.random() * REAPER_MAX * ATTACK_SCALE_CURRENT)));
            setStatus('The Reapers have advanced in the air!');
        } else {
            groundDamage += Math.max(1, Math.min(REAPER_MAX, Math.round(Math.random() * REAPER_MAX * ATTACK_SCALE_CURRENT)));
            setStatus('The Reapers have advanced on the ground!');
        }
        update();
    }, DELAY);
}

function update() {
    let canContinue = true;

    if (airDamage >= 100 || groundDamage >= 100) {
        $('._lost').removeClass('hidden');
        localStorage.setItem(ATTACK_SCALE_KEY, `${Math.max(ATTACK_SCALE_CURRENT - ATTACK_SCALE_ATTENUATION, ATTACK_SCALE_MIN)}`);
        canContinue = false;
    } else if (fuel <= 0 && (airDamage > 0 || groundDamage > 0)) {
        $('._lost-fuel').removeClass('hidden');
        localStorage.setItem(ATTACK_SCALE_KEY, `${Math.max(ATTACK_SCALE_CURRENT - ATTACK_SCALE_ATTENUATION, ATTACK_SCALE_MIN)}`);
        canContinue = false;
    } else if (airDamage <= 0 && groundDamage <= 0) {
        $('._map').removeClass('border-rose-500/30').addClass('border-green-500/30');
        $('._won').removeClass('hidden');
        localStorage.setItem(ATTACK_SCALE_KEY, `${Math.min(ATTACK_SCALE_CURRENT + ATTACK_SCALE_ATTENUATION, ATTACK_SCALE_MAX)}`);
        canContinue = false
    } else {
        $('._won').addClass('hidden');
        $('._lost').addClass('hidden');
        $('._lost-fuel').addClass('hidden');
        $('._map').addClass('border-rose-500/30').removeClass('border-green-500/30');
    }

    airDamage = Math.max(0, Math.min(100, airDamage));
    $('._air ._bg-damage').css('width', `${airDamage / 100 * 106}%`); //Scale slightly above since the front of the damage indicator has a fade-in
    $('._air ._damage-text').text(airDamage);
    if (airDamage == 0) {
        airEmbattled = false;
        $('._air ._text').removeClass('text-rose-500').addClass('text-green-500');
        $('._air ._bg-radar').addClass('_safe');
    } else {
        $('._air ._text').addClass('text-rose-500').removeClass('text-green-500');
        $('._air ._bg-radar').removeClass('_safe');
    }
    
    groundDamage = Math.max(0, Math.min(100, groundDamage));
    $('._ground ._bg-damage').css('width', `${groundDamage / 100 * 106}%`); //Scale slightly above since the front of the damage indicator has a fade-in
    $('._ground ._damage-text').text(groundDamage);
    if (groundDamage == 0) {
        groundEmbattled = false;
        $('._ground ._text').removeClass('text-rose-500').addClass('text-green-500');
        $('._ground ._bg-radar').addClass('_safe');
    } else {
        $('._ground ._text').addClass('text-rose-500').removeClass('text-green-500');
        $('._ground ._bg-radar').removeClass('_safe');
    }

    fuel = Math.max(0, Math.min(100, fuel));
    $('._fuel').text(fuel);

    return canContinue;
}

$('._card-bg').each((idx, c) => {
    $(c).draggable({
        revert: true,
        revertDuration: 250,
        classes: {
            'ui-draggable-dragging': 'z-10',
        },
        start: () => {
            grabbedIdx = idx;
        },
    });
});

$('._air').droppable({
    over: () => {
        $('._air ._text').removeClass('md:opacity-25').addClass('opacity-75');
    },
    out: () => {
        $('._air ._text').addClass('md:opacity-25').removeClass('opacity-75');
    },
    drop: playCard.bind(null, 'air'),
});
$('._ground').droppable({
    over: () => {
        $('._ground ._text').removeClass('md:opacity-25').addClass('opacity-75');
    },
    out: () => {
        $('._ground ._text').addClass('md:opacity-25').removeClass('opacity-75');
    },
    drop: playCard.bind(null, 'ground'),
});

$('._restart').on('click', () => {
    newGame();
});

newGame();