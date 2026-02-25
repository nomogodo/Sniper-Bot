const { Connection, PublicKey } = require('@solana/web3.js');

// --- 1. CONFIGURACIÓN ---
// Tu API Key limpia
const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e".trim(); 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;

// Función para crear llaves sin errores de espacios
const crearLlave = (texto) => new PublicKey(texto.trim());

const RAYDIUM_ID = crearLlave("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const PUMP_ID = crearLlave("6EF8rSrgU21pTvR7vy9LX9w7dq3ivlsfM47WJ2ARZP");

const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

let miSaldoSOL = 0.5;
const INVERSION_POR_TRADE = 0.05;

async function main() {
    console.log("---------------------------------------------");
    console.log("🚀 BOT REINICIADO - MODO BLINDADO");
    console.log(`💼 SALDO VIRTUAL: ${miSaldoSOL} SOL`);
    console.log("---------------------------------------------");

    connection.onSlotChange((slot) => {
        if (slot.slot % 20 === 0) console.log(`💓 Latido: Bloque ${slot.slot}`);
    });

    // Radar Raydium
    connection.onLogs(RAYDIUM_ID, async ({ logs, err, signature }) => {
        if (err) return;
        if (logs.some(l => l.includes("initialize2") || l.includes("InitializeInstruction2"))) {
            console.log(`\n🚨 ¡NUEVO EN RAYDIUM!`);
            ejecutarTrade(signature);
        }
    }, "processed");

    // Radar Pump.fun
    connection.onLogs(PUMP_ID, async ({ logs, err, signature }) => {
        if (err) return;
        if (logs.some(l => l.includes("Create"))) {
            console.log(`\n💊 ¡NUEVO EN PUMP.FUN!`);
            ejecutarTrade(signature);
        }
    }, "processed");
}

function ejecutarTrade(sig) {
    if (miSaldoSOL < INVERSION_POR_TRADE) return;
    miSaldoSOL -= INVERSION_POR_TRADE;
    console.log(`🛒 Compra: 0.05 SOL | Tx: ${sig.slice(0,10)}...`);
    
    setTimeout(() => {
        const win = Math.random() > 0.5;
        const profit = win ? INVERSION_POR_TRADE * 2 : 0;
        miSaldoSOL += profit;
        console.log(`🏁 Venta: ${win ? "✅ GANÓ" : "❌ PERDIÓ"} | Saldo: ${miSaldoSOL.toFixed(4)} SOL`);
    }, 10000); 
}

main().catch(e => console.error("❌ ERROR CRÍTICO:", e.message));
