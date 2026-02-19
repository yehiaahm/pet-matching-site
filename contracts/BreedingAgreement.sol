// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * BreedingAgreement
 * - Immutable record of breeding agreements between two parties
 * - Stores hashed references to health/genetic docs
 * - Enforces both-party signatures and optional moderator approval
 */
contract BreedingAgreement {
    enum Status { Draft, Active, Completed, Cancelled }

    struct Agreement {
        address partyA;
        address partyB;
        bytes32 petAId;
        bytes32 petBId;
        bytes32 healthDocsHash;   // keccak256 hash of off-chain docs bundle
        bytes32 geneticsDocsHash; // keccak256 hash of off-chain genetics
        uint256 createdAt;
        Status status;
        bool partyASigned;
        bool partyBSigned;
        bool moderatorApproved;
        uint256 feeWei;           // fixed execution fee (optional)
    }

    address public moderator;
    uint256 public agreementCount;
    mapping(uint256 => Agreement) public agreements;

    event AgreementCreated(uint256 indexed id, address indexed partyA, address indexed partyB);
    event AgreementSigned(uint256 indexed id, address indexed party, bool aSigned, bool bSigned);
    event AgreementApproved(uint256 indexed id, address indexed moderator);
    event AgreementStatusChanged(uint256 indexed id, Status status);

    modifier onlyModerator() { require(msg.sender == moderator, "not moderator"); _; }

    constructor(address _moderator) { moderator = _moderator; }

    function createAgreement(
        address partyB,
        bytes32 petAId,
        bytes32 petBId,
        bytes32 healthDocsHash,
        bytes32 geneticsDocsHash,
        uint256 feeWei
    ) external returns (uint256 id) {
        id = ++agreementCount;
        agreements[id] = Agreement({
            partyA: msg.sender,
            partyB: partyB,
            petAId: petAId,
            petBId: petBId,
            healthDocsHash: healthDocsHash,
            geneticsDocsHash: geneticsDocsHash,
            createdAt: block.timestamp,
            status: Status.Draft,
            partyASigned: false,
            partyBSigned: false,
            moderatorApproved: false,
            feeWei: feeWei
        });
        emit AgreementCreated(id, msg.sender, partyB);
    }

    function sign(uint256 id) external {
        Agreement storage a = agreements[id];
        require(a.partyA != address(0), "invalid id");
        require(a.status == Status.Draft, "not draft");
        require(msg.sender == a.partyA || msg.sender == a.partyB, "not a party");
        if (msg.sender == a.partyA) a.partyASigned = true; else a.partyBSigned = true;
        emit AgreementSigned(id, msg.sender, a.partyASigned, a.partyBSigned);
        if (a.partyASigned && a.partyBSigned) {
            a.status = Status.Active;
            emit AgreementStatusChanged(id, a.status);
        }
    }

    function approve(uint256 id) external onlyModerator {
        Agreement storage a = agreements[id];
        require(a.partyA != address(0), "invalid id");
        a.moderatorApproved = true;
        emit AgreementApproved(id, msg.sender);
    }

    function complete(uint256 id) external payable {
        Agreement storage a = agreements[id];
        require(a.status == Status.Active, "not active");
        require(msg.sender == a.partyA || msg.sender == a.partyB, "not a party");
        require(msg.value >= a.feeWei, "fee not paid");
        a.status = Status.Completed;
        emit AgreementStatusChanged(id, a.status);
    }

    function cancel(uint256 id) external {
        Agreement storage a = agreements[id];
        require(msg.sender == a.partyA || msg.sender == a.partyB || msg.sender == moderator, "not authorized");
        a.status = Status.Cancelled;
        emit AgreementStatusChanged(id, a.status);
    }
}
