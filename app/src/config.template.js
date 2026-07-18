'use strict';

/**
 * ==============================================
 * MiroTalk P2P v.1.8.31 - Configuration File
 * ==============================================
 *
 * This file is the central configuration source.
 * All environment variables are read here so the
 * rest of the codebase imports config values
 * instead of reading process.env directly.
 *
 * Setup:
 *   cp app/src/config.template.js app/src/config.js
 *   Then edit config.js to match your environment.
 *
 * Docker/container environments inject values via
 * environment variables which are read at startup.
 *
 * Branding and customizations require a license:
 * https://codecanyon.net/item/mirotalk-p2p-webrtc-realtime-video-conferences/38376661
 */

require('dotenv').config();

const packageJson = require('../../package.json');

// Helper: parse env string to boolean
function getEnvBoolean(key, force_true_if_undefined = false) {
    if (key == undefined && force_true_if_undefined) return true;
    return key == 'true' ? true : false;
}

// Helper: safely parse JSON env vars with a fallback
function parseJsonEnv(envValue, fallback) {
    if (!envValue) return fallback;
    try {
        return JSON.parse(envValue);
    } catch (e) {
        return fallback;
    }
}

const port = process.env.PORT || 3000;

// ==========================================
// Brand presets
// ==========================================
// BRAND_PRESET selects which baked-in UI brand this instance serves:
//   sgc    - SGC Meet (meet.sgc.ai): gold/navy palette, Stargate room names (default)
//   smooje - Libations (libations.cooey.club): cooey purple palette, beverage room names
//   ccisd  - CCISD Meet (meet.ccisd.me): Clear Creek ISD blue/gold palette, district/space room names
// Each preset carries the app/og/site/about text blocks plus:
//   theme     - palette key; injected as html[data-brand] and themed in public/css/brand.css
//   roomNames - adjective/noun dictionaries for the client room-name generator,
//               delivered to the browser via GET /brand (see public/js/common.js)
// Dictionary tokens must stay lowercase alphanumeric so generated names are URL-safe.
const brandPresets = {
    sgc: {
        theme: 'sgc',
        roomThemes: {}, // in-call room keeps MiroTalk's default themes
        roomNames: {
            adjectives: (
                'ancient ascended lost forbidden hidden sacred frozen buried crystal naquadah subspace ' +
                'galactic stellar cosmic astral shielded cloaked gated quantum temporal orbital arctic desert ' +
                'oceanic iron golden silver dark bright wild rogue free noble fallen risen eternal distant ' +
                'unknown final first rapid silent hostile sealed dialed active deep outer inner red'
            ).split(' '),
            nouns: (
                'abydos chulak dakara atlantis tollana cimmeria langara hebridan vorash netu othala camelot ' +
                'praclarush antarctica cheyenne stargate chevron dhd naquadah trinium zatarc goauld jaffa ' +
                'asgard tollan nox ancient ori wraith replicator tauri tokra prior unas sodan furling daedalus ' +
                'prometheus odyssey hammond jumper teltac alkesh hatak glider sangraal zpm kawoosh wormhole ' +
                'iris gateroom sg1 horus anubis baal apophis ra sokar thor oma'
            ).split(' '),
        },
        app: {
            language: 'en', // https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
            name: 'SGC Meet',
            title: '<h1>SGC Meet</h1>Secure browser-based video meetings.',
            description: 'Pick a room name and start a secure video meeting. No download or login required.',
            joinDescription: 'Pick a room name.',
            joinButtonLabel: 'JOIN ROOM',
            customizeRoomButtonLabel: 'CUSTOMIZE ROOM',
            joinLastLabel: 'Your recent room:',
        },
        og: {
            type: 'app-webrtc',
            siteName: 'SGC Meet',
            title: 'Click the link to join the meeting.',
            description: 'SGC Meet provides secure, real-time HD video meetings right in your browser.',
            image: 'https://meet.sgc.ai/images/sgc-logo.jpg',
            url: 'https://meet.sgc.ai',
        },
        site: {
            brandLogo: '../images/sgc-logo.jpg',
            shortcutIcon: '../images/sgc-favicon.jpg',
            appleTouchIcon: '../images/sgc-logo.jpg',
            landingTitle: 'SGC Meet — Secure Video Meetings.',
            newCallTitle: 'SGC Meet — Secure Video Meetings.',
            newCallRoomTitle: 'Pick name. <br />Share URL. <br />Start conference.',
            newCallRoomDescription:
                "Each room has its disposable URL. Just pick a room name and share your custom URL. It's that easy.",
            loginTitle: 'SGC Meet - Host Protected login required.',
            loginHeading: 'Welcome back',
            loginDescription: 'Enter your credentials to continue.',
            loginButtonLabel: 'Login',
            joinRoomTitle: 'Pick name.<br />Share URL.<br />Start conference.',
            joinRoomButtonLabel: 'JOIN ROOM',
            clientTitle: 'SGC Meet — WebRTC Video Meeting, Chat & Screen Sharing.',
            privacyPolicyTitle: 'SGC Meet - privacy and policy.',
            stunTurnTitle: 'Test Stun/Turn Servers.',
            notFoundTitle: 'SGC Meet - 404 Page not found.',
            waitingRoomTitle: 'SGC Meet - Waiting for host to start the meeting',
            waitingRoomHeading: 'Waiting for host...',
            waitingRoomDescription:
                "The meeting hasn't started yet.<br />You'll join automatically when the host opens the room.",
            waitingRoomStatus: 'Checking room status...',
            waitingRoomReady: 'Room is ready! Joining...',
            waitingRoomWaiting: 'Waiting for host to start the meeting...',
            waitingRoomHostLink: 'Are you the host?',
            waitingRoomLoginLink: 'Login here',
            waitingRoomElapsedJust: 'Just started waiting',
            waitingRoomElapsedMinutes: 'Waiting for {minutes}',
            waitingRoomSongUrl: '../sounds/waiting-music.mp3',
        },
        about: {
            imageUrl: '../images/sgc-logo.jpg',
            title: `SGC Meet v${packageJson.version}`,
            html: `
                <br />
                <span>Secure browser-based video meetings.</span>
                <br /><br />
                <hr />
                <span>&copy; 2026 SGC, all rights reserved</span>
                <hr />
            `,
        },
    },
    smooje: {
        theme: 'smooje',
        // Cooey Terminal in-call room theme — overrides the default `dark`
        // theme (index 0) so libations rooms are red-on-black by default.
        roomThemes: {
            dark: {
                '--body-bg': 'radial-gradient(#1a0406, #0e1013)',
                '--msger-bg': 'radial-gradient(#12080a, #0b0b0e)',
                '--msger-private-bg': 'radial-gradient(#1a0406, #0b0b0e)',
                '--wb-bg': 'radial-gradient(#12080a, #0b0b0e)',
                '--elem-border-color': '1px solid rgba(255, 33, 41, 0.22)',
                '--navbar-bg': 'rgba(5, 5, 7, 0.9)',
                '--select-bg': '#15080a',
                '--tab-btn-active': '#3a0d10',
                '--box-shadow': '0px 4px 14px 0px rgba(0, 0, 0, 0.6)',
                '--left-msg-bg': '#1a1013',
                '--right-msg-bg': '#3a0d10',
                '--private-msg-bg': '#2a0a0d',
                '--btn-bar-bg-color': '#ff2129',
                '--btn-bar-color': '#0e1013',
                '--btns-bg-color': 'rgba(5, 5, 7, 0.8)',
                '--dd-color': '#ff4650',
            },
        },
        // Room names are Smooj-flavor themed: a fruit/descriptor + a smoothie
        // form, e.g. MangoColada, SpikedPinacolada, CoconutBlast. Smooj's real
        // flavors (Piña Colada, Strawberry Banana) and their fruits lead the
        // lists; the rest is the tropical-smoothie flavor family. Tokens stay
        // lowercase alphanumeric so generated names are URL-safe.
        roomNames: {
            adjectives: (
                'pinacolada strawberrybanana pineapple coconut strawberry banana mango peach watermelon guava ' +
                'passionfruit papaya lime kiwi cherry raspberry blueberry blackberry pomegranate dragonfruit ' +
                'lychee apricot nectarine spiked frozen creamy tropical frosty boozy chilled ripe juicy tangy ' +
                'sunny island'
            ).split(' '),
            nouns: (
                'smooj smoothie colada pinacolada strawberrybanana daiquiri slushie sorbet blend nectar freezie ' +
                'swirl blast fizz cooler punch splash frappe slush spritz twist crush wave breeze'
            ).split(' '),
        },
        app: {
            language: 'en',
            name: 'Libations',
            title: '<h1>Libations</h1>Drinks with friends, face to face.',
            description: 'Pick a room name, pour something nice, and settle in. No download required.',
            joinDescription: 'Name your room.',
            joinButtonLabel: 'JOIN ROOM',
            customizeRoomButtonLabel: 'CUSTOMIZE ROOM',
            joinLastLabel: 'Your usual:',
        },
        og: {
            type: 'app-webrtc',
            siteName: 'Libations',
            title: "You're invited — click to join the room.",
            description: 'Libations — cooey.club video hangouts. Real-time, browser-based, no download.',
            image: 'https://libations.cooey.club/images/smooje-logo.svg',
            url: 'https://libations.cooey.club',
        },
        site: {
            brandLogo: '../images/smooje-logo.svg',
            shortcutIcon: '../images/smooje-logo.svg',
            appleTouchIcon: '../images/smooje-logo.svg',
            landingTitle: 'Libations — cooey.club video hangouts.',
            newCallTitle: 'Libations — cooey.club video hangouts.',
            newCallRoomTitle: 'Pick a name. <br />Share the link. <br />Raise a glass.',
            newCallRoomDescription: "Every room has its own disposable link. Pick a name and share it — that's it.",
            loginTitle: 'Libations - Host protected login required.',
            loginHeading: 'Welcome back',
            loginDescription: 'Enter your credentials to continue.',
            loginButtonLabel: 'Login',
            joinRoomTitle: 'Pick a name.<br />Share the link.<br />Raise a glass.',
            joinRoomButtonLabel: 'JOIN ROOM',
            clientTitle: 'Libations — WebRTC Video Meeting, Chat & Screen Sharing.',
            privacyPolicyTitle: 'Libations - privacy and policy.',
            stunTurnTitle: 'Test Stun/Turn Servers.',
            notFoundTitle: 'Libations - 404 Page not found.',
            waitingRoomTitle: 'Libations - Waiting for the host to open the room',
            waitingRoomHeading: 'Waiting for your host...',
            waitingRoomDescription: "The room isn't open yet.<br />You'll join automatically when your host arrives.",
            waitingRoomStatus: 'Checking room status...',
            waitingRoomReady: 'Room is open! Joining...',
            waitingRoomWaiting: 'Waiting for your host to open the room...',
            waitingRoomHostLink: 'Are you the host?',
            waitingRoomLoginLink: 'Login here',
            waitingRoomElapsedJust: 'Just started waiting',
            waitingRoomElapsedMinutes: 'Waiting for {minutes}',
            waitingRoomSongUrl: '../sounds/waiting-music.mp3',
        },
        about: {
            imageUrl: '../images/smooje-logo.svg',
            title: `Libations v${packageJson.version}`,
            html: `
                <br />
                <span>Drinks with friends, face to face — a cooey.club hangout.</span>
                <br /><br />
                <hr />
                <span>&copy; 2026 cooey.club, all rights reserved</span>
                <hr />
            `,
        },
    },
    ccisd: {
        theme: 'ccisd',
        // Room names are Clear Creek ISD flavored: district campuses/mascots
        // plus the Clear Lake / Johnson Space Center heritage the district
        // serves, e.g. FalconLaunch, StellarClassroom, ClearCreekOrbit.
        // Tokens stay lowercase alphanumeric so generated names are URL-safe.
        roomNames: {
            adjectives: (
                'clear creek falcon wildcat cougar charger mustang stellar lunar solar orbital cosmic astro ' +
                'gemini apollo mercury artemis coastal bayside lakeside gulf golden navy bright soaring rising ' +
                'varsity scholar honor learning junior senior league webster seabrook kemah friendswood'
            ).split(' '),
            nouns: (
                'launch orbit mission rocket capsule module station shuttle splashdown countdown liftoff crew ' +
                'classroom campus library lab studio commons hall academy huddle assembly seminar cohort ' +
                'creek bay harbor marina regatta gateway summit horizon'
            ).split(' '),
        },
        app: {
            language: 'en',
            name: 'CCISD Meet',
            title: '<h1>CCISD Meet</h1>Video meetings for Clear Creek ISD.',
            description: 'Pick a room name and start a secure video meeting. No download or login required.',
            joinDescription: 'Pick a room name.',
            joinButtonLabel: 'JOIN ROOM',
            customizeRoomButtonLabel: 'CUSTOMIZE ROOM',
            joinLastLabel: 'Your recent room:',
        },
        og: {
            type: 'app-webrtc',
            siteName: 'CCISD Meet',
            title: 'Click the link to join the meeting.',
            description: 'CCISD Meet — secure browser-based video meetings for Clear Creek ISD.',
            image: 'https://meet.ccisd.me/images/ccisd-logo.svg',
            url: 'https://meet.ccisd.me',
        },
        site: {
            brandLogo: '../images/ccisd-logo.svg',
            shortcutIcon: '../images/ccisd-logo.svg',
            appleTouchIcon: '../images/ccisd-logo.svg',
            landingTitle: 'CCISD Meet — Video meetings for Clear Creek ISD.',
            newCallTitle: 'CCISD Meet — Video meetings for Clear Creek ISD.',
            newCallRoomTitle: 'Pick name. <br />Share URL. <br />Start meeting.',
            newCallRoomDescription:
                "Each room has its own disposable URL. Just pick a room name and share your custom URL. It's that easy.",
            loginTitle: 'CCISD Meet - Host Protected login required.',
            loginHeading: 'Welcome back',
            loginDescription: 'Enter your credentials to continue.',
            loginButtonLabel: 'Login',
            joinRoomTitle: 'Pick name.<br />Share URL.<br />Start meeting.',
            joinRoomButtonLabel: 'JOIN ROOM',
            clientTitle: 'CCISD Meet — WebRTC Video Meeting, Chat & Screen Sharing.',
            privacyPolicyTitle: 'CCISD Meet - privacy and policy.',
            stunTurnTitle: 'Test Stun/Turn Servers.',
            notFoundTitle: 'CCISD Meet - 404 Page not found.',
            waitingRoomTitle: 'CCISD Meet - Waiting for host to start the meeting',
            waitingRoomHeading: 'Waiting for host...',
            waitingRoomDescription:
                "The meeting hasn't started yet.<br />You'll join automatically when the host opens the room.",
            waitingRoomStatus: 'Checking room status...',
            waitingRoomReady: 'Room is ready! Joining...',
            waitingRoomWaiting: 'Waiting for host to start the meeting...',
            waitingRoomHostLink: 'Are you the host?',
            waitingRoomLoginLink: 'Login here',
            waitingRoomElapsedJust: 'Just started waiting',
            waitingRoomElapsedMinutes: 'Waiting for {minutes}',
            waitingRoomSongUrl: '../sounds/waiting-music.mp3',
        },
        about: {
            imageUrl: '../images/ccisd-logo.svg',
            title: `CCISD Meet v${packageJson.version}`,
            html: `
                <br />
                <span>Video meetings for Clear Creek ISD.</span>
                <br /><br />
                <hr />
                <span>&copy; 2026 Clear Creek ISD — A World-Class Education from Pre-K to Career</span>
                <hr />
            `,
        },
    },
};

const brandPreset = brandPresets[process.env.BRAND_PRESET] || brandPresets.sgc;

module.exports = {
    // ==========================================
    // Server
    // ==========================================
    server: {
        port: port,
        host: process.env.HOST || `http://localhost:${port}`,
        environment: process.env.NODE_ENV || 'development',
        trustProxy: !!getEnvBoolean(process.env.TRUST_PROXY),
    },

    // ==========================================
    // CORS
    // ==========================================
    cors: {
        origin: parseJsonEnv(process.env.CORS_ORIGIN, '*'),
        methods: parseJsonEnv(process.env.CORS_METHODS, ['GET', 'POST']),
    },

    // ==========================================
    // Host Protection
    // ==========================================
    host: {
        protected: getEnvBoolean(process.env.HOST_PROTECTED),
        userAuth: getEnvBoolean(process.env.HOST_USER_AUTH),
        users: parseJsonEnv(process.env.HOST_USERS, [{ username: 'MiroTalk', password: 'P2P' }]),
        maxLoginAttempts: process.env.HOST_MAX_LOGIN_ATTEMPTS || 5,
        minLoginBlockTime: process.env.HOST_MIN_LOGIN_BLOCK_TIME || 15, // in minutes
        maxRoomParticipants: parseInt(process.env.ROOM_MAX_PARTICIPANTS) || 1000,
        showActiveRooms: getEnvBoolean(process.env.SHOW_ACTIVE_ROOMS) || false,
    },

    // ==========================================
    // JWT
    // ==========================================
    jwt: {
        key: process.env.JWT_KEY || 'mirotalk_jwt_secret',
        exp: process.env.JWT_EXP || '1h',
    },

    // ==========================================
    // Presenters
    // ==========================================
    presenters: parseJsonEnv(process.env.PRESENTERS, ['MiroTalk P2P']),

    // ==========================================
    // API
    // ==========================================
    api: {
        keySecret: process.env.API_KEY_SECRET,
        disabled: parseJsonEnv(process.env.API_DISABLED, ['token', 'meetings']),
    },

    // ==========================================
    // Ngrok
    // ==========================================
    ngrok: {
        enabled: getEnvBoolean(process.env.NGROK_ENABLED),
        authToken: process.env.NGROK_AUTH_TOKEN,
    },

    // ==========================================
    // WebRTC ICE Servers
    // ==========================================
    webrtc: {
        stun: {
            enabled: getEnvBoolean(process.env.STUN_SERVER_ENABLED),
            url: process.env.STUN_SERVER_URL,
        },
        turn: {
            enabled: getEnvBoolean(process.env.TURN_SERVER_ENABLED),
            url: process.env.TURN_SERVER_URL,
            username: process.env.TURN_SERVER_USERNAME,
            credential: process.env.TURN_SERVER_CREDENTIAL,
        },
    },

    // ==========================================
    // IP Lookup
    // ==========================================
    ipLookup: {
        enabled: getEnvBoolean(process.env.IP_LOOKUP_ENABLED),
    },

    // ==========================================
    // Survey
    // ==========================================
    survey: {
        enabled: getEnvBoolean(process.env.SURVEY_ENABLED),
        url: process.env.SURVEY_URL || '',
    },

    // ==========================================
    // Redirect
    // ==========================================
    redirect: {
        enabled: getEnvBoolean(process.env.REDIRECT_ENABLED),
        url: process.env.REDIRECT_URL || '/newcall',
    },

    // ==========================================
    // Sentry
    // ==========================================
    sentry: {
        enabled: getEnvBoolean(process.env.SENTRY_ENABLED),
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.0'),
        logLevels: process.env.SENTRY_LOG_LEVELS
            ? process.env.SENTRY_LOG_LEVELS.split(',').map((level) => level.trim())
            : ['error'],
    },

    // ==========================================
    // Slack
    // ==========================================
    slack: {
        enabled: getEnvBoolean(process.env.SLACK_ENABLED),
        signingSecret: process.env.SLACK_SIGNING_SECRET,
    },

    // ==========================================
    // ChatGPT / OpenAI
    // ==========================================
    chatGPT: {
        enabled: getEnvBoolean(process.env.CHATGPT_ENABLED),
        basePath: process.env.CHATGPT_BASE_PATH,
        apiKey: process.env.CHATGPT_APIKEY,
        model: process.env.CHATGPT_MODEL,
        max_tokens: parseInt(process.env.CHATGPT_MAX_TOKENS),
        temperature: parseInt(process.env.CHATGPT_TEMPERATURE),
    },

    // ==========================================
    // IP Whitelist
    // ==========================================
    ipWhitelist: {
        enabled: getEnvBoolean(process.env.IP_WHITELIST_ENABLED),
        allowed: parseJsonEnv(process.env.IP_WHITELIST_ALLOWED, []),
    },

    // ==========================================
    // OIDC - OpenID Connect
    // ==========================================
    oidc: {
        enabled: process.env.OIDC_ENABLED ? getEnvBoolean(process.env.OIDC_ENABLED) : false,
        // Optional-OIDC: when false (default), OIDC provides IDENTITY only — the
        // app stays anonymous-accessible and a signed-in user is recognized
        // (name auto-filled, staging screen skipped). Set true to force login.
        forceLogin: getEnvBoolean(process.env.OIDC_FORCE_LOGIN),
        allowRoomCreationForAuthUsers: process.env.OIDC_ALLOW_ROOMS_CREATION_FOR_AUTH_USERS
            ? getEnvBoolean(process.env.OIDC_ALLOW_ROOMS_CREATION_FOR_AUTH_USERS)
            : false,
        baseUrlDynamic: process.env.OIDC_BASE_URL_DYNAMIC ? getEnvBoolean(process.env.OIDC_BASE_URL_DYNAMIC) : false,
        config: {
            issuerBaseURL: process.env.OIDC_ISSUER_BASE_URL,
            clientID: process.env.OIDC_CLIENT_ID,
            clientSecret: process.env.OIDC_CLIENT_SECRET,
            baseURL: process.env.OIDC_BASE_URL,
            secret: process.env.SESSION_SECRET,
            authorizationParams: {
                response_type: 'code',
                scope: 'openid profile email',
            },
            authRequired: process.env.OIDC_AUTH_REQUIRED ? getEnvBoolean(process.env.OIDC_AUTH_REQUIRED) : false,
            auth0Logout: process.env.OIDC_AUTH_LOGOUT ? getEnvBoolean(process.env.OIDC_AUTH_LOGOUT) : true,
            routes: {
                callback: '/auth/callback',
                // Explicit sign-in entry point (SSO-instant if the user already
                // has an auth.cooey.club/Discord session). Not auto-forced.
                login: '/auth/login',
                logout: '/logout',
            },
        },
    },

    // ==========================================
    // Mattermost
    // ==========================================
    mattermost: {
        enabled: getEnvBoolean(process.env.MATTERMOST_ENABLED),
        serverUrl: process.env.MATTERMOST_SERVER_URL,
        username: process.env.MATTERMOST_USERNAME,
        password: process.env.MATTERMOST_PASSWORD,
        token: process.env.MATTERMOST_TOKEN,
        roomTokenExpire: process.env.MATTERMOST_ROOM_TOKEN_EXPIRE,
    },

    // ==========================================
    // Stats / Analytics
    // ==========================================
    // Self-hosted Plausible analytics (SGC webstats). No third-party analytics.
    // Off unless STATS_ENABLED=true. src = public ingest script URL (a public
    // proxy to the mesh-only webstats.sgc.ai, e.g. https://stats.cooey.club/js/
    // script.js); domain = Plausible site key (data-domain); api = optional
    // data-api override (defaults to the script origin's /api/event).
    stats: {
        enabled: getEnvBoolean(process.env.STATS_ENABLED),
        src: process.env.STATS_SRC || '',
        domain: process.env.STATS_DOMAIN || '',
        api: process.env.STATS_API || '',
    },

    // ==========================================
    // Email
    // ==========================================
    email: {
        alert: process.env.EMAIL_ALERT === 'true' || false,
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
        sendTo: process.env.EMAIL_SEND_TO,
        https: process.env.HTTPS === 'true' || false,
        serverPort: process.env.PORT || 3000,
    },

    // ==========================================
    // Branding (UI customizations)
    // ==========================================
    brand: {
        htmlInjection: true,
        // Active brand preset (see brandPresets above; selected via BRAND_PRESET)
        theme: brandPreset.theme,
        roomNames: brandPreset.roomNames,
        app: brandPreset.app,
        og: brandPreset.og,
        site: brandPreset.site,
        html: {
            topSponsors: false,
            features: false,
            browsers: false,
            teams: false,
            tryEasier: false,
            poweredBy: false,
            sponsors: false,
            pastSponsors: false,
            advertisers: false,
            supportUs: false,
            footer: false,
        },
        about: brandPreset.about,
        // https://docs.mirotalk.com/mirotalk-p2p/integration/#widgets-integration
        widget: {
            enabled: false,
            roomId: 'support-room',
            theme: 'dark',
            widgetState: 'minimized',
            widgetType: 'support',
            supportWidget: {
                position: 'top-right',
                expertImages: [
                    'https://photo.cloudron.pocketsolution.net/uploads/original/95/7d/a5f7f7a2c89a5fee7affda5f013c.jpeg',
                ],
                buttons: {
                    audio: true,
                    video: true,
                    screen: true,
                    chat: true,
                    join: true,
                },
                checkOnlineStatus: false,
                isOnline: true,
                customMessages: {
                    heading: 'Need Help?',
                    subheading: 'Get instant support from our expert team!',
                    connectText: 'connect in < 5 seconds',
                    onlineText: 'We are online',
                    offlineText: 'We are offline',
                    poweredBy: 'Powered by MiroTalk',
                },
            },
        },
        //...
    },
    // ==========================================
    // Themes
    // ==========================================
    /**
     * Theme definitions — CSS custom properties for each theme.
     * Admins can override individual themes or add new ones.
     * The client merges these with built-in defaults, so you
     * only need to specify the properties you want to change.
     */
    // In-call room themes, merged into the client's themeMap via GET /themes.
    // Driven by the active brand preset (brandPreset.roomThemes) so a brand can
    // recolor the room UI: smooje overrides the default `dark` theme with the
    // Cooey Terminal red-on-black palette, making libations rooms terminal by
    // default (index 0 = dark). sgc leaves it empty (normal dark).
    themes: brandPreset.roomThemes || {},
    /**
     * Configuration for controlling the visibility of buttons in the MiroTalk P2P client.
     * Set properties to true to show the corresponding buttons, or false to hide them.
     * captionBtn, showSwapCameraBtn, showScreenShareBtn, showFullScreenBtn, showVideoPipBtn, showDocumentPipBtn -> (auto-detected).
     */
    buttons: {
        main: {
            showAudioBtn: true,
            showVideoBtn: true,
            showScreenBtn: true, // autodetected
            showMyHandBtn: true,
            showChatRoomBtn: true,
            showParticipantsBtn: true,
            showMySettingsBtn: true,
            showExtraBtn: true,
            showShareQr: true,
            showShareRoomBtn: true, // For guests
            showHideMeBtn: true,
            showRecordStreamBtn: true,
            showFullScreenBtn: true,
            showRoomEmojiPickerBtn: true,
            showCaptionRoomBtn: true,
            showWhiteboardBtn: true,
            showSnapshotRoomBtn: true,
            showFileShareBtn: true,
            showDocumentPipBtn: true,
            showAboutBtn: true, // Please keep me always true, Thank you!
        },
        chat: {
            showTogglePinBtn: true,
            showMaxBtn: true,
            showSaveMessageBtn: true,
            showMarkDownBtn: true,
            showChatGPTBtn: getEnvBoolean(process.env.CHATGPT_ENABLED, true),
            showFileShareBtn: true,
            showShareVideoAudioBtn: true,
            showParticipantsBtn: true,
        },
        caption: {
            showTogglePinBtn: true,
            showMaxBtn: true,
        },
        settings: {
            showActiveRoomsBtn: true,
            showMicOptionsBtn: true,
            showTabRoomPeerName: true,
            showTabRoomParticipants: true,
            showTabRoomSecurity: true,
            showTabEmailInvitation: true,
            showCaptionEveryoneBtn: true,
            showMuteEveryoneBtn: true,
            showHideEveryoneBtn: true,
            showEjectEveryoneBtn: true,
            showLockRoomBtn: true,
            showUnlockRoomBtn: true,
            showShortcutsBtn: true,
            customNoiseSuppression: getEnvBoolean(process.env.CUSTOM_NOISE_SUPPRESSION_ENABLED, true),
        },
        remote: {
            showAudioVolume: true,
            audioBtnClickAllowed: true,
            videoBtnClickAllowed: true,
            showVideoPipBtn: true,
            showKickOutBtn: true,
            showSnapShotBtn: true,
            showFileShareBtn: true,
            showShareVideoAudioBtn: true,
            showGeoLocationBtn: true,
            showPrivateMessageBtn: true,
            showZoomInOutBtn: false,
            showVideoFocusBtn: true,
        },
        local: {
            showVideoPipBtn: true,
            showSnapShotBtn: true,
            showVideoCircleBtn: true,
            showZoomInOutBtn: false,
            showVideoFocusBtn: true,
        },
        whiteboard: {
            whiteboardLockBtn: false,
        },
    },
    // ==========================================
    // Webhook
    // ==========================================
    webhook: {
        enabled: false, // Enable webhook functionality
        url: 'http://localhost:8888/webhook-endpoint', // Webhook server URL
    },
};
