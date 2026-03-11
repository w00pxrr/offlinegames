try {
    getStoredJSON("gams", {key: "gamMode"});
} catch(_e) {
    localStorage.removeItem("gams");
    storeJSON("gams", {key: "gamMode", value: "gam"})
}

const BroadcastDisguise = (typeof BroadcastChannel !== 'undefined')
    ? new BroadcastChannel('BroadcastDisguise')
    : null;
var consentStorageKey = 'gams_cookie_consent_v1';
var analyticsEnabled = false;

// Short helper for id-based element lookup.
function l(e) {
    return document.getElementById(e);
}

// Initializes page-level behaviors after DOM is ready.
function initPage() {
    applyReducedMotionPreference();
    setSavedTheme();
    bindSearchToggle();
    bindControls();
    bindCookieConsent();
}

function applyReducedMotionPreference() {
    var savedReducedMotion = getStoredJSON('gams', {key: 'reducedMotion'});
    var reduced = false;

    if (typeof savedReducedMotion === 'boolean') {
        reduced = savedReducedMotion;
    } else if (window.matchMedia) {
        reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    document.documentElement.setAttribute('data-reduced-motion', reduced ? 'true' : 'false');
}

// Wires the floating search button click/keyboard interactions.
function bindSearchToggle() {
    var toggle = l('searchToggle');
    if (!toggle) {return;}
    toggle.onclick = function() {
        searchbar(toggle);
    };
    toggle.onkeydown = function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            searchbar(toggle);
        }
    };
}

// Wires top control inputs to their corresponding handlers.
function bindControls() {
    var darkModeInput = l('darkModeInput');
    if (darkModeInput) {
        darkModeInput.onchange = function() {
            changeTheme(darkModeInput);
        };
    }

    var gamMode = l('gamMode');
    if (gamMode) {
        gamMode.onchange = function() {
            changeGamMode(gamMode);
        };
    }
}

function loadCookieConsent() {
    var raw = localStorage.getItem(consentStorageKey);
    if (!raw) {return null;}
    try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {return parsed;}
    } catch (_e) {}
    return null;
}

function saveCookieConsent(consent) {
    localStorage.setItem(consentStorageKey, JSON.stringify(consent));
}

function hasSettingsCookieConsent() {
    var consent = loadCookieConsent();
    return !!(consent && consent.settings === true);
}

function clearCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
}

function enableAnalytics() {
    if (analyticsEnabled) {return;}
    analyticsEnabled = true;
    var script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.dataset.websiteId = 'ac0c3422-a178-4ef1-92f3-8d6f875896d0';
    document.head.appendChild(script);
}

function applyCookieConsent(consent) {
    if (!consent) {return;}
    if (consent.analytics) {
        enableAnalytics();
    }
    if (!consent.settings) {
        clearCookie('gams_favorites');
    }
    if (typeof renderGames === 'function') {
        renderGames();
    }
}

function bindCookieConsent() {
    var popup = l('cookieConsent');
    var settingsInput = l('consentSettings');
    var analyticsInput = l('consentAnalytics');
    var acceptAll = l('consentAcceptAll');
    var saveBtn = l('consentSave');
    var rejectAll = l('consentRejectAll');
    if (!popup || !settingsInput || !analyticsInput || !acceptAll || !saveBtn || !rejectAll) {return;}

    var saved = loadCookieConsent();
    if (saved) {
        applyCookieConsent(saved);
        popup.classList.add('hidden');
        return;
    }

    popup.classList.remove('hidden');

    acceptAll.onclick = function() {
        var consent = {settings: true, analytics: true};
        saveCookieConsent(consent);
        applyCookieConsent(consent);
        popup.classList.add('hidden');
    };

    saveBtn.onclick = function() {
        var consent = {settings: settingsInput.checked, analytics: analyticsInput.checked};
        saveCookieConsent(consent);
        applyCookieConsent(consent);
        popup.classList.add('hidden');
    };

    rejectAll.onclick = function() {
        var consent = {settings: false, analytics: false};
        saveCookieConsent(consent);
        applyCookieConsent(consent);
        popup.classList.add('hidden');
    };
}

// Applies the light color palette to theme variables.
function setLight() {
    document.documentElement.style.setProperty('--gams-title-color', "#121a2c");
    document.documentElement.style.setProperty('--nc-tx-1', "#0f1729");
    document.documentElement.style.setProperty('--nc-tx-2', "#4a5978");
    document.documentElement.style.setProperty('--nc-bg-1', "#f8fbff");
    document.documentElement.style.setProperty('--nc-bg-2', "#edf3fb");
    document.documentElement.style.setProperty('--nc-bg-3', "#dce6f5");
    document.documentElement.style.setProperty('--nc-lk-1', "#2f6df6");
    document.documentElement.style.setProperty('--nc-lk-2', "#2357cc");
    document.documentElement.style.setProperty('--nc-lk-tx', "#FFFFFF");
    document.documentElement.style.setProperty('--nc-ac-1', "#81f0d7");
    document.documentElement.style.setProperty('--nc-ac-tx', "#123c49");
}

// Applies the dark color palette to theme variables.
function setDark() {
    document.documentElement.style.setProperty('--gams-title-color', "#f0f5ff");
    document.documentElement.style.setProperty('--nc-tx-1', "#e8efff");
    document.documentElement.style.setProperty('--nc-tx-2', "#adbedf");
    document.documentElement.style.setProperty('--nc-bg-1', "#0b1220");
    document.documentElement.style.setProperty('--nc-bg-2', "#111b2d");
    document.documentElement.style.setProperty('--nc-bg-3', "#1a2842");
    document.documentElement.style.setProperty('--nc-lk-1', "#6ea0ff");
    document.documentElement.style.setProperty('--nc-lk-2', "#4a7de6");
    document.documentElement.style.setProperty('--nc-lk-tx', "#FFFFFF");
    document.documentElement.style.setProperty('--nc-ac-1', "#5fd7bd");
    document.documentElement.style.setProperty('--nc-ac-tx', "#062b36");
}

// Replaces the search icon with an expanded search input.
function searchbar(elm) {
    if (elm) {elm.remove();}
    var searcher = l('searcher');
    if (!searcher) {return;}
    var input = document.createElement('input');
    input.id = 'searchQuery';
    input.className = 'search-input';
    input.type = 'search';
    input.placeholder = 'Search...';
    input.autocomplete = 'off';
    input.onkeyup = startSearch;
    input.onblur = function() { searchicon(input); };
    input.onfocus = function() { this.style.width = '180px'; };
    searcher.appendChild(input);
    input.focus();
    input.style.width = '180px';
}

// Restores the compact search icon after input blur.
function searchicon(elm) {
    if (!elm) {return;}
    elm.style.width = '20px';
    setTimeout(function(){
        elm.remove();
        var searcher = l('searcher');
        if (!searcher) {return;}
        var toggle = document.createElement('button');
        toggle.id = 'searchToggle';
        toggle.className = 'search-toggle button is-rounded is-light';
        toggle.textContent = '\uD83D\uDD0D';
        toggle.setAttribute('type', 'button');
        toggle.setAttribute('aria-label', 'Open search');
        toggle.onclick = function() { searchbar(toggle); };
        toggle.onkeydown = function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                searchbar(toggle);
            }
        };
        searcher.appendChild(toggle);
    }, 500);
}

// Reads JSON data from localStorage with optional key access.
function getStoredJSON(key, data) {
    if (data && data.key && (localStorage[key] !== 'null')) {
        var inStore;
        try {
            inStore = JSON.parse(localStorage[key]);
        } catch (_e) {
            return null;
        }
        if ((typeof inStore === 'object') && Object.prototype.hasOwnProperty.call(inStore, data.key)) {
            return inStore[data.key];
        }
    }
    if (localStorage[key] && !data) {
        try {
            return JSON.parse(localStorage[key]);
        } catch (_e) {
            return null;
        }
    }
    return null;
}

// Stores a key/value pair in a JSON object in localStorage.
function storeJSON(key, data) {
    var inStore;
    if (localStorage[key]) {
        try {
            inStore = JSON.parse(localStorage[key]) || {};
        } catch (_e) {
            inStore = {};
        }
        inStore[data.key] = data.value;
        localStorage[key] = JSON.stringify(inStore);
    }else{
        inStore = {};
        inStore[data.key] = data.value;
        localStorage[key] = JSON.stringify(inStore);
    }

    return localStorage[key];
}

// Toggles site theme and persists the choice.
function changeTheme(input) {
    var wantsDarkMode = (input.checked);
    if (wantsDarkMode) {
        setDark();
        storeJSON('gams', {
            key: 'theme',
            value: 'dark'
        })
    } else {
        setLight();
        storeJSON('gams', {
            key: 'theme',
            value: 'light'
        })
    }
}

// Persists selected game launch mode.
function changeGamMode(input) {
    storeJSON('gams', {
        key: 'gamMode',
        value: input.value
    });
}

// Restores saved theme and game mode preferences.
function setSavedTheme() {
    var darkModeInput = l('darkModeInput');
    if (!darkModeInput) {return;}
//Set Gam Mode
    var gamModeSelect = l('gamMode');
    if (gamModeSelect) {
        gamModeSelect.value = getStoredJSON('gams', {key: 'gamMode'}) || 'embed';
    }
//Set gam Mode

    var savedTheme = getStoredJSON('gams', {key: 'theme'});
    if (savedTheme) {
        if (savedTheme === 'light') {
//eww you monster
            setLight();
            darkModeInput.checked = false;
        } else if (savedTheme === 'dark') {
            setDark();
            darkModeInput.checked = true;
        }
    } else {
        var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        if (media) {
            var applyAutoTheme = function(isDark) {
                darkModeInput.checked = isDark;
                if (isDark) {
                    setDark();
                } else {
                    setLight();
                }
            };
            var onThemePrefChange = function(event) {
                applyAutoTheme(event.matches);
            };
            if (typeof media.addEventListener === 'function') {
                media.addEventListener('change', onThemePrefChange);
            } else if (typeof media.addEventListener === 'function') {
                media.addEventListener(onThemePrefChange);
            }
            applyAutoTheme(media.matches);
        } else {
            setLight();
            darkModeInput.checked = false;
        }
    }
}

var shadeElm = l('shade');
if (shadeElm) {
    shadeElm.onclick = function() {
        l('overlay').style.display='none';
        l("mainGam").src = '';
        l("newWin").href = '';
    };
}

// Filters visible game tiles using current search text.
function startSearch() {
    var input, filter, li, i;
    input = l("searchQuery");
    if (!input) {return;}
    filter = input.value.toUpperCase();
    li = document.body.getElementsByClassName("tile");
    for (i = 0; i < li.length; i++) {
        if (li[i].textContent.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

// Creates a DOM element and applies provided attributes.
function createElement(tag, prps) {
    var elm = document.createElement(tag);
    if (prps) {
        var props = Object.getOwnPropertyNames(prps);
        for (var i=0;i<props.length;i++) {
            elm.setAttribute(props[i], prps[props[i]]);
        }
    }

    return elm;
}

var gamsList = [
    {title: "HTML5/unity Webgl", type: "section"},
    {name: "Stickman Hook"},
    {name: "Drive Mad", href: "g/g/drivemad/drivemad.html"},
    {name: "2048"},
    {name: "Cookie Clicker", href: "g/g/cookie/index.html"},
    {name: "Cube Field", href: "g/g/cubefield/index.html"},
    {name: "Spacebar Clicker"},
    {name: "Offline Paradise"},
    {name: "Sand Game"},
    {name: "Agario Lite"},
    {name: "Evil Glitch"},
    {name: "Its Raining Boxes"},
    {name: "T Rex"},
    {name: "Stack"},
    {name: "Rolling Forests"},
    {name: "Radius Raid"},
    {name: "Mountain Maze"},
    {name: "Fluid Simulator"},
    {name: "Edge Not Found"},
    {name: "Ninja vs EVILCORP"},
    {name: "Geometry Dash"},
    {name: "Wordle"},
    {name: "Paper IO 2"},
    {name: "Aim Trainer", href: "g/g/aimtrainer/aimtrainer.html"},
    {name: "Snake", href: "g/snake.html"},
    {name: "Slope"},
    {name: "Burrito Bison", href: "g/g/burritobison/burritobison.html"},
    {name: "Tube Jumpers"},
    {name: "Hole IO"},
    {name: "Madalin Stunt Cars", href: "g/g/madalinstuntcars/madalinstuntcars.html"},
    {name: "Glass City", href: "g/g/glasscity/glasscity.html"},
    {name: "Tunnel Rush", href: "g/g/tunnelrush/tunnelrush.html"},
    {name: "Tanuki Sunset", href: "g/g/tanukisunset/tanukisunset.html"},
    {name: "A Dance of Fire and Ice", href: "g/g/fireice/index.html"},
    {name: "Game Inside a Game", href: "g/g/gameinsideagame/index.html"},
    {name: "Cell Machine", href: "g/g/cellmachine/index.html"},
    {name: "Slope 2", href: "g/g/slope2/index.html"},
    {name: "Ai Creatures", href: "g/g/aicreatures/index.html"},
    {name: "Grey Box Testing", href: "g/g/greybox/index.html"},
    {name: "Drift Boss", href: "g/g/driftboss/driftboss.html"},
    {title: "Retro", type: "section"},
    {name: "Super Mario 64"},
    {name: "Celeste"},
    {name: "Just One Boss"},
    {name: "Super Mario RPG"},


    {title: "Flash", type: "section"},
    {name: "Breaking The Bank"},
    {name: "Escaping The Prison"},
    {name: "Stealing The Diamond"},
    {name: "Infiltrating The Airship"},
    {name: "Fleeing The Complex"},
    {name: "Bloxorz"},
    {name: "Tetris"},
    {name: "Flood Runner 4"},
    {name: "Raft Wars"},
    {name: "Raft Wars 2"},
    {name: "Worlds Hardest Game"},
    {name: "Worlds Hardest Game 2", href: "g/g/Ruffle/player.html?swf=../../flash/whg2.swf"},
    {name: "The Impossible Quiz"},
    {name: "Learn To Fly Idle"},
    {name: "Learn To Fly 1"},
    {name: "Learn To Fly 2"},
    {name: "Learn To Fly 3"},
    {name: "Bloons Tower Defense 1"},
    {name: "Bloons Tower Defense 2"},
    {name: "Bloons Tower Defense 5"},
    {name: "Cat Ninja"},
    {name: "Pacman"},
    {name: "1 on 1 Soccer"},
    {name: "QWOP"},
    {name: "Use Boxmen"},
    {name: "40x Escape"},
    {name: "Stickman Life"},
    {name: "Duck Life 1"},
    {name: "Duck Life 2"},
    {name: "Duck Life 3"},
    {name: "Duck Life 4"},
    {name: "Duck Life 5"},
    {name: "Run", href: "g/g/Ruffle/player.html?swf=../../flash/run.swf"},
    {name: "Run 2", href: "g/g/Ruffle/player.html?swf=../../flash/run-2.swf"},
    {name: "Run 3", href: "g/g/Ruffle/player.html?swf=../../flash/run3.swf"},
    {name: "doom", href: "g/g/Ruffle/player.html?swf=../../flash/doom.swf"},
    {name: "Papas Burgeria", href: "g/g/Ruffle/player.html?swf=../../flash/papasburgeria.swf"},
    {name: "Fireboy And Watergirl 1", href: "g/g/Ruffle/player.html?swf=../../flash/fbwg1.swf"},
    {name: "Papas Pastaria", href: "g/g/Ruffle/player.html?swf=../../flash/papaspastaria.swf"},
    {name: "Portal", href: "g/g/Ruffle/player.html?swf=../../flash/portal.swf"},
    {title: "Tools", type: "section"},
    {name: "Ruffle Flash Player", href: "g/g/Ruffle/Ruffle.html"},
    {name: "Code Editor", type: "raw"},
    {name: "Web Retro"},
    {name: "Proxy Browser", href: "g/proxybrowser.html"},
    {name: "Calculator", href: "g/calc.html"},
];

// Persists a cookie value with expiration and security flags.
function setCookie(name, value, days) {
    if (!hasSettingsCookieConsent()) {return;}
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    var secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax" + secure;
}

// Reads a cookie value by name.
function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        while (c.charAt(0) === ' ') {c = c.substring(1, c.length);}
        if (c.indexOf(nameEQ) === 0) {return decodeURIComponent(c.substring(nameEQ.length, c.length));}
    }
    return null;
}

// Returns favorite game ids from cookie storage.
function getFavoriteIds() {
    if (!hasSettingsCookieConsent()) {return [];}
    var raw = getCookie('gams_favorites');
    if (!raw) {return [];}
    try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {return parsed;}
    } catch (e) {}
    return [];
}

// Saves favorite game ids to cookie storage.
function saveFavoriteIds(ids) {
    setCookie('gams_favorites', JSON.stringify(ids), 3650);
}

// Checks whether a game id is currently favorited.
function isFavorite(gameId) {
    var ids = getFavoriteIds();
    return ids.indexOf(gameId) !== -1;
}

// Adds/removes a game from favorites and rerenders lists.
function toggleFavorite(gameId) {
    var ids = getFavoriteIds();
    var idx = ids.indexOf(gameId);
    if (idx === -1) {
        ids.push(gameId);
    } else {
        ids.splice(idx, 1);
    }
    saveFavoriteIds(ids);
    renderGames();
}

var sectionOrder = [];
var gamesData = [];
var currentSection;

for (var j = 0; j < gamsList.length; j++) {
    var gam = gamsList[j];
    if (gam.title) {
        currentSection = gam.title;
        sectionOrder.push(gam.title);
        continue;
    }
    if (!gam.name) {continue;}

    var imgName = gam.name.toLowerCase().replace(/\s/g, '');
    var gameId = gam.id || imgName;
    gamesData.push({
        id: gameId,
        name: gam.name,
        href: gam.href || ('g/' + imgName + '.html'),
        img: gam.img || (gam.src ? ('img/' + gam.src) : ('img/' + imgName + '.jpeg')),
        type: gam.type || "",
        section: currentSection || "Other",
        index: gamesData.length
    });
}

var totalGames = gamesData.length;
l('totalGames').innerText = totalGames;

var container = createElement('div', {id: 'container'});
l('contain').appendChild(container);

// Creates a section heading element for the game grid.
function makeSectionTitle(titleText) {
    var title = createElement('h2', {
        class: "section-title"
    });
    title.textContent = titleText;
    return title;
}

// Builds a single game tile including favorite control.
function makeTile(game) {
    var tile = createElement('div', {
        class: 'tile card',
        'data-game-id': game.id,
        'data-href': game.href,
        'data-name': game.name,
        'data-modex': game.type,
        'data-pic': game.img
    });

    var favoriteButton = createElement('button', {
        class: 'favorite-btn',
        type: 'button',
        title: 'Toggle favorite',
        'aria-label': 'Toggle favorite'
    });
    favoriteButton.textContent = isFavorite(game.id) ? "\u2605" : "\u2606";
    favoriteButton.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(game.id);
    };
    tile.appendChild(favoriteButton);

    var img = createElement('img', {
        class: 'img',
        src: game.img,
        alt: game.name,
        width: '512',
        height: '512',
        loading: 'lazy',
        decoding: 'async'
    });
    var imageFigure = createElement('figure', {class: 'image is-square'});
    imageFigure.appendChild(img);
    var imageWrap = createElement('div', {class: 'card-image'});
    imageWrap.appendChild(imageFigure);
    tile.appendChild(imageWrap);

    var p = createElement('p', {
        class: 'name'
    });
    p.textContent = game.name;
    var content = createElement('div', {class: 'card-content'});
    content.appendChild(p);
    tile.appendChild(content);

    return tile;
}

// Opens a game using the currently selected launch mode.
function handleTileOpen(tile) {
    var href = new URL(tile.getAttribute('data-href'), window.location.href).href;
    var name = tile.getAttribute('data-name');
    var modeX = tile.getAttribute('data-modex');
    var pic = new URL(tile.getAttribute('data-pic'), window.location.href).href;
    var mode = getStoredJSON('gams', {key: 'gamMode'}) || 'embed';
    var gameShellQuery = new URLSearchParams({
        icon: pic,
        name: name,
        src: href
    }).toString();
    var gameShellUrl = `g/g/Gam.html?${gameShellQuery}`;

    if (modeX === "raw") {mode = modeX;}

    if (mode === 'raw') {
        window.open(href);
    }

    if (mode === 'direct') {
        window.location = gameShellUrl;
    }

    if (mode === 'blank') {
        const w = window.open();
        if (!w) {return;}
        const doc = w.document;

        const body = doc.body;
        body.style = "margin:0";
        const iframe = w.document.createElement('iframe');
        iframe.style = "width:100vw;height:100vh";
        iframe.setAttribute('frameborder', "0");
        iframe.src = gameShellUrl;
        body.appendChild(iframe);

        const script = w.document.createElement('script');
        script.textContent = `const BroadcastDisguise = new BroadcastChannel('BroadcastDisguise');

// Updates the favicon in the popup about:blank wrapper.
function setFavicon(href) {
var existFav = document.querySelectorAll('link[rel*="icon"]');
existFav.forEach(function(favicon) {
favicon.parentNode.removeChild(favicon);
});

var link = document.createElement('link');
link.type = 'image/x-icon';
link.rel = 'icon';
link.href = href;
document.getElementsByTagName('head')[0].appendChild(link);
}

// Reads JSON data from localStorage in popup context.
function getStoredJSON(key, data) {
if (data && data.key && (localStorage[key] !== 'null')) {
var inStore = JSON.parse(localStorage[key]);
if ((typeof inStore === 'object') && Object.prototype.hasOwnProperty.call(inStore, data.key)) {
return inStore[data.key];
}
}
if (localStorage[key] && !data) {
return JSON.parse(localStorage[key]);
}
return null;
}

// Applies saved disguise settings in popup context.
function applyDisguise() {
var icon = getStoredJSON('gams', {key: 'icon'});
var title = getStoredJSON('gams', {key: 'title'});
if (title) {
document.title = (title);
}else{
document.title = 'about:blank';
}

if (icon) {
setFavicon(icon)
}else{
setFavicon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABRklEQVR42mKgOqjq75ds7510YNL0uV9nAGqniqwKYiCIHIIjcAK22BGQLRdgBWvc3fnWk/FJhrkPO1xPgGvqPfLfJMHhT1yqurvS48bPaJhjD2efgidnVwa2yv59xecvEvi0UWCXq9t0ItfP2MMZ7nwIpkA8F1n8uLxZHM6yrBH7FIl2gFXDHYsErkn2hyKLHtcKrFntk58uVQJ+kSdQnmjhID4cwLLa8+K0BXsfNWCqBOsFdo2Yldv43DBrkxd30cjnNyYBhK0SQGkI9pG4Mu40D5b374DRCAyhHqXVfTmOwivivMkJxBz5wnHCtBfGgNFC+ChWKWRf3hsQIlyEoIv4IYEo5wkgtBLRekY9DE4Uin4Keae6hydGnljPmE8kRcCine6827AMsJ1IuW9ibnlQpXLBCR/WC875m2BP+VSu3c/0m+8V08OBngc0pxcAAAAASUVORK5CYII=')
}
}

applyDisguise();

if (BroadcastDisguise) {
if (BroadcastDisguise) {
BroadcastDisguise.onmessage = () => {
applyDisguise();
};
}
}
`;
        doc.head.appendChild(script);
    }

    if (mode === 'gam') {
        window.open(gameShellUrl);
    }

    if (mode === 'embed') {
        l('overlay').style.display = 'block';
        l("mainGam").src = href;
        l("newWin").href = href;
        l("mainGam").focus();
        l("loader").style.display = 'block';
        l("mainGam").onload = function(){
            l("mainGam").focus();
            setTimeout(function(){
                l("loader").style.display = 'none';
                l("mainGam").focus();
            }, 100);
        }
    }
}

// Gets the newest games from HTML5/Unity WebGL and Flash sections only (by insertion order).
function getLatestGames() {
    var allowedSections = ['HTML5/unity Webgl', 'Flash'];
    var filtered = gamesData.filter(function(g) {
        return allowedSections.indexOf(g.section) !== -1;
    });
    var sorted = filtered.slice().sort(function(a, b) {
        return b.index - a.index;
    });
    return sorted.slice(0, 4);
}

// Renders favorites and sectioned game tiles into the grid.
function renderGames() {
    container.innerHTML = "";
    var fragment = document.createDocumentFragment();
    var favoriteIds = getFavoriteIds();
    var favoriteMap = {};
    for (var i = 0; i < favoriteIds.length; i++) {
        favoriteMap[favoriteIds[i]] = true;
    }

    var latestGames = getLatestGames();
    if (latestGames.length > 0) {
        fragment.appendChild(makeSectionTitle('New Games'));
        for (var d = 0; d < latestGames.length; d++) {
            fragment.appendChild(makeTile(latestGames[d]));
        }
    }

    var favoriteGames = [];
    for (var k = 0; k < gamesData.length; k++) {
        if (favoriteMap[gamesData[k].id]) {favoriteGames.push(gamesData[k]);}
    }
    favoriteGames.sort(function(a, b) { return a.index - b.index; });

    if (favoriteGames.length > 0) {
        fragment.appendChild(makeSectionTitle('Favorites'));
        for (var f = 0; f < favoriteGames.length; f++) {
            fragment.appendChild(makeTile(favoriteGames[f]));
        }
    }

    for (var s = 0; s < sectionOrder.length; s++) {
        var sectionName = sectionOrder[s];
        var sectionGames = [];
        for (var g = 0; g < gamesData.length; g++) {
            if (gamesData[g].section === sectionName && !favoriteMap[gamesData[g].id]) {
                sectionGames.push(gamesData[g]);
            }
        }
        if (sectionGames.length === 0) {continue;}

        fragment.appendChild(makeSectionTitle(sectionName));
        for (var t = 0; t < sectionGames.length; t++) {
            fragment.appendChild(makeTile(sectionGames[t]));
        }
    }

    container.appendChild(fragment);

    var tiles = container.getElementsByClassName('tile');
    for (var n = 0; n < tiles.length; n++) {
        tiles[n].onclick = function(e) {
            if (e.target && e.target.classList && e.target.classList.contains('favorite-btn')) {return;}
            handleTileOpen(this);
        }
    }
}

renderGames();

// Updates the main page favicon.
function setFavicon(href) {
    var existFav = document.querySelectorAll('link[rel*="icon"]');
    existFav.forEach(function(favicon) {
        favicon.parentNode.removeChild(favicon);
    });

    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = href;
    document.getElementsByTagName('head')[0].appendChild(link);
}

const ogTitle = document.title;
const ogIcon = document.querySelectorAll('link[rel*="icon"]')[0].href;

// Applies saved disguise settings on the main page.
function applyDisguise() {
    var icon = getStoredJSON('gams', {key: 'icon'});
    var title = getStoredJSON('gams', {key: 'title'});
    if (title) {
        document.title = (title);
    }else{
        document.title = (ogTitle);
    }

    if (icon) {
        setFavicon(icon)
    }else{
        setFavicon(ogIcon)
    }
}

applyDisguise();

BroadcastDisguise.onmessage = () => {
    applyDisguise();
};

initPage();