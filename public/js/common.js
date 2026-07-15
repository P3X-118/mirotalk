'use strict';

// ####################################################################
// NEW CALL
// ####################################################################

// Fallback room-name dictionaries. The active brand preset ships its own
// dictionaries via GET /brand (config.js brand.roomNames): brand.js applies
// them through applyBrandRoomNames() below, and repeat visits pick them up
// synchronously from the sessionStorage brand cache. These short neutral
// lists only surface if /brand is unavailable.
let roomNameDict = {
    adjectives: ['quick', 'bright', 'hidden', 'golden', 'silent', 'wild', 'cosmic', 'velvet'],
    nouns: ['room', 'call', 'lounge', 'summit', 'harbor', 'studio', 'parlor', 'meeting'],
};

try {
    const cachedBrand = JSON.parse(window.sessionStorage.getItem('brandDataP2P') || 'null');
    if (cachedBrand?.roomNames?.adjectives?.length && cachedBrand?.roomNames?.nouns?.length) {
        roomNameDict = cachedBrand.roomNames;
    }
} catch (err) {
    console.warn('Brand room-name cache unavailable', err.message);
}

let roomNameUserEdited = false;

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

/**
 * Compose a random room-name suggestion from the active dictionary
 * @returns {string} e.g. 12345AncientAbydos
 */
function generateRoomSuggestion() {
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const capitalize = (word) => word.charAt(0).toUpperCase() + word.substring(1);
    return getRandomNumber(5) + capitalize(pick(roomNameDict.adjectives)) + capitalize(pick(roomNameDict.nouns));
}

/**
 * Swap in the brand's room-name dictionaries (called by brand.js once
 * /brand has been fetched) and refresh the suggestion, unless the user
 * already typed a room name of their own.
 * @param {object} dict {adjectives: [...], nouns: [...]}
 */
function applyBrandRoomNames(dict) {
    if (!dict?.adjectives?.length || !dict?.nouns?.length) return;
    roomNameDict = dict;
    if (roomName && !roomNameUserEdited) {
        txt = generateRoomSuggestion();
        shuffleText(roomName, txt);
    }
}

// Shuffle Text Effect

let txt = generateRoomSuggestion();

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

    roomName.addEventListener('input', () => {
        roomNameUserEdited = true;
    });

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
// OPTIONAL-OIDC SIGN-IN STATUS (landing header)
// #########################################################

// Populate #authStatus from /profile: signed-in users see their name + a
// sign-out link (and get auto-joined into rooms by their name); anonymous
// users see a sign-in link only when OIDC is enabled on this instance.
(function renderAuthStatus() {
    const el = document.getElementById('authStatus');
    if (!el) return;
    fetch('/profile', { headers: { Accept: 'application/json' } })
        .then((r) => r.json())
        .then((profile) => {
            if (profile && profile.name) {
                const name = filterXSS(profile.name);
                el.innerHTML =
                    '<span class="auth-user" title="Signed in — rooms open with this name">&#9673; ' +
                    name +
                    '</span> <a class="auth-link" href="/logout">sign out</a>';
            } else if (profile && profile.oidcEnabled) {
                el.innerHTML = '<a class="auth-link" href="/auth/login">[ sign in ]</a>';
            }
        })
        .catch((err) => console.warn('auth status unavailable', err.message));
})();

// #########################################################
// LIVE ROOM LIST (landing) — open + locked(knock) rooms; private are hidden
// #########################################################

(function renderRoomList() {
    const section = document.getElementById('roomsSection');
    const list = document.getElementById('roomList');
    if (!section || !list) return;

    function render(rooms) {
        if (!rooms.length) {
            list.innerHTML = '<div class="room-list-empty">No open rooms right now — start one above.</div>';
            return;
        }
        list.innerHTML = '';
        rooms.forEach((room) => {
            const id = filterXSS(String(room.id));
            const row = document.createElement('a');
            row.className = 'room-row' + (room.locked ? ' room-row-locked' : '');
            row.href = '/join/' + encodeURIComponent(id);
            const state = room.locked
                ? '<span class="room-state room-state-locked">&#128274; KNOCK</span>'
                : '<span class="room-state room-state-open">&#9673; OPEN</span>';
            row.innerHTML =
                '<span class="room-name">' +
                id +
                '</span>' +
                '<span class="room-meta">&#128100; ' +
                room.peers +
                ' ' +
                state +
                '</span>';
            list.appendChild(row);
        });
    }

    function poll() {
        fetch('/roomList', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((data) => {
                if (!data.enabled) {
                    section.style.display = 'none';
                    return;
                }
                render(data.rooms || []);
            })
            .catch((err) => console.warn('room list unavailable', err.message));
    }
    poll();
    setInterval(poll, 5000);
})();

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
