const UNITS = [
    {
        name: 'Destiny Ascension',
        airAttack: 80,
        groundAttack: 20,
        fuelCost: -2,
    },
    {
        name: 'Normandy',
        airAttack: 30,
        groundAttack: 30,
        fuelCost: -4,
    },
    {
        name: 'Migrant Fleet',
        airAttack: 15,
        groundAttack: 5,
        fuelCost: -1,
    },
    {
        name: 'Alliance Fleet',
        airAttack: 20,
        groundAttack: 10,
        fuelCost: -1,
    },
    {
        name: 'Turian Battleship',
        airAttack: 10,
        groundAttack: 2,
        fuelCost: -8,
    },
    {
        name: 'Wing Fighters',
        airAttack: 8,
        groundAttack: 6,
        fuelCost: -3,
    },
    {
        name: 'Commander Shepard',
        airAttack: 4,
        groundAttack: 20,
        fuelCost: -1,
    },
    {
        name: 'N7 Soldiers',
        airAttack: 12,
        groundAttack: 18,
        fuelCost: -8,
    },
    {
        name: 'Aralakh Company',
        airAttack: 0,
        groundAttack: 25,
        fuelCost: -1,
    },
    {
        name: 'Biotics',
        airAttack: 0,
        groundAttack: 6,
        fuelCost: -4,
    },
    {
        name: 'AA Guns',
        airAttack: 20,
        groundAttack: 0,
        fuelCost: -2,
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
        groundAttack: 12,
        fuelCost: -2,
    }
];

const REAPER_MAX = 26;

let deck = [];
let hand = [];
let grabbedIdx = null;
let discard = UNITS;

let airEmbattled = true;
let groundEmbattled = true;
let airDamage = 20;
let groundDamage = 30;   
let fuel = 100;

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
    $('._status').text('').removeClass('animate-fastFade');

    const card = hand[grabbedIdx];

    if (target == 'air' && !airEmbattled) {
        target = 'ground';
    } else if (target == 'ground' && !groundEmbattled) {
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
    }, 1000);

    if (update()) {
        reaperAttack();
    }
}

function reaperAttack() {
    window.setTimeout(() => {
        if (airEmbattled && (!groundEmbattled || Math.random() < 0.5)) {
            airDamage += Math.max(1, Math.round(Math.random() * REAPER_MAX));
            $('._status').text('The Reapers have advanced in the air!').addClass('animate-fastFade');
        } else {
            groundDamage += Math.max(1, Math.round(Math.random() * REAPER_MAX));
            $('._status').text('The Reapers have advanced on the ground!').addClass('animate-fastFade');
        }
        update();
    }, 1000);
}

function update() {
    airDamage = Math.max(0, Math.min(100, airDamage));
    if (airDamage == 0) {
        airEmbattled = false;
    }

    groundDamage = Math.max(0, Math.min(100, groundDamage));
    if (groundDamage == 0) {
        groundEmbattled = false;
    }

    fuel = Math.max(0, Math.min(100, fuel));

    $('._air ._bg-damage').css('width', `${airDamage}%`);
    $('._air ._damage-text').text(airDamage);
    if (airDamage == 0) {
        $('._air ._text').removeClass('text-rose-500').addClass('text-green-500');
        $('._air ._bg-radar').addClass('_safe');
    }
    
    $('._ground ._bg-damage').css('width', `${groundDamage}%`);
    $('._ground ._damage-text').text(groundDamage);
    if (groundDamage == 0) {
        $('._ground ._text').removeClass('text-rose-500').addClass('text-green-500');
        $('._ground ._bg-radar').addClass('_safe');
    }

    $('._fuel').text(fuel);

    if (airDamage == 0 && groundDamage == 0) {
        $('._map').removeClass('border-rose-500/30').addClass('border-green-500/30');
        $('._won').removeClass('hidden');
        return false;
    } else if (airDamage == 100 || groundDamage == 100 || fuel == 0) {
        $('._lost').removeClass('hidden');
        return false;
    }

    return true;
}

$('._card-bg').each((idx, c) => {
    $(c).draggable({
        revert: true,
        revertDuration: 250,
        classes: {
            'ui-draggable-dragging': 'shadow-xl z-10',
        },
        start: () => {
            grabbedIdx = idx;
        },
    });
});

$('._bg-air').droppable({
    drop: playCard.bind(null, 'air'),
});
$('._bg-ground').droppable({
    drop: playCard.bind(null, 'ground'),
});

$('._restart').on('click', () => {
    location.reload();
});

shuffle();
drawCard(0);
drawCard(1);
update();

window.setTimeout(() => {
    $('._status').text('You get to make the first attack...');
}, 2000);