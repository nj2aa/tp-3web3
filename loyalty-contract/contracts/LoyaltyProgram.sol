// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LoyaltyProgram {

    // ── Variables d'état ──────────────────────────────────────────────
    address public owner;
    mapping(address => uint256) public points;
    mapping(address => uint256) public dernierCheckIn;
    mapping(address => uint256) public recompensesReclamees;

    uint256 public constant POINTS_PAR_CHECKIN = 10;
    uint256 public constant SEUIL_RECOMPENSE = 50;
    uint256 public constant COOLDOWN = 1 minutes;

    // ── Events ────────────────────────────────────────────────────────
    event CheckIn(address indexed utilisateur, uint256 pointsGagnes, uint256 totalPoints);
    event RecompenseReclamee(address indexed utilisateur, uint256 nombreRecompenses);

    // ── Constructor ───────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ── Lecture ───────────────────────────────────────────────────────
    function getPoints(address utilisateur) external view returns (uint256) {
        return points[utilisateur];
    }

    function getRecompenses(address utilisateur) external view returns (uint256) {
        return recompensesReclamees[utilisateur];
    }

    // ── Écriture ──────────────────────────────────────────────────────
    function checkIn() external {
        require(
            block.timestamp >= dernierCheckIn[msg.sender] + COOLDOWN,
            "Attends 1 minute entre deux check-ins"
        );

        dernierCheckIn[msg.sender] = block.timestamp;
        points[msg.sender] += POINTS_PAR_CHECKIN;

        emit CheckIn(msg.sender, POINTS_PAR_CHECKIN, points[msg.sender]);
    }

    function reclamerRecompense() external {
        require(points[msg.sender] >= SEUIL_RECOMPENSE, "Pas assez de points");

        points[msg.sender] -= SEUIL_RECOMPENSE;
        recompensesReclamees[msg.sender] += 1;

        emit RecompenseReclamee(msg.sender, recompensesReclamees[msg.sender]);
    }
}