'use strict';

// ####################################################################
// NEW CALL
// ####################################################################

// Stargate-themed room name dictionary
const adjectives = [
    'ancient',
    'ascended',
    'lost',
    'forbidden',
    'hidden',
    'sacred',
    'frozen',
    'buried',
    'crystal',
    'naquadah',
    'subspace',
    'galactic',
    'stellar',
    'cosmic',
    'astral',
    'shielded',
    'cloaked',
    'gated',
    'quantum',
    'temporal',
    'orbital',
    'arctic',
    'desert',
    'oceanic',
    'iron',
    'golden',
    'silver',
    'dark',
    'bright',
    'wild',
    'rogue',
    'free',
    'noble',
    'fallen',
    'risen',
    'eternal',
    'distant',
    'unknown',
    'final',
    'first',
    'rapid',
    'silent',
    'hostile',
    'sealed',
    'dialed',
    'active',
    'deep',
    'outer',
    'inner',
    'red',
];

const nouns = [
    'abydos',
    'chulak',
    'dakara',
    'atlantis',
    'tollana',
    'cimmeria',
    'langara',
    'hebridan',
    'vorash',
    'netu',
    'othala',
    'camelot',
    'praclarush',
    'antarctica',
    'cheyenne',
    'stargate',
    'chevron',
    'dhd',
    'naquadah',
    'trinium',
    'zatarc',
    'goauld',
    'jaffa',
    'asgard',
    'tollan',
    'nox',
    'ancient',
    'ori',
    'wraith',
    'replicator',
    'tauri',
    'tokra',
    'prior',
    'unas',
    'sodan',
    'furling',
    'daedalus',
    'prometheus',
    'odyssey',
    'hammond',
    'jumper',
    'teltac',
    'alkesh',
    'hatak',
    'glider',
    'sangraal',
    'zpm',
    'kawoosh',
    'wormhole',
    'iris',
    'gateroom',
    'sg1',
    'horus',
    'anubis',
    'baal',
    'apophis',
    'ra',
    'sokar',
    'thor',
    'oma',
];

let adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
let noun = nouns[Math.floor(Math.random() * nouns.length)];
let num = getRandomNumber(5);
noun = noun.charAt(0).toUpperCase() + noun.substring(1);
adjective = adjective.charAt(0).toUpperCase() + adjective.substring(1);

/**
 * Get random number
 * @param {integer} length of string
 * @returns {string} random number
 */
function getRandomNumber(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Shuffle Text Effect

let txt = num + adjective + noun;

/**
 * Shuffle text effect for input fields
 * @param {HTMLInputElement} input
 * @param {string} finalValue
 * @param {number} duration
 */
function shuffleText(input, finalValue, duration = 600) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const steps = 10;
    const interval = duration / steps;
    let step = 0;

    input.classList.add('shuffle-active');

    const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        let display = '';
        for (let i = 0; i < finalValue.length; i++) {
            if (i < finalValue.length * progress) {
                display += finalValue[i];
            } else {
                display += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        input.value = display;

        if (step >= steps) {
            clearInterval(timer);
            input.value = finalValue;
            setTimeout(() => input.classList.remove('shuffle-active'), 300);
        }
    }, interval);
}

const roomName = document.getElementById('roomName');
if (roomName) {
    roomName.value = '';
    shuffleText(roomName, txt);

    roomName.onkeyup = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            joinRoom();
        }
    };
}

// ####################################################################
// LANDING | NEW CALL
// ####################################################################

const lastRoomContainer = document.getElementById('lastRoomContainer');
const lastRoom = document.getElementById('lastRoom');
const lastRoomName = window.localStorage.lastRoom ? window.localStorage.lastRoom : '';

if (lastRoomContainer && lastRoom && lastRoomName) {
    lastRoom.setAttribute('href', '/join/' + lastRoomName);
    lastRoom.innerText = lastRoomName;
}

const genRoomButton = document.getElementById('genRoomButton');
const joinRoomButton = document.getElementById('joinRoomButton');
const customizeRoomButton = document.getElementById('customizeRoomButton');
const adultCnt = document.getElementById('adultCnt');

if (genRoomButton) {
    genRoomButton.onclick = (e) => {
        genRoomButton.classList.remove('spin');
        void genRoomButton.offsetWidth;
        genRoomButton.classList.add('spin');
        genRoom();
    };
    genRoomButton.addEventListener('animationend', () => {
        genRoomButton.classList.remove('spin');
    });
}

if (joinRoomButton) {
    joinRoomButton.onclick = (e) => {
        joinRoom();
    };
}

if (customizeRoomButton) {
    customizeRoomButton.onclick = (e) => {
        window.location.href = '/customizeRoom';
    };
}

if (adultCnt) {
    adultCnt.onclick = (e) => {
        adultContent();
    };
}

function genRoom() {
    const input = document.getElementById('roomName');
    shuffleText(input, getUUID4());
}

function getUUID4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}

function joinRoom() {
    const roomName = filterXSS(document.getElementById('roomName').value).trim().replace(/\s+/g, '-');
    const roomValid = isValidRoomName(roomName);

    if (!roomName) {
        popup('warning', 'Room name empty!\nPlease pick a room name.');
        return;
    }
    if (!roomValid) {
        popup('warning', 'Invalid Room name!\nPath traversal pattern detected!');
        return;
    }

    window.location.href = '/join/' + roomName;
    window.localStorage.lastRoom = roomName;
}

function isValidRoomName(input) {
    if (typeof input !== 'string') {
        return false;
    }
    const pathTraversalPattern = /(\.\.(\/|\\))+/;
    return !pathTraversalPattern.test(input);
}

function adultContent() {
    if (
        confirm(
            '18+ WARNING! ADULTS ONLY!\n\nExplicit material for viewing by adults 18 years of age or older. You must be at least 18 years old to access to this site!\n\nProceeding you are agree and confirm to have 18+ year.'
        )
    ) {
        window.open('https://luvlounge.ca', '_blank');
    }
}

// #########################################################
// PERMISSIONS
// #########################################################

const qs = new URLSearchParams(window.location.search);
const room_id = filterXSS(qs.get('room_id'));
const message = filterXSS(qs.get('message'));
const showMessage = document.getElementById('message');
console.log('Allow Camera or Audio', {
    room_id: room_id,
    message: message,
});
if (showMessage) showMessage.innerHTML = message;
