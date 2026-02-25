const { Connection, PublicKey } = require('@solana/web3.js');

// Configuración de red (RPC Público)
const RPC_URL = "https://api.mainnet-beta.solana.com";
const WSS_URL = "wss://api.mainnet-beta.solana.com";
const RAYDIUM_PROGRAM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");

const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

console.log("---------------------------------------------");
console.log("🚀 BOT INICIADO DESDE GITHUB + REPLIT");
console.log("💰 MODO: SIMULACIÓN (Sin riesgo)");
console.log("📡 Escuchando Raydium...");
console.log("---------------------------------------------");

async function main() {
    connection.onLogs(
        RAYDIUM_PROGRAM_ID,
        async ({ logs, err, signature }) => {
            if (err) return;

            // Detectar 'initialize2' (Nuevo Pool)
            if (logs && logs.some(log => log.includes("initialize2"))) {
                console.log(`\n🚨 NUEVA LIQUIDEZ DETECTADA!`);
                console.log(`🔗 https://solscan.io/tx/${signature}`);
                simularTrade();
            }
        },
        "processed"
    );
}

function simularTrade() {
    const precioFalso = (Math.random() * 0.0001).toFixed(9);
    console.log(`[SIMULACIÓN] 🛒 Compra ficticia a ${precioFalso} SOL`);
    
    setTimeout(() => {
        const resultado = Math.random() > 0.4 ? "✅ PROFIT" : "❌ LOSS"; // 60% chance de ganar ficticio
        console.log(`[SIMULACIÓN] ⏱️ Venta ficticia tras 10s: ${resultado}`);
    }, 10000);
}

main().catch(console.error);
