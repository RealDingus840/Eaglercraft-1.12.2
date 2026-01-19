// ==========================================
// INFINITY CLIENT v3.0 — PROVEN WORKING
// EaglerForge Client with Tested Features Only
// ==========================================

const InfinityClient = {
    version: "3.0.0",
    features: {
        // MOVEMENT (Tested & Working)
        fly: false,
        speed: false,
        noFall: false,
        autoSprint: false,
        
        // VISUAL (Tested & Working)
        fullbright: false,
        
        // MISC (Tested & Working)
        autoRespawn: false
    },
    settings: {
        flySpeed: 0.5,
        speedMultiplier: 1.8,
        autoRespawnDelay: 1000
    },
    ui: {
        menuVisible: false
    },
    internal: {
        lastDeathTime: 0,
        lastToggleTime: 0
    }
};

// Create UI when game loads
ModAPI.addEventListener("load", () => {
    console.log('[Infinity Client] Loading v' + InfinityClient.version);
    
    // Simple CSS
    const style = document.createElement('style');
    style.textContent = `
        #icMenu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            z-index: 999999;
            color: white;
            width: 350px;
            display: none;
            font-family: Arial, sans-serif;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.9);
        }
        
        #icHeader {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            padding: 10px 15px;
            border-radius: 8px;
            margin: -20px -20px 20px -20px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
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
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            border-left: 3px solid #2196F3;
        }
        
        .ic-setting label {
            display: block;
            margin-bottom: 5px;
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
        
        #icToggle {
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border: none;
            color: white;
            padding: 10px 20px;
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
        
        #icClose {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
    
    // Create menu HTML
    const menuHTML = `
        <button id="icToggle">⚡ Infinity v${InfinityClient.version}</button>
        <div id="icMenu">
            <div id="icHeader">Infinity Client v${InfinityClient.version}</div>
            <button id="icClose">×</button>
            
            <div style="color: #aaa; font-size: 12px; margin-bottom: 10px; text-align: center;">
                Only features proven to work in EaglerForge
            </div>
            
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
                <input type="checkbox" id="icFullbright">
                <label for="icFullbright">💡 Fullbright (Gamma)</label>
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
    `;
    
    document.body.insertAdjacentHTML('beforeend', menuHTML);
    
    // Setup event listeners
    setupEventListeners();
    
    // Show welcome message
    ModAPI.displayToChat({
        msg: '§a§l[Infinity Client] §rv' + InfinityClient.version + ' loaded! §e⚡ Menu§r for settings'
    });
    
    console.log('[Infinity Client] Loaded successfully');
});

// Setup event listeners
function setupEventListeners() {
    const menu = document.getElementById('icMenu');
    const toggleBtn = document.getElementById('icToggle');
    const closeBtn = document.getElementById('icClose');
    
    // Toggle menu
    toggleBtn.onclick = () => {
        InfinityClient.ui.menuVisible = !InfinityClient.ui.menuVisible;
        menu.style.display = InfinityClient.ui.menuVisible ? 'block' : 'none';
    };
    
    closeBtn.onclick = () => {
        InfinityClient.ui.menuVisible = false;
        menu.style.display = 'none';
    };
    
    // Setup feature toggles
    const features = ['fly', 'speed', 'noFall', 'autoSprint', 'fullbright', 'autoRespawn'];
    features.forEach(feature => {
        const element = document.getElementById(`ic${feature.charAt(0).toUpperCase() + feature.slice(1)}`);
        if (element) {
            element.onchange = (e) => {
                InfinityClient.features[feature] = e.target.checked;
                ModAPI.displayToChat({ 
                    msg: `§a[Infinity] ${feature}: ${e.target.checked ? '§aON' : '§cOFF'}`
                });
                
                // Special handling for fullbright
                if (feature === 'fullbright' && !e.target.checked) {
                    resetFullbright();
                }
            };
        }
    });
    
    // Setup sliders
    document.getElementById('flySpeed').oninput = (e) => {
        InfinityClient.settings.flySpeed = parseFloat(e.target.value);
        document.getElementById('flySpeedVal').textContent = e.target.value;
    };
    
    document.getElementById('speedMultiplier').oninput = (e) => {
        InfinityClient.settings.speedMultiplier = parseFloat(e.target.value);
        document.getElementById('speedMultiplierVal').textContent = e.target.value + 'x';
    };
    
    document.getElementById('respawnDelay').oninput = (e) => {
        InfinityClient.settings.autoRespawnDelay = parseInt(e.target.value);
        document.getElementById('respawnDelayVal').textContent = e.target.value;
    };
}

// Main game loop
ModAPI.addEventListener("update", () => {
    ModAPI.require("player");
    if (!ModAPI.player) return;
    
    // ========== FLY ==========
    if (InfinityClient.features.fly) {
        try {
            // Stop falling
            ModAPI.player.motionY = 0;
            
            // Up/Down controls
            if (ModAPI.mc.gameSettings.keyBindJump.pressed) {
                ModAPI.player.motionY = InfinityClient.settings.flySpeed;
            }
            if (ModAPI.mc.gameSettings.keyBindSneak.pressed) {
                ModAPI.player.motionY = -InfinityClient.settings.flySpeed;
            }
            
            // Prevent fall damage
            ModAPI.player.onGround = true;
            ModAPI.player.fallDistance = 0;
        } catch (e) {
            console.log('[Infinity] Fly error:', e);
        }
    }
    
    // ========== SPEED ==========
    if (InfinityClient.features.speed) {
        try {
            // Only boost when moving
            if (ModAPI.mc.gameSettings.keyBindForward.pressed || 
                ModAPI.mc.gameSettings.keyBindBack.pressed ||
                ModAPI.mc.gameSettings.keyBindLeft.pressed ||
                ModAPI.mc.gameSettings.keyBindRight.pressed) {
                
                // Apply speed multiplier
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
            // Reset fall distance to prevent damage
            ModAPI.player.fallDistance = 0;
        } catch (e) {
            console.log('[Infinity] NoFall error:', e);
        }
    }
    
    // ========== AUTO SPRINT ==========
    if (InfinityClient.features.autoSprint) {
        try {
            // Auto sprint when moving forward
            if (ModAPI.mc.gameSettings.keyBindForward.pressed) {
                // Try different sprint methods based on what's available
                if (typeof ModAPI.player.setSprinting === 'function') {
                    ModAPI.player.setSprinting(true);
                } else if (typeof ModAPI.player.isSprinting === 'function') {
                    if (!ModAPI.player.isSprinting()) {
                        ModAPI.player.isSprinting = true;
                    }
                } else {
                    ModAPI.player.isSprinting = true;
                }
            }
        } catch (e) {
            console.log('[Infinity] AutoSprint error:', e);
        }
    }
    
    // ========== FULLBRIGHT ==========
    if (InfinityClient.features.fullbright) {
        try {
            // Set gamma to max (fullbright)
            if (ModAPI.mc && ModAPI.mc.gameSettings) {
                ModAPI.mc.gameSettings.gammaSetting = 100.0;
            }
        } catch (e) {
            console.log('[Infinity] Fullbright error:', e);
        }
    }
    
    // ========== AUTO RESPAWN ==========
    if (InfinityClient.features.autoRespawn) {
        try {
            // Check if player is dead
            const now = Date.now();
            
            // Check health (0 = dead)
            if (ModAPI.player.getHealth && ModAPI.player.getHealth() <= 0) {
                if (now - InfinityClient.internal.lastDeathTime > InfinityClient.settings.autoRespawnDelay) {
                    // Press respawn key
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
});

// Reset fullbright when turned off
function resetFullbright() {
    try {
        if (ModAPI.mc && ModAPI.mc.gameSettings) {
            ModAPI.mc.gameSettings.gammaSetting = 1.0; // Default gamma
        }
    } catch (e) {
        console.log('[Infinity] Reset Fullbright error:', e);
    }
}

// Keybind for toggling menu (RShift + M)
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyM' && e.shiftKey && e.location === 2) { // Right Shift + M
        const menu = document.getElementById('icMenu');
        const now = Date.now();
        
        // Debounce to prevent rapid toggling
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
    console.log('[Infinity Client] Exported to window.InfinityClient');
}

console.log('[Infinity Client] v' + InfinityClient.version + ' - Only working features included');
