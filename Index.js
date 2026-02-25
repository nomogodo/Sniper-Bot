const { Connection, PublicKey } = require('@solana/web3.js');

// 1. TU LLAVE 
const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 

// 2. CONEXIÓN
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

// 3. DIRECCIONES (¡AHORA SÍ, LA REAL DE PUMP.FUN!)
const RAYDIUM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const PUMP_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

let saldo = 0.5;

async function iniciar() {
    console.log("-----------------------------------------");
    console.log("🔥 BOT REINICIADO (CON EL ID REAL)");
    console.log(`💰 SALDO INICIAL: ${saldo} SOL`);
    console.log("-----------------------------------------");

    // Latido corto
    connection.onSlotChange(() => {
        process.stdout.write("."); // Un punto por bloque
    });

    // Escuchar Raydium
    connection.onLogs(RAYDIUM_ID, ({ logs }) => {
        if (logs.some(l => l.includes("initialize2") || l.includes("InitializeInstruction2"))) {
            console.log("\n🚨 ¡NUEVO EN RAYDIUM!");
            ejecutar();
        }
    }, "processed");

    // Escuchar Pump.fun
    connection.onLogs(PUMP_ID, ({ logs }) => {
        if (logs.some(l => l.includes("Create"))) {
            console.log("\n💊 ¡NUEVO EN PUMP.FUN!");
            ejecutar();
        }
    }, "processed");
}

function ejecutar() {
    if (saldo < 0.05) return;
    saldo -= 0.05;
    console.log("🛒 Comprando 0.05 SOL... Saldo: " + saldo.toFixed(3));
    
    setTimeout(() => {
        saldo += 0.07; // Simulamos ganancia rápida
        console.log("✅ Vendido. Saldo actual: " + saldo.toFixed(3) + " SOL");
    }, 5000);
}

iniciar().catch(err => console.error("\n❌ ERROR:", err.message));
