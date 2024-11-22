const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

const provider = waffle.provider;

describe("Greeter", function () {
  let Greeter, greeter, owner, addr1, addr2;

  beforeEach(async function () {
    Greeter = await ethers.getContractFactory("Greeter");
    [owner, addr1, addr2] = await ethers.getSigners(); // Lấy các tài khoản để test
    greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();
  });

  it("Should return the initial greeting", async function () {
    expect(await greeter.greet()).to.equal("Hello, world!");
  });

  it("Should change the greeting", async function () {
    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
    await setGreetingTx.wait();
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });

  it("Should allow depositing ETH to the contract", async function () {
    const depositAmount = ethers.utils.parseEther("1.0"); // 1 ETH

    await greeter.connect(addr1).deposit({ value: depositAmount });

    const contractBalance = await provider.getBalance(greeter.address);
    expect(contractBalance).to.equal(depositAmount);
  });

  it("Should allow transferring ETH from the contract", async function () {
    const depositAmount = ethers.utils.parseEther("2.0"); // 2 ETH
    const transferAmount = ethers.utils.parseEther("1.0"); // 1 ETH

    // Addr1 deposits 2 ETH into the contract
    await greeter.connect(addr1).deposit({ value: depositAmount });

    // Transfer 1 ETH to Addr2
    await greeter.transferTo(addr2.address, transferAmount);

    const contractBalance = await provider.getBalance(greeter.address);
    const addr2Balance = await provider.getBalance(addr2.address);

    // Check contract balance (should be 1 ETH)
    expect(contractBalance).to.equal(depositAmount.sub(transferAmount));

    // Addr2 balance increased by 1 ETH
    expect(addr2Balance).to.be.above(ethers.utils.parseEther("10000.0")); // Giá trị phụ thuộc vào mạng thử nghiệm
  });

  it("Should revert transfer if contract has insufficient balance", async function () {
    const depositAmount = ethers.utils.parseEther("0.5"); // 0.5 ETH
    const transferAmount = ethers.utils.parseEther("1.0"); // 1 ETH

    // Addr1 deposits 0.5 ETH
    await greeter.connect(addr1).deposit({ value: depositAmount });

    // Try transferring 1 ETH (should fail)
    await expect(
        greeter.transferTo(addr2.address, transferAmount)
    ).to.be.revertedWith("Insufficient balance");
  });

  it("Should revert transfer if recipient address is invalid", async function () {
    const depositAmount = ethers.utils.parseEther("1.0"); // 1 ETH

    // Addr1 deposits 1 ETH
    await greeter.connect(addr1).deposit({ value: depositAmount });

    // Try transferring to an invalid address
    await expect(
        greeter.transferTo("0x0000000000000000000000000000000000000000", depositAmount)
    ).to.be.revertedWith("Invalid recipient address");
  });

  it("Should emit events for deposit and transfer", async function () {
    const depositAmount = ethers.utils.parseEther("1.0"); // 1 ETH
    const transferAmount = ethers.utils.parseEther("0.5"); // 0.5 ETH

    // Deposit event
    await expect(greeter.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(greeter, "Deposit")
        .withArgs(addr1.address, depositAmount);

    // Transfer event
    await expect(greeter.transferTo(addr2.address, transferAmount))
        .to.emit(greeter, "Transfer")
        .withArgs(addr2.address, transferAmount);
  });
});