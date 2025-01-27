const { conf } = require("./src/services/config");
const { fetchData } = require("./src/services/apiService");
async function main() {
    try {
        const data = await fetchData();
        console.log(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
main();