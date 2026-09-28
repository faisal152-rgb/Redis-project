const axios = require("axios");

const fetchOrdersRisk = async (orderData) => { 
    try {
        const baseURL = process.env.ORDER_RISK_BASE_URL;
        const apiKey = process.env.ORDER_RISK_PRIVATE_KEY;

        if (!baseURL) {
            return { score: 10 };
        }

        const response = await axios.post(`${baseURL}/score`, orderData, {
            headers: {
                "x-api-key": apiKey,
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            timeout: 5000
        });
        return response.data;
    }
    catch(error) {
        console.error("OrderRisk fetch warning:", error.message);
        // Fallback so order creation doesn't crash if external service is unreachable
        return { score: 20 };
    }
}

module.exports = { fetchOrdersRisk };

