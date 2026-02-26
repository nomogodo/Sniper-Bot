const { Connection, PublicKey } = require('@solana/web3.js');

async function rastreoUrgente() {
    console.clear();
    console.log("🚑 USANDO CONEXIÓN DE EMERGENCIA...");
    
    // Usamos el servidor oficial de Solana sin intermediarios
    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    
    // La dirección donde está el dinero según tu historial
    const direccionDestino = new PublicKey("5qmtDCvUreD8G59M5FosdpV8Gqdd3kFgdH1Vv7HKXUKq");

    try {
        const balance = await connection.getBalance(direccionDestino);
        const sol = balance / 1000000000;

        console.log("------------------------------------------");
        console.log(`🏠 Wallet Destino: ${direccionDestino.toBase58()}`);
        console.log(`💰 SALDO REAL: ${sol.toFixed(4)} SOL`);
        console.log("------------------------------------------");

        if (sol > 0) {
            console.log("✅ EL DINERO ESTÁ SEGURO EN ESA CUENTA.");
            console.log("\n⚠️ CÓMO RECUPERARLO:");
            console.log("1. Ve a Phantom.");
            console.log("2. Pulsa en el nombre de tu cuenta (arriba).");
            console.log("3. Dale a '+' -> 'Crear cuenta nueva'.");
            console.log("4. Hazlo varias veces hasta que aparezca una con el saldo.");
        } else {
            console.log("⚠️ Saldo 0. El envío no se completó o la dirección es otra.");
        }
    } catch (err) {
        console.log("❌ Error de red: El servidor está muy saturado. Intenta de nuevo en 10 segundos.");
    }
}

rastreoUrgente();
