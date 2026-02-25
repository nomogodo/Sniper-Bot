const { Connection, PublicKey } = require('@solana/web3.js');

// 1. CONFIGURACIÓN
const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const connection = new Connection(RPC_URL, { wsEndpoint: WSS_URL });

const RAYDIUM_ID = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8");
const PUMP_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

let saldo = 1.5;
const INVERSION = 0.05;

async function iniciar() {
    console.log("=========================================");
    console.log("🩸 MODO REALIDAD: PRECIOS EN DIRECTO");
    console.log(`💰 SALDO BANCARIO: ${saldo} SOL`);
    console.log("=========================================");

    connection.onSlotChange(() => { process.stdout.write("."); });

    connection.onLogs(RAYDIUM_ID, ({ logs, signature }) => {
        if (logs.some(l => l.includes("initialize2") || l.includes("InitializeInstruction2"))) {
            console.log(`\n🚨 [RAYDIUM] Detectado -> Tx: ${signature.slice(0, 10)}...`);
            ejecutarOperacionReal(signature);
        }
    }, "processed");

    connection.onLogs(PUMP_ID, ({ logs, signature }) => {
        if (logs.some(l => l.includes("Create"))) {
            console.log(`\n💊 [PUMP.FUN] Detectado -> Tx: ${signature.slice(0, 10)}...`);
            ejecutarOperacionReal(signature);
        }
    }, "processed");
}

async function ejecutarOperacionReal(firmaTx) {
    if (saldo < INVERSION) {
        console.log("💸 ¡BANCARROTA! No tienes saldo suficiente para operar.");
        return;
    }
    
    saldo -= INVERSION;
    console.log(`🛒 Comprando ${INVERSION} SOL... (Saldo temporal: ${saldo.toFixed(3)} SOL)`);
    console.log(`⏳ Esperando 60s para ver el impacto real en el mercado...`);

    // Esperamos 60 segundos exactos
    setTimeout(async () => {
        try {
            // 1. Extraemos el contrato real de la blockchain
            const tx = await connection.getParsedTransaction(firmaTx, { maxSupportedTransactionVersion: 0 });
            const balances = tx?.meta?.postTokenBalances || [];
            const token = balances.find(b => b.mint !== "So11111111111111111111111111111111111111112"); // Ignoramos el SOL
            
            if (!token) {
                console.log("⚠️ Transacción ilegible. Devolviendo dinero.");
                saldo += INVERSION;
                return;
            }

            const tokenAddress = token.mint;
            console.log(`\n🔍 Evaluando token real: ${tokenAddress}`);

            // 2. Buscamos el precio en DexScreener
            const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
            const data = await res.json();

            // 3. Calculamos resultados
            if (data.pairs && data.pairs.length > 0) {
                // Cogemos la variación de precio de los últimos 5 minutos
                const porcentaje = data.pairs[0].priceChange.m5 || 0; 
                const multiplicador = 1 + (porcentaje / 100);
                const dineroRecuperado = INVERSION * multiplicador;
                
                saldo += dineroRecuperado;
                
                if (porcentaje > 0) {
                    console.log(`✅ ¡ÉXITO! Subió un +${porcentaje}%. Vendido por ${dineroRecuperado.toFixed(3)} SOL. (Saldo: ${saldo.toFixed(3)})`);
                } else {
                    console.log(`❌ PÉRDIDA. Cayó un ${porcentaje}%. Vendido por ${dineroRecuperado.toFixed(3)} SOL. (Saldo: ${saldo.toFixed(3)})`);
                }
            } else {
                // Si DexScreener no lo encuentra pasado 1 minuto, es porque ha muerto (Rug Pull)
                console.log(`💀 RUG PULL / ESTAFA. El token no tiene liquidez. Has perdido los ${INVERSION} SOL. (Saldo: ${saldo.toFixed(3)})`);
            }

        } catch (error) {
            console.log("⚠️ La red está saturada, operación simulada cancelada.");
            saldo += INVERSION;
        }
    }, 60000); // 60.000 milisegundos = 60 segundos
}

iniciar().catch(err => console.error("❌ ERROR CRÍTICO:", err));
