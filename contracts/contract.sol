// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BountyWave
 * @notice Plataforma descentralizada de retos con recompensas automáticas
 * @dev Contrato para crear bounties, recibir propuestas y distribuir premios
 */
contract BountyWave is ReentrancyGuard, Ownable {
    
    // ==================== STRUCTS ====================
    
    struct Challenge {
        uint256 id;
        address sponsor;
        string title;
        string description;
        uint256 rewardAmount;
        uint256 deadline;
        uint256 maxWinners;
        bool isActive;
        bool isCompleted;
        uint256 participantCount;
        uint256 winnerCount;
    }
    
    struct Proposal {
        address solver;
        uint256 challengeId;
        string submissionURI; // IPFS hash o URL de la solución
        uint256 timestamp;
        bool isWinner;
        bool rewardClaimed;
    }
    
    struct UserProfile {
        uint256 participations;
        uint256 wins;
        uint256 totalEarned;
        uint256 reputation;
    }
    
    // ==================== STATE VARIABLES ====================
    
    uint256 public challengeCounter;
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 3; // 3% fee
    uint256 public platformBalance;
    
    // Mappings principales
    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => mapping(address => Proposal)) public proposals;
    mapping(uint256 => address[]) public challengeParticipants;
    mapping(uint256 => address[]) public challengeWinners;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => bool) public verifiedSponsors;
    
    // ==================== EVENTS ====================
    
    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed sponsor,
        string title,
        uint256 rewardAmount,
        uint256 deadline
    );
    
    event ProposalSubmitted(
        uint256 indexed challengeId,
        address indexed solver,
        string submissionURI,
        uint256 timestamp
    );
    
    event WinnerSelected(
        uint256 indexed challengeId,
        address indexed winner,
        uint256 rewardAmount
    );
    
    event RewardClaimed(
        uint256 indexed challengeId,
        address indexed winner,
        uint256 amount
    );
    
    event ChallengeCancelled(
        uint256 indexed challengeId,
        address indexed sponsor
    );
    
    event SponsorVerified(address indexed sponsor);
    
    // ==================== MODIFIERS ====================
    
    modifier onlyVerifiedSponsor() {
        require(verifiedSponsors[msg.sender] || msg.sender == owner(), "No eres sponsor verificado");
        _;
    }
    
    modifier challengeExists(uint256 _challengeId) {
        require(_challengeId > 0 && _challengeId <= challengeCounter, "Reto no existe");
        _;
    }
    
    modifier challengeActive(uint256 _challengeId) {
        require(challenges[_challengeId].isActive, "Reto no esta activo");
        require(block.timestamp < challenges[_challengeId].deadline, "Reto finalizado");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor() Ownable(msg.sender) {
        verifiedSponsors[msg.sender] = true;
    }
    
    // ==================== FUNCIONES SPONSOR ====================
    
    /**
     * @notice Crear un nuevo reto con recompensa
     * @param _title Título del reto
     * @param _description Descripción detallada
     * @param _deadline Timestamp de cierre
     * @param _maxWinners Número máximo de ganadores
     */
    function createChallenge(
        string memory _title,
        string memory _description,
        uint256 _deadline,
        uint256 _maxWinners
    ) external payable onlyVerifiedSponsor nonReentrant {
        require(msg.value > 0, "Recompensa debe ser mayor a 0");
        require(_deadline > block.timestamp, "Deadline debe ser futuro");
        require(_maxWinners > 0, "Debe haber al menos 1 ganador");
        require(bytes(_title).length > 0, "Titulo requerido");
        
        challengeCounter++;
        
        challenges[challengeCounter] = Challenge({
            id: challengeCounter,
            sponsor: msg.sender,
            title: _title,
            description: _description,
            rewardAmount: msg.value,
            deadline: _deadline,
            maxWinners: _maxWinners,
            isActive: true,
            isCompleted: false,
            participantCount: 0,
            winnerCount: 0
        });
        
        emit ChallengeCreated(
            challengeCounter,
            msg.sender,
            _title,
            msg.value,
            _deadline
        );
    }
    
    /**
     * @notice Seleccionar ganadores de un reto
     * @param _challengeId ID del reto
     * @param _winners Array de direcciones ganadoras
     */
    function selectWinners(
        uint256 _challengeId,
        address[] memory _winners
    ) external challengeExists(_challengeId) nonReentrant {
        Challenge storage challenge = challenges[_challengeId];
        
        require(msg.sender == challenge.sponsor, "Solo el sponsor puede seleccionar");
        require(challenge.isActive, "Reto no activo");
        require(!challenge.isCompleted, "Reto ya completado");
        require(_winners.length <= challenge.maxWinners, "Excede maximo de ganadores");
        require(_winners.length > 0, "Debe haber al menos 1 ganador");
        
        uint256 rewardPerWinner = challenge.rewardAmount / _winners.length;
        uint256 platformFee = (rewardPerWinner * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 netReward = rewardPerWinner - platformFee;
        
        for (uint256 i = 0; i < _winners.length; i++) {
            address winner = _winners[i];
            require(winner != address(0), "Direccion invalida");
            
            Proposal storage proposal = proposals[_challengeId][winner];
            require(proposal.solver == winner, "No ha participado");
            require(!proposal.isWinner, "Ya es ganador");
            
            proposal.isWinner = true;
            challengeWinners[_challengeId].push(winner);
            
            // Actualizar perfil del ganador
            userProfiles[winner].wins++;
            userProfiles[winner].totalEarned += netReward;
            userProfiles[winner].reputation += 100;
            
            // Transferir recompensa automáticamente
            platformBalance += platformFee;
            (bool success, ) = payable(winner).call{value: netReward}("");
            require(success, "Transferencia fallida");
            
            proposal.rewardClaimed = true;
            
            emit WinnerSelected(_challengeId, winner, netReward);
            emit RewardClaimed(_challengeId, winner, netReward);
        }
        
        challenge.isCompleted = true;
        challenge.isActive = false;
        challenge.winnerCount = _winners.length;
    }
    
    /**
     * @notice Cancelar un reto y recuperar fondos
     * @param _challengeId ID del reto
     */
    function cancelChallenge(uint256 _challengeId) 
        external 
        challengeExists(_challengeId) 
        nonReentrant 
    {
        Challenge storage challenge = challenges[_challengeId];
        
        require(msg.sender == challenge.sponsor, "Solo el sponsor puede cancelar");
        require(challenge.isActive, "Reto no activo");
        require(challenge.participantCount == 0, "Ya hay participantes");
        
        challenge.isActive = false;
        
        (bool success, ) = payable(msg.sender).call{value: challenge.rewardAmount}("");
        require(success, "Reembolso fallido");
        
        emit ChallengeCancelled(_challengeId, msg.sender);
    }
    
    // ==================== FUNCIONES SOLVER ====================
    
    /**
     * @notice Enviar propuesta a un reto
     * @param _challengeId ID del reto
     * @param _submissionURI URI de la solución (IPFS/URL)
     */
    function submitProposal(
        uint256 _challengeId,
        string memory _submissionURI
    ) external challengeExists(_challengeId) challengeActive(_challengeId) {
        require(bytes(_submissionURI).length > 0, "URI requerido");
        require(proposals[_challengeId][msg.sender].solver == address(0), "Ya participaste");
        
        Challenge storage challenge = challenges[_challengeId];
        
        proposals[_challengeId][msg.sender] = Proposal({
            solver: msg.sender,
            challengeId: _challengeId,
            submissionURI: _submissionURI,
            timestamp: block.timestamp,
            isWinner: false,
            rewardClaimed: false
        });
        
        challengeParticipants[_challengeId].push(msg.sender);
        challenge.participantCount++;
        
        // Actualizar perfil
        userProfiles[msg.sender].participations++;
        userProfiles[msg.sender].reputation += 10;
        
        emit ProposalSubmitted(_challengeId, msg.sender, _submissionURI, block.timestamp);
    }
    
    // ==================== FUNCIONES ADMIN ====================
    
    /**
     * @notice Verificar un sponsor
     * @param _sponsor Dirección del sponsor
     */
    function verifySponsor(address _sponsor) external onlyOwner {
        require(_sponsor != address(0), "Direccion invalida");
        verifiedSponsors[_sponsor] = true;
        emit SponsorVerified(_sponsor);
    }
    
    /**
     * @notice Remover verificación de sponsor
     * @param _sponsor Dirección del sponsor
     */
    function removeSponsor(address _sponsor) external onlyOwner {
        verifiedSponsors[_sponsor] = false;
    }
    
    /**
     * @notice Retirar fees de la plataforma
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        require(platformBalance > 0, "Sin balance");
        uint256 amount = platformBalance;
        platformBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Retiro fallido");
    }
    
    // ==================== FUNCIONES VIEW ====================
    
    /**
     * @notice Obtener detalles de un reto
     */
    function getChallenge(uint256 _challengeId) 
        external 
        view 
        challengeExists(_challengeId) 
        returns (Challenge memory) 
    {
        return challenges[_challengeId];
    }
    
    /**
     * @notice Obtener participantes de un reto
     */
    function getChallengeParticipants(uint256 _challengeId) 
        external 
        view 
        challengeExists(_challengeId) 
        returns (address[] memory) 
    {
        return challengeParticipants[_challengeId];
    }
    
    /**
     * @notice Obtener ganadores de un reto
     */
    function getChallengeWinners(uint256 _challengeId) 
        external 
        view 
        challengeExists(_challengeId) 
        returns (address[] memory) 
    {
        return challengeWinners[_challengeId];
    }
    
    /**
     * @notice Obtener propuesta de un usuario
     */
    function getProposal(uint256 _challengeId, address _solver) 
        external 
        view 
        challengeExists(_challengeId) 
        returns (Proposal memory) 
    {
        return proposals[_challengeId][_solver];
    }
    
    /**
     * @notice Obtener perfil de usuario
     */
    function getUserProfile(address _user) 
        external 
        view 
        returns (UserProfile memory) 
    {
        return userProfiles[_user];
    }
    
    /**
     * @notice Verificar si un reto está activo
     */
    function isChallengeActive(uint256 _challengeId) 
        external 
        view 
        challengeExists(_challengeId) 
        returns (bool) 
    {
        Challenge memory challenge = challenges[_challengeId];
        return challenge.isActive && block.timestamp < challenge.deadline;
    }
    
    /**
     * @notice Obtener retos activos (últimos 50)
     */
    function getActiveChallenges() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = challengeCounter; i > 0 && count < 50; i--) {
            if (challenges[i].isActive && block.timestamp < challenges[i].deadline) {
                count++;
            }
        }
        
        uint256[] memory activeChallenges = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = challengeCounter; i > 0 && index < count; i--) {
            if (challenges[i].isActive && block.timestamp < challenges[i].deadline) {
                activeChallenges[index] = i;
                index++;
            }
        }
        
        return activeChallenges;
    }
    
    // ==================== FALLBACK ====================
    
    receive() external payable {}
}