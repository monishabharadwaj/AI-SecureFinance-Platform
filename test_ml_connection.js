const { analyzeTransaction } = require("./src/ai/aiPredictor");

async function testML() {

    const sequence = [
        100,110,120,130,140,
        150,160,170,180,190
    ];

    const result = await analyzeTransaction(5000, sequence);

    console.log("ML RESPONSE:");
    console.log(result);
}

testML();