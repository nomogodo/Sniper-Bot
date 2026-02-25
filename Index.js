const { Connection, PublicKey } = require('@solana/web3.js');


const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 

// Construimos las direcciones VIP
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;

const RAYDIUM_PROGRAM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");

// Conexión
const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

console.log("---------------------------------------------");
console.log("🩺 DIAGNÓSTICO: Usando RPC Privado (Helius)");
console.log("🔌 Conectando...");
console.log("---------------------------------------------");

async function main() {
    // Monitor de Latido (Para ver si funciona)
    connection.onSlotChange((slotInfo) => {
        // Solo imprimimos cada 50 bloques para no llenar la pantalla
        if (slotInfo.slot % 50 === 0) {
            console.log(`💓 Conexión estable. Bloque actual: ${slotInfo.slot}`);
        }
    });

    console.log("👁️ Escuchando Raydium...");
    
    connection.onLogs(
        RAYDIUM_PROGRAM_ID,
        async ({ logs, err, signature }) => {
            if (err) return;
            if (logs && logs.some(log => log.includes("initialize2"))) {
                console.log(`\n🚨 ¡NUEVO TOKEN DETECTADO!`);
                console.log(`🔗 https://solscan.io/tx/${signature}`);
                simularTrade();
            }
        },
        "processed"
    );
}

function simularTrade() {
    console.log(`[SIMULACIÓN] 🛒 Compra simulada ejecutada.`);
    // Lógica simple de simulación
    setTimeout(() => console.log(`[SIMULACIÓN] 🏁 Operación cerrada (Ficticia)`), 5000);
}

main().catch(console.error);
