export const FACTORY_ABI = [
  "function createBountyWithETH(uint256 _deadline, string memory _title, string memory _description, string memory _metadataURI) external payable returns (address)",
  "function createBountyWithToken(address _rewardToken, uint256 _rewardAmount, uint256 _deadline, string memory _title, string memory _description, string memory _metadataURI) external returns (address)",
  "function getTotalBounties() external view returns (uint256)",
  "function getBounties(uint256 _start, uint256 _count) external view returns (address[])",
  "function getBountiesByCreator(address _creator) external view returns (address[])",
  "function getBountyInfo(address _bountyAddress) external view returns (address, address, uint256, address, bool, uint256, uint256, uint256, string, string)",
  "function platformFee() external view returns (uint256)",
  "function feeCollector() external view returns (address)",
  "event BountyCreated(address indexed creator, address indexed bountyAddress, address rewardToken, uint256 rewardAmount, uint256 deadline, string title)"
];

export const BOUNTY_ABI = [
  "function submitSolution(string memory _solutionURI) external",
  "function selectWinner(address _winner) external",
  "function cancelBounty() external",
  "function extendDeadline(uint256 _newDeadline) external",
  "function getBountyInfo() external view returns (address, address, uint256, address, bool, uint256, uint256, uint256, string, string)",
  "function getSubmission(address _participant) external view returns (string, uint256, bool)",
  "function getParticipant(uint256 _index) external view returns (address)",
  "function getParticipantCount() external view returns (uint256)",
  "function hasEnded() external view returns (bool)",
  "function timeRemaining() external view returns (uint256)",
  "function hasSubmitted(address _participant) external view returns (bool)",
  "function owner() external view returns (address)",
  "function rewardToken() external view returns (address)",
  "function rewardAmount() external view returns (uint256)",
  "function winner() external view returns (address)",
  "function isActive() external view returns (bool)",
  "function deadline() external view returns (uint256)",
  "function submissionCount() external view returns (uint256)",
  "event SubmissionReceived(address indexed participant, string solutionURI, uint256 timestamp)",
  "event WinnerSelected(address indexed winner, uint256 rewardAmount, uint256 timestamp)",
  "event BountyCancelled(address indexed creator, uint256 refundAmount, uint256 timestamp)",
  "event DeadlineExtended(uint256 oldDeadline, uint256 newDeadline)"
];

export const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

export const SCROLL_USDC_ADDRESS = "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4"; // Scroll Mainnet USDC

export const NETWORKS = {
  SCROLL_MAINNET: {
    chainId: 534352,
    name: "Scroll",
    rpcUrl: "https://rpc.scroll.io",
    explorer: "https://scrollscan.com",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  },
  SCROLL_SEPOLIA: {
    chainId: 534351,
    name: "Scroll Sepolia",
    rpcUrl: "https://sepolia-rpc.scroll.io",
    explorer: "https://sepolia.scrollscan.com",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  }
};
