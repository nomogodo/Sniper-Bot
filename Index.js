const { Connection, PublicKey } = require('@solana/web3.js');

// Conexión oficial de Solana
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Esta es la dirección a la que se fue el dinero según la transacción que me diste
const direccionDudosa = new PublicKey("5qmtDCvUreD8G59M5FosdpV8Gqdd3kFgdH1Vv7HKXUKq");

async function rastrearDinero() {
    console.clear();
    console.log("🔍 INICIANDO RASTREO DE EMERGENCIA...");
    console.log("-----------------------------------------");

    try {
        const balance = await connection.getBalance(direccionDudosa);
        const sol = balance / 1000000000;

        console.log(`🏠 Dirección: 5qmtDC...UKq`);
        console.log(`💰 Saldo actual: ${sol.toFixed(4)} SOL`);
        
        console.log("-----------------------------------------");
        if (sol > 0) {
            console.log("✅ EL DINERO ESTÁ AHÍ. No se ha perdido.");
            console.log("\n💡 SIGUIENTE PASO:");
            console.log("Abre tu Phantom, dale al nombre de tu cuenta arriba");
            console.log("y mira si tienes una 'Account 2' o 'Account 3'.");
            console.log("Ese dinero tiene que estar en una de tus cuentas.");
        } else {
            console.log("⚠️ LA CUENTA ESTÁ VACÍA.");
            console.log("Esto significa que el envío falló o el dinero se movió a otro sitio.");
        }
    } catch (err) {
        console.log("❌ Error de conexión: " + err.message);
    }
}

rastrearDinero();
