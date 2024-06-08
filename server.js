const express = require('express');
const { Web3 } = require('web3');
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Web3 with Infura using your API key
const infuraUrl = 'https://mainnet.infura.io/v3/your_api_key';
const web3 = new Web3(infuraUrl); // Simplified initialization

// Simulated user database
let users = {};

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('login'));

app.post('/dashboard', async (req, res) => {
    const { address } = req.body;
    const name = generateUserName(address); // Generate a user name based on the Ethereum address

    try {
        const balance = await web3.eth.getBalance(address);
        const ethHoldings = web3.utils.fromWei(balance, 'ether');

        if (!users[address]) {
            users[address] = { name, ethHoldings: parseFloat(ethHoldings), loginCount: 1 };
        } else {
            users[address].loginCount += 1;
            users[address].ethHoldings = parseFloat(ethHoldings);
        }
        res.render('dashboard', {
            name: users[address].name,
            netWorth: (users[address].ethHoldings * users[address].loginCount).toFixed(2),
            multiplier: users[address].loginCount
        });
    } catch (error) {
        console.error("Error fetching ETH balance:", error);
        res.status(500).send("Error fetching wallet information");
    }
});

app.get('/leaderboard', (req, res) => {
    const userList = Object.keys(users).map(address => ({
        name: users[address].name,
        netWorth: users[address].ethHoldings * users[address].loginCount,
        multiplier: users[address].loginCount
    }));
    userList.sort((a, b) => b.netWorth - a.netWorth);
    res.render('leaderboard', { users: userList });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

function generateUserName(address) {
    return `User${address.slice(2, 6)}`; // Take part of the address and prepend 'User'
}