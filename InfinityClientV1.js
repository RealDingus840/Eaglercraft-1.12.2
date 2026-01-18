// ==========================================
// CUSTOM CLIENT MOD FOR EAGLERFORGE (UPGRADED)
// Save this as: customclient.js
// ==========================================

const CustomClient = {
    version: "2.0.0",
    features: {
        fly: false,
        speed: false,
        noFall: false,
        fullbright: false,
        xray: false,
        autoSprint: false,
        noSlowdown: false,
        autoTotem: false,
        elytraPause: false,
        autoCrystal: false,
        reach: false,
        killaura: false,
        aimBot: false,
        antiCobweb: false,
        autoWTap: false,
        criticals: false,
        playerESP: false,
        chestESP: false,
        mobESP: false,
        viaVersionViewer: false,
        fastPlace: false,
        antiAim: false,
        autoStrength: false,
        durabilityGUI: false,
        noDamage: false,
        scaffold: false,
        safeWalk: false
    },
    settings: {
        speedMultiplier: 1.5,
        flySpeed: 0.5,
        reachDistance: 4.5,
        killauraRange: 5,
        killauraCPS: 10,
        fastPlaceDelay: 100,
        safeWalkMode: 'stop', // 'stop' or 'crouch'
        mobESPType: 'zombie'
    },
    ui: { menuVisible: false }
};

// ==================== UI ====================
ModAPI.addEventListener("load", () => {
    console.log(`[Custom Client] Loading v${CustomClient.version}`);

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        /* (CSS code here, fix emojis) */
    `;
    document.head.appendChild(style);

    // Inject HTML
    const menuHTML = `
        <div id="ccMenu">
            <h3>⚡ Custom Client v${CustomClient.version}</h3>
            <div class="cc-info"><strong>ℹ Info:</strong> Press <kbd>R</kbd> to toggle menu</div>
            <!-- Features checkboxes -->
            <div class="cc-feature"><input type="checkbox" id="ccFly"><label for="ccFly">🕊️ Fly Mode</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccSpeed"><label for="ccSpeed">⚡ Speed Boost</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccNoFall"><label for="ccNoFall">🛡️ No Fall Damage</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccFullbright"><label for="ccFullbright">💡 Fullbright</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccXray"><label for="ccXray">⛏️ Xray</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccAutoSprint"><label for="ccAutoSprint">🏃 Auto Sprint</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccNoSlowdown"><label for="ccNoSlowdown">⛏️ No Slowdown</label></div>
            <!-- Additional features will be dynamically added -->
            <button id="ccClose" class="cc-btn cc-btn-close">✖ Close</button>
        </div>
        <button id="ccToggle">⚡ Client</button>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    setupEventListeners();

    ModAPI.displayToChat({ msg: `§a§l[Custom Client] §rv${CustomClient.version} loaded! Press §eR§r to open menu` });
    console.log('[Custom Client] UI created successfully');
});

// ==================== Event Listeners ====================
function setupEventListeners() {
    const menu = document.getElementById('ccMenu');
    const toggleBtn = document.getElementById('ccToggle');
    const closeBtn = document.getElementById('ccClose');

    function toggleMenu() {
        CustomClient.ui.menuVisible = !CustomClient.ui.menuVisible;
        menu.style.display = CustomClient.ui.menuVisible ? 'block' : 'none';
        toggleBtn.style.display = CustomClient.ui.menuVisible ? 'none' : 'block';
    }

    toggleBtn.onclick = toggleMenu;
    closeBtn.onclick = toggleMenu;
    document.addEventListener('keydown', e => {
        if (e.key === 'r' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Feature checkboxes
    ['Fly','Speed','NoFall','Fullbright','Xray','AutoSprint','NoSlowdown'].forEach(f => {
        const el = document.getElementById(`cc${f}`);
        if (el) el.onchange = e => {
            CustomClient.features[f.toLowerCase()] = e.target.checked;
            if(f === 'Fullbright') applyFullbright(e.target.checked);
            if(f === 'Xray') applyXray(e.target.checked);
            ModAPI.displayToChat({ msg: `§a[Client] ${f}: ${e.target.checked ? 'ON' : 'OFF'}` });
        };
    });
}

// ==================== Utilities ====================
function applyFullbright(enabled) {
    if(ModAPI.mc && ModAPI.mc.gameSettings) ModAPI.mc.gameSettings.gammaSetting = enabled ? 100.0 : 1.0;
}

function applyXray(enabled) {
    if(!ModAPI.world) return;
    ModAPI.world.forEachBlock((x,y,z,block)=>{
        if(!block) return;
        if(enabled){
            const ores = ["diamond_ore","gold_ore","iron_ore","emerald_ore","redstone_ore","lapis_ore","coal_ore"];
            block.visible = ores.includes(block.name);
        }else block.visible = true;
    });
}

// ==================== Main Tick ====================
ModAPI.addEventListener("update", () => {
    if(!ModAPI.player) return;

    // Combined motion multiplier
    let motionMultiplier = 1;
    if(CustomClient.features.speed) motionMultiplier *= CustomClient.settings.speedMultiplier;
    if(CustomClient.features.noSlowdown && ModAPI.player.isUsingItem()) motionMultiplier *= 5;

    // FLY
    if(CustomClient.features.fly){
        ModAPI.player.motionY = 0;
        if(ModAPI.mc.gameSettings.keyBindJump.pressed) ModAPI.player.motionY = CustomClient.settings.flySpeed;
        if(ModAPI.mc.gameSettings.keyBindSneak.pressed) ModAPI.player.motionY = -CustomClient.settings.flySpeed;
        ModAPI.player.onGround = true;
        ModAPI.player.fallDistance = 0;
    }

    // SPEED
    if(CustomClient.features.speed && (ModAPI.mc.gameSettings.keyBindForward.pressed || ModAPI.mc.gameSettings.keyBindBack.pressed || ModAPI.mc.gameSettings.keyBindLeft.pressed || ModAPI.mc.gameSettings.keyBindRight.pressed)){
        ModAPI.player.motionX *= motionMultiplier;
        ModAPI.player.motionZ *= motionMultiplier;
    }

    // NO FALL
    if(CustomClient.features.noFall) ModAPI.player.fallDistance = 0;

    // AUTO SPRINT
    if(CustomClient.features.autoSprint && ModAPI.mc.gameSettings.keyBindForward.pressed && !ModAPI.player.isSprinting()){
        ModAPI.player.setSprinting(true);
    }

    // Xray
    if(CustomClient.features.xray) applyXray(true);

    // TODO: Implement remaining features like AutoTotem, Killaura, AimBot, AutoCrystal, Scaffold, SafeWalk, ESPs etc.

    ModAPI.player.reload(); // single reload per tick
});

// ==================== Debug Export ====================
if(typeof window !== 'undefined') window.CustomClient = CustomClient;
console.log(`[Custom Client] Mod loaded successfully v${CustomClient.version}`);
