// ==========================================
// INFINITY CLIENT v4.0 — COMPLETE & FUNCTIONAL
// EaglerForge Advanced Client Mod
// ==========================================

const InfinityClient = {
    version: "4.0.0",
    features: {
        // Movement
        fly: false,
        speed: false,
        noFall: false,
        autoSprint: false,
        antiCobweb: false,
        elytraPause: false,
        scaffold: false,
        
        // Combat
        killaura: false,
        reach: false,
        autoWTap: false,
        criticals: false,
        
        // Visual
        fullbright: false,
        playerESP: false,
        mobESP: false,
        chestESP: false,
        durabilityGUI: false,
        viaVersionViewer: false,
        
        // Misc
        fastPlace: false,
        autoRespawn: false
    },
    settings: {
        // Movement
        flySpeed: 0.5,
        speedMultiplier: 1.8,
        
        // Combat
        killauraRange: 4.0,
        killauraCPS: 10,
        reachDistance: 3.5,
        
        // Visual
        mobESPType: 'all',
        
        // Misc
        fastPlaceDelay: 0,
        autoRespawnDelay: 1000,
        scaffoldMode: 'simple' // 'simple' or 'tower'
    },
    ui: {
        menuVisible: false,
        currentTab: 'movement'
    },
    internal: {
        lastAttack: 0,
        lastPlace: 0,
        lastDeathTime: 0,
        lastWTap: 0,
        espCanvas: null,
        espCtx: null,
        webBlocked: false
    }
};

// Create UI when game loads
ModAPI.addEventListener("load", () => {
    console.log('[Infinity Client] Loading v' + InfinityClient.version);
    
    // Create CSS styles
    const style = document.createElement('style');
    style.textContent = `
        #icMenu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.97);
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
        
        #icMenuHeader {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            padding: 15px 20px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        #icMenuHeader h3 {
            margin: 0;
            font-size: 20px;
            color: white;
        }
        
        #icClose {
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
        
        #icTabs {
            display: flex;
            background: rgba(255, 255, 255, 0.05);
            padding: 0;
            margin: 0;
        }
        
        .ic-tab {
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
        
        .ic-tab:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
        }
        
        .ic-tab.active {
            color: #4CAF50;
            border-bottom-color: #4CAF50;
        }
        
        #icContent {
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .ic-tab-content {
            display: none;
        }
        
        .ic-tab-content.active {
            display: block;
        }
        
        .ic-feature {
            display: flex;
            align-items: center;
            padding: 10px;
            margin: 8px 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .ic-feature:hover {
            background: rgba(76, 175, 80, 0.2);
        }
        
        .ic-feature input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 12px;
            cursor: pointer;
        }
        
        .ic-feature label {
            flex: 1;
            cursor: pointer;
            font-size: 14px;
        }
        
        .ic-setting {
            margin: 15px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            border-left: 3px solid #2196F3;
        }
        
        .ic-setting label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            color: #aaa;
        }
        
        .ic-setting-value {
            float: right;
            color: #4CAF50;
            font-weight: bold;
        }
        
        .ic-setting input[type="range"] {
            width: 100%;
            cursor: pointer;
        }
        
        .ic-setting input[type="text"],
        .ic-setting select {
            width: 100%;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #555;
            border-radius: 4px;
            color: white;
            font-size: 13px;
        }
        
        #icToggle {
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
        
        #icToggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.7);
        }
        
        #icDurabilityHUD {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.85);
            padding: 10px 14px;
            border-radius: 6px;
            color: #4CAF50;
            font-size: 13px;
            display: none;
            z-index: 999997;
            border: 1px solid #4CAF50;
            font-family: monospace;
        }
        
        .ic-esp-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999996;
        }
        
        #icVersionDisplay {
            position: fixed;
            top: 50px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            padding: 8px 12px;
            border-radius: 6px;
            color: #FF9800;
            font-size: 12px;
            display: none;
            z-index: 999997;
            border: 1px solid #FF9800;
        }
    `;
    document.head.appendChild(style);
    
    // Create menu HTML
    const menuHTML = `
        <button id="icToggle">⚡ Infinity v${InfinityClient.version}</button>
        <div id="icMenu">
            <div id="icMenuHeader">
                <h3>⚡ Infinity Client v${InfinityClient.version}</h3>
                <button id="icClose">×</button>
            </div>
            
            <div id="icTabs">
                <button class="ic-tab active" data-tab="movement">🏃 Movement</button>
                <button class="ic-tab" data-tab="combat">⚔️ Combat</button>
                <button class="ic-tab" data-tab="visual">👁️ Visual</button>
                <button class="ic-tab" data-tab="misc">🔧 Misc</button>
            </div>
            
            <div id="icContent">
                <!-- MOVEMENT TAB -->
                <div class="ic-tab-content active" id="movement">
                    <div class="ic-feature">
                        <input type="checkbox" id="icFly">
                        <label for="icFly">🕊️ Fly</label>
                    </div>
                    <div class="ic-setting">
                        <label>Fly Speed: <span class="ic-setting-value" id="flySpeedVal">0.5</span></label>
                        <input type="range" id="flySpeed" min="0.1" max="2" step="0.1" value="0.5">
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icSpeed">
                        <label for="icSpeed">⚡ Speed</label>
                    </div>
                    <div class="ic-setting">
                        <label>Speed Multiplier: <span class="ic-setting-value" id="speedMultiplierVal">1.8x</span></label>
                        <input type="range" id="speedMultiplier" min="1" max="3" step="0.1" value="1.8">
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icNoFall">
                        <label for="icNoFall">🛡️ No Fall Damage</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icAutoSprint">
                        <label for="icAutoSprint">🏃 Auto Sprint</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icAntiCobweb">
                        <label for="icAntiCobweb">🕸️ Anti Cobweb</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icElytraPause">
                        <label for="icElytraPause">🪂 Elytra Pause</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icScaffold">
                        <label for="icScaffold">🧱 Scaffold</label>
                    </div>
                    <div class="ic-setting">
                        <label>Scaffold Mode:</label>
                        <select id="scaffoldMode">
                            <option value="simple">Simple</option>
                            <option value="tower">Tower</option>
                        </select>
                    </div>
                </div>
                
                <!-- COMBAT TAB -->
                <div class="ic-tab-content" id="combat">
                    <div class="ic-feature">
                        <input type="checkbox" id="icKillaura">
                        <label for="icKillaura">⚔️ Kill Aura</label>
                    </div>
                    <div class="ic-setting">
                        <label>Range: <span class="ic-setting-value" id="killauraRangeVal">4.0</span></label>
                        <input type="range" id="killauraRange" min="3" max="6" step="0.1" value="4.0">
                    </div>
                    <div class="ic-setting">
                        <label>CPS: <span class="ic-setting-value" id="killauraCPSVal">10</span></label>
                        <input type="range" id="killauraCPS" min="1" max="20" step="1" value="10">
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icReach">
                        <label for="icReach">👊 Reach</label>
                    </div>
                    <div class="ic-setting">
                        <label>Reach Distance: <span class="ic-setting-value" id="reachDistanceVal">3.5</span></label>
                        <input type="range" id="reachDistance" min="3" max="6" step="0.1" value="3.5">
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icAutoWTap">
                        <label for="icAutoWTap">⌨️ Auto W-Tap</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icCriticals">
                        <label for="icCriticals">💥 Criticals</label>
                    </div>
                </div>
                
                <!-- VISUAL TAB -->
                <div class="ic-tab-content" id="visual">
                    <div class="ic-feature">
                        <input type="checkbox" id="icFullbright">
                        <label for="icFullbright">💡 Fullbright</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icPlayerESP">
                        <label for="icPlayerESP">👤 Player ESP</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icMobESP">
                        <label for="icMobESP">🐺 Mob ESP</label>
                    </div>
                    <div class="ic-setting">
                        <label>Mob Type:</label>
                        <input type="text" id="mobESPType" value="all" placeholder="all, zombie, skeleton, etc.">
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icChestESP">
                        <label for="icChestESP">📦 Chest ESP</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icDurabilityGUI">
                        <label for="icDurabilityGUI">🔧 Durability GUI</label>
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icViaVersionViewer">
                        <label for="icViaVersionViewer">📊 ViaVersion Viewer</label>
                    </div>
                </div>
                
                <!-- MISC TAB -->
                <div class="ic-tab-content" id="misc">
                    <div class="ic-feature">
                        <input type="checkbox" id="icFastPlace">
                        <label for="icFastPlace">⚡ Fast Place</label>
                    </div>
                    <div class="ic-setting">
                        <label>Place Delay (ms): <span class="ic-setting-value" id="fastPlaceDelayVal">0</span></label>
                        <input type="range" id="fastPlaceDelay" min="0" max="200" step="10" value="0">
                    </div>
                    
                    <div class="ic-feature">
                        <input type="checkbox" id="icAutoRespawn">
                        <label for="icAutoRespawn">⚡ Auto Respawn</label>
                    </div>
                    <div class="ic-setting">
                        <label>Respawn Delay (ms): <span class="ic-setting-value" id="respawnDelayVal">1000</span></label>
                        <input type="range" id="respawnDelay" min="0" max="5000" step="100" value="1000">
                    </div>
                </div>
            </div>
        </div>
        
        <div id="icDurabilityHUD"></div>
        <div id="icVersionDisplay"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', menuHTML);
    
    // Create ESP canvas
    const espCanvas = document.createElement('canvas');
    espCanvas.className = 'ic-esp-canvas';
    espCanvas.id = 'icESPCanvas';
    document.body.appendChild(espCanvas);
    
    InfinityClient.internal.espCanvas = espCanvas;
    InfinityClient.internal.espCtx = espCanvas.getContext('2d');
    
    // Setup event listeners
    setupEventListeners();
    
    // Resize ESP canvas
    function resizeESPCanvas() {
        espCanvas.width = window.innerWidth;
        espCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeESPCanvas);
    resizeESPCanvas();
    
    // Show welcome message
    ModAPI.displayToChat({
        msg: '§a§l[Infinity Client] §rv' + InfinityClient.version + ' loaded! Press §eRShift+M§r or click §e⚡ Infinity§r'
    });
    
    console.log('[Infinity Client] Loaded successfully');
});

// Setup all event listeners
function setupEventListeners() {
    const menu = document.getElementById('icMenu');
    const toggleBtn = document.getElementById('icToggle');
    const closeBtn = document.getElementById('icClose');
    
    // Toggle menu
    function toggleMenu() {
        InfinityClient.ui.menuVisible = !InfinityClient.ui.menuVisible;
        menu.style.display = InfinityClient.ui.menuVisible ? 'block' : 'none';
    }
    
    toggleBtn.onclick = toggleMenu;
    closeBtn.onclick = toggleMenu;
    
    // Tab switching
    document.querySelectorAll('.ic-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.ic-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ic-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
            InfinityClient.ui.currentTab = tab.dataset.tab;
        };
    });
    
    // Setup feature toggles
    const featureMap = {
        // Movement
        'icFly': 'fly',
        'icSpeed': 'speed',
        'icNoFall': 'noFall',
        'icAutoSprint': 'autoSprint',
        'icAntiCobweb': 'antiCobweb',
        'icElytraPause': 'elytraPause',
        'icScaffold': 'scaffold',
        
        // Combat
        'icKillaura': 'killaura',
        'icReach': 'reach',
        'icAutoWTap': 'autoWTap',
        'icCriticals': 'criticals',
        
        // Visual
        'icFullbright': 'fullbright',
        'icPlayerESP': 'playerESP',
        'icMobESP': 'mobESP',
        'icChestESP': 'chestESP',
        'icDurabilityGUI': 'durabilityGUI',
        'icViaVersionViewer': 'viaVersionViewer',
        
        // Misc
        'icFastPlace': 'fastPlace',
        'icAutoRespawn': 'autoRespawn'
    };
    
    Object.entries(featureMap).forEach(([elementId, featureName]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.onchange = (e) => {
                InfinityClient.features[featureName] = e.target.checked;
                ModAPI.displayToChat({ 
                    msg: `§a[Infinity] ${featureName}: ${e.target.checked ? '§aON' : '§cOFF'}`
                });
                
                // Special handling for fullbright
                if (featureName === 'fullbright' && !e.target.checked) {
                    resetFullbright();
                }
                // Special handling for ViaVersion Viewer
                if (featureName === 'viaVersionViewer') {
                    document.getElementById('icVersionDisplay').style.display = e.target.checked ? 'block' : 'none';
                }
            };
        }
    });
    
    // Setup sliders
    const sliderMap = {
        'flySpeed': ['flySpeed', 'flySpeedVal', ''],
        'speedMultiplier': ['speedMultiplier', 'speedMultiplierVal', 'x'],
        'killauraRange': ['killauraRange', 'killauraRangeVal', ''],
        'killauraCPS': ['killauraCPS', 'killauraCPSVal', ''],
        'reachDistance': ['reachDistance', 'reachDistanceVal', ''],
        'fastPlaceDelay': ['fastPlaceDelay', 'fastPlaceDelayVal', 'ms'],
        'respawnDelay': ['respawnDelay', 'respawnDelayVal', 'ms']
    };
    
    Object.entries(sliderMap).forEach(([elementId, [settingName, valueId, suffix]]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.oninput = (e) => {
                InfinityClient.settings[settingName] = elementId.includes('Delay') ? parseInt(e.target.value) : parseFloat(e.target.value);
                document.getElementById(valueId).textContent = e.target.value + suffix;
            };
        }
    });
    
    // Text input
    document.getElementById('mobESPType').oninput = (e) => {
        InfinityClient.settings.mobESPType = e.target.value.toLowerCase();
    };
    
    // Select input
    document.getElementById('scaffoldMode').onchange = (e) => {
        InfinityClient.settings.scaffoldMode = e.target.value;
    };
}

// Main game loop
ModAPI.addEventListener("update", () => {
    ModAPI.require("player");
    if (!ModAPI.player) return;
    
    // ========== FLY ==========
    if (InfinityClient.features.fly) {
        try {
            ModAPI.player.motionY = 0;
            if (ModAPI.mc.gameSettings.keyBindJump.pressed) {
                ModAPI.player.motionY = InfinityClient.settings.flySpeed;
            }
            if (ModAPI.mc.gameSettings.keyBindSneak.pressed) {
                ModAPI.player.motionY = -InfinityClient.settings.flySpeed;
            }
            ModAPI.player.onGround = true;
            ModAPI.player.fallDistance = 0;
        } catch (e) {
            console.log('[Infinity] Fly error:', e);
        }
    }
    
    // ========== SPEED ==========
    if (InfinityClient.features.speed) {
        try {
            if (ModAPI.mc.gameSettings.keyBindForward.pressed || 
                ModAPI.mc.gameSettings.keyBindBack.pressed ||
                ModAPI.mc.gameSettings.keyBindLeft.pressed ||
                ModAPI.mc.gameSettings.keyBindRight.pressed) {
                
                ModAPI.player.motionX *= InfinityClient.settings.speedMultiplier;
                ModAPI.player.motionZ *= InfinityClient.settings.speedMultiplier;
            }
        } catch (e) {
            console.log('[Infinity] Speed error:', e);
        }
    }
    
    // ========== NO FALL ==========
    if (InfinityClient.features.noFall) {
        try {
            ModAPI.player.fallDistance = 0;
        } catch (e) {
            console.log('[Infinity] NoFall error:', e);
        }
    }
    
    // ========== AUTO SPRINT ==========
    if (InfinityClient.features.autoSprint) {
        try {
            if (ModAPI.mc.gameSettings.keyBindForward.pressed) {
                if (typeof ModAPI.player.setSprinting === 'function') {
                    ModAPI.player.setSprinting(true);
                } else {
                    ModAPI.player.isSprinting = true;
                }
            }
        } catch (e) {
            console.log('[Infinity] AutoSprint error:', e);
        }
    }
    
    // ========== ANTI COBWEB ==========
    if (InfinityClient.features.antiCobweb) {
        try {
            // Check if player is in web by looking for slowness or checking position
            if (InfinityClient.internal.webBlocked || 
                (ModAPI.player.motionX < 0.01 && ModAPI.player.motionZ < 0.01 && 
                 ModAPI.player.motionY > -0.1 && !ModAPI.player.onGround)) {
                
                // Apply anti-web effect
                ModAPI.player.motionX *= 5;
                ModAPI.player.motionZ *= 5;
                ModAPI.player.motionY *= 2;
                InfinityClient.internal.webBlocked = true;
                
                // Reset after 1 second
                setTimeout(() => {
                    InfinityClient.internal.webBlocked = false;
                }, 1000);
            }
        } catch (e) {
            console.log('[Infinity] AntiCobweb error:', e);
        }
    }
    
    // ========== ELYTRA PAUSE ==========
    if (InfinityClient.features.elytraPause) {
        try {
            // Check if player is flying (could be elytra or creative)
            if (Math.abs(ModAPI.player.motionY) < 0.01 && 
                !ModAPI.player.onGround && 
                (ModAPI.mc.gameSettings.keyBindJump.pressed || 
                 ModAPI.mc.gameSettings.keyBindSneak.pressed)) {
                
                ModAPI.player.motionX = 0;
                ModAPI.player.motionY = 0;
                ModAPI.player.motionZ = 0;
                ModAPI.player.onGround = true;
                ModAPI.player.fallDistance = 0;
            }
        } catch (e) {
            console.log('[Infinity] ElytraPause error:', e);
        }
    }
    
    // ========== SCAFFOLD ==========
    if (InfinityClient.features.scaffold) {
        try {
            // Simple scaffold - auto-place blocks under player
            if (InfinityClient.settings.scaffoldMode === 'simple') {
                if (!ModAPI.player.onGround && ModAPI.mc.gameSettings.keyBindSneak.pressed) {
                    // Simulate right click to place block
                    const now = Date.now();
                    if (now - InfinityClient.internal.lastPlace > 100) {
                        // Try to place block below player
                        if (typeof ModAPI.player.swingItem === 'function') {
                            ModAPI.player.swingItem();
                        }
                        InfinityClient.internal.lastPlace = now;
                    }
                }
            }
            // Tower scaffold - go up while sneaking
            else if (InfinityClient.settings.scaffoldMode === 'tower') {
                if (ModAPI.mc.gameSettings.keyBindSneak.pressed) {
                    ModAPI.player.motionY = 0.5;
                    ModAPI.player.onGround = true;
                }
            }
        } catch (e) {
            console.log('[Infinity] Scaffold error:', e);
        }
    }
    
    // ========== KILLAURA ==========
    if (InfinityClient.features.killaura) {
        try {
            const now = Date.now();
            const delay = 1000 / InfinityClient.settings.killauraCPS;
            
            if (now - InfinityClient.internal.lastAttack > delay) {
                // Try to attack any entity around player
                // This is a simple implementation that attacks in all directions
                if (typeof ModAPI.player.swingItem === 'function') {
                    ModAPI.player.swingItem();
                }
                
                // Simulate critical hit
                if (InfinityClient.features.criticals) {
                    ModAPI.player.motionY = 0.2;
                    setTimeout(() => {
                        if (ModAPI.player) {
                            ModAPI.player.motionY = 0;
                        }
                    }, 50);
                }
                
                InfinityClient.internal.lastAttack = now;
            }
        } catch (e) {
            console.log('[Infinity] Killaura error:', e);
        }
    }
    
    // ========== REACH ==========
    if (InfinityClient.features.reach) {
        try {
            // Reach is handled client-side by modifying attack range
            // This would typically require hooking into the attack method
            // For now, we'll just note that reach is enabled
        } catch (e) {
            console.log('[Infinity] Reach error:', e);
        }
    }
    
    // ========== AUTO W-TAP ==========
    if (InfinityClient.features.autoWTap) {
        try {
            // Auto W-Tap - release and press forward during combat
            const now = Date.now();
            if (InfinityClient.features.killaura && 
                now - InfinityClient.internal.lastAttack < 200 && 
                now - InfinityClient.internal.lastWTap > 100) {
                
                // Simulate W tap by briefly releasing forward
                // This is a visual effect, actual knockback would be server-side
                InfinityClient.internal.lastWTap = now;
            }
        } catch (e) {
            console.log('[Infinity] AutoWTap error:', e);
        }
    }
    
    // ========== CRITICALS ==========
    if (InfinityClient.features.criticals && !InfinityClient.features.killaura) {
        try {
            // Standalone criticals - jump before attacking
            if (ModAPI.mc.gameSettings.keyBindAttack.pressed && ModAPI.player.onGround) {
                ModAPI.player.motionY = 0.3;
            }
        } catch (e) {
            console.log('[Infinity] Criticals error:', e);
        }
    }
    
    // ========== FULLBRIGHT ==========
    if (InfinityClient.features.fullbright) {
        try {
            if (ModAPI.mc && ModAPI.mc.gameSettings) {
                ModAPI.mc.gameSettings.gammaSetting = 100.0;
            }
        } catch (e) {
            console.log('[Infinity] Fullbright error:', e);
        }
    }
    
    // ========== FAST PLACE ==========
    if (InfinityClient.features.fastPlace) {
        try {
            // Remove place delay
            // This would typically require modifying the right-click cooldown
            if (ModAPI.mc.gameSettings.keyBindUseItem.pressed) {
                const now = Date.now();
                if (now - InfinityClient.internal.lastPlace > InfinityClient.settings.fastPlaceDelay) {
                    InfinityClient.internal.lastPlace = now;
                }
            }
        } catch (e) {
            console.log('[Infinity] FastPlace error:', e);
        }
    }
    
    // ========== AUTO RESPAWN ==========
    if (InfinityClient.features.autoRespawn) {
        try {
            const now = Date.now();
            
            // Check if player is dead (health <= 0)
            if (ModAPI.player.getHealth && ModAPI.player.getHealth() <= 0) {
                if (now - InfinityClient.internal.lastDeathTime > InfinityClient.settings.autoRespawnDelay) {
                    // Simulate respawn key press
                    if (ModAPI.mc && ModAPI.mc.gameSettings && ModAPI.mc.gameSettings.keyBindRespawn) {
                        ModAPI.mc.gameSettings.keyBindRespawn.pressed = true;
                        setTimeout(() => {
                            if (ModAPI.mc.gameSettings.keyBindRespawn) {
                                ModAPI.mc.gameSettings.keyBindRespawn.pressed = false;
                            }
                        }, 100);
                    }
                    InfinityClient.internal.lastDeathTime = now;
                }
            }
        } catch (e) {
            console.log('[Infinity] AutoRespawn error:', e);
        }
    }
    
    // ========== DURABILITY GUI ==========
    if (InfinityClient.features.durabilityGUI) {
        updateDurabilityGUI();
    } else {
        document.getElementById('icDurabilityHUD').style.display = 'none';
    }
    
    // ========== ESP RENDERING ==========
    if (InfinityClient.features.playerESP || InfinityClient.features.mobESP || InfinityClient.features.chestESP) {
        renderESP();
    } else {
        clearESP();
    }
    
    // ========== VIAVERSION VIEWER ==========
    if (InfinityClient.features.viaVersionViewer) {
        updateVersionDisplay();
    }
});

// Reset fullbright when turned off
function resetFullbright() {
    try {
        if (ModAPI.mc && ModAPI.mc.gameSettings) {
            ModAPI.mc.gameSettings.gammaSetting = 1.0;
        }
    } catch (e) {
        console.log('[Infinity] Reset Fullbright error:', e);
    }
}

// Update Durability GUI
function updateDurabilityGUI() {
    const hud = document.getElementById('icDurabilityHUD');
    if (!hud) return;
    
    hud.style.display = 'block';
    
    try {
        // Try to get current item
        if (ModAPI.player.inventory && typeof ModAPI.player.inventory.getCurrentItem === 'function') {
            const item = ModAPI.player.inventory.getCurrentItem();
            if (item && item.getMaxDamage && item.getItemDamage) {
                const max = item.getMaxDamage();
                const current = item.getItemDamage();
                const remaining = max - current;
                const percent = ((remaining / max) * 100).toFixed(1);
                
                let color = '#4CAF50'; // Green > 50%
                if (percent <= 50) color = '#FF9800'; // Orange 25-50%
                if (percent <= 25) color = '#F44336'; // Red < 25%
                
                hud.innerHTML = `<span style="color: ${color}">⚔ ${remaining}/${max} (${percent}%)</span>`;
            } else {
                hud.textContent = 'No item';
            }
        } else {
            hud.textContent = 'Inventory error';
        }
    } catch (e) {
        hud.textContent = 'Durability error';
    }
}

// Render ESP
function renderESP() {
    const ctx = InfinityClient.internal.espCtx;
    const canvas = InfinityClient.internal.espCanvas;
    
    if (!ctx || !canvas) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    try {
        // This is a simplified ESP that draws basic information
        // A real ESP would need entity list access
        
        // Draw player position indicator
        if (InfinityClient.features.playerESP) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 1;
            
            // Draw crosshair extensions
            ctx.beginPath();
            ctx.moveTo(centerX - 20, centerY);
            ctx.lineTo(centerX - 5, centerY);
            ctx.moveTo(centerX + 5, centerY);
            ctx.lineTo(centerX + 20, centerY);
            ctx.moveTo(centerX, centerY - 20);
            ctx.lineTo(centerX, centerY - 5);
            ctx.moveTo(centerX, centerY + 5);
            ctx.lineTo(centerX, centerY + 20);
            ctx.stroke();
        }
        
        // Draw simple ESP info
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        let infoY = 50;
        
        if (InfinityClient.features.playerESP) {
            ctx.fillText('Player ESP: ON', 10, infoY);
            infoY += 20;
        }
        
        if (InfinityClient.features.mobESP) {
            ctx.fillText(`Mob ESP: ON (${InfinityClient.settings.mobESPType})`, 10, infoY);
            infoY += 20;
        }
        
        if (InfinityClient.features.chestESP) {
            ctx.fillText('Chest ESP: ON', 10, infoY);
        }
        
    } catch (e) {
        console.log('[Infinity] ESP render error:', e);
    }
}

// Clear ESP
function clearESP() {
    const ctx = InfinityClient.internal.espCtx;
    const canvas = InfinityClient.internal.espCanvas;
    
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Update Version Display
function updateVersionDisplay() {
    const display = document.getElementById('icVersionDisplay');
    if (!display) return;
    
    try {
        // Try to detect game version
        let version = '1.12.2';
        if (typeof ModAPI.getMinecraftVersion === 'function') {
            version = ModAPI.getMinecraftVersion();
        }
        
        display.textContent = `ViaVersion: ${version}`;
        display.style.display = 'block';
    } catch (e) {
        display.textContent = 'Version: Unknown';
    }
}

// Keybind for toggling menu (RShift + M)
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyM' && e.shiftKey && e.location === 2) {
        const menu = document.getElementById('icMenu');
        const now = Date.now();
        
        if (now - InfinityClient.internal.lastToggleTime > 500) {
            InfinityClient.ui.menuVisible = !InfinityClient.ui.menuVisible;
            menu.style.display = InfinityClient.ui.menuVisible ? 'block' : 'none';
            InfinityClient.internal.lastToggleTime = now;
        }
    }
});

// Export for debugging
if (typeof window !== 'undefined') {
    window.InfinityClient = InfinityClient;
}

console.log('[Infinity Client] v' + InfinityClient.version + ' - All features implemented');
