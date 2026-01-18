// ==================================================
// INFINITY CLIENT v2.1 — FIXED & RESTORED
// EaglerForge Utility / Combat Client
// ==================================================

const InfinityClient = {
    version: "2.1.0",
    features: {
        // Movement
        fly: false,
        speed: false,
        elytraPause: false,
        autoSprint: false,
        noFall: false,

        // Combat
        killaura: false,

        // Visual
        playerESP: false,
        mobESP: false,
        chestESP: false,
        fullbright: false,
        durabilityGUI: false,
        viaVersionViewer: false
    },
    settings: {
        speedMultiplier: 1.5,
        flySpeed: 0.4,
        killauraCPS: 8,
        killauraRange: 4.2,
        mobESPType: "all"
    },
    internal: {
        lastAttack: 0
    }
};

// ================= UI =================

ModAPI.addEventListener("load", () => {
    const style = document.createElement("style");
    style.textContent = `
        #icMenu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.92);
            border: 2px solid #4caf50;
            border-radius: 10px;
            width: 650px;
            max-height: 85vh;
            color: white;
            display: none;
            z-index: 999999;
            font-family: Arial;
        }
        #icHeader {
            padding: 14px;
            background: #4caf50;
            color: black;
            font-weight: bold;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        #icContent {
            padding: 14px;
            overflow-y: auto;
            max-height: 65vh;
        }
        .icToggle {
            padding: 8px;
            margin: 6px 0;
            background: rgba(255,255,255,0.05);
            border-radius: 6px;
        }
        .icToggle input {
            margin-right: 6px;
        }
        #icOpen {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4caf50;
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
            background: rgba(0,0,0,0.85);
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 13px;
            color: #4caf50;
            display: none;
            z-index: 999997;
            border: 1px solid #4caf50;
        }
        #mobESPInput {
            width: 100%;
            padding: 6px;
            background: #111;
            border: 1px solid #555;
            color: white;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML("beforeend", `
        <button id="icOpen">⚡ Infinity</button>
        <div id="icMenu">
            <div id="icHeader">Infinity Client v${InfinityClient.version}</div>
            <div id="icContent">

                <b>Movement</b>
                <div class="icToggle"><input type="checkbox" id="fly"> Fly</div>
                <div class="icToggle"><input type="checkbox" id="speed"> Speed</div>
                <div class="icToggle"><input type="checkbox" id="elytraPause"> Elytra Pause</div>
                <div class="icToggle"><input type="checkbox" id="autoSprint"> Auto Sprint</div>
                <div class="icToggle"><input type="checkbox" id="noFall"> No Fall</div>

                <hr>

                <b>Combat</b>
                <div class="icToggle"><input type="checkbox" id="killaura"> KillAura</div>

                <hr>

                <b>ESP</b>
                <div class="icToggle"><input type="checkbox" id="playerESP"> Player ESP (Tracers)</div>
                <div class="icToggle"><input type="checkbox" id="mobESP"> Mob ESP (Tracers)</div>
                <div class="icToggle">
                    Mob Type:
                    <input id="mobESPInput" value="all" placeholder="all, zombie, skeleton...">
                </div>
                <div class="icToggle"><input type="checkbox" id="chestESP"> Chest ESP</div>

                <hr>

                <b>Visual</b>
                <div class="icToggle"><input type="checkbox" id="fullbright"> Fullbright</div>
                <div class="icToggle"><input type="checkbox" id="durabilityGUI"> Durability GUI</div>
                <div class="icToggle"><input type="checkbox" id="viaVersionViewer"> ViaVersion Viewer (Cosmetic)</div>

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
        if (el) el.onchange = e => InfinityClient.features[k] = e.target.checked;
    });

    document.getElementById("mobESPInput").oninput = e => {
        InfinityClient.settings.mobESPType = e.target.value.toLowerCase();
    };

    ModAPI.displayToChat({ msg: "§a[Infinity] Loaded v2.1" });
});

// ================= ESP TRACERS =================

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

    // Elytra Pause (fixed)
    if (InfinityClient.features.elytraPause &&
        ModAPI.player.isElytraFlying &&
        ModAPI.player.isElytraFlying()) {

        ModAPI.player.motionX = 0;
        ModAPI.player.motionY = 0;
        ModAPI.player.motionZ = 0;
        ModAPI.player.onGround = true;
        ModAPI.player.fallDistance = 0;
        ModAPI.player.reload();
    }

    // KillAura (nearest entity only)
    if (InfinityClient.features.killaura) {
        const now = Date.now();
        const delay = 1000 / InfinityClient.settings.killauraCPS;
        if (now - InfinityClient.internal.lastAttack >= delay) {
            let closest = null;
            let dist = InfinityClient.settings.killauraRange;

            ModAPI.world.loadedEntityList.forEach(e => {
                if (!e || e === ModAPI.player || !e.getDistanceToEntity) return;
                const d = e.getDistanceToEntity(ModAPI.player);
                if (d < dist) {
                    dist = d;
                    closest = e;
                }
            });

            if (closest) {
                ModAPI.player.attackTargetEntityWithCurrentItem(closest);
                InfinityClient.internal.lastAttack = now;
            }
        }
    }

    // Durability GUI (fixed)
    const hud = document.getElementById("durabilityHUD");
    if (InfinityClient.features.durabilityGUI) {
        hud.style.display = "block";
        try {
            const item = ModAPI.player.inventory.getCurrentItem();
            if (item && item.getMaxDamage) {
                const left = item.getMaxDamage() - item.getItemDamage();
                hud.textContent = `Durability: ${left}`;
            } else hud.textContent = "No item";
        } catch {
            hud.textContent = "Durability error";
        }
    } else hud.style.display = "none";

    // ESP Tracers + Chest ESP
    tracerCtx.clearRect(0, 0, tracerCanvas.width, tracerCanvas.height);
    const cx = tracerCanvas.width / 2;
    const cy = tracerCanvas.height;

    ModAPI.world.loadedEntityList.forEach(e => {
        if (!e || e === ModAPI.player) return;

        const isPlayer = e.getName && e.getName();
        const isMob = !isPlayer && e.getName;
        const name = e.getName ? e.getName().toLowerCase() : "";

        if (InfinityClient.features.mobESP &&
            isMob &&
            (InfinityClient.settings.mobESPType === "all" ||
             name.includes(InfinityClient.settings.mobESPType))) {

            tracerCtx.strokeStyle = "#ff5555";
        } else if (InfinityClient.features.playerESP && isPlayer) {
            tracerCtx.strokeStyle = "#00ff99";
        } else return;

        tracerCtx.beginPath();
        tracerCtx.moveTo(cx, cy);
        tracerCtx.lineTo(
            cx + (e.posX - ModAPI.player.posX) * 4,
            cy - (e.posZ - ModAPI.player.posZ) * 4
        );
        tracerCtx.stroke();
    });
});

// ================= EXPORT =================
window.InfinityClient = InfinityClient;
console.log("[InfinityClient] Loaded v2.1");
