const https = require('https');

const API_URL = 'https://arabai-825528766846.europe-west1.run.app/api/chat/gemini/chat';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoidGVzdDEyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTg1NTQ5NDEsImV4cCI6MTc1OTE1OTc0MX0.ieZEp1xJnjA5isqERQp--TXswe38sZaipXjIeBJVPZs'; // Replace with actual token

async function testSingleRequest() {
    const startTime = Date.now();
    
    const postData = JSON.stringify({
        message: "Explain quantum computing in detail with examples and applications"
    });

    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JWT_TOKEN}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(API_URL, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    parsedData = data;
                }
                
                resolve({
                    status: res.statusCode,
                    responseTime,
                    success: res.statusCode === 200,
                    response: parsedData
                });
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function runPerformanceTest() {
    console.log('🚀 Testing API Performance...\n');
    
    const results = [];
    const numTests = 10;
    
    for (let i = 1; i <= numTests; i++) {
        console.log(`Test ${i}/${numTests}...`);
        try {
            const result = await testSingleRequest();
            results.push(result.responseTime);
            console.log(`Status: ${result.status} | Time: ${result.responseTime}ms`);
            console.log(`Response: ${JSON.stringify(result.response, null, 2)}\n`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        // Wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Calculate statistics
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    
    console.log('\n📊 RESULTS:');
    console.log(`Average Response Time: ${avgTime.toFixed(0)}ms`);
    console.log(`Fastest Response: ${minTime}ms`);
    console.log(`Slowest Response: ${maxTime}ms`);
    
    // Performance assessment
    console.log('\n🎯 ASSESSMENT:');
    if (avgTime < 3000) {
        console.log('✅ EXCELLENT - Very fast response times');
    } else if (avgTime < 5000) {
        console.log('✅ GOOD - Acceptable response times');
    } else if (avgTime < 8000) {
        console.log('⚠️ FAIR - Could be improved');
    } else {
        console.log('❌ POOR - Response times too slow');
    }
}

// Run the test
runPerformanceTest().catch(console.error);