const { Connection, PublicKey } = require('@solana/web3.js');

// Cambiamos a la conexión pública oficial de Solana para evitar el bloqueo 403
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Esta es la dirección donde enviaste el dinero
const direccionDudosa = new PublicKey("5qmtDCvUreD8G59M5FosdpV8Gqdd3kFgdH1Vv7HKXUKq");

async function rastrearDinero() {
    console.clear();
    console.log("🔍 RASTREO CON CONEXIÓN PÚBLICA...");
    console.log("-----------------------------------------");

    try {
        const balance = await connection.getBalance(direccionDudosa);
        const sol = balance / 1000000000;

        console.log(`🏠 Wallet: 5qmtDC...UKq`);
        console.log(`💰 Saldo actual: ${sol.toFixed(4)} SOL`);
        
        console.log("-----------------------------------------");
        if (sol > 0) {
            console.log("✅ EL DINERO ESTÁ AHÍ.");
            console.log("\n⚠️ ATENCIÓN: Si no reconoces esta cuenta,");
            console.log("busca en tu Phantom la opción 'Añadir/Conectar Billetera'");
            console.log("y mira si aparece como una cuenta secundaria.");
        } else {
            console.log("⚠️ SALDO 0. El dinero no ha llegado o ya no está.");
        }
    } catch (err) {
        console.log("❌ Sigue fallando la conexión: " + err.message);
    }
}

rastrearDinero();
