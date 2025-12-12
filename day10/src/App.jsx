import { useState } from 'react'
import { Zap, Activity, Cpu } from 'lucide-react'
import './index.css'
import { solveAll, parseInput } from './lib/solver'

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [machines, setMachines] = useState([])

  const handleAnalyze = () => {
    try {
      const res = solveAll(input)
      setResult(res)
      setMachines(parseInput(input).map(m => m.originalLine))
    } catch (e) {
      console.error(e)
      setResult({ part1: "Error", part2: "Error" })
    }
  }

  return (
    <div className="app-container">
      <header>
        <div className="factory-decoration">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`light ${i % 2 === 0 ? 'on' : 'off'}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
        <h1 className="title">
          <Cpu style={{ verticalAlign: 'middle', marginRight: '15px', color: 'var(--neon-green)' }} size={48} />
          FACTORY INIT
        </h1>
      </header>

      <main className="card">
        <p style={{ color: '#8b949e', marginBottom: '1rem' }}>
          Paste your machine configuration below to initialize the factory systems.
        </p>

        <div className="textarea-container">
          <textarea
            spellCheck="false"
            placeholder="[.##.] (3) (1,3) (2)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button onClick={handleAnalyze}>
          <Zap style={{ verticalAlign: 'middle', marginRight: '8px' }} size={18} />
          Analyze Configuration
        </button>

        {result !== null && (
          <div className="result-container" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
            <div className="result-display" style={{ marginTop: 0 }}>
              <span style={{ fontSize: '0.8rem', color: '#8b949e', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Lights Mode (Pt 1)</span>
              <span className="result-value" style={{ fontSize: '2.5rem' }}>{result.part1}</span>
            </div>
            <div className="result-display" style={{ marginTop: 0, animationDelay: '0.2s' }}>
              <span style={{ fontSize: '0.8rem', color: '#8b949e', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Joltage Mode (Pt 2)</span>
              <span className="result-value" style={{ fontSize: '2.5rem', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }}>{result.part2}</span>
            </div>
          </div>
        )}

        {machines.length > 0 && (
          <div className="machine-list">
            <h3 style={{ color: 'var(--neon-blue)', fontSize: '1rem' }}>DETECTED MACHINES ({machines.length})</h3>
            {machines.map((m, i) => (
              <div key={i} className="machine-item">
                <span>Machine #{i + 1}</span>
                <span style={{ color: 'var(--metal-light)' }}>READY</span>
              </div>
            ))}
          </div>
        )}

      </main>

      <footer style={{ marginTop: '3rem', color: '#484f58', fontSize: '0.8rem' }}>
        <Activity size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
        SYSTEM MONITORING ACTIVE
      </footer>
    </div>
  )
}

export default App
