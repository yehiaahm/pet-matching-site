# Smart Contract: BreedingAgreement

- Two-party agreements with hashed off-chain docs (health/genetics)
- Both parties must sign; optional moderator approval
- Status lifecycle: Draft → Active → Completed → Cancelled
- Gas optimization: compact struct, minimal events, enum for status (fits into one storage slot with booleans where feasible).

## Compile & Deploy (Hardhat)

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# add contracts/BreedingAgreement.sol
npx hardhat compile
npx hardhat run --network sepolia scripts/deploy.js
```

## Frontend (MetaMask)

```js
import { ethers } from 'ethers';
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
await contract.createAgreement(partyB, petAIdBytes32, petBIdBytes32, healthHash, geneticHash, feeWei);
await contract.sign(agreementId);
```
