const { Connection, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58'); 

// 👇 PEGA TU CLAVE AQUÍ DENTRO (Mantén las comillas) 👇
const PRIVATE_KEY = "3nA7HSo1CUrJyrbb2meUbZDPAJXhgwgyZeF3Esusmx49e5Tw8ju14BL6KEXV3DtzV8TGpmzT82CttDhvauYLX8K6"; 

const API_KEY = "84f545e5-e414-4d68-b1fc-fe13e070d03e"; 
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;
const connection = new Connection(RPC_URL);

async function probarBilletera() {
    console.clear();
    console.log("🕵️‍♂️ ANALIZANDO TU CLAVE PRIVADA...");

    try {
        // 1. LIMPIEZA AUTOMÁTICA: Esto borra espacios invisibles si se te coló alguno
        const claveLimpia = PRIVATE_KEY.trim(); 

        if (claveLimpia.includes(" ")) {
            throw new Error("Hay espacios en blanco DENTRO de la clave.");
        }
        if (claveLimpia.length < 50) {
            throw new Error("La clave es demasiado corta. ¿Seguro que la copiaste entera?");
        }

        // 2. INTENTO DE CONEXIÓN
        const wallet = Keypair.fromSecretKey(bs58.decode(claveLimpia));
        
        console.log("✅ ¡CLAVE CORRECTA!");
        console.log("-----------------------------------------");
        console.log(`📬 Wallet Pública: ${wallet.publicKey.toBase58()}`);
        
        const balance = await connection.getBalance(wallet.publicKey);
        const sol = balance / 1000000000;
        console.log(`💰 Saldo Real: ${sol.toFixed(4)} SOL`);
        console.log("-----------------------------------------");
        console.log("🚀 ¡Ya estamos conectados! Pídeme el código de disparo.");

    } catch (error) {
        console.log("\n❌ ERROR DE FORMATO:");
        console.log(`   El ordenador dice: "${error.message}"`);
        console.log("\n   SOLUCIÓN:");
        console.log("   1. Vuelve a Phantom > Ajustes > Exportar Clave Privada.");
        console.log("   2. Dale al botón de 'Copiar' (no lo selecciones a mano).");
        console.log("   3. Pégalo con cuidado entre las comillas \" \".");
    }
}

probarBilletera();
