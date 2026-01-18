// ==========================================
// ADVANCED CUSTOM CLIENT MOD FOR EAGLERFORGE
// Save this as: customclient.js
// ==========================================

// Custom Client State
const CustomClient = {
    version: "2.0.0",
    features: {
        // Movement
        fly: false,
        speed: false,
        noFall: false,
        safeWalk: false,
        
        // Combat
        killaura: false,
        autoTotem: false,
        autoCrystal: false,
        aimBot: false,
        autoWTap: false,
        criticals: false,
        antiAim: false,
        autoStrength: false,
        reach: false,
        
        // Visual
        fullbright: false,
        xray: false,
        playerESP: false,
        chestESP: false,
        mobESP: false,
        durabilityGUI: false,
        
        // Misc
        autoSprint: false,
        noSlowdown: false,
        antiCobweb: false,
        elytraPause: false,
        fastPlace: false,
        noDamage: false,
        scaffold: false,
        viaVersionViewer: false
    },
    settings: {
        // Movement
        speedMultiplier: 1.5,
        flySpeed: 0.5,
        safeWalkMode: 'stop', // 'stop' or 'crouch'
        
        // Combat
        killauraRange: 4.0,
        killauraCPS: 10,
        reachDistance: 3.5,
        
        // Visual
        mobESPType: 'all', // 'all', 'zombie', 'skeleton', 'creeper', etc.
        
        // Misc
        fastPlaceDelay: 0
    },
    ui: {
        menuVisible: false,
        currentTab: 'combat'
    },
    internal: {
        lastAttack: 0,
        lastPlace: 0,
        xrayBlocks: ['minecraft:diamond_ore', 'minecraft:iron_ore', 'minecraft:gold_ore', 
                     'minecraft:emerald_ore', 'minecraft:coal_ore', 'minecraft:lapis_ore',
                     'minecraft:redstone_ore', 'minecraft:chest', 'minecraft:ender_chest']
    }
};

// Create UI when game loads
ModAPI.addEventListener("load", () => {
    console.log('[Custom Client] Loading v' + CustomClient.version);
    
    // Create CSS styles
    const style = document.createElement('style');
    style.textContent = `
        #ccMenu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 12px;
            padding: 0;
            z-index: 999999;
            color: white;
            width: 700px;
            max-height: 85vh;
            display: none;
            font-family: Arial, sans-serif;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.9);
        }
        
        #ccMenuHeader {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            padding: 15px 20px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        #ccMenuHeader h3 {
            margin: 0;
            font-size: 20px;
            color: white;
        }
        
        #ccClose {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
        }
        
        #ccTabs {
            display: flex;
            background: rgba(255, 255, 255, 0.05);
            padding: 0;
            margin: 0;
        }
        
        .cc-tab {
            flex: 1;
            padding: 12px;
            background: none;
            border: none;
            color: #aaa;
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
            transition: all 0.2s;
            border-bottom: 3px solid transparent;
        }
        
        .cc-tab:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
        }
        
        .cc-tab.active {
            color: #4CAF50;
            border-bottom-color: #4CAF50;
        }
        
        #ccContent {
            padding: 20px;
            max-height: 55vh;
            overflow-y: auto;
        }
        
        .cc-tab-content {
            display: none;
        }
        
        .cc-tab-content.active {
            display: block;
        }
        
        .cc-feature {
            display: flex;
            align-items: center;
            padding: 10px;
            margin: 8px 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .cc-feature:hover {
            background: rgba(76, 175, 80, 0.2);
        }
        
        .cc-feature input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 12px;
            cursor: pointer;
        }
        
        .cc-feature label {
            flex: 1;
            cursor: pointer;
            font-size: 14px;
        }
        
        .cc-setting {
            margin: 15px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            border-left: 3px solid #2196F3;
        }
        
        .cc-setting label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            color: #aaa;
        }
        
        .cc-setting-value {
            float: right;
            color: #4CAF50;
            font-weight: bold;
        }
        
        .cc-setting input[type="range"] {
            width: 100%;
            cursor: pointer;
        }
        
        .cc-setting input[type="text"],
        .cc-setting input[type="number"],
        .cc-setting select {
            width: 100%;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #555;
            border-radius: 4px;
            color: white;
            font-size: 13px;
        }
        
        #ccToggle {
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            z-index: 999998;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.5);
            transition: all 0.3s;
        }
        
        #ccToggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.7);
        }
        
        .cc-esp-overlay {
            position: absolute;
            pointer-events: none;
            border: 2px solid;
            box-sizing: border-box;
        }
        
        #ccDurabilityGUI {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 6px;
            color: white;
            font-size: 12px;
            display: none;
            z-index: 999997;
        }
    `;
    document.head.appendChild(style);
    
    // Create menu HTML
    const menuHTML = `
        <div id="ccMenu">
            <div id="ccMenuHeader">
                <h3>⚡ Custom Client v${CustomClient.version}</h3>
                <button id="ccClose">×</button>
            </div>
            
            <div id="ccTabs">
                <button class="cc-tab active" data-tab="combat">⚔️ Combat</button>
                <button class="cc-tab" data-tab="movement">🏃 Movement</button>
                <button class="cc-tab" data-tab="visual">👁️ Visual</button>
                <button class="cc-tab" data-tab="misc">🔧 Misc</button>
            </div>
            
            <div id="ccContent">
                <!-- COMBAT TAB -->
                <div class="cc-tab-content active" id="combat">
                    <div class="cc-feature">
                        <input type="checkbox" id="ccKillaura">
                        <label for="ccKillaura">⚔️ Kill Aura</label>
                    </div>
                    <div class="cc-setting">
                        <label>Range: <span class="cc-setting-value" id="killauraRangeVal">4.0</span></label>
                        <input type="range" id="killauraRange" min="3" max="6" step="0.1" value="4.0">
                    </div>
                    <div class="cc-setting">
                        <label>CPS: <span class="cc-setting-value" id="killauraCPSVal">10</span></label>
                        <input type="range" id="killauraCPS" min="1" max="20" step="1" value="10">
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAutoTotem">
                        <label for="ccAutoTotem">🛡️ Auto Totem</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAutoCrystal">
                        <label for="ccAutoCrystal">💎 Auto Crystal</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAimBot">
                        <label for="ccAimBot">🎯 Aim Bot</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccReach">
                        <label for="ccReach">👊 Reach</label>
                    </div>
                    <div class="cc-setting">
                        <label>Distance: <span class="cc-setting-value" id="reachDistanceVal">3.5</span></label>
                        <input type="range" id="reachDistance" min="3" max="6" step="0.1" value="3.5">
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAutoWTap">
                        <label for="ccAutoWTap">⌨️ Auto W-Tap</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccCriticals">
                        <label for="ccCriticals">💥 Criticals</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAntiAim">
                        <label for="ccAntiAim">🔄 Anti-Aim</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAutoStrength">
                        <label for="ccAutoStrength">💪 Auto Strength</label>
                    </div>
                </div>
                
                <!-- MOVEMENT TAB -->
                <div class="cc-tab-content" id="movement">
                    <div class="cc-feature">
                        <input type="checkbox" id="ccFly">
                        <label for="ccFly">🕊️ Fly</label>
                    </div>
                    <div class="cc-setting">
                        <label>Speed: <span class="cc-setting-value" id="flySpeedVal">0.5</span></label>
                        <input type="range" id="flySpeed" min="0.1" max="2" step="0.1" value="0.5">
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccSpeed">
                        <label for="ccSpeed">⚡ Speed</label>
                    </div>
                    <div class="cc-setting">
                        <label>Multiplier: <span class="cc-setting-value" id="speedMultiplierVal">1.5x</span></label>
                        <input type="range" id="speedMultiplier" min="1" max="5" step="0.1" value="1.5">
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccNoFall">
                        <label for="ccNoFall">🛡️ No Fall</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccSafeWalk">
                        <label for="ccSafeWalk">🚶 Safe Walk</label>
                    </div>
                    <div class="cc-setting">
                        <label>Mode:</label>
                        <select id="safeWalkMode">
                            <option value="stop">Stop at Edge</option>
                            <option value="crouch">Auto Crouch</option>
                        </select>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAutoSprint">
                        <label for="ccAutoSprint">🏃 Auto Sprint</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccNoSlowdown">
                        <label for="ccNoSlowdown">🚀 No Slowdown</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccAntiCobweb">
                        <label for="ccAntiCobweb">🕸️ Anti Cobweb</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccElytraPause">
                        <label for="ccElytraPause">🪂 Elytra Pause</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccScaffold">
                        <label for="ccScaffold">🧱 Scaffold</label>
                    </div>
                </div>
                
                <!-- VISUAL TAB -->
                <div class="cc-tab-content" id="visual">
                    <div class="cc-feature">
                        <input type="checkbox" id="ccFullbright">
                        <label for="ccFullbright">💡 Fullbright</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccXray">
                        <label for="ccXray">👁️ X-Ray</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccPlayerESP">
                        <label for="ccPlayerESP">👤 Player ESP</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccChestESP">
                        <label for="ccChestESP">📦 Chest ESP</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccMobESP">
                        <label for="ccMobESP">🐺 Mob ESP</label>
                    </div>
                    <div class="cc-setting">
                        <label>Mob Type:</label>
                        <input type="text" id="mobESPType" value="all" placeholder="all, zombie, skeleton, etc.">
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccDurabilityGUI">
                        <label for="ccDurabilityGUI">🔧 Durability GUI</label>
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccViaVersionViewer">
                        <label for="ccViaVersionViewer">📊 ViaVersion Viewer</label>
                    </div>
                </div>
                
                <!-- MISC TAB -->
                <div class="cc-tab-content" id="misc">
                    <div class="cc-feature">
                        <input type="checkbox" id="ccFastPlace">
                        <label for="ccFastPlace">⚡ Fast Place</label>
                    </div>
                    <div class="cc-setting">
                        <label>Delay (ms): <span class="cc-setting-value" id="fastPlaceDelayVal">0</span></label>
                        <input type="range" id="fastPlaceDelay" min="0" max="200" step="10" value="0">
                    </div>
                    
                    <div class="cc-feature">
                        <input type="checkbox" id="ccNoDamage">
                        <label for="ccNoDamage">🛡️ No Damage</label>
                    </div>
                </div>
            </div>
        </div>
        
        <button id="ccToggle">⚡ Menu</button>
        
        <div id="ccDurabilityGUI"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', menuHTML);
    
    // Setup event listeners
    setupEventListeners();
    
    // Show welcome message
    ModAPI.displayToChat({
        msg: '§a§l[Custom Client] §rv' + CustomClient.version + ' loaded! Click the §e⚡ Menu§r button to configure'
    });
    
    console.log('[Custom Client] UI created successfully');
});

// Setup all event listeners
function setupEventListeners() {
    const menu = document.getElementById('ccMenu');
    const toggleBtn = document.getElementById('ccToggle');
    const closeBtn = document.getElementById('ccClose');
    
    // Toggle menu
    function toggleMenu() {
        CustomClient.ui.menuVisible = !CustomClient.ui.menuVisible;
        menu.style.display = CustomClient.ui.menuVisible ? 'block' : 'none';
    }
    
    toggleBtn.onclick = toggleMenu;
    closeBtn.onclick = toggleMenu;
    
    // Tab switching
    document.querySelectorAll('.cc-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.cc-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.cc-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        };
    });
    
    // Combat features
    setupToggle('ccKillaura', 'killaura');
    setupToggle('ccAutoTotem', 'autoTotem');
    setupToggle('ccAutoCrystal', 'autoCrystal');
    setupToggle('ccAimBot', 'aimBot');
    setupToggle('ccReach', 'reach');
    setupToggle('ccAutoWTap', 'autoWTap');
    setupToggle('ccCriticals', 'criticals');
    setupToggle('ccAntiAim', 'antiAim');
    setupToggle('ccAutoStrength', 'autoStrength');
    
    // Movement features
    setupToggle('ccFly', 'fly');
    setupToggle('ccSpeed', 'speed');
    setupToggle('ccNoFall', 'noFall');
    setupToggle('ccSafeWalk', 'safeWalk');
    setupToggle('ccAutoSprint', 'autoSprint');
    setupToggle('ccNoSlowdown', 'noSlowdown');
    setupToggle('ccAntiCobweb', 'antiCobweb');
    setupToggle('ccElytraPause', 'elytraPause');
    setupToggle('ccScaffold', 'scaffold');
    
    // Visual features
    setupToggle('ccFullbright', 'fullbright');
    setupToggle('ccXray', 'xray');
    setupToggle('ccPlayerESP', 'playerESP');
    setupToggle('ccChestESP', 'chestESP');
    setupToggle('ccMobESP', 'mobESP');
    setupToggle('ccDurabilityGUI', 'durabilityGUI');
    setupToggle('ccViaVersionViewer', 'viaVersionViewer');
    
    // Misc features
    setupToggle('ccFastPlace', 'fastPlace');
    setupToggle('ccNoDamage', 'noDamage');
    
    // Sliders
    setupSlider('killauraRange', 'killauraRange', 'killauraRangeVal');
    setupSlider('killauraCPS', 'killauraCPS', 'killauraCPSVal');
    setupSlider('reachDistance', 'reachDistance', 'reachDistanceVal');
    setupSlider('flySpeed', 'flySpeed', 'flySpeedVal');
    setupSlider('speedMultiplier', 'speedMultiplier', 'speedMultiplierVal', 'x');
    setupSlider('fastPlaceDelay', 'fastPlaceDelay', 'fastPlaceDelayVal');
    
    // Text inputs
    document.getElementById('mobESPType').oninput = (e) => {
        CustomClient.settings.mobESPType = e.target.value.toLowerCase();
    };
    
    document.getElementById('safeWalkMode').onchange = (e) => {
        CustomClient.settings.safeWalkMode = e.target.value;
    };
}

function setupToggle(elementId, featureName) {
    document.getElementById(elementId).onchange = (e) => {
        CustomClient.features[featureName] = e.target.checked;
        ModAPI.displayToChat({msg: '§a[Client] ' + featureName + ': ' + (e.target.checked ? 'ON' : 'OFF')});
    };
}

function setupSlider(elementId, settingName, valueId, suffix = '') {
    document.getElementById(elementId).oninput = (e) => {
        CustomClient.settings[settingName] = parseFloat(e.target.value);
        document.getElementById(valueId).textContent = e.target.value + suffix;
    };
}

// Main game loop
ModAPI.addEventListener("update", () => {
    ModAPI.require("player");
    if (!ModAPI.player) return;
    
    // FLY
    if (CustomClient.features.fly) {
        ModAPI.player.motionY = 0;
        if (ModAPI.mc.gameSettings.keyBindJump.pressed) {
            ModAPI.player.motionY = CustomClient.settings.flySpeed;
        }
        if (ModAPI.mc.gameSettings.keyBindSneak.pressed) {
            ModAPI.player.motionY = -CustomClient.settings.flySpeed;
        }
        ModAPI.player.onGround = true;
        ModAPI.player.fallDistance = 0;
        ModAPI.player.reload();
    }
    
    // SPEED
    if (CustomClient.features.speed) {
        if (ModAPI.mc.gameSettings.keyBindForward.pressed || 
            ModAPI.mc.gameSettings.keyBindBack.pressed ||
            ModAPI.mc.gameSettings.keyBindLeft.pressed ||
            ModAPI.mc.gameSettings.keyBindRight.pressed) {
            ModAPI.player.motionX *= CustomClient.settings.speedMultiplier;
            ModAPI.player.motionZ *= CustomClient.settings.speedMultiplier;
            ModAPI.player.reload();
        }
    }
    
    // NO FALL
    if (CustomClient.features.noFall) {
        ModAPI.player.fallDistance = 0;
        ModAPI.player.reload();
    }
    
    // AUTO SPRINT
    if (CustomClient.features.autoSprint) {
        if (ModAPI.mc.gameSettings.keyBindForward.pressed && !ModAPI.player.isSprinting()) {
            ModAPI.player.setSprinting(true);
            ModAPI.player.reload();
        }
    }
    
    // NO SLOWDOWN
    if (CustomClient.features.noSlowdown) {
        if (ModAPI.player.isUsingItem && ModAPI.player.isUsingItem()) {
            ModAPI.player.motionX *= 5;
            ModAPI.player.motionZ *= 5;
            ModAPI.player.reload();
        }
    }
    
    // ANTI COBWEB
    if (CustomClient.features.antiCobweb) {
        if (ModAPI.player.isInWeb) {
            ModAPI.player.isInWeb = false;
            ModAPI.player.reload();
        }
    }
    
    // KILLAURA
    if (CustomClient.features.killaura) {
        const now = Date.now();
        const delay = 1000 / CustomClient.settings.killauraCPS;
        if (now - CustomClient.internal.lastAttack > delay) {
            attackNearestEntity(CustomClient.settings.killauraRange);
            CustomClient.internal.lastAttack = now;
        }
    }
    
    // CRITICALS
    if (CustomClient.features.criticals && ModAPI.player.onGround) {
        ModAPI.player.motionY = 0.1;
        ModAPI.player.fallDistance = 0.1;
        ModAPI.player.reload();
    }
    
    // FULLBRIGHT
    if (CustomClient.features.fullbright) {
        if (ModAPI.mc && ModAPI.mc.gameSettings) {
            ModAPI.mc.gameSettings.gammaSetting = 100.0;
        }
    }
    
    // DURABILITY GUI
    if (CustomClient.features.durabilityGUI) {
        updateDurabilityGUI();
    } else {
        document.getElementById('ccDurabilityGUI').style.display = 'none';
    }
});

// Helper functions
function attackNearestEntity(range) {
    // This would need access to entity list through ModAPI
    // Implementation depends on ModAPI's entity access methods
    try {
        if (ModAPI.world && ModAPI.world.loadedEntityList) {
            const entities = ModAPI.world.loadedEntityList;
            // Find nearest entity within range and attack
        }
    } catch(e) {
        // ModAPI might not expose this
    }
}

function updateDurabilityGUI() {
    const gui = document.getElementById('ccDurabilityGUI');
    gui.style.display = 'block';
    
    try {
        const inventory = ModAPI.player.inventory;
        const mainItem = inventory.getCurrentItem();
        if (mainItem && mainItem.getMaxDamage) {
            const max = mainItem.getMaxDamage();
            const current = mainItem.getItemDamage();
            const percent = ((max - current) / max * 100).toFixed(1);
            gui.textContent = `Durability: ${max - current}/${max} (${percent}%)`;
        } else {
            gui.textContent = 'No item';
        }
    } catch(e) {
        gui.textContent = 'Error reading durability';
    }
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.CustomClient = CustomClient;
}

console.log('[Custom Client] Advanced mod loaded v' + CustomClient.version);
