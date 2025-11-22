// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title GreenFiCore - Staking + Impact NFT protocol
contract GreenFiCore is Ownable, ReentrancyGuard, Pausable, ERC721URIStorage {
    // ------------------------------------------------------
    // Types
    // ------------------------------------------------------

    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt; // rewards already claimed
        uint256 lastUpdated;
        uint256 startTime;
    }

    struct ImpactMetadata {
        uint256 carbonOffset; // e.g. in kg or tons * 1e18
        string projectName;
        string date; // ISO-8601 string
        string badgeTier; // e.g. "Seed", "Forest", "Guardian"
    }

    // ------------------------------------------------------
    // State
    // ------------------------------------------------------

    IERC20 public immutable stakingToken;

    // APR in basis points (1% = 100 bps)
    uint256 public aprBps; // e.g. 1000 = 10% APR

    uint256 public minStakeAmount;
    uint256 public lockPeriod; // seconds, optional

    uint256 public nextTokenId = 1;

    mapping(address => StakeInfo) public stakes;
    mapping(uint256 => ImpactMetadata) public impactMetadataByTokenId;

    // ------------------------------------------------------
    // Events
    // ------------------------------------------------------

    event Stake(address indexed user, uint256 amount, uint256 timestamp);
    event Unstake(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
    event ClaimReward(address indexed user, uint256 reward, uint256 timestamp);
    event MintImpactNFT(
        address indexed user,
        uint256 indexed tokenId,
        uint256 carbonOffset,
        string projectName,
        string date,
        string badgeTier
    );
    event ProjectFunded(uint256 indexed projectId, uint256 amount, string projectName);

    // ------------------------------------------------------
    // Constructor
    // ------------------------------------------------------

    constructor(
        address _stakingToken,
        uint256 _aprBps,
        uint256 _minStakeAmount,
        uint256 _lockPeriod
    ) ERC721("GreenFi Impact NFT", "GFIMPACT") {
        require(_stakingToken != address(0), "Invalid token");
        stakingToken = IERC20(_stakingToken);
        aprBps = _aprBps;
        minStakeAmount = _minStakeAmount;
        lockPeriod = _lockPeriod;
    }

    // ------------------------------------------------------
    // Modifiers / Views
    // ------------------------------------------------------

    function _pendingReward(address _user) internal view returns (uint256) {
        StakeInfo memory s = stakes[_user];
        if (s.amount == 0) return 0;

        uint256 timeDiff = block.timestamp - s.lastUpdated;
        // reward = amount * apr * time / (365 days * 10000)
        uint256 yearly = s.amount * aprBps / 10000;
        uint256 reward = yearly * timeDiff / 365 days;

        return reward;
    }

    function pendingReward(address _user) external view returns (uint256) {
        return _pendingReward(_user);
    }

    // ------------------------------------------------------
    // Core staking logic
    // ------------------------------------------------------

    function stake(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount >= minStakeAmount, "Amount too low");

        StakeInfo storage s = stakes[msg.sender];

        // calculate and accumulate pending rewards
        uint256 reward = _pendingReward(msg.sender);
        s.rewardDebt += reward;

        // transfer tokens in
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        s.amount += _amount;
        s.lastUpdated = block.timestamp;
        if (s.startTime == 0) {
            s.startTime = block.timestamp;
        }

        emit Stake(msg.sender, _amount, block.timestamp);
    }

    function _canWithdraw(StakeInfo memory s) internal view returns (bool) {
        if (lockPeriod == 0) return true;
        if (s.startTime == 0) return true;
        return block.timestamp >= s.startTime + lockPeriod;
    }

    function claimReward() public nonReentrant whenNotPaused {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount > 0, "No stake");

        uint256 reward = _pendingReward(msg.sender) + s.rewardDebt;
        require(reward > 0, "No rewards");

        s.rewardDebt = 0;
        s.lastUpdated = block.timestamp;

        require(stakingToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit ClaimReward(msg.sender, reward, block.timestamp);
    }

    function unstake(uint256 _amount) external nonReentrant whenNotPaused {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount >= _amount && _amount > 0, "Invalid amount");
        require(_canWithdraw(s), "Stake locked");

        uint256 reward = _pendingReward(msg.sender) + s.rewardDebt;

        s.amount -= _amount;
        s.rewardDebt = 0;
        s.lastUpdated = block.timestamp;

        require(stakingToken.transfer(msg.sender, _amount), "Unstake transfer failed");
        if (reward > 0) {
            require(stakingToken.transfer(msg.sender, reward), "Reward transfer failed");
        }

        emit Unstake(msg.sender, _amount, reward, block.timestamp);
    }

    // ------------------------------------------------------
    // Impact NFT logic
    // ------------------------------------------------------

    function _mintImpactNFT(
        address _to,
        uint256 _carbonOffset,
        string memory _projectName,
        string memory _date,
        string memory _badgeTier,
        string memory _tokenURI
    ) internal returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        _safeMint(_to, tokenId);
        if (bytes(_tokenURI).length > 0) {
            _setTokenURI(tokenId, _tokenURI);
        }

        impactMetadataByTokenId[tokenId] = ImpactMetadata({
            carbonOffset: _carbonOffset,
            projectName: _projectName,
            date: _date,
            badgeTier: _badgeTier
        });

        emit MintImpactNFT(_to, tokenId, _carbonOffset, _projectName, _date, _badgeTier);
    }

    /// @notice Mint NFT automatically for a staker (e.g. on milestone or task completion)
    function mintImpactNFTForUser(
        address _user,
        uint256 _carbonOffset,
        string calldata _projectName,
        string calldata _date,
        string calldata _badgeTier,
        string calldata _tokenURI
    ) external onlyOwner returns (uint256) {
        return _mintImpactNFT(_user, _carbonOffset, _projectName, _date, _badgeTier, _tokenURI);
    }

    // ------------------------------------------------------
    // Admin functions
    // ------------------------------------------------------

    function setAPR(uint256 _aprBps) external onlyOwner {
        require(_aprBps <= 5000, "APR too high"); // max 50%
        aprBps = _aprBps;
    }

    function setMinStakeAmount(uint256 _minStakeAmount) external onlyOwner {
        minStakeAmount = _minStakeAmount;
    }

    function setLockPeriod(uint256 _lockPeriod) external onlyOwner {
        lockPeriod = _lockPeriod;
    }

    function withdrawPlatformFunds(uint256 _amount, address _to) external onlyOwner {
        require(_to != address(0), "Invalid to");
        require(stakingToken.transfer(_to, _amount), "Withdraw failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Emit a ProjectFunded event for off-chain tracking
    function emitProjectFunded(uint256 _projectId, uint256 _amount, string calldata _projectName) external onlyOwner {
        emit ProjectFunded(_projectId, _amount, _projectName);
    }

    // ------------------------------------------------------
    // Overrides
    // ------------------------------------------------------

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
