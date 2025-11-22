import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Coins, 
  Shield, 
  Zap,
  Link,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Crown,
  Gem
} from "lucide-react";

interface Block {
  id: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  difficulty: number;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  gasPrice: number;
  gasUsed: number;
  status: "pending" | "confirmed" | "failed";
}

interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: "erc20" | "erc721" | "defi" | "dao" | "gaming";
  code: string;
  isDeployed: boolean;
  creator: string;
  balance: number;
  position: { x: number; y: number };
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: string | null;
  networkName: string;
}

interface MetaMaskProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider;
  }
}

interface BlockchainBuilding {
  id: string;
  name: string;
  type: "exchange" | "bank" | "casino" | "marketplace" | "governance";
  level: number; // 1-5
  isActive: boolean;
  volume: number; // Daily volume
  users: number; // Active users
  security: number; // Security score 1-100
  position: { x: number; y: number };
  contracts: string[]; // Contract IDs powering this building
}

interface BlockchainQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: "consensus" | "cryptography" | "smart-contracts" | "defi" | "nfts";
}

const SMART_CONTRACTS: SmartContract[] = [
  {
    id: "erc20-token",
    name: "MyToken (MTK)",
    address: "0x742d35Cc6644C55532f6c02d350a0e7c19F4C5bC",
    type: "erc20",
    isDeployed: false,
    creator: "developer",
    balance: 0,
    position: { x: 20, y: 30 },
    code: `pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}`
  },
  {
    id: "nft-collection",
    name: "CryptoArt NFT",
    address: "0x8ba1f109551bD432803012645Hac136c",
    type: "erc721",
    isDeployed: false,
    creator: "artist",
    balance: 0,
    position: { x: 50, y: 20 },
    code: `pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CryptoArt is ERC721 {
    uint256 public tokenCounter;
    
    constructor() ERC721("CryptoArt", "CART") {
        tokenCounter = 0;
    }
    
    function createNFT() public returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        tokenCounter++;
        return newTokenId;
    }
}`
  },
  {
    id: "defi-vault",
    name: "Yield Vault",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    type: "defi",
    isDeployed: false,
    creator: "protocol",
    balance: 0,
    position: { x: 75, y: 35 },
    code: `pragma solidity ^0.8.0;

contract YieldVault {
    mapping(address => uint256) public deposits;
    uint256 public totalDeposits;
    uint256 public yieldRate = 500; // 5% APY
    
    function deposit() external payable {
        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
    }
    
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount);
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    function calculateYield(address user) external view returns (uint256) {
        return (deposits[user] * yieldRate) / 10000;
    }
}`
  }
];

const BLOCKCHAIN_BUILDINGS: BlockchainBuilding[] = [
  {
    id: "dex-exchange",
    name: "DEX Exchange",
    type: "exchange",
    level: 1,
    isActive: false,
    volume: 0,
    users: 0,
    security: 85,
    position: { x: 25, y: 65 },
    contracts: []
  },
  {
    id: "defi-bank",
    name: "DeFi Bank",
    type: "bank",
    level: 1,
    isActive: false,
    volume: 0,
    users: 0,
    security: 95,
    position: { x: 45, y: 70 },
    contracts: []
  },
  {
    id: "nft-marketplace",
    name: "NFT Marketplace",
    type: "marketplace",
    level: 1,
    isActive: false,
    volume: 0,
    users: 0,
    security: 80,
    position: { x: 65, y: 68 },
    contracts: []
  },
  {
    id: "dao-governance",
    name: "DAO Governance",
    type: "governance",
    level: 1,
    isActive: false,
    volume: 0,
    users: 0,
    security: 90,
    position: { x: 85, y: 75 },
    contracts: []
  }
];

const BLOCKCHAIN_QUIZZES: BlockchainQuiz[] = [
  {
    id: "consensus-1",
    question: "What is the primary purpose of a consensus mechanism in blockchain?",
    options: [
      "To encrypt transactions",
      "To ensure all nodes agree on the state of the ledger",
      "To create new tokens",
      "To compress block data"
    ],
    correctAnswer: 1,
    explanation: "Consensus mechanisms ensure all nodes in the network agree on the current state and validity of transactions.",
    difficulty: "easy",
    category: "consensus"
  },
  {
    id: "smart-contracts-1",
    question: "What happens if a smart contract function reverts?",
    options: [
      "The transaction is processed normally",
      "All state changes are rolled back and gas is still consumed",
      "The contract is deleted",
      "New tokens are minted"
    ],
    correctAnswer: 1,
    explanation: "When a smart contract reverts, all state changes are undone but gas is still consumed up to the revert point.",
    difficulty: "medium",
    category: "smart-contracts"
  },
  {
    id: "defi-1",
    question: "What is 'impermanent loss' in DeFi liquidity pools?",
    options: [
      "Permanent loss of all funds",
      "Temporary loss due to price volatility",
      "Loss due to smart contract bugs",
      "Loss due to high gas fees"
    ],
    correctAnswer: 1,
    explanation: "Impermanent loss occurs when the price of tokens in a liquidity pool changes compared to holding them separately.",
    difficulty: "hard",
    category: "defi"
  }
];

const SIMULATION_SCENARIOS = [
  {
    id: "token-launch",
    title: "Token Launch Simulation",
    description: "Deploy an ERC-20 token and handle initial distribution",
    initialCode: `// Token deployment parameters
const tokenName = "MyToken";
const tokenSymbol = "MTK";
const initialSupply = 1000000;

// What's missing in this token contract?`,
    tasks: [
      "Add proper access control",
      "Implement token burning mechanism", 
      "Add pause functionality",
      "Set up initial token distribution"
    ]
  },
  {
    id: "defi-exploit",
    title: "DeFi Security Challenge",
    description: "Identify and fix vulnerabilities in a DeFi protocol",
    initialCode: `contract VulnerableVault {
    mapping(address => uint256) public balances;
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        payable(msg.sender).call{value: amount}("");
        balances[msg.sender] -= amount; // Vulnerability!
    }
}`,
    tasks: [
      "Fix the reentrancy vulnerability",
      "Add proper access control",
      "Implement emergency pause",
      "Add slippage protection"
    ]
  }
];

export default function BlockTropolisContent() {
  const [contracts, setContracts] = useState<SmartContract[]>(SMART_CONTRACTS);
  const [buildings, setBuildings] = useState<BlockchainBuilding[]>(BLOCKCHAIN_BUILDINGS);
  const [blockchain, setBlockchain] = useState<Block[]>([]);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<BlockchainQuiz | null>(null);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState(20);
  const [selectedScenario, setSelectedScenario] = useState<typeof SIMULATION_SCENARIOS[0] | null>(null);
  const [userCode, setUserCode] = useState("");
  const [showMiningAnimation, setShowMiningAnimation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [securityAnalysis, setSecurityAnalysis] = useState("");
  
  // MetaMask wallet state
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: "0",
    chainId: null,
    networkName: "Not Connected"
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask is not installed! Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (accounts.length > 0) {
        const address = accounts[0];
        
        // Get balance
        const balanceWei = await window.ethereum!.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        }) as string;
        
        // Convert from Wei to ETH
        const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
        
        // Get network info
        const chainId = await window.ethereum!.request({
          method: 'eth_chainId'
        }) as string;
        
        const networkName = getNetworkName(chainId);
        
        setWallet({
          isConnected: true,
          address,
          balance: balanceEth.toFixed(4),
          chainId,
          networkName
        });
        
        // Listen for account changes
        window.ethereum!.on('accountsChanged', handleAccountsChanged);
        window.ethereum!.on('chainChanged', handleChainChanged);
        
      }
    } catch (error: unknown) {
      console.error('Failed to connect MetaMask:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to connect: ${errorMessage}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: "0",
      chainId: null,
      networkName: "Not Connected"
    });
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const address = accounts[0];
      const balanceWei = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      }) as string;
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
      
      setWallet(prev => ({
        ...prev,
        address,
        balance: balanceEth.toFixed(4)
      }));
    }
  };

  // Handle network changes
  const handleChainChanged = (chainId: string) => {
    const networkName = getNetworkName(chainId);
    setWallet(prev => ({
      ...prev,
      chainId,
      networkName
    }));
    // Refresh balance for new network
    if (wallet.address) {
      refreshBalance();
    }
  };

  // Get network name from chain ID
  const getNetworkName = (chainId: string) => {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
      '0xa86a': 'Avalanche Mainnet',
      '0xa869': 'Avalanche Fuji',
      '0x38': 'BSC Mainnet',
      '0x61': 'BSC Testnet'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  // Refresh wallet balance
  const refreshBalance = async () => {
    if (!wallet.address || !window.ethereum) return;
    
    try {
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [wallet.address, 'latest']
      }) as string;
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18);
      
      setWallet(prev => ({
        ...prev,
        balance: balanceEth.toFixed(4)
      }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum!.request({
            method: 'eth_accounts'
          }) as string[];
          if (accounts.length > 0) {
            connectMetaMask();
          }
        } catch (error) {
          console.error('Failed to check connection:', error);
        }
      }
    };
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    // Initialize with genesis block
    if (blockchain.length === 0) {
      createGenesisBlock();
    }
  }, [blockchain.length]);

  const createGenesisBlock = () => {
    const genesisBlock: Block = {
      id: 0,
      hash: "0000a7b3c5d8e9f2a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0",
      previousHash: "0",
      timestamp: Date.now(),
      transactions: [],
      nonce: 0,
      difficulty: 4
    };
    setBlockchain([genesisBlock]);
  };

  const openContractDialog = (contract: SmartContract) => {
    setSelectedContract(contract);
    setUserCode(contract.code);
    setIsContractDialogOpen(true);
  };

  const deployContract = async () => {
    if (!selectedContract) return;
    
    if (!wallet.isConnected) {
      alert('Please connect your MetaMask wallet first!');
      return;
    }

    setShowMiningAnimation(true);
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create new block with contract deployment
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      from: wallet.address!,
      to: "0x0", // Contract creation
      amount: 0,
      gasPrice: gasPrice,
      gasUsed: 2100000, // Typical contract deployment gas
      status: "confirmed"
    };

    const newBlock: Block = {
      id: blockchain.length,
      hash: generateBlockHash(),
      previousHash: blockchain[blockchain.length - 1]?.hash || "0",
      timestamp: Date.now(),
      transactions: [newTransaction],
      nonce: Math.floor(Math.random() * 1000000),
      difficulty: 4
    };

    setBlockchain(prev => [...prev, newBlock]);
    
    // Update contract status
    setContracts(prev => prev.map(contract => 
      contract.id === selectedContract.id 
        ? { ...contract, isDeployed: true, balance: Math.random() * 100 }
        : contract
    ));

    // Activate buildings
    activateBuildings();
    
    setShowMiningAnimation(false);
    setIsContractDialogOpen(false);
    
    // Refresh wallet balance after deployment
    setTimeout(refreshBalance, 1000);
  };

  const generateBlockHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0000'; // Start with difficulty zeros
    for (let i = 4; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const activateBuildings = () => {
    setBuildings(prev => prev.map(building => ({
      ...building,
      level: Math.min(building.level + 1, 5),
      isActive: true,
      volume: building.volume + Math.random() * 10000,
      users: building.users + Math.floor(Math.random() * 100)
    })));
  };

  const openQuizDialog = (quiz: BlockchainQuiz) => {
    setSelectedQuiz(quiz);
    setCurrentAnswer(null);
    setIsQuizDialogOpen(true);
  };

  const submitQuizAnswer = () => {
    if (selectedQuiz && currentAnswer !== null) {
      const isCorrect = currentAnswer === selectedQuiz.correctAnswer;
      
      if (isCorrect) {
        alert("Correct! Great job understanding blockchain concepts.");
        // Award building upgrade
        upgradeRandomBuilding();
      } else {
        alert(`Incorrect. ${selectedQuiz.explanation}`);
      }
      
      setIsQuizDialogOpen(false);
    }
  };

  const upgradeRandomBuilding = () => {
    const activeBuildings = buildings.filter(b => b.isActive);
    if (activeBuildings.length > 0) {
      const randomBuilding = activeBuildings[Math.floor(Math.random() * activeBuildings.length)];
      setBuildings(prev => prev.map(building => 
        building.id === randomBuilding.id 
          ? { ...building, level: Math.min(building.level + 1, 5) }
          : building
      ));
    }
  };

  const getBuildingGlow = (building: BlockchainBuilding) => {
    if (!building.isActive) return "";
    
    const glowColors = {
      exchange: "shadow-green-400/50 shadow-lg",
      bank: "shadow-blue-400/50 shadow-lg",
      marketplace: "shadow-purple-400/50 shadow-lg",
      governance: "shadow-yellow-400/50 shadow-lg",
      casino: "shadow-red-400/50 shadow-lg"
    };
    
    return glowColors[building.type];
  };

  const getBuildingHeight = (building: BlockchainBuilding) => {
    return 50 + building.level * 10;
  };

  const handleScenarioCodeSubmit = async () => {
    if (selectedScenario && userCode.trim()) {
      setIsAnalyzing(true);
      setSecurityAnalysis("");
      
      try {
        const result = await analyzeSmartContract(userCode, selectedScenario);
        setSecurityAnalysis(result.output);
        
        setTimeout(() => {
          if (result.isSecure) {
            alert("Excellent! You've fixed the reentrancy vulnerability by following the checks-effects-interactions pattern.");
            setSelectedScenario(null);
            upgradeRandomBuilding();
          } else {
            alert("Keep working on the fix. Look for the reentrancy vulnerability in the withdraw function.");
          }
          setIsAnalyzing(false);
        }, 1500);
        
      } catch (error) {
        setSecurityAnalysis(`Security analysis failed: ${error.message}`);
        setIsAnalyzing(false);
      }
    }
  };
  
  const analyzeSmartContract = async (code: string, scenario: {id: string, title: string, tasks: string[]}): Promise<{output: string, isSecure: boolean}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let output = "";
        let isSecure = false;
        
        if (scenario.id === 'defi-exploit') {
          const hasChecksEffectsPattern = code.includes('balances[msg.sender] -= amount;');
          const codeLines = code.split('\n');
          const balanceUpdateLine = codeLines.findIndex(line => line.includes('balances[msg.sender] -= amount'));
          const externalCallLine = codeLines.findIndex(line => line.includes('call{value: amount}'));
          
          const isPatternCorrect = balanceUpdateLine < externalCallLine && balanceUpdateLine !== -1;
          const hasReentrancyGuard = code.includes('nonReentrant') || code.includes('require(!locked');
          const hasAccessControl = code.includes('onlyOwner') || code.includes('require(msg.sender');
          
          output = `🛡️ Smart Contract Security Analysis:\n`;
          output += `• Reentrancy protection: ${isPatternCorrect ? '✅' : '❌'}\n`;
          output += `• Checks-Effects-Interactions: ${isPatternCorrect ? '✅' : '❌'}\n`;
          output += `• Access control: ${hasAccessControl ? '✅' : '⚠️ Consider adding'}\n`;
          output += `• Reentrancy guard: ${hasReentrancyGuard ? '✅' : '⚠️ Consider adding'}\n`;
          
          isSecure = isPatternCorrect;
          output += `\n${isSecure ? '✅ Vulnerability fixed!' : '❌ Reentrancy vulnerability still exists'}`;
          
          if (!isSecure) {
            output += `\n\n💡 Hint: Move the balance update before the external call`;
          }
        } else {
          // Token launch analysis
          const hasAccessControl = code.includes('onlyOwner') || code.includes('AccessControl');
          const hasPauseFunction = code.includes('pause') || code.includes('Pausable');
          const hasBurnFunction = code.includes('burn');
          
          output = `🪙 Token Contract Analysis:\n`;
          output += `• Access control: ${hasAccessControl ? '✅' : '❌'}\n`;
          output += `• Pause functionality: ${hasPauseFunction ? '✅' : '⚠️'}\n`;
          output += `• Burn mechanism: ${hasBurnFunction ? '✅' : '⚠️'}\n`;
          
          isSecure = hasAccessControl && hasPauseFunction;
          output += `\n${isSecure ? '✅ Good token implementation!' : '⚠️ Consider adding missing features'}`;
        }
        
        resolve({ output, isSecure });
      }, 1000 + Math.random() * 1000);
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Wallet & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold">MetaMask Wallet</span>
          </div>
          {wallet.isConnected ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-400">{wallet.balance} ETH</div>
              <div className="text-xs text-gray-400 font-mono">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </div>
              <div className="text-xs text-gray-400">{wallet.networkName}</div>
              <div className="flex gap-2">
                <Button 
                  onClick={refreshBalance}
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-6 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                >
                  Refresh
                </Button>
                <Button 
                  onClick={disconnectWallet}
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-6 border-red-400/30 text-red-400 hover:bg-red-400/10"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg text-gray-400">Not Connected</div>
              <Button 
                onClick={connectMetaMask}
                disabled={isConnecting || !isMetaMaskInstalled()}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white w-full"
              >
                {isConnecting ? 'Connecting...' : isMetaMaskInstalled() ? 'Connect MetaMask' : 'Install MetaMask'}
              </Button>
              {!isMetaMaskInstalled() && (
                <div className="text-xs text-red-400">MetaMask extension required</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold">Network</span>
          </div>
          <div className="text-lg font-bold text-blue-400">Block #{blockchain.length - 1}</div>
          <div className="text-sm text-gray-400">Mainnet</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-white font-semibold">Contracts</span>
          </div>
          <div className="text-lg font-bold text-green-400">
            {contracts.filter(c => c.isDeployed).length}/{contracts.length}
          </div>
          <div className="text-sm text-gray-400">Deployed</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold">DeFi TVL</span>
          </div>
          <div className="text-lg font-bold text-purple-400">
            ${buildings.reduce((sum, b) => sum + b.volume, 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">Total Value</div>
        </div>
      </div>

      {/* Blockchain City */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-black rounded-xl p-8 min-h-[600px] relative overflow-hidden border border-purple-500/20">
        {showMiningAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-6xl animate-bounce">⛏️</div>
          </div>
        )}
        
        {/* Background city grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-16 w-4 h-8 bg-blue-400 rounded-sm animate-pulse"></div>
          <div className="absolute top-15 left-20 w-6 h-12 bg-green-400 rounded-sm animate-pulse delay-500"></div>
          <div className="absolute top-8 left-24 w-5 h-10 bg-purple-400 rounded-sm animate-pulse delay-1000"></div>
          <div className="absolute top-12 right-20 w-4 h-6 bg-yellow-400 rounded-sm animate-pulse delay-1500"></div>
          <div className="absolute bottom-20 left-10 w-8 h-4 bg-red-400 rounded-sm animate-pulse delay-2000"></div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-purple-400" />
          BlockTropolis - Web3 Ecosystem
        </h3>
        
        {/* Smart Contracts */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4">Smart Contracts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {contracts.map((contract) => (
              <button
                key={contract.id}
                onClick={() => openContractDialog(contract)}
                className="group text-left"
              >
                <div className={`
                  relative p-4 rounded-lg border-2 transition-all duration-300 bg-gray-800/90 min-h-[140px] flex flex-col justify-between
                  ${contract.isDeployed 
                    ? 'border-green-500 shadow-green-500/30 shadow-lg' 
                    : 'border-gray-600 hover:border-purple-400 hover:scale-[1.02]'
                  }
                `}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {contract.isDeployed ? (
                        <Unlock className="w-4 h-4 text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-semibold text-white">{contract.name}</span>
                      {contract.isDeployed && (
                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-3 font-mono">
                      {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge 
                      variant={contract.type === "erc20" ? "default" : 
                               contract.type === "erc721" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {contract.type.toUpperCase()}
                    </Badge>
                    
                    {contract.isDeployed ? (
                      <div className="text-xs text-green-400">
                        ✅ Deployed • Balance: {contract.balance.toFixed(2)} ETH
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        🔒 Ready to deploy • Click to start
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DeFi Buildings */}
        <div className="absolute bottom-8 left-8 right-8">
          <h4 className="text-lg font-semibold text-white mb-4">DeFi Infrastructure</h4>
          <div className="flex justify-between items-end">
            {buildings.map((building) => (
              <div 
                key={building.id}
                className={`relative transition-all duration-500 ${getBuildingGlow(building)} cursor-pointer group`}
                style={{ 
                  width: '60px',
                  height: `${getBuildingHeight(building)}px`,
                }}
                onClick={() => building.isActive && alert(`${building.name}\nLevel: ${building.level}\nDaily Volume: $${building.volume.toFixed(0)}\nUsers: ${building.users}`)}
              >
                <div className={`
                  w-full h-full rounded-t-lg border-2 transition-all relative overflow-hidden
                  ${building.isActive 
                    ? 'bg-gradient-to-t from-gray-700 to-purple-500 border-purple-400' 
                    : 'bg-gray-700 border-gray-500'
                  }
                `}>
                  {/* Building windows */}
                  <div className="absolute top-2 left-1 right-1">
                    {Array.from({ length: Math.min(building.level * 2, 8) }).map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 w-1 mb-1 mx-1 inline-block rounded-sm ${
                          building.isActive ? 'bg-yellow-300 animate-pulse' : 'bg-gray-500'
                        }`}
                        style={{ animationDelay: `${i * 0.5}s` }}
                      />
                    ))}
                  </div>
                  
                  {/* Building icon */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    {building.type === 'exchange' && <TrendingUp className="w-4 h-4 text-green-300" />}
                    {building.type === 'bank' && <Shield className="w-4 h-4 text-blue-300" />}
                    {building.type === 'marketplace' && <Gem className="w-4 h-4 text-purple-300" />}
                    {building.type === 'governance' && <Crown className="w-4 h-4 text-yellow-300" />}
                  </div>
                </div>
                
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white text-center w-16">
                  <div className="font-semibold">{building.name}</div>
                  <div className="text-gray-400">Lvl {building.level}</div>
                </div>

                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div>Users: {building.users}</div>
                  <div>Volume: ${building.volume.toFixed(0)}</div>
                  <div>Security: {building.security}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Buttons */}
        <div className="absolute top-4 right-4 space-y-2">
          {BLOCKCHAIN_QUIZZES.slice(0, 3).map((quiz) => (
            <Button 
              key={quiz.id}
              onClick={() => openQuizDialog(quiz)}
              variant="outline"
              size="sm"
              className="bg-purple-800/50 border-purple-400 text-purple-100 hover:bg-purple-700/50"
            >
              {quiz.category} Quiz
            </Button>
          ))}
        </div>

        {/* Simulation Scenarios */}
        <div className="absolute bottom-4 right-4 space-y-2">
          {SIMULATION_SCENARIOS.map((scenario) => (
            <Button 
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario);
                setUserCode(scenario.initialCode);
              }}
              variant="outline"
              size="sm"
              className="bg-red-800/50 border-red-400 text-red-100 hover:bg-red-700/50"
            >
              {scenario.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Contract Deployment Dialog */}
      <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-400" />
              {selectedContract?.name} - Smart Contract
            </DialogTitle>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-6">
              {/* Contract Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{selectedContract.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator:</span>
                      <span className="text-white">{selectedContract.creator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Address:</span>
                      <span className="text-purple-400 font-mono text-xs">{selectedContract.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={selectedContract.isDeployed ? "text-green-400" : "text-yellow-400"}>
                        {selectedContract.isDeployed ? "Deployed" : "Not Deployed"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Deployment Cost</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas Limit:</span>
                      <span className="text-white">2,100,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas Price:</span>
                      <span className="text-white">{gasPrice} Gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Cost:</span>
                      <span className="text-yellow-400">{(gasPrice * 2.1).toFixed(4)} ETH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Code */}
              <div>
                <h4 className="font-semibold text-white mb-2">Smart Contract Code</h4>
                <Textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="h-64 font-mono text-sm bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter your smart contract code..."
                />
              </div>

              {/* Deploy Button */}
              <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => setIsContractDialogOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={deployContract}
                  disabled={selectedContract.isDeployed}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {selectedContract.isDeployed ? "Already Deployed" : "Deploy Contract"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Blockchain Knowledge Quiz
              <Badge variant={selectedQuiz?.difficulty === "easy" ? "secondary" : 
                             selectedQuiz?.difficulty === "medium" ? "default" : "destructive"}>
                {selectedQuiz?.difficulty}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedQuiz && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-white text-lg">{selectedQuiz.question}</p>
              </div>

              <div className="space-y-2">
                {selectedQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAnswer(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      currentAnswer === index 
                        ? 'border-purple-500 bg-purple-500/20' 
                        : 'border-gray-600 bg-gray-800 hover:border-purple-400'
                    }`}
                  >
                    <span className="text-white">{String.fromCharCode(65 + index)}. {option}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => setIsQuizDialogOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitQuizAnswer}
                  disabled={currentAnswer === null}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Submit Answer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scenario Dialog */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              {selectedScenario.title}
            </h4>
            <p className="text-gray-300 mb-4">{selectedScenario.description}</p>
            
            <div className="mb-4">
              <h5 className="font-semibold text-white mb-2">Tasks to Complete:</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {selectedScenario.tasks.map((task: string, index: number) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-white mb-2">Smart Contract Code:</h5>
              <Textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="min-h-[300px] font-mono bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            {/* Real-time security analysis */}
            {securityAnalysis && (
              <div className="mb-4">
                <h5 className="font-semibold text-white mb-2">Security Analysis:</h5>
                <div className="bg-black/50 border border-gray-600 rounded p-3">
                  <pre className="text-sm text-orange-400 whitespace-pre-wrap">{securityAnalysis}</pre>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isAnalyzing && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Running security analysis...</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button 
                onClick={() => setSelectedScenario(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleScenarioCodeSubmit}
                className="bg-green-600 hover:bg-green-700"
                disabled={!userCode.trim() || isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Submit Solution'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}