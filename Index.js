const { Connection, PublicKey } = require('@solana/web3.js');

// 1. TU LLAVE (Limpiada automáticamente)
const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e".replace(/\s/g, ''); 

// 2. CONEXIÓN
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

// 3. DIRECCIONES (Limpiadas de cualquier espacio invisible)
const RAYDIUM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8".trim());
const PUMP_ID = new PublicKey("6EF8rSrgU21pTvR7vy9LX9w7dq3ivlsfM47WJ2ARZP".trim());

let saldo = 0.5;

async function iniciar() {
    console.log("-----------------------------------------");
    console.log("🔥 MODO SUPERVIVENCIA ACTIVADO");
    console.log(`💰 SALDO INICIAL: ${saldo} SOL`);
    console.log("-----------------------------------------");

    // Latido corto para ver que hay vida
    connection.onSlotChange(() => {
        process.stdout.write("."); // Solo pondrá un punto cada bloque para no agobiar
    });

    // Escuchar Raydium
    connection.onLogs(RAYDIUM_ID, ({ logs }) => {
        if (logs.some(l => l.includes("initialize2"))) {
            console.log("\n🚨 ¡RAYDIUM!");
            ejecutar();
        }
    }, "processed");

    // Escuchar Pump.fun
    connection.onLogs(PUMP_ID, ({ logs }) => {
        if (logs.some(l => l.includes("Create"))) {
            console.log("\n💊 ¡PUMP.FUN!");
            ejecutar();
        }
    }, "processed");
}

function ejecutar() {
    if (saldo < 0.05) return;
    saldo -= 0.05;
    console.log("🛒 Comprando... Saldo: " + saldo.toFixed(3));
    setTimeout(() => {
        saldo += 0.07; // Simulamos ganancia rápida
        console.log("✅ Vendido. Saldo: " + saldo.toFixed(3));
    }, 5000);
}

iniciar().catch(err => console.error("❌ ERROR:", err.message));
