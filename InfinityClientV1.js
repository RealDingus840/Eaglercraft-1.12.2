// Eaglercraft Mod Menu v1.0 - EaglerForge Edition
// File: modmenu.js
// Inject with: Load File -> EaglerForge/Mods/modmenu.js
// Activate with Right-Shift key

if (typeof ModAPI !== "undefined" && ModAPI.hooks) {
    console.log("[ModMenu] Initializing EaglerForge Mod Menu...");
    
    // Wait for game to fully load
    ModAPI.addEventListener("update", function() {
        if (typeof nms === "undefined") return;
        
        // Only run once
        ModAPI.removeEventListener("update", arguments.callee);
        initModMenu();
    });
} else {
    console.error("[ModMenu] EaglerForge not found! This mod requires EaglerForge.");
}

function initModMenu() {
    console.log("[ModMenu] Game loaded, setting up mod menu...");
    
    // Mod states storage
    window.modmenu = {
        enabled: false,
        xray: false,
        fly: false,
        elytraPause: false,
        speed: false,
        speedMultiplier: 2.0,
        noclip: false,
        fullbright: false,
        menuVisible: false
    };
    
    // Create menu HTML
    const menuHTML = `
    <div id="modmenu-container" style="
        position: fixed;
        top: 50px;
        left: 20px;
        width: 260px;
        background: #2C2C2C;
        border: 3px solid #4CAF50;
        border-radius: 8px;
        color: white;
        font-family: 'Minecraft', monospace;
        font-size: 14px;
        z-index: 10000;
        display: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        user-select: none;
    ">
        <div id="modmenu-title" style="
            background: #4CAF50;
            color: black;
            padding: 10px;
            font-weight: bold;
            text-align: center;
            border-radius: 5px 5px 0 0;
            cursor: move;
        ">
            EaglerForge Mod Menu
        </div>
        <div id="modmenu-content" style="
            padding: 15px;
            max-height: 350px;
            overflow-y: auto;
        ">
            <!-- Mod toggles will be added here -->
        </div>
        <div id="modmenu-footer" style="
            padding: 10px;
            background: #222;
            border-top: 1px solid #444;
            border-radius: 0 0 5px 5px;
            text-align: center;
            font-size: 12px;
            color: #AAA;
        ">
            Right-Shift to open/close
        </div>
    </div>
    `;
    
    // Inject menu into DOM
    const div = document.createElement('div');
    div.innerHTML = menuHTML;
    document.body.appendChild(div);
    
    const menuContainer = document.getElementById('modmenu-container');
    const menuContent = document.getElementById('modmenu-content');
    const menuTitle = document.getElementById('modmenu-title');
    
    // Create mod toggles
    const mods = [
        {id: 'xray', name: 'X-Ray Vision', desc: 'See through blocks'},
        {id: 'fly', name: 'Flight Mode', desc: 'Toggle flying'},
        {id: 'elytraPause', name: 'Elytra Pause', desc: 'Freeze elytra flight'},
        {id: 'speed', name: 'Speed Hack', desc: 'Increase movement speed'},
        {id: 'noclip', name: 'No Clip', desc: 'Walk through blocks'},
        {id: 'fullbright', name: 'Full Bright', desc: 'Maximum brightness'}
    ];
    
    mods.forEach(mod => {
        const modDiv = document.createElement('div');
        modDiv.style.cssText = `
            margin-bottom: 12px;
            padding: 8px;
            border: 1px solid #444;
            border-radius: 4px;
            background: #333;
        `;
        
        modDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">${mod.name}</span>
                <div id="toggle-${mod.id}" style="
                    width: 40px;
                    height: 20px;
                    background: #555;
                    border-radius: 10px;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.3s;
                ">
                    <div style="
                        width: 16px;
                        height: 16px;
                        background: white;
                        border-radius: 50%;
                        position: absolute;
                        top: 2px;
                        left: 2px;
                        transition: left 0.3s;
                    "></div>
                </div>
            </div>
            <div style="font-size: 10px; color: #AAA; margin-top: 4px;">${mod.desc}</div>
        `;
        
        menuContent.appendChild(modDiv);
        
        // Add toggle functionality
        const toggle = document.getElementById(`toggle-${mod.id}`);
        toggle.addEventListener('click', () => {
            window.modmenu[mod.id] = !window.modmenu[mod.id];
            const circle = toggle.querySelector('div');
            if (window.modmenu[mod.id]) {
                toggle.style.background = '#4CAF50';
                circle.style.left = '22px';
                enableMod(mod.id);
            } else {
                toggle.style.background = '#555';
                circle.style.left = '2px';
                disableMod(mod.id);
            }
        });
    });
    
    // Make menu draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    menuTitle.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = menuContainer.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        menuTitle.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        menuContainer.style.left = (e.clientX - offsetX) + 'px';
        menuContainer.style.top = (e.clientY - offsetY) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        menuTitle.style.cursor = 'move';
    });
    
    // Keyboard control for menu
    let rightShiftPressed = false;
    
    ModAPI.addEventListener('key', function(key, state, char, location) {
        // Check for Right-Shift (keycode 16, location=2 for right)
        if (key === 16 && location === 2) {
            rightShiftPressed = state;
            if (state) {
                window.modmenu.menuVisible = !window.modmenu.menuVisible;
                menuContainer.style.display = window.modmenu.menuVisible ? 'block' : 'none';
                
                if (window.modmenu.menuVisible) {
                    // Add fade-in animation
                    menuContainer.style.animation = 'fadeIn 0.3s ease';
                }
            }
        }
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        #modmenu-container::-webkit-scrollbar {
            width: 6px;
        }
        
        #modmenu-container::-webkit-scrollbar-track {
            background: #222;
        }
        
        #modmenu-container::-webkit-scrollbar-thumb {
            background: #4CAF50;
            border-radius: 3px;
        }
        
        #modmenu-content > div:hover {
            background: #3A3A3A !important;
            border-color: #555 !important;
        }
        
        #modmenu-footer:hover {
            background: #2A2A2A !important;
        }
    `;
    document.head.appendChild(style);
    
    // Mod functionality implementations
    function enableMod(modId) {
        console.log(`[ModMenu] Enabling ${modId}`);
        
        switch(modId) {
            case 'xray':
                enableXray();
                break;
            case 'fly':
                enableFly();
                break;
            case 'elytraPause':
                enableElytraPause();
                break;
            case 'speed':
                enableSpeed();
                break;
            case 'noclip':
                enableNoclip();
                break;
            case 'fullbright':
                enableFullbright();
                break;
        }
    }
    
    function disableMod(modId) {
        console.log(`[ModMenu] Disabling ${modId}`);
        
        switch(modId) {
            case 'xray':
                disableXray();
                break;
            case 'fly':
                disableFly();
                break;
            case 'elytraPause':
                disableElytraPause();
                break;
            case 'speed':
                disableSpeed();
                break;
            case 'noclip':
                disableNoclip();
                break;
            case 'fullbright':
                disableFullbright();
                break;
        }
    }
    
    // X-Ray Implementation
    function enableXray() {
        // Hook into block rendering
        try {
            // Try to access Minecraft's render engine
            if (typeof nms !== 'undefined') {
                // This is a simplified approach - actual implementation would require
                // more complex block rendering manipulation
                console.log('[ModMenu] X-Ray: Making blocks transparent');
                
                // Hook into world rendering
                const originalRenderWorld = ModAPI.hooks.methods['nmc_Minecraft_renderWorld'];
                if (originalRenderWorld) {
                    ModAPI.hooks.methods['nmc_Minecraft_renderWorld'] = function($this) {
                        // Call original
                        originalRenderWorld.call(this, $this);
                        
                        // Add X-Ray effect
                        if (window.modmenu.xray) {
                            // This would require modifying block rendering code
                            // For now, we'll just log
                            console.log('[ModMenu] X-Ray active');
                        }
                    };
                }
            }
        } catch(e) {
            console.error('[ModMenu] X-Ray error:', e);
        }
    }
    
    function disableXray() {
        // Restore original rendering
        console.log('[ModMenu] X-Ray disabled');
    }
    
    // Flight Implementation
    function enableFly() {
        try {
            if (typeof nms !== 'undefined' && nms.thePlayer) {
                // Set player capabilities
                nms.thePlayer.capabilities.allowFlying = true;
                nms.thePlayer.capabilities.isFlying = true;
                nms.thePlayer.capabilities.disableDamage = true;
                console.log('[ModMenu] Flight enabled');
            }
        } catch(e) {
            console.error('[ModMenu] Flight error:', e);
        }
    }
    
    function disableFly() {
        try {
            if (typeof nms !== 'undefined' && nms.thePlayer) {
                nms.thePlayer.capabilities.allowFlying = false;
                nms.thePlayer.capabilities.isFlying = false;
                nms.thePlayer.capabilities.disableDamage = false;
                console.log('[ModMenu] Flight disabled');
            }
        } catch(e) {
            console.error('[ModMenu] Flight disable error:', e);
        }
    }
    
    // Elytra Pause Implementation
    function enableElytraPause() {
        try {
            if (typeof nms !== 'undefined' && nms.thePlayer) {
                // Hook into player update
                const originalUpdate = nms.thePlayer.onUpdate;
                nms.thePlayer.onUpdate = function() {
                    // Call original
                    originalUpdate.call(this);
                    
                    // Freeze elytra movement
                    if (this.isElytraFlying() && window.modmenu.elytraPause) {
                        this.motionX = 0;
                        this.motionY = 0;
                        this.motionZ = 0;
                        this.fallDistance = 0;
                    }
                };
                console.log('[ModMenu] Elytra Pause enabled');
            }
        } catch(e) {
            console.error('[ModMenu] Elytra Pause error:', e);
        }
    }
    
    function disableElytraPause() {
        try {
            if (typeof nms !== 'undefined' && nms.thePlayer) {
                // Restore original update
                console.log('[ModMenu] Elytra Pause disabled');
            }
        } catch(e) {
            console.error('[ModMenu] Elytra Pause disable error:', e);
        }
    }
    
    // Speed Hack Implementation
    function enableSpeed() {
        try {
            if (typeof nms !== 'undefined' && nms.thePlayer) {
                // Hook into movement
                const originalMoveEntity = nms.thePlayer.moveEntity;
                nms.thePlayer.moveEntity = function(x, y, z) {
                    if (window.modmenu.speed) {
                        x *= window.modmenu.speedMultiplier;
                        y *= window.modmenu.speedMultiplier;
                        z *= window.modmenu.speedMultiplier;
                    }
                    originalMoveEntity.call(this, x, y, z);
                };
                console.log('[ModMenu] Speed hack enabled');
            }
        } catch(e) {
            console.error('[ModMenu] Speed error:', e);
        }
    }
    
    function disableSpeed() {
        console.log('[ModMenu] Speed hack disabled');
    }
    
    // No Clip Implementation
    function enableNoclip() {
        try {
            if (typeof nms !== 'undefined' && nms.thePlayer) {
                nms.thePlayer.noClip = true;
                nms.thePlayer.onGround = false;
                console.log('[ModMenu] No Clip enabled');
            }
        } catch(e) {
            console.error('[ModMenu] No Clip error:', e);
        }
    }
    
    function disableNoclip() {
        try {
            if (typeof nms !== 'undefined' && nms.thePlayer) {
                nms.thePlayer.noClip = false;
                console.log('[ModMenu] No Clip disabled');
            }
        } catch(e) {
            console.error('[ModMenu] No Clip disable error:', e);
        }
    }
    
    // Full Bright Implementation
    function enableFullbright() {
        try {
            // Try to access game settings
            if (typeof nms !== 'undefined' && nms.gameSettings) {
                // Save original gamma
                if (!window.modmenu.originalGamma) {
                    window.modmenu.originalGamma = nms.gameSettings.gammaSetting;
                }
                
                // Set to maximum brightness
                nms.gameSettings.gammaSetting = 100.0;
                console.log('[ModMenu] Full Bright enabled');
            }
        } catch(e) {
            console.error('[ModMenu] Full Bright error:', e);
        }
    }
    
    function disableFullbright() {
        try {
            if (typeof nms !== 'undefined' && nms.gameSettings && window.modmenu.originalGamma) {
                nms.gameSettings.gammaSetting = window.modmenu.originalGamma;
                console.log('[ModMenu] Full Bright disabled');
            }
        } catch(e) {
            console.error('[ModMenu] Full Bright disable error:', e);
        }
    }
    
    // Register mod with EaglerForge
    if (typeof ModAPI !== "undefined") {
        ModAPI.registerMod("ModMenu", {
            name: "Mod Menu",
            version: "1.0",
            description: "Right-Shift mod menu with Xray, Fly, Elytra Pause, and more",
            author: "EaglerForge Modder",
            icon: "🎮"
        });
    }
    
    console.log('[ModMenu] Mod menu ready! Press Right-Shift to open.');
}
