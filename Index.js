const { Connection, PublicKey } = require('@solana/web3.js');

// --- 1. CONFIGURACIÓN ---
const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;

// IDs de programas (Limpios de espacios)
const RAYDIUM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const PUMP_ID = new PublicKey("6EF8rSrgU21pTvR7vy9LX9w7dq3ivlsfM47WJ2ARZP");

const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

let miSaldoSOL = 0.5;
const INVERSION_POR_TRADE = 0.05;

async function main() {
    console.log("---------------------------------------------");
    console.log("🚀 BOT REINICIADO Y CORREGIDO");
    console.log(`💼 SALDO: ${miSaldoSOL} SOL`);
    console.log("📡 Escaneando Raydium y Pump.fun...");
    console.log("---------------------------------------------");

    connection.onSlotChange((slot) => {
        if (slot.slot % 20 === 0) console.log(`💓 Latido: Bloque ${slot.slot}`);
    });

    // Radar Raydium
    connection.onLogs(RAYDIUM_ID, async ({ logs, err, signature }) => {
        if (err) return;
        if (logs.some(l => l.includes("initialize2") || l.includes("InitializeInstruction2"))) {
            console.log(`\n🚨 ¡NUEVO EN RAYDIUM! -> https://solscan.io/tx/${signature}`);
            ejecutarTrade(signature);
        }
    }, "processed");

    // Radar Pump.fun
    connection.onLogs(PUMP_ID, async ({ logs, err, signature }) => {
        if (err) return;
        if (logs.some(l => l.includes("Create"))) {
            console.log(`\n💊 ¡NUEVO EN PUMP.FUN! -> https://solscan.io/tx/${signature}`);
            ejecutarTrade(signature);
        }
    }, "processed");
}

function ejecutarTrade(sig) {
    if (miSaldoSOL < INVERSION_POR_TRADE) return;
    miSaldoSOL -= INVERSION_POR_TRADE;
    console.log(`🛒 Compra simulada de 0.05 SOL...`);
    
    setTimeout(() => {
        const win = Math.random() > 0.5;
        const profit = win ? INVERSION_POR_TRADE * 2 : 0;
        miSaldoSOL += profit;
        console.log(`🏁 Venta: ${win ? "✅ GANANCIA" : "❌ PÉRDIDA"} | Saldo: ${miSaldoSOL.toFixed(4)} SOL`);
    }, 10000); // 10 segundos para ver resultados rápido
}

main().catch(e => console.error("❌ ERROR:", e));
