import { useState, useEffect } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import ABI from './abi.json'
import { CONTRACT_ADDRESS, EXPECTED_CHAIN_ID, EXPECTED_NETWORK_NAME } from './config'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0a;
    color: #f0ead6;
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    padding: 48px 24px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .header-tag {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c9a84c;
    opacity: 0.8;
  }

  .header h1 {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -1px;
    line-height: 1.1;
    background: linear-gradient(135deg, #f0ead6 0%, #c9a84c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .wallet-card {
    background: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .wallet-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
    flex-shrink: 0;
  }

  .wallet-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .wallet-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #666;
  }

  .wallet-address {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #f0ead6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .network-badge {
    margin-left: auto;
    background: #1a1a1a;
    border: 1px solid #c9a84c33;
    color: #c9a84c;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
  }

  .points-card {
    background: linear-gradient(135deg, #141414 0%, #1a1500 100%);
    border: 1px solid #c9a84c33;
    border-radius: 20px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .points-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .points-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #666;
  }

  .points-value {
    font-size: 64px;
    font-weight: 800;
    letter-spacing: -3px;
    color: #c9a84c;
    line-height: 1;
  }

  .points-max {
    font-size: 20px;
    color: #444;
    font-weight: 400;
  }

  .rewards-badge {
    background: #c9a84c22;
    border: 1px solid #c9a84c44;
    border-radius: 12px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rewards-badge span:first-child {
    font-size: 18px;
  }

  .rewards-text {
    display: flex;
    flex-direction: column;
  }

  .rewards-count {
    font-size: 18px;
    font-weight: 700;
    color: #c9a84c;
    line-height: 1;
  }

  .rewards-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #666;
  }

  .progress-bar {
    background: #222;
    border-radius: 4px;
    height: 6px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #c9a84c, #f0c060);
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-text {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #555;
    text-align: right;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .btn {
    width: 100%;
    padding: 16px 24px;
    border-radius: 14px;
    border: none;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 0.3px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #c9a84c, #e8c060);
    color: #0a0a0a;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px #c9a84c44;
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-secondary {
    background: #141414;
    border: 1px solid #2a2a2a;
    color: #f0ead6;
  }

  .btn-secondary:hover:not(:disabled) {
    border-color: #c9a84c44;
    background: #1a1a1a;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-connect {
    background: #141414;
    border: 1px solid #333;
    color: #f0ead6;
    padding: 18px 24px;
    border-radius: 14px;
    font-size: 16px;
  }

  .btn-connect:hover {
    border-color: #c9a84c66;
    background: #1a1a1a;
    transform: translateY(-1px);
  }

  .cooldown-bar {
    background: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cooldown-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #555;
  }

  .cooldown-timer {
    font-family: 'DM Mono', monospace;
    font-size: 22px;
    font-weight: 500;
    color: #c9a84c;
    letter-spacing: 2px;
  }

  .error-box {
    background: #1a0a0a;
    border: 1px solid #ff444433;
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 13px;
    color: #ff8080;
    font-family: 'DM Mono', monospace;
  }

  .event-box {
    background: #0a140a;
    border: 1px solid #4ade8033;
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    animation: fadeIn 0.4s ease;
  }

  .event-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #4ade80;
    opacity: 0.7;
  }

  .event-text {
    font-size: 14px;
    color: #f0ead6;
  }

  .event-text strong {
    color: #4ade80;
  }

  .tx-box {
    background: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tx-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tx-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #555;
  }

  .tx-value {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #888;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tx-block {
    color: #4ade80;
  }

  .divider {
    height: 1px;
    background: #1a1a1a;
  }

  .how-it-works {
    background: #0f0f0f;
    border: 1px solid #1e1e1e;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .how-title {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #444;
  }

  .how-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .how-step {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .step-num {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #c9a84c;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 14px;
    color: #888;
    line-height: 1.4;
  }

  .step-text strong {
    color: #f0ead6;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [points, setPoints] = useState(0)
  const [recompenses, setRecompenses] = useState(0)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [txHash, setTxHash] = useState(null)
  const [lastBlockNumber, setLastBlockNumber] = useState(null)
  const [lastEvent, setLastEvent] = useState(null)

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  useEffect(() => {
    if (!provider || !account) return
    let listenContract
    try {
      listenContract = new Contract(CONTRACT_ADDRESS, ABI, provider)
      const handler = (utilisateur, pointsGagnes, totalPoints) => {
        setLastEvent({
          utilisateur: utilisateur.slice(0, 6) + '...' + utilisateur.slice(-4),
          pointsGagnes: Number(pointsGagnes),
          totalPoints: Number(totalPoints)
        })
        loadData(provider, account)
      }
      listenContract.on("CheckIn", handler)
      return () => { listenContract.off("CheckIn", handler) }
    } catch (err) {
      console.warn("Impossible d'écouter les events :", err.message)
    }
  }, [provider, account])

  const loadData = async (_provider, _account) => {
    const c = new Contract(CONTRACT_ADDRESS, ABI, _provider)
    const p = await c.getPoints(_account)
    const r = await c.getRecompenses(_account)
    setPoints(Number(p))
    setRecompenses(Number(r))
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) { setError("MetaMask n'est pas installé."); return }
      const _provider = new BrowserProvider(window.ethereum)
      await _provider.send("eth_requestAccounts", [])
      const network = await _provider.getNetwork()
      if (network.chainId !== BigInt(EXPECTED_CHAIN_ID)) {
        setError(`Mauvais réseau — connectez MetaMask sur ${EXPECTED_NETWORK_NAME}.`)
        return
      }
      const signer = await _provider.getSigner()
      const address = await signer.getAddress()
      setAccount(address)
      setProvider(_provider)
      setError(null)
      await loadData(_provider, address)
    } catch { setError("Connexion refusée.") }
  }

  const checkIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const signer = await provider.getSigner()
      const contrat = new Contract(CONTRACT_ADDRESS, ABI, signer)
      const tx = await contrat.checkIn()
      setTxHash(tx.hash)
      const receipt = await tx.wait()
      setLastBlockNumber(receipt.blockNumber)
      setCooldownSeconds(60)
      await loadData(provider, account)
    } catch (err) {
      if (err.code === 4001) {
        setError("Transaction annulée.")
      } else if (err.message.includes("Attends 1 minute")) {
        setError("Attends 1 minute entre deux check-ins !")
        setCooldownSeconds(60)
      } else {
        setError("Erreur : " + err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const reclamerRecompense = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const signer = await provider.getSigner()
      const contrat = new Contract(CONTRACT_ADDRESS, ABI, signer)
      const tx = await contrat.reclamerRecompense()
      setTxHash(tx.hash)
      const receipt = await tx.wait()
      setLastBlockNumber(receipt.blockNumber)
      await loadData(provider, account)
    } catch (err) {
      if (err.code === 4001) {
        setError("Transaction annulée.")
      } else if (err.message.includes("Pas assez de points")) {
        setError("Pas assez de points — il faut 50 points minimum !")
      } else {
        setError("Erreur : " + err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const progressPercent = Math.min((points / 50) * 100, 100)

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        <div className="header">
          <span className="header-tag">// Gagnez des points on-chain</span>
          <h1>Loyalty<br />Program</h1>
        </div>

        {!account ? (
          <>
            <button className="btn btn-connect" onClick={connectWallet}>
              🦊 Connecter MetaMask
            </button>
            <div className="how-it-works">
              <span className="how-title">// Comment ça marche</span>
              <div className="how-steps">
                <div className="how-step">
                  <span className="step-num">01</span>
                  <span className="step-text">Connecte ton wallet MetaMask sur <strong>{EXPECTED_NETWORK_NAME}</strong></span>
                </div>
                <div className="how-step">
                  <span className="step-num">02</span>
                  <span className="step-text">Fais un <strong>check-in</strong> toutes les minutes pour gagner <strong>10 points</strong></span>
                </div>
                <div className="how-step">
                  <span className="step-num">03</span>
                  <span className="step-text">Atteins <strong>50 points</strong> et réclame une <strong>récompense</strong> on-chain</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="wallet-card">
              <div className="wallet-dot" />
              <div className="wallet-info">
                <span className="wallet-label">Wallet connecté</span>
                <span className="wallet-address">{account}</span>
              </div>
              <span className="network-badge">{EXPECTED_NETWORK_NAME}</span>
            </div>

            <div className="points-card">
              <div className="points-header">
                <div>
                  <div className="points-label">Mes points</div>
                  <div className="points-value">
                    {points}<span className="points-max">/50</span>
                  </div>
                </div>
                <div className="rewards-badge">
                  <span>🎁</span>
                  <div className="rewards-text">
                    <span className="rewards-count">{recompenses}</span>
                    <span className="rewards-label">Récompenses</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="progress-text">{progressPercent.toFixed(0)}% vers la prochaine récompense</div>
              </div>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <div className="actions">
              {cooldownSeconds > 0 ? (
                <div className="cooldown-bar">
                  <span className="cooldown-label">Prochain check-in</span>
                  <span className="cooldown-timer">
                    {String(Math.floor(cooldownSeconds / 60)).padStart(2, '0')}:{String(cooldownSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={checkIn} disabled={isLoading}>
                  {isLoading ? '⏳ Transaction en cours...' : '✓ Check-in — Gagner 10 pts'}
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={reclamerRecompense}
                disabled={isLoading || points < 50}
              >
                {points < 50
                  ? `🔒 Récompense — encore ${50 - points} pts`
                  : '🎁 Réclamer ma récompense'}
              </button>
            </div>

            {(txHash || lastBlockNumber) && (
              <div className="tx-box">
                {txHash && (
                  <div className="tx-row">
                    <span className="tx-label">Tx Hash</span>
                    <span className="tx-value">{txHash.slice(0, 18)}...{txHash.slice(-6)}</span>
                  </div>
                )}
                {lastBlockNumber && (
                  <>
                    <div className="divider" />
                    <div className="tx-row">
                      <span className="tx-label">Bloc</span>
                      <span className="tx-value tx-block">#{lastBlockNumber} ✓</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {lastEvent && (
              <div className="event-box">
                <span className="event-label">// Event on-chain</span>
                <span className="event-text">
                  <strong>{lastEvent.utilisateur}</strong> a gagné <strong>{lastEvent.pointsGagnes} pts</strong> — total : {lastEvent.totalPoints} pts
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default App