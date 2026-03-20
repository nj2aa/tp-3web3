# TD Jour 3 — Smart Contract & Déploiement Sepolia
**3WEB3 · Najwa FARQANE · B3**  
**Projet : Loyalty Program — Programme de fidélité décentralisé**

---

## Présentation du projet

Pour ce TD j'ai choisi de faire un programme de fidélité on-chain. L'idée c'est simple : un utilisateur connecte son wallet MetaMask, fait des check-ins pour accumuler des points, et quand il atteint 50 points il peut réclamer une récompense, le tout enregistré de façon permanente sur la blockchain.

J'ai choisi ce sujet parce que ça me semblait plus original que refaire un système de vote qu'on avait déjà fait au Jour 2, et parce que la logique de cooldown avec accumulation de points est quelque chose de concret qu'on retrouve dans plein d'applis réelles.

---

## Stack utilisée

| Outil | Rôle |
|-------|------|
| Solidity `^0.8.20` | Langage du smart contract |
| Hardhat `2.22.17` | Compilation, déploiement, console de test |
| Ganache `2.7.1` | Blockchain locale pour le développement |
| Alchemy | Nœud RPC pour accéder à Sepolia |
| Sepolia Testnet | Réseau Ethereum public de test |
| Ethers.js `v6` | Communication frontend vers blockchain |
| React + Vite | Interface utilisateur |
| MetaMask | Wallet pour signer les transactions |

---

## Structure du contrat

Le contrat `LoyaltyProgram.sol` respecte les 4 éléments obligatoires du TD :

### Variables d'état
```solidity
address public owner;
mapping(address => uint256) public points;
mapping(address => uint256) public dernierCheckIn;
mapping(address => uint256) public recompensesReclamees;

uint256 public constant POINTS_PAR_CHECKIN = 10;
uint256 public constant SEUIL_RECOMPENSE = 50;
uint256 public constant COOLDOWN = 1 minutes;
```

### 2 fonctions `view` (lecture gratuite)
- `getPoints(address)` retourne le solde de points d'un utilisateur
- `getRecompenses(address)` retourne le nombre de récompenses réclamées

### 1 fonction d'écriture
- `checkIn()` ajoute 10 points à l'appelant
- `reclamerRecompense()` déduit 50 points et incrémente le compteur de récompenses

### 1 event
```solidity
event CheckIn(address indexed utilisateur, uint256 pointsGagnes, uint256 totalPoints);
event RecompenseReclamee(address indexed utilisateur, uint256 nombreRecompenses);
```

### 2 `require()` (règles métier on-chain)
```solidity
require(
    block.timestamp >= dernierCheckIn[msg.sender] + COOLDOWN,
    "Attends 1 minute entre deux check-ins"
);
require(points[msg.sender] >= SEUIL_RECOMPENSE, "Pas assez de points");
```

---

## Étapes réalisées

### Étape 1 — Setup Hardhat
Création du projet dans un dossier dédié, séparé du projet React du Jour 2. Installation de Hardhat v2 avec le toolbox correspondant.

**Commandes :**
```bash
mkdir loyalty-contract && cd loyalty-contract
npm init -y
npm install --save-dev hardhat@2.22.17 @nomicfoundation/hardhat-toolbox@hh2
npx hardhat --init
```

Configuration de `hardhat.config.js` avec les deux réseaux (Ganache local et Sepolia), les clés stockées dans un fichier `.env` jamais commité.

### Étape 2 — Écriture du contrat Solidity
Création de `contracts/LoyaltyProgram.sol`. C'est l'étape qui m'a demandé le plus de rigueur, mais honnêtement ce n'est pas ce que j'ai trouvé le plus dur dans ce TD. La syntaxe s'apprend assez vite une fois qu'on comprend la distinction entre les fonctions `view` et les fonctions d'écriture, et le rôle du `require()`.

### Étape 3 — Tests dans la console Hardhat
Avant de déployer, j'ai testé la logique directement dans le REPL Hardhat :

```bash
npx hardhat console --network ganache
```

```javascript
const Factory = await ethers.getContractFactory("LoyaltyProgram")
const contrat = await Factory.deploy()
await contrat.waitForDeployment()
await contrat.getPoints("0x07Ed5911a00c62b491d90234E4a83d35bC71a11c") // 0n
const tx = await contrat.checkIn()
await tx.wait()
await contrat.getPoints("0x07Ed5911a00c62b491d90234E4a83d35bC71a11c") // 10n
await contrat.checkIn() // revert "Attends 1 minute entre deux check-ins" ✓
```

### Étape 4 — Déploiement sur Ganache
```bash
npx hardhat run scripts/deploy.js --network ganache
# ✅ Contrat déployé à : 0xe03aA5ECB090C41e8A1100e2a997e1770f88Ea67
```

### Étape 5 — Extraction de l'ABI
```bash
node -e "
const fs = require('fs');
const full = JSON.parse(fs.readFileSync('artifacts/contracts/LoyaltyProgram.sol/LoyaltyProgram.json', 'utf8'));
fs.writeFileSync('abi.json', JSON.stringify(full.abi, null, 2));
"
```

### Étape 6 — Intégration frontend sur Ganache
Mise à jour de `src/config.js` du projet React du Jour 2 avec la nouvelle adresse et le nouvel ABI. Réécriture de `App.jsx` pour utiliser `checkIn()` et `getPoints()` à la place des fonctions de vote.

Test complet : connexion MetaMask sur Ganache Local, check-in confirmé, points mis à jour en temps réel via les events.

### Étape 7 — Déploiement sur Sepolia
Création d'un compte Alchemy, récupération de l'URL RPC Sepolia. ETH de test obtenus via le faucet Google Cloud.

```bash
npx hardhat run scripts/deploy.js --network sepolia
# ✅ Contrat déployé à : 0x26780a2f16f88D80E9b6973C3472a6f312a5F035
# Etherscan : https://sepolia.etherscan.io/address/0x26780a2f16f88D80E9b6973C3472a6f312a5F035
```

### Étape 8 — Frontend rebranché sur Sepolia
Mise à jour de `config.js` avec l'adresse Sepolia et le chainId `11155111`. L'ABI n'a pas eu besoin d'être modifié car il décrit la structure du contrat et non le réseau sur lequel il tourne.

---

## Problèmes rencontrés

### 1. Conflit de versions Hardhat
**Problème :** En lançant `npx hardhat init`, Hardhat v3 s'est installé automatiquement alors que les plugins nécessitent la v2. Ça a généré des erreurs `ERESOLVE unable to resolve dependency tree`.

**Solution :** Forcer l'installation de la version 2 directement :
```bash
npm install --save-dev hardhat@2.22.17 @nomicfoundation/hardhat-toolbox@hh2
```

### 2. Node.js 25 non supporté
**Problème :** Ma version de Node.js (25.2.1) n'est pas officiellement supportée par Hardhat 2, qui affiche un warning à chaque commande.

**Solution :** Le warning n'empêche pas le fonctionnement. J'ai continué avec cette version et tout a fonctionné correctement. Idéalement il faudrait utiliser Node.js 22 LTS.

### 3. Ganache sur le mauvais port
**Problème :** Ganache démarre par défaut sur le port `7545` mais Hardhat attend le port `8545`.

**Solution :** Changement du port dans les settings Ganache via ⚙️ Server puis Port Number.

### 4. MetaMask sur le mauvais réseau
**Problème :** Après avoir ajouté Ganache Local dans MetaMask, le site restait connecté à l'ancien réseau et affichait "Mauvais réseau".

**Solution :** Déconnecter le site depuis MetaMask via Paramètres, Sites connectés, puis révoquer localhost:5173 et se reconnecter.

### 5. ETH Sepolia non reçus immédiatement
**Problème :** Le faucet Google Cloud confirmait la transaction mais les ETH n'apparaissaient pas dans MetaMask.

**Solution :** Attendre quelques minutes et vérifier sur Etherscan Sepolia que la transaction était bien confirmée avant de lancer le déploiement.

### 6. Erreurs de compilation Solidity
**Problème :** Plusieurs erreurs au début sur la syntaxe Solidity, notamment la confusion entre fonctions `view` et fonctions d'écriture.

**Solution :** Lecture attentive des messages d'erreur du compilateur qui indique toujours le fichier, la ligne et le type d'erreur.

---

## Ce que j'ai appris

Ce qui m'a pris le plus de temps ce n'était pas vraiment la logique du contrat mais tout l'environnement autour. Les conflits de versions Hardhat, Ganache sur le mauvais port, MetaMask qui ne reconnaissait pas le bon réseau... La partie setup est clairement la plus frustrante quand on part de zéro.

Une fois l'environnement en place, écrire le contrat Solidity était plus accessible que prévu. Ce qui m'a le plus marqué c'est la notion de gas et d'état immuable. Chaque modification sur la blockchain coûte quelque chose, et une fois qu'une transaction est confirmée elle ne peut pas être annulée. C'est très différent d'une base de données classique où on peut tout modifier facilement.

J'ai aussi mieux compris la différence entre les fonctions `view` et les fonctions d'écriture. Les premières sont gratuites et instantanées, les secondes déclenchent une transaction qui nécessite une signature MetaMask et du gas. Cette distinction change la façon de concevoir une application.

Le déploiement sur Sepolia était la partie la plus satisfaisante du TD. Voir son contrat apparaître sur Etherscan et faire une vraie transaction on-chain donne une dimension concrète à tout ce qu'on a appris. Le concept blockchain m'a vraiment intéressée et c'est quelque chose que j'aurais envie d'approfondir.

---

## Adresses de déploiement

| Réseau | Adresse |
|--------|---------|
| Ganache (local) | `0xe03aA5ECB090C41e8A1100e2a997e1770f88Ea67` |
| Sepolia (public) | `0x26780a2f16f88D80E9b6973C3472a6f312a5F035` |

**Etherscan Sepolia :** https://sepolia.etherscan.io/address/0x26780a2f16f88D80E9b6973C3472a6f312a5F035


## Liens

- **dApp déployée :** https://tp-3web3.vercel.app
- **Contrat Etherscan :** https://sepolia.etherscan.io/address/0x26780a2f16f88D80E9b6973C3472a6f312a5F035
- **GitHub :** https://github.com/nj2aa/tp-3web3
