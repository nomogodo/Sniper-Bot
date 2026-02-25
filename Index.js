const { Connection, PublicKey } = require('@solana/web3.js');

const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

const RAYDIUM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const PUMP_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

// TUS CANTIDADES
let saldo = 1.5; 
const INVERSION = 0.5; 

let operando = false; // EL SEMÁFORO VITAL

async function iniciar() {
    console.log("=========================================");
    console.log("🚦 MODO SEMÁFORO (TUS CANTIDADES)");
    console.log(`💰 SALDO BANCARIO: ${saldo} SOL | INVERSIÓN: ${INVERSION} SOL`);
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
    
    operando = true; // SEMÁFORO ROJO: Ignora el resto de tokens que salgan
    saldo -= INVERSION;
    console.log(`🛒 Comprando ${INVERSION} SOL... (Saldo en espera: ${saldo.toFixed(3)} SOL)`);
    console.log(`⏳ Esperando 60s. SEMÁFORO EN ROJO (Ignorando la basura de Pump.fun)...`);

    setTimeout(async () => {
        try {
            const tx = await connection.getParsedTransaction(firmaTx, { maxSupportedTransactionVersion: 0 });
            const balances = tx?.meta?.postTokenBalances || [];
            const token = balances.find(b => b.mint !== "So11111111111111111111111111111111111111112");
            
            if (!token) {
                console.log("⚠️ Transacción ilegible. Devolviendo dinero.");
                saldo += INVERSION;
                operando = false; 
                return;
            }

            console.log(`🔍 Evaluando precio del token: ${token.mint}`);
            const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.mint}`);
            const data = await res.json();

            if (data.pairs && data.pairs.length > 0) {
                const porcentaje = data.pairs[0].priceChange.m5 || 0; 
                const multiplicador = 1 + (porcentaje / 100);
                const dineroRecuperado = INVERSION * multiplicador;
                
                saldo += dineroRecuperado;
                
                if (porcentaje > 0) {
                    console.log(`✅ ¡ÉXITO! +${porcentaje}% | Saldo total: ${saldo.toFixed(3)} SOL`);
                } else {
                    console.log(`❌ PÉRDIDA. ${porcentaje}% | Saldo total: ${saldo.toFixed(3)} SOL`);
                }
            } else {
                console.log(`💀 RUG PULL (Estafa / Sin liquidez). Pierdes los ${INVERSION} SOL.`);
            }

        } catch (error) {
            console.log(`⚠️ ERROR TÉCNICO AL BUSCAR PRECIO: ${error.message}`);
            saldo += INVERSION;
        }
        
        console.log("🟢 Semáforo en VERDE. Listo para el siguiente disparo...\n");
        operando = false; // SEMÁFORO VERDE: Vuelve a cazar

    }, 60000); 
}

iniciar().catch(err => console.error("❌ ERROR CRÍTICO:", err));
