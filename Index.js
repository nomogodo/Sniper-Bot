const { Connection, PublicKey } = require('@solana/web3.js');

// --- 1. CONFIGURACIÓN ---
const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;

const RAYDIUM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const PUMP_ID = new PublicKey("6EF8rSrgU21pTvR7vy9LX9w7dq3ivlsfM47WJ2ARZP");

const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

let miSaldoSOL = 0.5;
const INVERSION_POR_TRADE = 0.05;

// --- 2. LÓGICA DE DETECCIÓN ---
async function main() {
    console.log("---------------------------------------------");
    console.log("🚀 BOT ACTIVADO Y LISTO");
    console.log(`💼 SALDO: ${miSaldoSOL} SOL | RIESGO: ${INVERSION_POR_TRADE} SOL`);
    console.log("📡 Escaneando Raydium y Pump.fun...");
    console.log("---------------------------------------------");

    // Latido para saber que la conexión no ha muerto
    connection.onSlotChange((slot) => {
        if (slot.slot % 20 === 0) console.log(`💓 Latido: Bloque ${slot.slot} (Buscando...)`);
    });

    // Radar Raydium
    connection.onLogs(RAYDIUM_ID, async ({ logs, err, signature }) => {
        if (err) return;
        if (logs.some(l => l.includes("initialize2") || l.includes("InitializeInstruction2"))) {
            console.log(`\n🚨 NUEVA LIQUIDEZ EN RAYDIUM!`);
            ejecutarTradeRealista(signature);
        }
    }, "processed");

    // Radar Pump.fun
    connection.onLogs(PUMP_ID, async ({ logs, err, signature }) => {
        if (err) return;
        if (logs.some(l => l.includes("Create"))) {
            console.log(`\n💊 NUEVO TOKEN EN PUMP.FUN!`);
            ejecutarTradeRealista(signature);
        }
    }, "processed");
}

// --- 3. LÓGICA DE SIMULACIÓN ---
async function ejecutarTradeRealista(signature) {
    if (miSaldoSOL < INVERSION_POR_TRADE) return;
    
    miSaldoSOL -= INVERSION_POR_TRADE;
    console.log(`🛒 Compra ejecutada. Tx: ${signature}`);
    console.log(`⏳ Analizando mercado (Espera de 60s)...`);

    // Simulamos la espera para ver el precio real en DexScreener
    setTimeout(async () => {
        const resultado = Math.random() > 0.5 ? 1.5 : 0.5; // Simulación simple por ahora para confirmar que funciona
        const retorno = INVERSION_POR_TRADE * resultado;
        miSaldoSOL += retorno;
        
        console.log(`🏁 Venta completada. Saldo actual: ${miSaldoSOL.toFixed(4)} SOL`);
    }, 60000);
}

main().catch(e => console.error("❌ ERROR CRÍTICO:", e));
