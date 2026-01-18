// ==========================================
// CUSTOM CLIENT MOD FOR EAGLERFORGE (FINAL CLEANED-UP + TOGGLE BUTTON)
// Save this as: customclient.js
// ==========================================

const CustomClient = {
    version: "4.2.0",
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
        fastPlace: false,
        antiAim: false,
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
        safeWalkMode: 'stop',
        mobESPType: 'zombie'
    },
    ui: { menuVisible: false }
};

// ==================== UI ====================
ModAPI.addEventListener("load", () => {
    console.log(`[Custom Client] Loading v${CustomClient.version}`);

    const menuHTML = `
        <div id="ccMenu" style="display:none; position:fixed; top:10px; right:10px; background:rgba(0,0,0,0.9); padding:15px; border-radius:10px; z-index:999999; color:white;">
            <h3>⚡ Custom Client v${CustomClient.version}</h3>
            <!-- Feature checkboxes will be added here -->
            <button id="ccClose" class="cc-btn cc-btn-close">✖ Close</button>
        </div>
        <button id="ccToggle" style="position:fixed; top:10px; right:10px; z-index:999998; background:#4CAF50; color:white; padding:10px 20px; border:none; border-radius:10px; cursor:pointer;">⚡ Client</button>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    setupUI();

    // Ensure toggle button always visible
    document.getElementById('ccToggle').style.display='block';

    console.log('[Custom Client] UI initialized');
});

function setupUI(){
    const menu=document.getElementById('ccMenu');
    const toggleBtn=document.getElementById('ccToggle');
    const closeBtn=document.getElementById('ccClose');

    function toggleMenu(){
        CustomClient.ui.menuVisible=!CustomClient.ui.menuVisible;
        menu.style.display=CustomClient.ui.menuVisible?'block':'none';
    }

    toggleBtn.onclick=toggleMenu;
    closeBtn.onclick=toggleMenu;
}

// ==================== Utilities ====================
function applyFullbright(enabled){
    if(ModAPI.mc && ModAPI.mc.gameSettings) ModAPI.mc.gameSettings.gammaSetting=enabled?100:1;
}

function applyXray(enabled){
    if(!ModAPI.world) return;
    ModAPI.world.forEachBlock((x,y,z,block)=>{
        if(!block) return;
        const ores=["diamond_ore","gold_ore","iron_ore","emerald_ore","redstone_ore","lapis_ore","coal_ore"];
        block.visible=enabled?ores.includes(block.name):true;
    });
}

function distance(p1,p2){
    return Math.sqrt(Math.pow(p1.posX-p2.posX,2)+Math.pow(p1.posY-p2.posY,2)+Math.pow(p1.posZ-p2.posZ,2));
}

function lookAtEntity(target){
    const dx=target.posX-ModAPI.player.posX;
    const dy=(target.posY+target.eyeHeight)-(ModAPI.player.posY+ModAPI.player.eyeHeight);
    const dz=target.posZ-ModAPI.player.posZ;
    ModAPI.player.rotationYaw=Math.atan2(dz,dx)*(180/Math.PI)-90;
    ModAPI.player.rotationPitch=-Math.atan2(dy,Math.sqrt(dx*dx+dz*dz))*(180/Math.PI);
}

// ==================== Tick / Main Loop ====================
let lastPlaceTime=0,lastAttackTime=0;
ModAPI.addEventListener("update",()=>{
    if(!ModAPI.player) return;

    const now=Date.now();

    // Fly
    if(CustomClient.features.fly){
        ModAPI.player.motionY=0;
        if(ModAPI.mc.gameSettings.keyBindJump.pressed) ModAPI.player.motionY=CustomClient.settings.flySpeed;
        if(ModAPI.mc.gameSettings.keyBindSneak.pressed) ModAPI.player.motionY=-CustomClient.settings.flySpeed;
        ModAPI.player.onGround=true;
        ModAPI.player.fallDistance=0;
    }

    // Speed / NoSlowdown
    let motionMultiplier=1;
    if(CustomClient.features.speed) motionMultiplier*=CustomClient.settings.speedMultiplier;
    if(CustomClient.features.noSlowdown && ModAPI.player.isUsingItem()) motionMultiplier*=5;
    ModAPI.player.motionX*=motionMultiplier;
    ModAPI.player.motionZ*=motionMultiplier;

    // NoFall
    if(CustomClient.features.noFall) ModAPI.player.fallDistance=0;

    // AutoSprint
    if(CustomClient.features.autoSprint && ModAPI.mc.gameSettings.keyBindForward.pressed && !ModAPI.player.isSprinting()){
        ModAPI.player.setSprinting(true);
    }

    // Fullbright / Xray
    if(CustomClient.features.fullbright) applyFullbright(true);
    if(CustomClient.features.xray) applyXray(true);

    // AutoTotem
    if(CustomClient.features.autoTotem && ModAPI.player.health<=4) ModAPI.player.switchToTotem();

    // Elytra Pause
    if(CustomClient.features.elytraPause && ModAPI.player.isElytraFlying()){
        ModAPI.player.motionX=0;
        ModAPI.player.motionZ=0;
    }

    // Reach / Criticals
    if(CustomClient.features.reach || CustomClient.features.criticals){
        if(CustomClient.features.criticals && ModAPI.player.onGround){
            ModAPI.player.motionY=0.1;
        }
    }

    // Killaura / AimBot
    if(CustomClient.features.killaura || CustomClient.features.aimBot){
        const targets=ModAPI.world.entities.filter(e=>e.type==='player' && e!==ModAPI.player && distance(ModAPI.player,e)<=CustomClient.settings.killauraRange);
        if(targets.length>0){
            const target=targets[0];
            if(CustomClient.features.aimBot) lookAtEntity(target);
            if(CustomClient.features.killaura && now-lastAttackTime>=1000/CustomClient.settings.killauraCPS){
                ModAPI.player.attack(target);
                lastAttackTime=now;
            }
        }
    }

    // AutoCrystal
    if(CustomClient.features.autoCrystal){
        ModAPI.world.entities.filter(e=>e.type==='end_crystal' && distance(ModAPI.player,e)<=5).forEach(c=>ModAPI.player.attack(c));
    }

    // ESP
    if(CustomClient.features.playerESP) ModAPI.world.players.forEach(p=>p.setOutlineColor('red'));
    if(CustomClient.features.mobESP) ModAPI.world.entities.filter(e=>e.type===CustomClient.settings.mobESPType).forEach(e=>e.setOutlineColor('green'));
    if(CustomClient.features.chestESP) ModAPI.world.entities.filter(e=>e.type==='chest').forEach(e=>e.setOutlineColor('yellow'));

    // FastPlace
    if(CustomClient.features.fastPlace && now-lastPlaceTime>=CustomClient.settings.fastPlaceDelay){
        ModAPI.player.placeBlock();
        lastPlaceTime=now;
    }

    // Scaffold / SafeWalk
    if(CustomClient.features.scaffold || CustomClient.features.safeWalk){
        const blockBelow=ModAPI.world.getBlock(Math.floor(ModAPI.player.posX),Math.floor(ModAPI.player.posY-1),Math.floor(ModAPI.player.posZ));
        if(CustomClient.features.scaffold && !blockBelow) ModAPI.player.placeBlockBelow();
        if(CustomClient.features.safeWalk){
            if(CustomClient.settings.safeWalkMode==='stop' && !blockBelow){
                ModAPI.player.motionX=0;
                ModAPI.player.motionZ=0;
            }else if(CustomClient.settings.safeWalkMode==='crouch' && !blockBelow){
                ModAPI.player.setSneaking(true);
            }
        }
    }

    ModAPI.player.reload();
});

if(typeof window!=='undefined') window.CustomClient=CustomClient;
console.log(`[Custom Client] Mod loaded successfully v${CustomClient.version}`);
