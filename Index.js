const { Connection, PublicKey } = require('@solana/web3.js');

// --- 1. CONFIGURACIÓN DE RED ---
// PON AQUÍ TU API KEY DE HELIUS DENTRO DE LAS COMILLAS
const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 

const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const RAYDIUM_PROGRAM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");

const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

// --- 2. CONFIGURACIÓN DE TU CUENTA (SIMULADA) ---
let miSaldoSOL = 0.5; // Empezamos con 0.5 SOL
const INVERSION_POR_TRADE = 0.05; // Cuánto gasta el bot en cada moneda que sale

console.log("=============================================");
console.log(`💼 BILLETERA INICIAL: ${miSaldoSOL} SOL`);
console.log(`🔫 INVERSIÓN POR DISPARO: ${INVERSION_POR_TRADE} SOL`);
console.log("=============================================");
console.log("🩺 Conectando a Solana...");

async function main() {
    connection.onSlotChange((slotInfo) => {
        if (slotInfo.slot % 50 === 0) console.log(`💓 Buscando... (Bloque: ${slotInfo.slot})`);
    });

    connection.onLogs(
        RAYDIUM_PROGRAM_ID,
        async ({ logs, err, signature }) => {
            if (err) return;
            if (logs && logs.some(log => log.includes("initialize2"))) {
                console.log(`\n🚨 ¡NUEVA MONEDA DETECTADA!`);
                console.log(`🔗 Tx: https://solscan.io/tx/${signature}`);
                ejecutarTradeRealista(signature);
            }
        },
        "processed"
    );
}

async function ejecutarTradeRealista(signature) {
    try {
        // --- FASE 1: COMPRA SIMULADA ---
        if (miSaldoSOL < INVERSION_POR_TRADE) {
            console.log(`[SIMULACIÓN] 💸 Te has quedado sin dinero. Saldo: ${miSaldoSOL.toFixed(4)} SOL`);
            return;
        }

        // Restamos el dinero de tu cuenta
        miSaldoSOL -= INVERSION_POR_TRADE;
        console.log(`[SIMULACIÓN] 🛒 Comprando ${INVERSION_POR_TRADE} SOL de la nueva moneda...`);
        console.log(`[SIMULACIÓN] 🏦 Saldo restante temporal: ${miSaldoSOL.toFixed(4)} SOL`);

        // --- FASE 2: EXTRACCIÓN DEL CONTRATO ---
        console.log(`[SIMULACIÓN] 🔍 Escaneando blockchain para encontrar la dirección de la moneda...`);
        
        // Esperamos 5 segundos para asegurarnos de que Solana ha guardado la info
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const tx = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

        // Buscamos los tokens involucrados y descartamos el SOL (WSOL)
        const balances = tx?.meta?.postTokenBalances;
        const wsol = "So11111111111111111111111111111111111111112";
        const token = balances?.find(b => b.mint !== wsol);

        if (!token) {
             console.log(`[SIMULACIÓN] ❌ Error: No se pudo aislar el contrato. Devolviendo dinero.`);
             miSaldoSOL += INVERSION_POR_TRADE;
             return;
        }

        const tokenAddress = token.mint;
        console.log(`[SIMULACIÓN] 📝 CONTRATO ENCONTRADO: ${tokenAddress}`);
        console.log(`📈 Sigue el gráfico en vivo: https://dexscreener.com/solana/${tokenAddress}`);

        // --- FASE 3: ESPERA Y VENTA CON PRECIOS REALES ---
        // DexScreener tarda unos 60 segundos en crear el gráfico de una moneda que acaba de nacer.
        console.log(`[SIMULACIÓN] ⏳ Esperando 60 segundos para vender a precio de mercado real...`);
        await new Promise(resolve => setTimeout(resolve, 60000));

        // Llamamos a la API de DexScreener
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
        const data = await response.json();

        // Comprobamos si DexScreener ya tiene datos del token
        if (data && data.pairs && data.pairs.length > 0) {
            // Cogemos el rendimiento del token de los últimos 5 minutos (es un %)
            const rendimientoPorcentaje = data.pairs[0].priceChange.m5; 

            console.log(`[SIMULACIÓN] 📊 Rendimiento real de la moneda en su primer minuto: ${rendimientoPorcentaje}%`);

            // Calculamos cuánto dinero te devuelven según si subió o bajó
            const multiplicador = 1 + (rendimientoPorcentaje / 100);
            const dineroRecuperado = INVERSION_POR_TRADE * multiplicador;

            miSaldoSOL += dineroRecuperado; // Sumamos la ganancia (o pérdida) a tu cuenta
            
            console.log(`[SIMULACIÓN] 🏁 VENTA EJECUTADA.`);
            console.log(`[SIMULACIÓN] 💰 Ingresas: ${dineroRecuperado.toFixed(4)} SOL`);
            
            // Imprimir resumen si ganaste o perdiste
            if (rendimientoPorcentaje > 0) console.log("✅ ¡OPERACIÓN RENTABLE!");
            else console.log("❌ OPERACIÓN EN PÉRDIDAS.");

        } else {
             // Si DexScreener falló o no lo indexó a tiempo, cancelamos la operación
             console.log(`[SIMULACIÓN] ⚠️ DexScreener está saturado y no tiene el precio. Operación cancelada.`);
             miSaldoSOL += INVERSION_POR_TRADE;
        }

        console.log(`=============================================`);
        console.log(`💼 BILLETERA ACTUALIZADA: ${miSaldoSOL.toFixed(4)} SOL`);
        console.log(`=============================================\n`);

    } catch (error) {
        console.error("[SIMULACIÓN] ❌ Error en el proceso. Recuperando fondos.", error.message);
        miSaldoSOL += INVERSION_POR_TRADE; // Sistema de seguridad para no perder saldo ficticio por un error técnico
    }
}

main().catch(console.error);
