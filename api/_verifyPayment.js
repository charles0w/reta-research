// On-chain payment verification via a standard Ethereum JSON-RPC endpoint.
//
// Set ETH_RPC_URL to a mainnet JSON-RPC URL (Alchemy / Infura / QuickNode / your
// own node). Without it, orders are held as 'pending' and the cron reconciler
// will attempt verification once the URL is configured.
//
// Because the client POSTs the order immediately after the wallet returns the
// tx hash — i.e. BEFORE the tx is mined — a freshly-submitted payment is almost
// always 'pending' here. The cron reconciler (api/cron/verify-orders.js) flips
// 'pending' -> 'verified'/'mismatch' once the tx is mined.

const RECIPIENT = (
  process.env.RECIPIENT_ADDRESS || "0xDc074770cA4d806c03a172fE02231Dae37B6f25A"
).toLowerCase();
const USDC_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // mainnet USDC
// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const CONFIRMATION_DEPTH = Math.max(1, parseInt(process.env.CONFIRMATION_DEPTH || "12", 10));

async function rpc(method, params) {
  const res = await fetch(process.env.ETH_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

const topicToAddress = (t) => "0x" + t.slice(26).toLowerCase();

// Verify that txHash is a confirmed payment of >= expectedUsd to RECIPIENT.
// Returns one of:
//   { status: 'pending', detail }        - tx not mined / insufficient confirmations / RPC not configured
//   { status: 'verified', detail, from } - mined, confirmed, correct recipient & sufficient amount;
//                                          `from` is the on-chain sender wallet (lowercased), recorded
//                                          on the order so the operator can see who actually paid.
//   { status: 'mismatch', detail }       - mined but wrong recipient / reverted / underpaid
export async function verifyPayment({ txHash, paymentMethod, expectedUsd, ethUsdPrice }) {
  if (!process.env.ETH_RPC_URL) {
    console.error("_verifyPayment: ETH_RPC_URL not configured — order held as pending for cron reconciliation");
    return { status: "pending", detail: "RPC not configured" };
  }

  let receipt;
  try {
    receipt = await rpc("eth_getTransactionReceipt", [txHash]);
  } catch (e) {
    return { status: "pending", detail: `receipt error: ${e.message}` };
  }
  if (!receipt) return { status: "pending", detail: "not yet mined" };

  // Require enough confirmations before treating the tx as final.
  if (receipt.blockNumber) {
    let latestBlock;
    try {
      latestBlock = await rpc("eth_blockNumber", []);
    } catch {
      return { status: "pending", detail: "could not fetch latest block" };
    }
    const confirmations = Number(BigInt(latestBlock) - BigInt(receipt.blockNumber));
    if (confirmations < CONFIRMATION_DEPTH) {
      return { status: "pending", detail: `${confirmations}/${CONFIRMATION_DEPTH} confirmations` };
    }
  }

  if (receipt.status && receipt.status !== "0x1") return { status: "mismatch", detail: "tx reverted" };

  if (paymentMethod === "usdc") {
    const log = (receipt.logs || []).find(
      (l) =>
        l.address &&
        l.address.toLowerCase() === USDC_CONTRACT &&
        l.topics &&
        l.topics[0] === TRANSFER_TOPIC &&
        l.topics[1] &&
        topicToAddress(l.topics[1]) !== "0x0000000000000000000000000000000000000000" &&
        l.topics[2] &&
        topicToAddress(l.topics[2]) === RECIPIENT
    );
    if (!log) return { status: "mismatch", detail: "no USDC transfer to recipient" };
    const paid = Number(BigInt(log.data)) / 1e6; // USDC = 6 decimals
    if (paid + 0.01 < expectedUsd) {
      return { status: "mismatch", detail: `underpaid: $${paid} < $${expectedUsd}` };
    }
    // topics[1] is the indexed `from` of the Transfer event — the wallet that paid.
    return { status: "verified", detail: `USDC $${paid}`, from: topicToAddress(log.topics[1]) };
  }

  // ETH payment: inspect the transaction's recipient and value.
  let tx;
  try {
    tx = await rpc("eth_getTransactionByHash", [txHash]);
  } catch (e) {
    return { status: "pending", detail: `tx error: ${e.message}` };
  }
  if (!tx) return { status: "pending", detail: "tx not found" };
  if ((tx.to || "").toLowerCase() !== RECIPIENT) return { status: "mismatch", detail: "wrong recipient" };

  const price = Number(ethUsdPrice) || 0;
  if (!price) return { status: "pending", detail: "no ETH price for valuation" };
  const eth = Number(BigInt(tx.value || "0x0")) / 1e18;
  const paidUsd = eth * price;
  // 3% tolerance accommodates normal ETH/USD movement between client quote and confirmation.
  if (paidUsd < expectedUsd * 0.97) {
    return { status: "mismatch", detail: `underpaid: ~$${paidUsd.toFixed(2)} < $${expectedUsd}` };
  }
  return { status: "verified", detail: `ETH ${eth} ~ $${paidUsd.toFixed(2)}`, from: (tx.from || "").toLowerCase() };
}
