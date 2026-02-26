const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios'); // La herramienta bien escrita

const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

const RAYDIUM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const PUMP_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

let saldo = 10; 
const INVERSION = 3; 
let operando = false; 

async function iniciar() {
    console.log("=========================================");
    console.log("🚦 MODO SEMÁFORO (AHORA CON AXIOS)");
    console.log(`💰 SALDO INICIAL: ${saldo} SOL | INVERSIÓN: ${INVERSION} SOL`);
    console.log("=========================================");

    connection.onSlotChange(() => { process.stdout.write("."); });

    connection.onLogs(RAYDIUM_ID, ({ logs, signature }) => {
        if (!operando && logs.some(l => l.includes("initialize2") || l.includes("InitializeInstruction2"))) {
            console.log(`\n🚨 [RAYDIUM] Detectado -> Tx: ${signature.slice(0, 10)}...`);
            ejecutarOperacionReal(signature);
        }
    }, "processed");

    connection.onLogs(PUMP_ID, ({ logs, signature }) => {
        if (!operando && logs.some(l => l.includes("Create"))) {
            console.log(`\n💊 [PUMP.FUN] Detectado -> Tx: ${signature.slice(0, 10)}...`);
            ejecutarOperacionReal(signature);
        }
    }, "processed");
}

async function ejecutarOperacionReal(firmaTx) {
    if (saldo < INVERSION) {
        console.log("💸 ¡BANCARROTA DEFINITIVA! Fin de la simulación.");
        process.exit();
    }
    
    operando = true; 
    saldo -= INVERSION;
    console.log(`🛒 Comprando ${INVERSION} SOL... (Saldo temporal en caja: ${saldo.toFixed(3)} SOL)`);
    console.log(`⏳ Esperando 60s. SEMÁFORO EN ROJO...`);

    setTimeout(async () => {
        try {
            const tx = await connection.getParsedTransaction(firmaTx, { maxSupportedTransactionVersion: 0 });
            const balances = tx?.meta?.postTokenBalances || [];
            const token = balances.find(b => b.mint !== "So11111111111111111111111111111111111111112");
            
            if (!token) {
                console.log("⚠️ Transacción ilegible. Devolviendo dinero.");
                saldo += INVERSION;
                console.log(`💼 SALDO ACTUALIZADO: ${saldo.toFixed(3)} SOL`);
                operando = false; 
                return;
            }

            console.log(`🔍 Buscando precio de: ${token.mint}`);
            
            const res = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${token.mint}`);
            const data = res.data;

            if (data.pairs && data.pairs.length > 0) {
                const porcentaje = data.pairs[0].priceChange.m5 || 0; 
                const multiplicador = 1 + (porcentaje / 100);
                const dineroRecuperado = INVERSION * multiplicador;
                
                saldo += dineroRecuperado;
                
                if (porcentaje > 0) {
                    console.log(`✅ ¡ÉXITO! +${porcentaje}% | 💼 SALDO BANCARIO: ${saldo.toFixed(3)} SOL`);
                } else {
                    console.log(`❌ PÉRDIDA. ${porcentaje}% | 💼 SALDO BANCARIO: ${saldo.toFixed(3)} SOL`);
                }
            } else {
                console.log(`💀 RUG PULL (Estafa). Pierdes los ${INVERSION} SOL.`);
                console.log(`💼 SALDO BANCARIO: ${saldo.toFixed(3)} SOL`);
            }

        } catch (error) {
            console.log(`⚠️ ERROR TÉCNICO: ${error.message}`);
            saldo += INVERSION;
            console.log(`💼 SALDO (Dinero devuelto por error): ${saldo.toFixed(3)} SOL`);
        }
        
        console.log("🟢 Semáforo en VERDE. Listo para el siguiente disparo...\n");
        operando = false; 

    }, 60000); 
}

iniciar().catch(err => console.error("❌ ERROR CRÍTICO:", err));
