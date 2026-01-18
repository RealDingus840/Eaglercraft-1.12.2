// ==================================================
// INFINITY CLIENT v2.0 (EAGLERFORGE)
// Clean, honest, and functional utility client
// ==================================================

const InfinityClient = {
    version: "2.0.0",
    features: {
        fly: false,
        speed: false,
        elytraPause: false,
        autoSprint: false,
        noFall: false,

        killaura: false,
        fastPlace: false,

        tracerPlayers: false,
        tracerMobs: false,

        fullbright: false,
        durabilityGUI: false,

        modernVisuals: false
    },
    settings: {
        speedMultiplier: 1.5,
        flySpeed: 0.4,
        killauraCPS: 8,
        fastPlaceDelay: 0
    },
    internal: {
        lastAttack: 0
    }
};

// ================= UI LOAD =================

ModAPI.addEventListener("load", () => {
    const style = document.createElement("style");
    style.textContent = `
        #icMenu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            border: 2px solid #00ff99;
            border-radius: 10px;
            width: 600px;
            max-height: 80vh;
            color: white;
            display: none;
            z-index: 999999;
            font-family: Arial;
        }
        #icHeader {
            padding: 12px;
            background: #00ff99;
            color: black;
            font-weight: bold;
            text-align: center;
        }
        #icContent {
            padding: 12px;
            overflow-y: auto;
            max-height: 65vh;
        }
        .icToggle {
            padding: 8px;
            margin: 6px 0;
            background: rgba(255,255,255,0.05);
            border-radius: 6px;
            cursor: pointer;
        }
        #icOpen {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #00ff99;
            color: black;
            border: none;
            padding: 10px 18px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            z-index: 999998;
        }
        #durabilityHUD {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            padding: 8px;
            border-radius: 6px;
            font-size: 12px;
            display: none;
            z-index: 999997;
        }
    `;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML("beforeend", `
        <button id="icOpen">⚡ Infinity</button>
        <div id="icMenu">
            <div id="icHeader">Infinity Client v${InfinityClient.version}</div>
            <div id="icContent">
                <div class="icToggle"><input type="checkbox" id="fly"> Fly</div>
                <div class="icToggle"><input type="checkbox" id="speed"> Speed</div>
                <div class="icToggle"><input type="checkbox" id="elytraPause"> Elytra Pause</div>
                <div class="icToggle"><input type="checkbox" id="autoSprint"> Auto Sprint</div>
                <div class="icToggle"><input type="checkbox" id="noFall"> No Fall</div>

                <hr>

                <div class="icToggle"><input type="checkbox" id="killaura"> KillAura</div>
                <div class="icToggle"><input type="checkbox" id="fastPlace"> Fast Place</div>

                <hr>

                <div class="icToggle"><input type="checkbox" id="tracerPlayers"> Player Tracers</div>
                <div class="icToggle"><input type="checkbox" id="tracerMobs"> Mob Tracers</div>

                <hr>

                <div class="icToggle"><input type="checkbox" id="fullbright"> Fullbright</div>
                <div class="icToggle"><input type="checkbox" id="durabilityGUI"> Durability HUD</div>
                <div class="icToggle"><input type="checkbox" id="modernVisuals"> Modern Visuals (1.12+)</div>
            </div>
        </div>
        <div id="durabilityHUD"></div>
    `);

    document.getElementById("icOpen").onclick = () => {
        const m = document.getElementById("icMenu");
        m.style.display = m.style.display === "block" ? "none" : "block";
    };

    Object.keys(InfinityClient.features).forEach(k => {
        const el = document.getElementById(k);
        if (el) {
            el.onchange = e => InfinityClient.features[k] = e.target.checked;
        }
    });

    ModAPI.displayToChat({ msg: "§a[Infinity] Loaded v2.0" });
});

// ================= TRACER ESP =================

const tracerCanvas = document.createElement("canvas");
tracerCanvas.style.position = "fixed";
tracerCanvas.style.pointerEvents = "none";
tracerCanvas.style.zIndex = "999996";
document.body.appendChild(tracerCanvas);
const tracerCtx = tracerCanvas.getContext("2d");

function resizeTracer() {
    tracerCanvas.width = innerWidth;
    tracerCanvas.height = innerHeight;
}
window.addEventListener("resize", resizeTracer);
resizeTracer();

// ================= MAIN LOOP =================

ModAPI.addEventListener("update", () => {
    ModAPI.require("player");
    if (!ModAPI.player) return;

    // Fly
    if (InfinityClient.features.fly) {
        ModAPI.player.motionY = 0;
        if (ModAPI.mc.gameSettings.keyBindJump.pressed)
            ModAPI.player.motionY = InfinityClient.settings.flySpeed;
        if (ModAPI.mc.gameSettings.keyBindSneak.pressed)
            ModAPI.player.motionY = -InfinityClient.settings.flySpeed;
        ModAPI.player.onGround = true;
        ModAPI.player.reload();
    }

    // Speed (fixed)
    if (InfinityClient.features.speed) {
        const yaw = ModAPI.player.rotationYaw * Math.PI / 180;
        const spd = 0.1 * InfinityClient.settings.speedMultiplier;
        if (ModAPI.mc.gameSettings.keyBindForward.pressed) {
            ModAPI.player.motionX = -Math.sin(yaw) * spd;
            ModAPI.player.motionZ =  Math.cos(yaw) * spd;
            ModAPI.player.reload();
        }
    }

    // Elytra Pause
    if (InfinityClient.features.elytraPause &&
        ModAPI.player.isElytraFlying && ModAPI.player.isElytraFlying()) {
        ModAPI.player.motionX = 0;
        ModAPI.player.motionY = 0;
        ModAPI.player.motionZ = 0;
        ModAPI.player.reload();
    }

    // Auto Sprint
    if (InfinityClient.features.autoSprint &&
        ModAPI.mc.gameSettings.keyBindForward.pressed) {
        ModAPI.player.setSprinting(true);
    }

    // No Fall
    if (InfinityClient.features.noFall) {
        ModAPI.player.fallDistance = 0;
    }

    // KillAura (timed)
    if (InfinityClient.features.killaura) {
        const now = Date.now();
        const delay = 1000 / InfinityClient.settings.killauraCPS;
        if (now - InfinityClient.internal.lastAttack >= delay) {
            try {
                ModAPI.world.loadedEntityList.forEach(e => {
                    if (e !== ModAPI.player && e.attackEntityFrom) {
                        ModAPI.player.attackTargetEntityWithCurrentItem(e);
                        InfinityClient.internal.lastAttack = now;
                    }
                });
            } catch {}
        }
    }

    // Fast Place
    if (InfinityClient.features.fastPlace && ModAPI.mc) {
        ModAPI.mc.rightClickDelayTimer = InfinityClient.settings.fastPlaceDelay;
    }

    // Fullbright
    if (InfinityClient.features.fullbright) {
        ModAPI.mc.gameSettings.gammaSetting = 100;
    }

    // Durability HUD
    const hud = document.getElementById("durabilityHUD");
    if (InfinityClient.features.durabilityGUI) {
        hud.style.display = "block";
        try {
            const item = ModAPI.player.inventory.getCurrentItem();
            if (item && item.getMaxDamage) {
                hud.textContent =
                    "Durability: " +
                    (item.getMaxDamage() - item.getItemDamage());
            }
        } catch {}
    } else hud.style.display = "none";

    // Tracers
    tracerCtx.clearRect(0, 0, tracerCanvas.width, tracerCanvas.height);
    if (InfinityClient.features.tracerPlayers || InfinityClient.features.tracerMobs) {
        const cx = tracerCanvas.width / 2;
        const cy = tracerCanvas.height;
        ModAPI.world.loadedEntityList.forEach(e => {
            if (!e || e === ModAPI.player) return;
            const isPlayer = e.getName && e.getName();
            if (isPlayer && !InfinityClient.features.tracerPlayers) return;
            if (!isPlayer && !InfinityClient.features.tracerMobs) return;

            tracerCtx.strokeStyle = isPlayer ? "#00ff99" : "#ff4444";
            tracerCtx.beginPath();
            tracerCtx.moveTo(cx, cy);
            tracerCtx.lineTo(
                cx + (e.posX - ModAPI.player.posX) * 4,
                cy - (e.posZ - ModAPI.player.posZ) * 4
            );
            tracerCtx.stroke();
        });
    }
});

// ================= EXPORT =================
window.InfinityClient = InfinityClient;
console.log("[InfinityClient] Loaded v2.0");
