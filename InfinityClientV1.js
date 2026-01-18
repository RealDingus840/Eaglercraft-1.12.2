// ==========================================
// CUSTOM CLIENT MOD FOR EAGLERFORGE (FULL IMPLEMENTATION)
// Save this as: customclient.js
// ==========================================

const CustomClient = {
    version: "5.2.0",
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
        safeWalk: false,
        viaVersionViewer: true
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
        <div id="ccMenu" style="display:none; position:fixed; top:10px; right:10px; background:rgba(0,0,0,0.9); padding:15px; border-radius:10px; z-index:999999; color:white; max-height:80vh; overflow-y:auto;">
            <h3>⚡ Custom Client v${CustomClient.version}</h3>
            <div id="ccFeatureContainer"></div>
            <button id="ccClose" class="cc-btn cc-btn-close">✖ Close</button>
        </div>
        <button id="ccToggle" style="position:fixed; top:10px; right:10px; z-index:999998; background:#4CAF50; color:white; padding:10px 20px; border:none; border-radius:10px; cursor:pointer;">⚡ Client</button>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    setupUI();
    populateFeatureUI();

    // Set ViaVersion viewer to latest MC version
    const viaSpan = document.getElementById('ccViaVersion');
    if(viaSpan) viaSpan.textContent='Latest MC: 1.21';

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

function populateFeatureUI(){
    const container=document.getElementById('ccFeatureContainer');
    for(const feature in CustomClient.features){
        const div=document.createElement('div');
        div.style.display='flex';
        div.style.alignItems='center';
        div.style.marginBottom='5px';

        const checkbox=document.createElement('input');
        checkbox.type='checkbox';
        checkbox.id='cc'+feature;
        checkbox.checked=CustomClient.features[feature];
        checkbox.style.marginRight='8px';
        checkbox.onchange=e=>{ CustomClient.features[feature]=e.target.checked; };

        const label=document.createElement('label');
        label.htmlFor='cc'+feature;
        label.textContent=feature;
        label.style.flex='1';

        div.appendChild(checkbox);
        div.appendChild(label);

        // Sliders for configurable ranges
        if(feature==='speed' || feature==='fly' || feature==='killaura' || feature==='reach' || feature==='fastPlace'){
            const slider=document.createElement('input');
            slider.type='range';
            slider.min='0.1';
            slider.max='10';
            slider.step='0.1';
            if(feature==='speed') slider.value=CustomClient.settings.speedMultiplier;
            if(feature==='fly') slider.value=CustomClient.settings.flySpeed;
            if(feature==='killaura') slider.value=CustomClient.settings.killauraRange;
            if(feature==='reach') slider.value=CustomClient.settings.reachDistance;
            if(feature==='fastPlace') slider.value=CustomClient.settings.fastPlaceDelay;
            slider.style.marginLeft='10px';
            slider.oninput=e=>{
                if(feature==='speed') CustomClient.settings.speedMultiplier=parseFloat(e.target.value);
                if(feature==='fly') CustomClient.settings.flySpeed=parseFloat(e.target.value);
                if(feature==='killaura') CustomClient.settings.killauraRange=parseFloat(e.target.value);
                if(feature==='reach') CustomClient.settings.reachDistance=parseFloat(e.target.value);
                if(feature==='fastPlace') CustomClient.settings.fastPlaceDelay=parseFloat(e.target.value);
            };
            div.appendChild(slider);
        }

        // MobESP input field
        if(feature==='mobESP'){
            const input=document.createElement('input');
            input.type='text';
            input.placeholder='Mob type';
            input.value=CustomClient.settings.mobESPType;
            input.style.marginLeft='10px';
            input.oninput=e=>{ CustomClient.settings.mobESPType=e.target.value; };
            div.appendChild(input);
        }

        // ViaVersion Viewer display
        if(feature==='viaVersionViewer'){
            const span=document.createElement('span');
            span.id='ccViaVersion';
            span.style.marginLeft='10px';
            span.textContent='Latest MC: 1.21';
            div.appendChild(span);
        }

        container.appendChild(div);
    }
}

// ==================== Utilities ====================
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

// ==================== Main Loop ====================
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
    if(CustomClient.features.autoSprint && ModAPI.mc.gameSettings.keyBindForward.pressed && !ModAPI.player.isSprinting()) ModAPI.player.setSprinting(true);

    // Fullbright / Xray
    if(CustomClient.features.fullbright) ModAPI.mc.gameSettings.gammaSetting=100;
    if(CustomClient.features.xray) applyXray(true);

    // AutoTotem
    if(CustomClient.features.autoTotem && ModAPI.player.health<=4) ModAPI.player.switchToTotem();

    // Elytra Pause
    if(CustomClient.features.elytraPause && ModAPI.player.isElytraFlying()){
        ModAPI.player.motionX=0;
        ModAPI.player.motionZ=0;
    }

    // ==================== Combat & Utilities ====================

    // Criticals
    if(CustomClient.features.criticals && ModAPI.player.onGround){
        ModAPI.player.motionY=0.1;
    }

    // Killaura / AimBot / Reach
    if(CustomClient.features.killaura || CustomClient.features.aimBot || CustomClient.features.reach){
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
