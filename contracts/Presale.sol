//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Presale is AccessControlEnumerable {
    using SafeERC20 for IERC20;

    event Deposited(
        address indexed depositor,
        uint256 amount,
        uint256 timestamp
    );
    event Claimed(address indexed depositor, uint256 amount);

    struct Deposit {
        address depositor;
        uint256 amount;
        uint256 timestamp;
    }

    ERC20Burnable public dlycop;
    ERC20PresetMinterPauser public dly;
    uint256 public earlyMultiplier; // ToDo: The earlier to launching,the more tokens
    uint256 public launchTime;
    uint256 public finishTime;
    uint256 public totalDeposited;
    uint256 public totalClaimed;
    mapping(address => uint256) public claimedAmountsByAddress;
    mapping(address => Deposit[]) public depositsByAddress;
    uint256 public constant RATE_PER_SECOND = 633; // Per Billion
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    modifier onlyAfterLaunch() {
        require(hasLaunched(), "NOT_LAUNCHED");
        _;
    }

    modifier onlyDuringPresale() {
        require(hasLaunched(), "NOT_LAUNCHED");
        require(!hasFinished(), "FINISHED");
        _;
    }

    constructor(ERC20Burnable _dlycop, ERC20PresetMinterPauser _dly) {
        dlycop = _dlycop;
        dly = _dly;
        _grantRole(GOVERNOR_ROLE, msg.sender);
    }

    function hasLaunched() public view returns (bool) {
        return launchTime > 0 && block.timestamp >= launchTime;
    }

    function hasFinished() public view returns (bool) {
        return finishTime > 0 && block.timestamp >= finishTime;
    }

    function getClaimableAmount(address _depositor)
        public
        view
        returns (uint256 amount)
    {
        if (!hasLaunched()) {
            return 0;
        }
        Deposit[] storage deposits = depositsByAddress[_depositor];
        for (uint256 index = 0; index < deposits.length; index++) {
            // The deposit should only generate DLY until the finish time of the presale
            uint256 until = block.timestamp > finishTime
                ? finishTime
                : block.timestamp;
            uint256 duration = until - deposits[index].timestamp;
            amount += ((deposits[index].amount * duration * RATE_PER_SECOND) /
                1000000000);
        }
        // Substract the amount of tokens that were already claimed by this address
        amount -= claimedAmountsByAddress[_depositor];
    }

    function deposit(uint256 _amount) external onlyDuringPresale {
        require(
            dlycop.allowance(msg.sender, address(this)) >= _amount,
            "NOT_ENOUGH_ALLOWANCE"
        );
        dlycop.burnFrom(msg.sender, _amount);
        Deposit[] storage deposits = depositsByAddress[msg.sender];
        deposits.push(Deposit(msg.sender, _amount, block.timestamp));
        totalDeposited += _amount;

        emit Deposited(msg.sender, _amount, block.timestamp);
    }

    function claim(uint256 _amount) external onlyAfterLaunch {
        uint256 claimableAmount = getClaimableAmount(msg.sender);
        require(claimableAmount >= _amount, "INSUFFICIENT_AVAILABLE");

        dly.mint(msg.sender, _amount);

        claimedAmountsByAddress[msg.sender] += _amount;
        totalClaimed += _amount;

        emit Claimed(msg.sender, _amount);
    }

    function setLaunchTime(uint256 _timestamp)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        launchTime = _timestamp;
    }

    function setFinishTime(uint256 _timestamp)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        finishTime = _timestamp;
    }
}
