// ==========================================
// CUSTOM CLIENT MOD FOR EAGLERFORGE (FULLY UPGRADED)
// Save this as: customclient.js
// ==========================================

const CustomClient = {
    version: "3.0.0",
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

    const style = document.createElement('style');
    style.textContent = `/* Your CSS with fixed emojis */`;
    document.head.appendChild(style);

    const menuHTML = `
        <div id="ccMenu">
            <h3>⚡ Custom Client v${CustomClient.version}</h3>
            <div class="cc-info"><strong>ℹ Info:</strong> Press <kbd>Right Shift</kbd> to toggle menu</div>
            <div class="cc-feature"><input type="checkbox" id="ccFly"><label for="ccFly">🕊️ Fly Mode</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccSpeed"><label for="ccSpeed">⚡ Speed Boost</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccNoFall"><label for="ccNoFall">🛡️ No Fall Damage</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccFullbright"><label for="ccFullbright">💡 Fullbright</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccXray"><label for="ccXray">⛏️ Xray</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccAutoSprint"><label for="ccAutoSprint">🏃 Auto Sprint</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccNoSlowdown"><label for="ccNoSlowdown">⛏️ No Slowdown</label></div>
            <!-- Advanced Features -->
            <div class="cc-feature"><input type="checkbox" id="ccKillaura"><label for="ccKillaura">⚔️ Killaura</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccAimBot"><label for="ccAimBot">🎯 AimBot</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccAutoTotem"><label for="ccAutoTotem">🛡️ Auto Totem</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccAutoCrystal"><label for="ccAutoCrystal">💥 Auto Crystal</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccPlayerESP"><label for="ccPlayerESP">👤 Player ESP</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccMobESP"><label for="ccMobESP">👾 Mob ESP</label></div>
            <div class="cc-feature"><input type="checkbox" id="ccChestESP"><label for="ccChestESP">📦 Chest ESP</label></div>
            <button id="ccClose" class="cc-btn cc-btn-close">✖ Close</button>
        </div>
        <button id="ccToggle">⚡ Client</button>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    setupEventListeners();

    ModAPI.displayToChat({ msg: `§a§l[Custom Client] §rv${CustomClient.version} loaded! Press §eRight Shift§r to open menu` });
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

    // Keyboard toggle: Right Shift
    document.addEventListener('keydown', e => {
        if (e.code === 'ShiftRight' && !e.ctrlKey && !e.altKey && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Feature checkboxes
    Object.keys(CustomClient.features).forEach(f => {
        const el = document.getElementById(`cc${capitalize(f)}`);
        if (el) el.onchange = e => {
            CustomClient.features[f] = e.target.checked;
            if(f === 'fullbright') applyFullbright(e.target.checked);
            if(f === 'xray') applyXray(e.target.checked);
            ModAPI.displayToChat({ msg: `§a[Client] ${capitalize(f)}: ${e.target.checked ? 'ON' : 'OFF'}` });
        };
    });
}

function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}

// ==================== Utilities ====================
function applyFullbright(enabled){
    if(ModAPI.mc && ModAPI.mc.gameSettings) ModAPI.mc.gameSettings.gammaSetting = enabled?100:1;
}

function applyXray(enabled){
    if(!ModAPI.world) return;
    ModAPI.world.forEachBlock((x,y,z,block)=>{
        if(!block) return;
        if(enabled){
            const ores = ["diamond_ore","gold_ore","iron_ore","emerald_ore","redstone_ore","lapis_ore","coal_ore"];
            block.visible = ores.includes(block.name);
        }else block.visible = true;
    });
}

// ==================== Tick / Main Loop ====================
let lastPlaceTime = 0;
let lastAttackTime = 0;
ModAPI.addEventListener("update", () => {
    if(!ModAPI.player) return;

    let motionMultiplier = 1;
    if(CustomClient.features.speed) motionMultiplier *= CustomClient.settings.speedMultiplier;
    if(CustomClient.features.noSlowdown && ModAPI.player.isUsingItem()) motionMultiplier *= 5;

    // Fly
    if(CustomClient.features.fly){
        ModAPI.player.motionY=0;
        if(ModAPI.mc.gameSettings.keyBindJump.pressed) ModAPI.player.motionY=CustomClient.settings.flySpeed;
        if(ModAPI.mc.gameSettings.keyBindSneak.pressed) ModAPI.player.motionY=-CustomClient.settings.flySpeed;
        ModAPI.player.onGround=true;
        ModAPI.player.fallDistance=0;
    }

    // Movement
    if(CustomClient.features.speed && (ModAPI.mc.gameSettings.keyBindForward.pressed || ModAPI.mc.gameSettings.keyBindBack.pressed || ModAPI.mc.gameSettings.keyBindLeft.pressed || ModAPI.mc.gameSettings.keyBindRight.pressed)){
        ModAPI.player.motionX *= motionMultiplier;
        ModAPI.player.motionZ *= motionMultiplier;
    }

    // NoFall
    if(CustomClient.features.noFall) ModAPI.player.fallDistance=0;

    // AutoSprint
    if(CustomClient.features.autoSprint && ModAPI.mc.gameSettings.keyBindForward.pressed && !ModAPI.player.isSprinting()){
        ModAPI.player.setSprinting(true);
    }

    // Fullbright
    if(CustomClient.features.fullbright) applyFullbright(true);

    // Xray
    if(CustomClient.features.xray) applyXray(true);

    // ==================== Combat Features ====================
    const now = Date.now();

    // AutoTotem
    if(CustomClient.features.autoTotem && ModAPI.player.health <= 4){
        ModAPI.player.switchToTotem();
    }

    // Killaura / AimBot
    if(CustomClient.features.killaura || CustomClient.features.aimBot){
        const targets = ModAPI.world.entities.filter(e => e.type === 'player' && e !== ModAPI.player && distance(ModAPI.player,e)<=CustomClient.settings.killauraRange);
        if(targets.length>0){
            const target = targets[0];
            if(CustomClient.features.aimBot) lookAtEntity(target);
            if(CustomClient.features.killaura && now - lastAttackTime >= 1000/CustomClient.settings.killauraCPS){
                ModAPI.player.attack(target);
                lastAttackTime=now;
            }
        }
    }

    // AutoCrystal
    if(CustomClient.features.autoCrystal){
        ModAPI.world.entities.filter(e=>e.type==='end_crystal').forEach(crystal=>{
            if(distance(ModAPI.player,crystal)<=5){
                ModAPI.player.attack(crystal);
            }
        });
    }

    // ESP
    if(CustomClient.features.playerESP){
        ModAPI.world.players.forEach(p=>p.setOutlineColor('red'));
    }
    if(CustomClient.features.mobESP){
        ModAPI.world.entities.filter(e=>e.type===CustomClient.settings.mobESPType).forEach(e=>e.setOutlineColor('green'));
    }
    if(CustomClient.features.chestESP){
        ModAPI.world.entities.filter(e=>e.type==='chest').forEach(e=>e.setOutlineColor('yellow'));
    }

    // FastPlace
    if(CustomClient.features.fastPlace && now - lastPlaceTime >= CustomClient.settings.fastPlaceDelay){
        ModAPI.player.placeBlock();
        lastPlaceTime = now;
    }

    // Scaffold / SafeWalk placeholder
    if(CustomClient.features.scaffold || CustomClient.features.safeWalk){
        // implement block check under player and movement adjustments
    }

    ModAPI.player.reload();
});

// ==================== Helpers ====================
function distance(p1,p2){
    return Math.sqrt(Math.pow(p1.posX-p2.posX,2)+Math.pow(p1.posY-p2.posY,2)+Math.pow(p1.posZ-p2.posZ,2));
}
function lookAtEntity(target){
    const dx = target.posX-ModAPI.player.posX;
    const dy = (target.posY+target.eyeHeight)-(ModAPI.player.posY+ModAPI.player.eyeHeight);
    const dz = target.posZ-ModAPI.player.posZ;
    const yaw = Math.atan2(dz,dx)*(180/Math.PI)-90;
    const pitch = -Math.atan2(dy,Math.sqrt(dx*dx+dz*dz))*(180/Math.PI);
    ModAPI.player.rotationYaw = yaw;
    ModAPI.player.rotationPitch = pitch;
}

if(typeof window!=='undefined') window.CustomClient = CustomClient;
console.log(`[Custom Client] Mod loaded successfully v${CustomClient.version}`);
