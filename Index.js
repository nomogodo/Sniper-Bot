const { Connection, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58'); 

// --- ZONA DE PELIGRO ---
// Pega tu clave privada dentro de las comillas. Ejemplo: "5Op..."
const PRIVATE_KEY = "3nA7HSo1CUrJyrbb2meUbZDPAJXhgwgyZeF3Esusmx49e5Tw8ju14BL6KEXV3DtzV8TGpmzT82CttDhvauYLX8K6"; 
// -----------------------

const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const connection = new Connection(RPC_URL);

async function probarBilletera() {
    console.clear();
    console.log("---------------------------------------------------");
    console.log("🔐 INTENTANDO CONECTAR BILLETERA REAL...");
    console.log("---------------------------------------------------");

    try {
        // 1. Decodificar la clave
        const wallet = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        
        // 2. Mostrar la dirección pública (La que puedes compartir)
        console.log(`✅ ¡ÉXITO! Clave reconocida.`);
        console.log(`📬 Tu Dirección Pública: ${wallet.publicKey.toBase58()}`);

        // 3. Ver saldo real
        const balance = await connection.getBalance(wallet.publicKey);
        const sol = balance / 1000000000;

        console.log(`💰 SALDO DISPONIBLE: ${sol.toFixed(4)} SOL`);

        if (sol < 0.02) {
            console.log("\n⚠️ ALERTA: Tienes muy poco saldo para las comisiones (Gas).");
            console.log("   Mete al menos 0.05 SOL para operar tranquilo.");
        } else {
            console.log("\n🚀 TODO LISTO. Tienes gasolina para empezar.");
        }

    } catch (error) {
        console.log("\n❌ ERROR DE CLAVE:");
        console.log("   El bot no puede leer tu clave privada.");
        console.log("   1. Asegúrate de que has copiado TODO el texto.");
        console.log("   2. Asegúrate de que está dentro de las comillas \" \".");
    }
}

probarBilletera();
